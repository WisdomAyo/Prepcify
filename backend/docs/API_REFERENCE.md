# API Reference

This document describes the Prepcify backend API implemented in `backend/routes/api.php`. All endpoints are mounted under `/api/v1`.

- Base URL: `/api/v1`
- Authentication: `Authorization: Bearer {token}` for protected endpoints
- Error format: `{ "message": "..." }`

## Table of contents

1. Auth
2. Exam catalog
3. Onboarding
4. Me
5. Admin impersonation
6. Questions
7. AI
8. Attempts
9. Mastery
10. Sessions
11. Mock exams
12. Family
13. Billing
14. Webhooks

---

## 1. Auth

### POST /auth/register

Create a new user account.

Request body:
- `email` (string, required)
- `password` (string, required, min 8)
- `password_confirmation` (string, required)
- `display_name` (string, optional)
- `first_name` (string, optional)
- `last_name` (string, optional)
- `user_type` (enum: `student`, `parent`, `admin`, optional)

Response `201`:
- top-level user fields
- `token`: bearer auth token

### POST /auth/login

Authenticate by email or phone.

Request body:
- `identifier` (string, required) — email or phone
- `password` (string, required)

Response `200`:
- top-level user fields
- `token`: bearer auth token

### POST /auth/logout

Revoke the current bearer token.

Headers:
- `Authorization: Bearer {token}`

Response `200`:
- `message`: `Logged out successfully.`

### POST /auth/password/forgot

Send a password reset link for the supplied email.

Request body:
- `email` (string, required)

Response `200`:
- `message`: `If that email exists, a reset link has been sent.`

### POST /auth/password/reset

Reset a password using a reset token.

Request body:
- `token` (string, required)
- `email` (email, required)
- `password` (string, required, min 8)
- `password_confirmation` (string, required)

Response `200`:
- `message`: `Password has been reset successfully.`

### GET /auth/email/verify/{id}/{hash}

Verify an email address.

Path parameters:
- `id` (integer)
- `hash` (string)

Response `200`:
- `message`: `Email verified successfully.`

### GET /auth/me

Return the authenticated user profile.

Headers:
- `Authorization: Bearer {token}`

Response `200`:
- Top-level user fields

### POST /auth/phone/otp/send

Send a verification OTP to the authenticated user's phone.

Headers:
- `Authorization: Bearer {token}`

Request body:
- `phone` (string, required, E.164 format)

Response `200`:
- `message`: `OTP sent successfully.`

### POST /auth/phone/otp/verify

Verify OTP after it is sent.

Headers:
- `Authorization: Bearer {token}`

Request body:
- `phone` (string, required)
- `code` (string, required, 6 digits)

Response `200`:
- Top-level user fields

---

## 2. Exam catalog

### GET /exams

List available exam bodies grouped by category.

Query parameters:
- `category` (optional): `secondary_ng`, `professional`, `international`

Response `200`:
- `data`: object whose keys are categories and values are arrays of `ExamBody`

### GET /exams/{code}/subjects

List subjects for a specific exam body code.

Path parameters:
- `code` (string)

Response `200`:
- `data`: array of `Subject`

### GET /exams/{code}/subjects/{subjectId}

Return the topic tree for a subject.

Path parameters:
- `code` (string)
- `subjectId` (integer)

Response `200`:
- `data`: array of `Topic`

---

## 3. Onboarding

All onboarding endpoints require `Authorization: Bearer {token}`.

### POST /onboarding/exam-targets

Set the user's exam target bodies and preferred exam date.

Request body:
- `exam_body_ids` (array of integers, required)
- `target_date` (date, required)

Response `200`:
- `message`: `Exam targets updated.`

### POST /onboarding/subjects

Choose subjects to follow.

Request body:
- `selections` (array, required)
  - each item must include `exam_body_id` and `subject_id`

Response `200`:
- `message`: `Subjects updated.`

### POST /onboarding/complete

Mark onboarding as complete.

Response `200`:
- `message`: `Onboarding complete.`

---

## 4. Me

### GET /me/context

Return resolved user context, including active exam, subject, and topic ids, timezone, locale, permissions, and entitlements.

Headers:
- `Authorization: Bearer {token}`

Response `200`:
- Top-level `UserContext` fields

### POST /me/data-export

Queue a user data export job.

Headers:
- `Authorization: Bearer {token}`

Response `200`:
- `status`: `queued`

---

## 5. Admin impersonation

### POST /admin/impersonation/start

Create a short-lived impersonation token for an admin user.

Headers:
- `Authorization: Bearer {token}`

Request body:
- `target_user_id` (integer, required)

Response `200`:
- `token` (string)
- `expires_at` (date-time)

### POST /admin/impersonation/end

Revoke an impersonation token.

Headers:
- `Authorization: Bearer {token}`

Request body:
- `token` (string, required)

Response `200`:
- `message`: `Operation completed successfully.`

---

## 6. Questions

All question endpoints require `Authorization: Bearer {token}`.

### GET /questions

Fetch published questions scoped to the authenticated user's enrolled subjects.

Query parameters:
- `topic_id` (integer, optional)
- `format` (enum: `mcq`, `theory`, `structured`)
- `year` (integer, 2000-2099, optional)
- `cursor` (string, optional)

Response `200`:
- `data`: array of `QuestionListItem`
- `links`: pagination links
- `meta`: pagination metadata

### GET /questions/{question}

Fetch a single question with full details.

Path parameters:
- `question` (integer)

Response `200`:
- `data`: `Question`

### POST /questions/{question}/report

Report an issue for a question.

Path parameters:
- `question` (integer)

Request body:
- `reason` (enum: `incorrect_answer`, `typo_or_grammar`, `outdated_content`, `diagram_issue`, `other`)
- `detail` (string, optional)

Response `201`:
- `message`: `Report submitted.`

### GET /questions/{question}/similar

Return related questions from the same exam subject.

Path parameters:
- `question` (integer)

Response `200`:
- `data`: array of `QuestionListItem`

### GET /questions/{questionId}/explanation

Stream AI-generated explanation text for a question.

Headers:
- `Authorization: Bearer {token}`
- `Accept: text/event-stream`

Path parameters:
- `questionId` (integer)

Response `200`:
- SSE `text/event-stream` events containing JSON chunks like `{ "text": "..." }`

---

## 7. AI

### POST /me/tutor/sessions

Start a new AI tutor session.

Headers:
- `Authorization: Bearer {token}`

Response `201`:
- `data`: `TutorSession`

### GET /me/tutor/sessions

List tutor sessions for the authenticated user.

Headers:
- `Authorization: Bearer {token}`

Response `200`:
- `data`: array of `TutorSession`
- `meta`: `{ current_page, last_page, total }`

### GET /me/tutor/sessions/{sessionId}/messages

List messages inside a tutor session.

Path parameters:
- `sessionId` (integer)

Response `200`:
- `data`: array of `TutorMessage`

### POST /me/tutor/sessions/{sessionId}/messages

Send a message to the tutor session and stream the AI reply.

Headers:
- `Authorization: Bearer {token}`
- `Accept: text/event-stream`

Path parameters:
- `sessionId` (integer)

Request body:
- `message` (string, required, max 2000)

Response `200`:
- SSE stream of assistant chunks

### GET /me/study-plan

Retrieve the current AI-generated study plan.

Headers:
- `Authorization: Bearer {token}`

Response `200`:
- `data`: `StudyPlan` or `null`

### POST /me/study-plan/regenerate

Force regeneration of the authenticated user's study plan.

Headers:
- `Authorization: Bearer {token}`

Response `201`:
- `data`: `StudyPlan`

---

## 8. Attempts

### POST /attempts

Record a single attempt.

Headers:
- `Authorization: Bearer {token}`

Request body:
- `question_id` (integer, required_without `sub_question_id`)
- `sub_question_id` (integer, required_without `question_id`)
- `attempt_type` (enum)
- `selected_option_id` (integer, optional)
- `response_text` (string, optional)
- `response_media_url` (string, optional, URL)
- `time_spent_ms` (integer, required, >=0)
- `context` (enum)
- `client_uuid` (UUID, required)
- `attempted_at` (date-time, optional)

Response `200`:
- `data`: `Attempt`

### POST /attempts/batch

Record a list of attempts in one request.

Headers:
- `Authorization: Bearer {token}`

Request body:
- `attempts`: array of `AttemptInput` objects

Response `200`:
- `data`: array of `Attempt`

---

## 9. Mastery

### GET /me/mastery

Return mastery summaries grouped by exam body and subject.

Headers:
- `Authorization: Bearer {token}`

Response `200`:
- `data.by_exam`: object keyed by exam body id with `MasterySummary`
- `data.by_subject`: object keyed by subject id with `MasterySummary`

### GET /me/mastery/topics/{topic}

Return detailed mastery for a single topic.

Path parameters:
- `topic` (integer)

Headers:
- `Authorization: Bearer {token}`

Response `200`:
- `data`: object with fields `topic_id`, `topic_name`, `mastery_score`, `confidence`, `attempts_count`, `correct_count`, `last_attempted_at`

---

## 10. Sessions

### GET /me/sessions

List the authenticated user's recent study sessions.

Headers:
- `Authorization: Bearer {token}`

Response `200`:
- `data`: array of `StudySession`

### POST /me/sessions

Start a new study session.

Headers:
- `Authorization: Bearer {token}`

Request body:
- `context` (enum)

Response `200`:
- `data`: `StudySession`

### POST /me/sessions/{studySession}/end

End a study session.

Path parameters:
- `studySession` (integer)

Headers:
- `Authorization: Bearer {token}`

Response `200`:
- `data`: `StudySession`

---

## 11. Mock exams

### POST /me/mock-exams

Start a mock exam.

Headers:
- `Authorization: Bearer {token}`

Request body:
- `exam_body_id` (integer, required)
- `subject_ids` (array of integers, required)

Response `200`:
- `data`: `MockExam`

### GET /me/mock-exams/{mockExam}/next

Fetch the next question in an active mock exam.

Path parameters:
- `mockExam` (integer)

Headers:
- `Authorization: Bearer {token}`

Response `200`:
- `data`: `Question` or `null`
- `message`: present when no more questions are available

### POST /me/mock-exams/{mockExam}/submit

Submit a mock exam for grading.

Path parameters:
- `mockExam` (integer)

Headers:
- `Authorization: Bearer {token}`

Response `200`:
- `data`: `MockExam`

---

## 12. Family

### POST /family/invite-new-student

Invite a student by name and contact link.

Headers:
- `Authorization: Bearer {token}`

Request body:
- `name` (string, required)
- `contact` (string, required)

Response `201`:
- `token` (string)
- `expires_at` (date-time)

### POST /family/request-link

Request a parent link to an existing student.

Headers:
- `Authorization: Bearer {token}`

Request body:
- `student_id` (integer, required)

Response `200`:
- `ParentLink`

### GET /parent/children

Return the authenticated parent's linked student summaries.

Headers:
- `Authorization: Bearer {token}`

Response `200`:
- `data`: array of `StudentSummary`

### GET /parent/children/{studentId}

Return a child summary for a linked student.

Path parameters:
- `studentId` (integer)
Query parameters:
- `permission` (string, optional, default `view_progress`)

Headers:
- `Authorization: Bearer {token}`

Response `200`:
- `StudentSummary`

### POST /parent/children/{studentId}/encouragement

Send encouragement to a linked student.

Path parameters:
- `studentId` (integer)

Headers:
- `Authorization: Bearer {token}`

Request body:
- `message` (string, required, max 500)

Response `200`:
- `sent`: true

### POST /parent/children/{studentId}/subscription/start

Start a subscription on behalf of a linked student.

Path parameters:
- `studentId` (integer)

Headers:
- `Authorization: Bearer {token}`

Request body:
- `plan_code` (string, required)
- `currency` (string, required, 3 characters)
- `interval` (string, required; `monthly` or `yearly`)

Response `201`:
- `authorization_url`
- `reference`

### GET /me/family/pending

List pending parent links for the authenticated student.

Headers:
- `Authorization: Bearer {token}`

Response `200`:
- `data`: array of `ParentLink`

### POST /me/family/claim-invite

Claim an invite token as a student.

Headers:
- `Authorization: Bearer {token}`

Request body:
- `token` (string, required, 64 characters)

Response `200`:
- `ParentLink`

### POST /me/family/links/{linkId}/accept

Accept a pending parent link.

Path parameters:
- `linkId` (integer)

Headers:
- `Authorization: Bearer {token}`

Response `200`:
- `ParentLink`

### POST /me/family/links/{linkId}/decline

Decline a pending parent link.

Response `200`:
- `declined`: true

### POST /me/family/links/{linkId}/revoke

Revoke an existing parent link.

Response `200`:
- `revoked`: true

### PATCH /me/family/links/{linkId}/permissions

Update permissions for a parent link.

Request body:
- `permissions.view_progress` (boolean, optional)
- `permissions.view_attempts` (boolean, optional)
- `permissions.receive_reports` (boolean, optional)

Response `200`:
- `ParentLink`

---

## 13. Billing

### GET /plans

List active pricing plans.

Response `200`:
- `data`: array of `Plan`

### GET /me/subscription

Fetch the current active subscription.

Headers:
- `Authorization: Bearer {token}`

Response `200`:
- `subscription`: `Subscription` or `null`

### POST /me/subscription/start

Start a subscription checkout session.

Headers:
- `Authorization: Bearer {token}`

Request body:
- `plan_code` (string, required)
- `currency` (string, required, 3 characters)
- `interval` (string, required; `monthly` or `yearly`)

Response `201`:
- `authorization_url`
- `reference`

### POST /me/subscription/{subscriptionId}/cancel

Cancel an active subscription.

Path parameters:
- `subscriptionId` (integer)

Headers:
- `Authorization: Bearer {token}`

Response `200`:
- `data`: `Subscription`

---

## 14. Webhooks

### POST /webhooks/paystack

Receive Paystack webhook events. No bearer auth is required; the request is verified with the `X-Paystack-Signature` header.

Headers:
- `X-Paystack-Signature` (string)

Request body:
- Raw Paystack event JSON

Response `200`:
- `status`: `queued`
