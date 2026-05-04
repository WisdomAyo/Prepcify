<?php

declare(strict_types=1);

namespace App\Models;

use App\Support\Enums\UserType;
use Database\Factories\UserFactory;
use Filament\Models\Contracts\FilamentUser;
use Filament\Models\Contracts\HasName;
use Filament\Panel;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

/**
 * @property-read StudentProfile|null $studentProfile
 * @property-read ParentProfile|null $parentProfile
 */
class User extends Authenticatable implements FilamentUser, HasName, MustVerifyEmail
{
    use HasApiTokens;

    /** @use HasFactory<UserFactory> */
    use HasFactory;

    use HasRoles;
    use Notifiable;
    use SoftDeletes;

    protected $fillable = [
        'email',
        'phone',
        'password',
        'display_name',
        'first_name',
        'last_name',
        'avatar_url',
        'timezone',
        'locale',
        'user_type',
        'last_login_at',
        'last_login_ip',
        'email_verified_at',
        'phone_verified_at',
        'two_factor_confirmed_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'user_type' => UserType::class,
        'email_verified_at' => 'datetime',
        'phone_verified_at' => 'datetime',
        'two_factor_confirmed_at' => 'datetime',
        'last_login_at' => 'datetime',
        'two_factor_recovery_codes' => 'encrypted',
        'deleted_at' => 'datetime',
    ];

    public function getFilamentName(): string
    {
        return $this->display_name
            ?? trim(($this->first_name ?? '').' '.($this->last_name ?? ''))
            ?: ($this->email ?? $this->phone ?? 'User');
    }

    public function canAccessPanel(Panel $panel): bool
    {
        return $this->user_type === UserType::Admin
            && $this->hasAnyRole(['Superadmin', 'Operations Admin', 'Content Lead', 'Content Reviewer', 'Support Agent']);
    }

    public function studentProfile(): HasOne
    {
        return $this->hasOne(StudentProfile::class);
    }

    public function parentProfile(): HasOne
    {
        return $this->hasOne(ParentProfile::class);
    }

    /** @return HasMany<UserExamTarget> */
    public function examTargets(): HasMany
    {
        return $this->hasMany(UserExamTarget::class);
    }

    /** @return HasMany<UserSubject> */
    public function userSubjects(): HasMany
    {
        return $this->hasMany(UserSubject::class);
    }

    /** @return HasMany<Attempt> */
    public function attempts(): HasMany
    {
        return $this->hasMany(Attempt::class);
    }

    /** @return HasMany<StudySession> */
    public function studySessions(): HasMany
    {
        return $this->hasMany(StudySession::class);
    }

    /** @return HasMany<MockExam> */
    public function mockExams(): HasMany
    {
        return $this->hasMany(MockExam::class);
    }

    /** @return HasOne<UserStreak, $this> */
    public function streak(): HasOne
    {
        return $this->hasOne(UserStreak::class);
    }

    /** @return HasOne<UserXp, $this> */
    public function xp(): HasOne
    {
        return $this->hasOne(UserXp::class);
    }

    /** @return HasMany<UserAchievement> */
    public function userAchievements(): HasMany
    {
        return $this->hasMany(UserAchievement::class);
    }

    /** @return HasMany<UserMission> */
    public function missions(): HasMany
    {
        return $this->hasMany(UserMission::class);
    }

    /** @return HasMany<UserLeagueStanding> */
    public function leagueStandings(): HasMany
    {
        return $this->hasMany(UserLeagueStanding::class);
    }

    /** @return HasMany<ParentLink> */
    public function parentLinks(): HasMany
    {
        return $this->hasMany(ParentLink::class, 'student_user_id');
    }

    /** @return HasMany<ParentLink> */
    public function childLinks(): HasMany
    {
        return $this->hasMany(ParentLink::class, 'parent_user_id');
    }

    /** @return HasMany<Subscription> */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /** @return HasMany<Payment> */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
