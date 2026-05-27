<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\SendOtpRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Http\Resources\UserContextResource;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuthService;
use App\Services\OtpService;
use App\Services\UserContextResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class AuthController extends Controller
{
    public function register(RegisterRequest $request, AuthService $service): JsonResponse
    {
        $result = $service->register($request->validated());

        return UserResource::make($result['user'])
            ->additional(['token' => $result['token']])
            ->response()
            ->setStatusCode(201);
    }

    public function login(LoginRequest $request, AuthService $service): JsonResponse
    {
        $result = $service->login($request->validated());

        return UserResource::make($result['user'])
            ->additional(['token' => $result['token']])
            ->response();
    }

    public function logout(Request $request, AuthService $service): JsonResponse
    {
        $user = $request->user();
        if (! $user instanceof User) {
            abort(401);
        }

        $service->logout($user);

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function forgotPassword(ForgotPasswordRequest $request, AuthService $service): JsonResponse
    {
        $service->forgotPassword($request->validated('email'));

        return response()->json(['message' => 'If that email exists, a reset link has been sent.']);
    }

    public function resetPassword(ResetPasswordRequest $request, AuthService $service): JsonResponse
    {
        $service->resetPassword($request->validated());

        return response()->json(['message' => 'Password has been reset successfully.']);
    }

    public function verifyEmail(int $id, string $hash, AuthService $service): JsonResponse
    {
        $user = User::findOrFail($id);
        $service->verifyEmail($user, $hash);

        return response()->json(['message' => 'Email verified successfully.']);
    }

    public function me(Request $request, AuthService $service): JsonResponse
    {
        $user = $request->user();
        if (! $user instanceof User) {
            abort(401);
        }

        return UserResource::make($service->me($user))->response();
    }

    public function updateProfile(\App\Http\Requests\UpdateProfileRequest $request, AuthService $service): JsonResponse
    {
        $user = $request->user();
        if (! $user instanceof User) {
            abort(401);
        }

        $updated = $service->updateProfile($user, $request->validated());

        return UserResource::make($updated)->response();
    }

    public function uploadAvatar(\App\Http\Requests\UploadAvatarRequest $request, AuthService $service): JsonResponse
    {
        $user = $request->user();
        if (! $user instanceof User) {
            abort(401);
        }

        $file = $request->file('avatar');
        if (! $file instanceof \Illuminate\Http\UploadedFile) {
            abort(422, 'No avatar file was uploaded.');
        }

        $updated = $service->uploadAvatar($user, $file);

        return UserResource::make($updated)->response();
    }

    public function sendOtp(SendOtpRequest $request, OtpService $service): JsonResponse
    {
        $user = $request->user();
        if (! $user instanceof User) {
            abort(401);
        }

        $service->send($user, $request->validated('phone'));

        return response()->json(['message' => 'OTP sent successfully.']);
    }

    public function context(Request $request, UserContextResolver $resolver): JsonResponse
    {
        $user = $request->user();
        if (! $user instanceof User) {
            abort(401);
        }

        return UserContextResource::make($resolver->resolve($user->id))->response();
    }

    public function verifyOtp(VerifyOtpRequest $request, OtpService $service): JsonResponse
    {
        $user = $request->user();
        if (! $user instanceof User) {
            abort(401);
        }

        $updated = $service->verifyAndActivate($user, $request->validated('phone'), $request->validated('code'));

        return UserResource::make($updated)->response();
    }
}
