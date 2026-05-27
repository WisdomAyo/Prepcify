<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\Admin\ImpersonationController;
use App\Http\Controllers\Api\V1\AI\ExplanationController;
use App\Http\Controllers\Api\V1\AI\StudyPlanController;
use App\Http\Controllers\Api\V1\AI\TutorController;
use App\Http\Controllers\Api\V1\Attempt\AttemptController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Billing\PlansController;
use App\Http\Controllers\Api\V1\Billing\SubscriptionController;
use App\Http\Controllers\Api\V1\Billing\WebhookController;
use App\Http\Controllers\Api\V1\Exam\ExamController;
use App\Http\Controllers\Api\V1\Family\FamilyController;
use App\Http\Controllers\Api\V1\Family\MeFamilyController;
use App\Http\Controllers\Api\V1\Mastery\MasteryController;
use App\Http\Controllers\Api\V1\Me\ExportController;
use App\Http\Controllers\Api\V1\MockExam\MockExamController;
use App\Http\Controllers\Api\V1\Onboarding\OnboardingController;
use App\Http\Controllers\Api\V1\Question\QuestionController;
use App\Http\Controllers\Api\V1\Session\StudySessionController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('api.v1.')->group(function () {

    // ── Auth ────────────────────────────────────────────────────────────────
    Route::prefix('auth')->name('auth.')->group(function () {

        Route::post('register', [AuthController::class, 'register'])
            ->middleware('throttle:register')
            ->name('register');

        Route::post('login', [AuthController::class, 'login'])
            ->middleware('throttle:login')
            ->name('login');

        Route::post('password/forgot', [AuthController::class, 'forgotPassword'])
            ->middleware('throttle:password-reset')
            ->name('password.forgot');

        Route::post('password/reset', [AuthController::class, 'resetPassword'])
            ->name('password.reset');

        Route::get('email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
            ->middleware(['signed', 'throttle:6,1'])
            ->name('verification.verify');

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('logout', [AuthController::class, 'logout'])->name('logout');
            Route::get('me', [AuthController::class, 'me'])->name('me');
            Route::post('phone/otp/send', [AuthController::class, 'sendOtp'])
                ->middleware('throttle:otp-send')
                ->name('phone.otp.send');
            Route::post('phone/otp/verify', [AuthController::class, 'verifyOtp'])
                ->middleware('throttle:otp-verify')
                ->name('phone.otp.verify');
        });
    });

    // ── Exam catalog (public) ────────────────────────────────────────────────
    Route::prefix('exams')->name('exams.')->group(function () {
        Route::get('/', [ExamController::class, 'index'])->name('index');
        Route::get('{code}/subjects', [ExamController::class, 'subjects'])->name('subjects');
        Route::get('{code}/subjects/{subjectId}', [ExamController::class, 'topics'])->name('topics');
    });

    // ── Onboarding (auth) ────────────────────────────────────────────────────
    Route::middleware('auth:sanctum')->prefix('onboarding')->name('onboarding.')->group(function () {
        Route::post('exam-targets', [OnboardingController::class, 'setExamTargets'])->name('exam-targets');
        Route::post('subjects', [OnboardingController::class, 'setSubjects'])->name('subjects');
        Route::post('complete', [OnboardingController::class, 'complete'])->name('complete');
    });

    // ── Me (auth) ────────────────────────────────────────────────────────────
    Route::middleware('auth:sanctum')->prefix('me')->name('me.')->group(function () {
        Route::get('context', [AuthController::class, 'context'])->name('context');
        Route::patch('profile', [AuthController::class, 'updateProfile'])->name('profile.update');
        Route::post('avatar', [AuthController::class, 'uploadAvatar'])->name('avatar.upload');
        Route::post('data-export', ExportController::class)->name('data-export');
    });

    // ── Admin impersonation (auth + permission) ───────────────────────────────
    Route::middleware(['auth:sanctum'])->prefix('admin/impersonation')->name('admin.impersonation.')->group(function () {
        Route::post('start', [ImpersonationController::class, 'start'])->name('start');
        Route::post('end', [ImpersonationController::class, 'end'])->name('end');
    });

    // ── Questions (auth) ─────────────────────────────────────────────────────
    Route::middleware(['auth:sanctum', 'throttle:api'])->prefix('questions')->name('questions.')->group(function () {
        Route::get('/', [QuestionController::class, 'index'])->name('index');
        Route::get('{question}', [QuestionController::class, 'show'])->name('show');
        Route::post('{question}/report', [QuestionController::class, 'report'])->name('report');
        Route::get('{question}/similar', [QuestionController::class, 'similar'])->name('similar');
        Route::get('{questionId}/explanation', ExplanationController::class)
            ->middleware('throttle:ai-explanation')
            ->name('explanation');
    });

    // ── AI tutor + study plan (auth) ─────────────────────────────────────────
    Route::middleware(['auth:sanctum', 'throttle:api'])->prefix('me')->name('me.')->group(function () {
        Route::prefix('tutor/sessions')->name('tutor.')->group(function () {
            Route::post('/', [TutorController::class, 'startSession'])->name('start');
            Route::get('/', [TutorController::class, 'listSessions'])->name('list');
            Route::get('{sessionId}/messages', [TutorController::class, 'messages'])->name('messages');
            Route::post('{sessionId}/messages', [TutorController::class, 'sendMessage'])
                ->middleware('throttle:ai-tutor')
                ->name('send');
        });

        Route::get('study-plan', [StudyPlanController::class, 'current'])->name('study-plan');
        Route::post('study-plan/regenerate', [StudyPlanController::class, 'regenerate'])
            ->middleware('throttle:ai-study-plan')
            ->name('study-plan.regenerate');
    });

    // ── Learning domain (auth) ───────────────────────────────────────────────
    Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {

        // Attempts
        Route::post('attempts', [AttemptController::class, 'store'])->name('attempts.store');
        Route::post('attempts/batch', [AttemptController::class, 'storeBatch'])->name('attempts.batch');

        // Mastery
        Route::prefix('me/mastery')->name('mastery.')->group(function () {
            Route::get('/', [MasteryController::class, 'index'])->name('index');
            Route::get('topics/{topic}', [MasteryController::class, 'topic'])->name('topic');
        });

        // Study sessions
        Route::prefix('me/sessions')->name('sessions.')->group(function () {
            Route::get('/', [StudySessionController::class, 'index'])->name('index');
            Route::post('/', [StudySessionController::class, 'store'])->name('store');
            Route::post('{studySession}/end', [StudySessionController::class, 'end'])->name('end');
        });

        // Mock exams
        Route::prefix('me/mock-exams')->name('mock-exams.')->group(function () {
            Route::post('/', [MockExamController::class, 'store'])->name('store');
            Route::get('{mockExam}/next', [MockExamController::class, 'next'])->name('next');
            Route::post('{mockExam}/submit', [MockExamController::class, 'submit'])->name('submit');
        });
    });

    // ── Plans (public) ───────────────────────────────────────────────────────
    Route::get('plans', [PlansController::class, 'index'])->name('plans.index');

    // ── Webhooks (no auth, signature verified in controller) ─────────────────
    Route::post('webhooks/paystack', [WebhookController::class, 'paystack'])->name('webhooks.paystack');

    // ── Family & Billing (auth) ──────────────────────────────────────────────
    Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {

        // Family — parent side
        Route::prefix('family')->name('family.')->group(function () {
            Route::post('invite-new-student', [FamilyController::class, 'inviteNewStudent'])->name('invite');
            Route::post('request-link', [FamilyController::class, 'requestLink'])->name('request-link');
        });

        // Family — parent viewing children
        Route::prefix('parent/children')->name('parent.children.')->group(function () {
            Route::get('/', [FamilyController::class, 'children'])->name('index');
            Route::get('{studentId}', [FamilyController::class, 'childSummary'])->name('show');
            Route::post('{studentId}/encouragement', [FamilyController::class, 'sendEncouragement'])->name('encouragement');
            Route::post('{studentId}/subscription/start', [SubscriptionController::class, 'startForStudent'])->name('subscription.start');
        });

        // Family — student side
        Route::prefix('me/family')->name('me.family.')->group(function () {
            Route::get('pending', [MeFamilyController::class, 'pendingLinks'])->name('pending');
            Route::post('claim-invite', [MeFamilyController::class, 'claimInvite'])->name('claim');
            Route::post('links/{linkId}/accept', [MeFamilyController::class, 'acceptLink'])->name('accept');
            Route::post('links/{linkId}/decline', [MeFamilyController::class, 'declineLink'])->name('decline');
            Route::post('links/{linkId}/revoke', [MeFamilyController::class, 'revokeLink'])->name('revoke');
            Route::patch('links/{linkId}/permissions', [MeFamilyController::class, 'updatePermissions'])->name('permissions');
        });

        // Billing — subscription
        Route::prefix('me/subscription')->name('me.subscription.')->group(function () {
            Route::get('/', [SubscriptionController::class, 'current'])->name('current');
            Route::post('start', [SubscriptionController::class, 'start'])->name('start');
            Route::post('{subscriptionId}/cancel', [SubscriptionController::class, 'cancel'])->name('cancel');
        });
    });

});
