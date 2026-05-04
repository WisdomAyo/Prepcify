# Lumio Scaling Guide

Decision guide for infrastructure changes as user count grows.

---

## Scaling Triggers

| Metric | Threshold | Action |
|--------|-----------|--------|
| DAU | > 500 | Move from cPanel to VPS (DigitalOcean Droplet) |
| DAU | > 2,000 | Add Redis for cache + queue. Enable Supervisor for workers. |
| DAU | > 10,000 | Move DB to RDS (managed MySQL). Add read replica. |
| DAU | > 50,000 | Partition `attempts` table by month. Add ALB + auto-scaling. |
| `attempts` rows | > 50M | Partition by `attempted_at` RANGE (see below) |
| AI spend | > $500/month | Implement response caching at edge (CloudFront). Tune token limits. |
| p95 API latency | > 500ms | Add read replica. Investigate N+1s. Review missing indexes. |

---

## When to Add a Read Replica

Signs you need one:
- Database CPU > 60% sustained during peak hours
- Slow query log shows SELECT queries competing with writes
- `SHOW PROCESSLIST` shows many SELECTs waiting on locks

Implementation with RDS:
1. Create a read replica in the same AZ
2. In `.env`, add `DB_READ_HOST=read-replica-endpoint`
3. In `config/database.php`, configure `read/write` split:
   ```php
   'mysql' => [
       'read' => ['host' => env('DB_READ_HOST', env('DB_HOST'))],
       'write' => ['host' => env('DB_HOST')],
       ...
   ]
   ```
4. Laravel automatically routes SELECT to the read replica.

Hot read paths:
- `GET /api/v1/questions` (catalog)
- `GET /api/v1/me/mastery` (mastery summary)
- Filament resource listings (admin panel)

---

## When to Partition the Attempts Table

The `attempts` table will be the largest table. At ~50M rows:
- Indexes become slower to maintain
- Vacuum/analyze takes longer
- Cold cache reads become expensive

**Range partition by `attempted_at` (MySQL 8.0+):**

```sql
ALTER TABLE attempts
PARTITION BY RANGE (YEAR(attempted_at) * 100 + MONTH(attempted_at)) (
    PARTITION p202601 VALUES LESS THAN (202602),
    PARTITION p202602 VALUES LESS THAN (202603),
    -- ... add monthly partitions
    PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

⚠ This requires a full table rebuild. Schedule during a maintenance window.

A Laravel migration for this is in `docs/partitioning-attempts.sql` (create this when ready).

---

## When to Move Off cPanel

Move when any of these occur:
- Need Redis (cPanel rarely allows Redis)
- Need background queue workers (cPanel cron is limited)
- Need more than 1 PHP worker / shared CPU
- AI streaming responses timing out (shared hosting has aggressive connection limits)

Recommended path: cPanel → DigitalOcean (single Droplet) → DigitalOcean (managed DB + worker Droplet) → AWS.

---

## AI Cost Estimates by User Tier

Assumptions: avg explanation = 500 tokens in + 300 tokens out; avg tutor message = 200 in + 300 out.

| Tier | DAU | Explanations/day | Tutor messages/day | Est. daily AI cost |
|------|-----|-----------------|-------------------|-------------------|
| Starter | 100 | 200 | 50 | ~$0.12 |
| Growth | 1,000 | 2,000 | 500 | ~$1.20 |
| Scale | 10,000 | 20,000 | 5,000 | ~$12.00 |
| Enterprise | 100,000 | 200,000 | 50,000 | ~$120.00 |

Cost levers:
- Cache explanations aggressively (already cached forever per question)
- Reduce tutor `max_tokens` from 4096 to 1024 for most queries
- Use `claude-haiku-4-5` for simple explanation requests (~10x cheaper)
- Implement a "free explanation credits" model (3/day on free tier)
- Use Anthropic's prompt caching for system prompts (50% input cost reduction)

---

## Database Cost at Scale (AWS RDS)

| Instance | vCPU | RAM | Storage | Monthly (on-demand) | Suitable for |
|----------|------|-----|---------|-------------------|--------------|
| db.t3.micro | 2 | 1 GB | 20 GB | ~$15 | Dev/staging |
| db.t3.medium | 2 | 4 GB | 100 GB | ~$75 | < 5,000 DAU |
| db.m5.large | 2 | 8 GB | 500 GB | ~$190 | < 20,000 DAU |
| db.m5.2xlarge | 8 | 32 GB | 1 TB | ~$550 | > 20,000 DAU |

Add ~30% for Multi-AZ (required for production).

---

## Projected Infrastructure Cost at 10K DAU

| Service | Monthly |
|---------|---------|
| EC2 app server (t3.medium × 2) | $80 |
| RDS MySQL m5.large Multi-AZ | $380 |
| ElastiCache Redis t3.micro | $25 |
| ALB | $20 |
| Cloudflare R2 (100 GB) | $2 |
| Cloudflare CDN | $0 (free tier) |
| AI (Claude API) | $360 |
| Paystack fees | Variable |
| **Total** | **~$867/month** |
