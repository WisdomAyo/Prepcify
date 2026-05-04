<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use ZipArchive;

class UserDataExportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private const IDEMPOTENCY_KEY = 'user_data_export:';

    private const IDEMPOTENCY_TTL_HOURS = 24;

    public int $tries = 3;

    public int $timeout = 120;

    public function __construct(
        public readonly int $userId,
    ) {}

    public function handle(): void
    {
        $key = self::IDEMPOTENCY_KEY.$this->userId;

        $existing = Cache::get($key);

        if (is_string($existing) && $existing !== 'queued') {
            return;
        }

        $user = User::findOrFail($this->userId);

        $zipPath = $this->buildZip($user);
        $remotePath = 'exports/user-'.$this->userId.'-'.Str::random(12).'.zip';

        $r2 = Storage::disk('r2');
        $r2->put($remotePath, file_get_contents($zipPath) ?: '');
        @unlink($zipPath);

        $downloadUrl = $r2->temporaryUrl($remotePath, now()->addHours(self::IDEMPOTENCY_TTL_HOURS));

        Cache::put($key, $remotePath, now()->addHours(self::IDEMPOTENCY_TTL_HOURS));

        $this->sendEmail($user, $downloadUrl);
    }

    private function buildZip(User $user): string
    {
        $tmpPath = sys_get_temp_dir().'/lumio-export-'.$user->id.'-'.Str::random(8).'.zip';

        $zip = new ZipArchive;
        $zip->open($tmpPath, ZipArchive::CREATE | ZipArchive::OVERWRITE);

        $profile = [
            'id' => $user->id,
            'display_name' => $user->display_name,
            'email' => $user->email,
            'phone' => $user->phone,
            'user_type' => $user->user_type,
            'timezone' => $user->timezone,
            'created_at' => $user->created_at?->toIso8601String(),
        ];

        $zip->addFromString('profile.json', json_encode($profile, JSON_PRETTY_PRINT) ?: '{}');

        $zip->close();

        return $tmpPath;
    }

    private function sendEmail(User $user, string $downloadUrl): void
    {
        $email = $user->email;

        if ($email === null) {
            return;
        }

        Mail::raw(
            "Your Lumio data export is ready. Download it here (link valid for 24 hours):\n\n{$downloadUrl}",
            function ($message) use ($email): void {
                $message->to($email)
                    ->subject('Your Lumio Data Export is Ready');
            },
        );
    }

    public function failed(\Throwable $exception): void
    {
        $user = User::find($this->userId);
        $email = $user?->email;

        if ($email !== null) {
            Mail::raw(
                'We were unable to generate your Lumio data export after multiple attempts. Please contact support.',
                function ($message) use ($email): void {
                    $message->to($email)->subject('Your Lumio Data Export Failed');
                },
            );
        }
    }
}
