<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Question;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EmbeddingService
{
    private string $apiKey;

    private string $model;

    public function __construct()
    {
        $this->apiKey = (string) config('services.voyage.api_key', config('services.openai.api_key', ''));
        $this->model = (string) config('services.voyage.model', 'voyage-2');
    }

    /**
     * Generate a text embedding vector.
     *
     * @return array<int, float>
     */
    public function generate(string $text): array
    {
        if ($this->apiKey === '') {
            return [];
        }

        try {
            $response = Http::withToken($this->apiKey)
                ->timeout(15)
                ->post('https://api.voyageai.com/v1/embeddings', [
                    'input' => $text,
                    'model' => $this->model,
                ]);

            /** @var array<int, float> */
            return $response->json('data.0.embedding') ?? [];
        } catch (\Throwable $e) {
            Log::warning('EmbeddingService failed: '.$e->getMessage());

            return [];
        }
    }

    /**
     * Find similar questions using JSON dot-product similarity.
     *
     * TODO: Replace with pgvector <-> operator once migrating to PostgreSQL.
     *
     * @return Collection<int, Question>
     */
    public function findSimilar(Question $question, int $limit = 10): Collection
    {
        /** @var array<int, float>|null */
        $queryEmbedding = $question->embedding;

        if (! is_array($queryEmbedding) || $queryEmbedding === []) {
            return Question::whereRaw('1=0')->get();
        }

        // Stub: return questions from same exam subject as approximation
        // TODO: Replace with pgvector cosine similarity when on PostgreSQL
        return Question::where('exam_subject_id', $question->exam_subject_id)
            ->where('id', '!=', $question->id)
            ->published()
            ->limit($limit)
            ->get();
    }
}
