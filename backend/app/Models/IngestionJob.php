<?php

declare(strict_types=1);

namespace App\Models;

use App\Support\Enums\AiProviderPreference;
use App\Support\Enums\ExtractionMethod;
use App\Support\Enums\IngestionStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IngestionJob extends Model
{
    /** @var list<string> */
    protected $fillable = [
        'exam_paper_id',
        'pdf_url',
        'pdf_size_bytes',
        'total_pages',
        'pages_processed',
        'pages_failed',
        'questions_extracted',
        'status',
        'extraction_method',
        'ai_provider_preferred',
        'estimated_cost_usd',
        'actual_cost_usd',
        'created_by',
        'started_at',
        'completed_at',
        'error_summary',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'status' => IngestionStatus::class,
        'extraction_method' => ExtractionMethod::class,
        'ai_provider_preferred' => AiProviderPreference::class,
        'pdf_size_bytes' => 'integer',
        'total_pages' => 'integer',
        'pages_processed' => 'integer',
        'pages_failed' => 'integer',
        'questions_extracted' => 'integer',
        'estimated_cost_usd' => 'float',
        'actual_cost_usd' => 'float',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /** @return BelongsTo<ExamPaper, $this> */
    public function examPaper(): BelongsTo
    {
        return $this->belongsTo(ExamPaper::class);
    }

    /** @return BelongsTo<User, $this> */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** @return HasMany<IngestionPage> */
    public function pages(): HasMany
    {
        return $this->hasMany(IngestionPage::class)->orderBy('page_number');
    }
}
