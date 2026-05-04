# PDF Ingestion Pipeline

## Overview

The ingestion pipeline converts scanned PDF exam papers into structured `question_drafts` ready for human review. The pipeline runs entirely via Laravel queues and requires no persistent workers — it is designed for cPanel shared hosting using cron-based queue consumption.

## Architecture

```
Admin uploads PDF
      │
      ▼
IngestionUploadService::createUploadUrl()
  → Creates presigned R2 upload URL
  → Creates ingestion_job stub (status: queued)

Admin uploads PDF directly to R2 (presigned URL)

Admin calls confirmUpload()
  → Checks daily cost cap
  → Dispatches SplitPdfJob (queue: ingestion)

SplitPdfJob
  → Downloads PDF from R2
  → Splits into per-page PNGs via Imagick (200 DPI)
  → Uploads each page PNG to R2
  → Creates ingestion_pages records
  → Enforces 60-page cap (requires ingestion.large_jobs permission)
  → Dispatches one ExtractPageQuestionsJob per page

ExtractPageQuestionsJob (per page, runs concurrently)
  → Gets temporary R2 URL for page image
  → Sends image to AI via AIRouter::complete(AiFeature::QuestionExtraction)
  → Parses JSON response into ExtractedQuestionDto[]
  → Creates Question + QuestionDraft records via DraftCreationService
  → Dispatches FinalizeIngestionJob (idempotent — safe to dispatch multiple times)

FinalizeIngestionJob (idempotent)
  → Checks if ALL pages are in terminal state (completed/failed/skipped)
  → If not all done: exits immediately (another page is still running)
  → If all done: updates job status to completed or partially_failed
  → Rolls up total questions_extracted and actual_cost_usd
```

## Database Schema

| Table | Purpose |
|-------|---------|
| `ingestion_jobs` | One per uploaded PDF. Tracks overall status, cost, provider choice |
| `ingestion_pages` | One per page image. Tracks per-page extraction status, cost, AI response |
| `question_drafts` | One per extracted question. Linked to ingestion_job and page via source_page_url/number |

## AI Provider Selection

The `ai_provider_preferred` on the job is a hint to AIRouter. The router may fall back to another provider if the preferred one is unhealthy (circuit breaker open).

Per-page cost rates:
- Gemini: $0.0004/page
- OpenAI: $0.002/page
- Claude: $0.003/page

## Cost Controls

**Daily cap**: Set `AI_INGESTION_DAILY_CAP_USD` in `.env`. If today's non-cancelled ingestion cost exceeds the cap, `confirmUpload()` throws and the job is not started. Set to `0` (default) to disable.

**Page cap**: Jobs exceeding 60 pages require the `ingestion.large_jobs` permission. If the admin lacks it, the job is cancelled after splitting.

## Question Draft Creation

Each extracted question creates:
1. A `Question` record (status: `draft`, linked to the exam's `exam_subject_id`)
2. A `QuestionDraft` record (status: `pending`) with:
   - `source_page_url` / `source_page_number` — traceability back to the PDF page
   - `extraction_confidence` — AI confidence score (0.0–1.0)
   - `raw_extraction` — full extracted JSON (options, has_diagram, topic_guess, etc.)

Reviewers then use the QuestionDrafts workbench to approve, reject, or edit each extracted question.

## Failure Handling

| Failure point | Behaviour |
|--------------|-----------|
| PDF not found in R2 | `SplitPdfJob` fails, job → `failed` after 3 retries |
| Imagick fails on one page | Page marked `skipped`, rest continue |
| AI provider times out | `ExtractPageQuestionsJob` retries 3× with exponential backoff (15s, 45s, 90s) |
| All pages fail | Job status → `failed` |
| Some pages fail | Job status → `partially_failed` |
| All pages succeed | Job status → `completed` |

## Retry Configuration

All jobs use `$tries = 3` with exponential backoff:
- `SplitPdfJob`: 10s, 30s, 60s
- `ExtractPageQuestionsJob`: 15s, 45s, 90s
- `FinalizeIngestionJob`: 5s, 15s, 30s

All jobs are `$timeout = 120` seconds.

## Idempotency

- `SplitPdfJob`: skips if job is past `splitting` status
- `ExtractPageQuestionsJob`: skips if page is already in a terminal status, or if parent job is cancelled/failed
- `FinalizeIngestionJob`: skips if job is already in a terminal status; returns early if any pages are still processing
