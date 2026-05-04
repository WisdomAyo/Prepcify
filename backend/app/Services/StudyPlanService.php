<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\StudyPlan;
use App\Models\User;
use App\Support\Enums\AiFeature;
use Illuminate\View\Factory as ViewFactory;

class StudyPlanService
{
    private const CACHE_DAYS = 7;

    public function __construct(
        private readonly AIRouter $router,
        private readonly ViewFactory $view,
    ) {}

    public function generate(User $user): StudyPlan
    {
        StudyPlan::where('user_id', $user->id)->delete();

        $systemPrompt = 'You are an expert academic planner.';
        $userPrompt = $this->view->make('prompts.study-plan', [
            'examTargets' => 'WAEC, JAMB',
            'examDate' => null,
            'weakTopics' => 'None identified yet',
            'strongTopics' => 'None identified yet',
            'dailyMinutes' => 60,
            'subjects' => 'Mathematics, English, Physics',
        ])->render();

        $response = $this->router->complete(AiFeature::StudyPlan, $systemPrompt, $userPrompt, $user->id);

        $content = json_decode($response->content, true);

        if (! is_array($content)) {
            $content = ['raw' => $response->content];
        }

        return StudyPlan::create([
            'user_id' => $user->id,
            'content' => $content,
            'generated_at' => now(),
            'expires_at' => now()->addDays(self::CACHE_DAYS),
        ]);
    }

    public function current(User $user): ?StudyPlan
    {
        return StudyPlan::where('user_id', $user->id)
            ->where('expires_at', '>', now())
            ->latest('generated_at')
            ->first();
    }

    public function forceRegenerate(User $user): StudyPlan
    {
        return $this->generate($user);
    }
}
