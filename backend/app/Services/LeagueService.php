<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\League;
use App\Models\LeagueGroup;
use App\Models\User;
use App\Models\UserLeagueStanding;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class LeagueService
{
    private const GROUP_SIZE = 30;

    public function assignWeeklyGroup(User $user): UserLeagueStanding
    {
        $weekStart = Carbon::now()->startOfWeek();
        $weekEnd = Carbon::now()->endOfWeek();

        $league = League::whereDate('period_start', $weekStart->toDateString())->first();

        if ($league === null) {
            $league = League::create([
                'name' => 'Week of '.$weekStart->format('M j'),
                'period_start' => $weekStart->toDateString(),
                'period_end' => $weekEnd->toDateString(),
            ]);
        }

        $existing = UserLeagueStanding::whereHas('leagueGroup', fn ($q) => $q->where('league_id', $league->id))
            ->where('user_id', $user->id)
            ->first();

        if ($existing !== null) {
            return $existing;
        }

        $group = LeagueGroup::where('league_id', $league->id)
            ->whereRaw(
                '(SELECT COUNT(*) FROM user_league_standings WHERE league_group_id = league_groups.id) < ?',
                [self::GROUP_SIZE],
            )
            ->first();

        if ($group === null) {
            $tierCount = LeagueGroup::where('league_id', $league->id)->count();
            $group = LeagueGroup::create([
                'league_id' => $league->id,
                'tier' => ($tierCount % 3) + 1,
            ]);
        }

        return UserLeagueStanding::create([
            'user_id' => $user->id,
            'league_group_id' => $group->id,
            'xp_in_period' => 0,
            'rank' => null,
        ]);
    }

    public function addXpToCurrentGroup(User $user, int $xp): void
    {
        $weekStart = Carbon::now()->startOfWeek();

        UserLeagueStanding::whereHas(
            'leagueGroup.league',
            fn ($q) => $q->whereDate('period_start', $weekStart->toDateString()),
        )
            ->where('user_id', $user->id)
            ->increment('xp_in_period', $xp);
    }

    public function resolveWeeklyLeagues(): void
    {
        $lastWeekStart = Carbon::now()->subWeek()->startOfWeek();

        $league = League::whereDate('period_start', $lastWeekStart->toDateString())->first();

        if ($league === null) {
            return;
        }

        $groups = $league->groups()->with('standings')->get();

        foreach ($groups as $group) {
            $rank = 1;
            $standings = $group->standings()
                ->orderByDesc('xp_in_period')
                ->get();

            foreach ($standings as $standing) {
                DB::table('user_league_standings')
                    ->where('id', $standing->id)
                    ->update(['rank' => $rank++]);
            }
        }
    }
}
