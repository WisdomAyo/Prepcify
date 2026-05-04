<?php

declare(strict_types=1);

namespace App\Models;

use App\Support\Enums\AiFeature;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiCallLog extends Model
{
    protected $table = 'ai_call_log';

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'feature',
        'model',
        'input_tokens',
        'output_tokens',
        'cost_usd',
        'duration_ms',
        'succeeded',
        'error',
        'provider',
        'fallback_from',
        'created_at',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'feature' => AiFeature::class,
        'input_tokens' => 'integer',
        'output_tokens' => 'integer',
        'cost_usd' => 'decimal:6',
        'duration_ms' => 'integer',
        'succeeded' => 'boolean',
        'created_at' => 'datetime',
    ];

    /** @return BelongsTo<User, AiCallLog> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
