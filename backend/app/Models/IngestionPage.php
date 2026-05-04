<?php

declare(strict_types=1);

namespace App\Models;

use App\Support\Enums\PageStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IngestionPage extends Model
{
    /** @var list<string> */
    protected $fillable = [
        'ingestion_job_id',
        'page_number',
        'page_image_url',
        'status',
        'ai_provider_used',
        'raw_response',
        'questions_extracted',
        'error',
        'processing_duration_ms',
        'cost_usd',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'status' => PageStatus::class,
        'raw_response' => 'array',
        'page_number' => 'integer',
        'questions_extracted' => 'integer',
        'processing_duration_ms' => 'integer',
        'cost_usd' => 'float',
    ];

    /** @return BelongsTo<IngestionJob, $this> */
    public function ingestionJob(): BelongsTo
    {
        return $this->belongsTo(IngestionJob::class);
    }
}
