# Lumio Deployment Guide

---

## cPanel Shared Hosting Deploy

### Prerequisites
- PHP 8.2+ with extensions: `pdo_mysql`, `mbstring`, `openssl`, `zip`, `tokenizer`, `bcmath`, `json`, `curl`
- MySQL 8.0+
- Composer installed (or upload vendor/ directory)

### First Deploy

1. **Upload files** to `public_html/lumio/` (or a subdomain root).

2. **Set document root** in cPanel to `public_html/lumio/public`.

3. **Create `.env`** from `.env.example` and configure:
   ```ini
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://yourdomain.com

   DB_CONNECTION=mysql
   DB_HOST=localhost
   DB_DATABASE=lumio_prod
   DB_USERNAME=lumio_user
   DB_PASSWORD=STRONG_PASSWORD

   CACHE_STORE=file       # Use file if Redis unavailable on shared hosting
   QUEUE_CONNECTION=sync  # Use sync on shared hosting (no worker processes)
   SESSION_DRIVER=file

   ANTHROPIC_API_KEY=sk-ant-...
   PAYSTACK_SECRET_KEY=sk_live_...
   PAYSTACK_WEBHOOK_SECRET=...
   
   AWS_ACCESS_KEY_ID=...           # Cloudflare R2
   AWS_SECRET_ACCESS_KEY=...
   AWS_DEFAULT_REGION=auto
   AWS_BUCKET=lumio-prod
   AWS_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
   AWS_USE_PATH_STYLE_ENDPOINT=true
   ```

4. **Run migrations and seeders:**
   ```bash
   php artisan migrate --force
   php artisan db:seed --force
   ```

5. **Set permissions:**
   ```bash
   chmod -R 755 storage bootstrap/cache
   php artisan storage:link
   ```

6. **Optimise for production:**
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   php artisan event:cache
   ```

### Subsequent Deploys
```bash
php artisan down
git pull origin main
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:clear && php artisan config:cache
php artisan route:clear && php artisan route:cache
php artisan view:clear && php artisan view:cache
php artisan up
```

### Queue Workers on cPanel

On shared hosting, add two cPanel cron jobs (every minute):

**General queue (auth, notifications, etc.):**
```
* * * * * cd /home/username/public_html && php artisan queue:work --queue=default --stop-when-empty --max-time=55 >> /dev/null 2>&1
```

**Ingestion queue (PDF splitting + AI extraction):**
```
* * * * * cd /home/username/public_html && php artisan queue:work --queue=ingestion --stop-when-empty --max-time=55 >> /dev/null 2>&1
```

`--stop-when-empty` makes the worker exit once the queue is drained. `--max-time=55` ensures it exits before the next cron tick. This approach works without Supervisor on shared hosting.

> **Note:** PDF ingestion requires the PHP `imagick` extension. Verify it is enabled in your cPanel PHP selector before running ingestion jobs.

On VPS/dedicated servers, run persistent workers:
```bash
php artisan queue:work --queue=ingestion --sleep=3 --tries=3 --timeout=120
php artisan queue:work --queue=default --sleep=3 --tries=3 --timeout=60
```
Use Supervisor to keep them running.

---

## DigitalOcean Migration Notes

When moving from cPanel to a DigitalOcean Droplet (recommended for > 1000 daily active users):

1. **Server:** Ubuntu 22.04, 2 vCPU / 4 GB RAM minimum (Droplet size: `s-2vcpu-4gb`)
2. **Stack:** Nginx + PHP-FPM + MySQL 8 + Redis
3. **Change `.env`:**
   ```ini
   CACHE_STORE=redis
   QUEUE_CONNECTION=redis
   SESSION_DRIVER=redis
   REDIS_HOST=127.0.0.1
   ```
4. **Nginx config** — add to server block:
   ```nginx
   gzip on;
   gzip_types text/plain application/json application/javascript text/css;
   gzip_min_length 256;
   gzip_comp_level 6;
   
   # brotli (if module installed)
   # brotli on;
   # brotli_types text/plain application/json application/javascript text/css;
   ```
5. Run queue workers with Supervisor.
6. Schedule the cron via `crontab -e`:
   ```
   * * * * * cd /var/www/lumio && php artisan schedule:run >> /dev/null 2>&1
   ```

---

## AWS Migration Notes

For production scale (> 10,000 DAU):

| Component | AWS Service |
|-----------|-------------|
| App servers | EC2 (t3.medium) + ALB |
| Database | RDS MySQL 8 (Multi-AZ) |
| Cache | ElastiCache Redis |
| Storage | S3 (replace R2 endpoint) |
| Queue | SQS (replace Redis queue) |
| CDN | CloudFront |

Change `.env`:
```ini
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=lumio-prod
# Remove AWS_ENDPOINT and AWS_USE_PATH_STYLE_ENDPOINT for native S3
QUEUE_CONNECTION=sqs
SQS_PREFIX=https://sqs.us-east-1.amazonaws.com/ACCOUNT_ID
SQS_QUEUE=lumio-jobs
```

---

## Laravel Octane (Future Optimisation)

Octane boots the application once and keeps it in memory, eliminating bootstrap overhead per request.

**Do NOT enable on shared cPanel hosting** — requires Swoole or RoadRunner, which are not available on shared hosts.

When ready for dedicated hosting:
```bash
composer require laravel/octane
php artisan octane:install --server=swoole
# or --server=roadrunner
```

Change Nginx upstream to point to Octane socket.

⚠ Octane requires careful handling of static state. Review any `static` properties in services before enabling.

---

## Environment Variable Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `APP_KEY` | Yes | 32-char encryption key. Generate: `php artisan key:generate` |
| `APP_ENV` | Yes | `production` in prod |
| `APP_DEBUG` | Yes | `false` in prod |
| `DB_*` | Yes | MySQL connection |
| `ANTHROPIC_API_KEY` | Yes | Claude API key |
| `PAYSTACK_SECRET_KEY` | Yes | Paystack live key |
| `PAYSTACK_WEBHOOK_SECRET` | Yes | Used to verify Paystack signatures |
| `AWS_*` | Yes | Cloudflare R2 or S3 credentials |
| `SEED_SUPERADMIN_EMAIL` | Seed only | First superadmin email |
| `SEED_SUPERADMIN_PASSWORD` | Seed only | First superadmin password |
| `AI_TUTOR_ENABLED` | No | Feature flag, defaults to `true` |
| `AI_EXPLANATIONS_ENABLED` | No | Feature flag, defaults to `true` |
| `AI_STUDY_PLAN_ENABLED` | No | Feature flag, defaults to `true` |
