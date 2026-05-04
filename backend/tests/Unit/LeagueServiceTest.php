<?php

declare(strict_types=1);

use App\Models\League;
use App\Models\LeagueGroup;
use App\Models\User;
use App\Models\UserLeagueStanding;
use App\Services\LeagueService;
use App\Support\Enums\UserType;
use Carbon\Carbon;

it('assignWeeklyGroup creates league, group, and standing for a new user', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    $standing = app(LeagueService::class)->assignWeeklyGroup($user);

    expect($standing->user_id)->toBe($user->id);
    expect($standing->xp_in_period)->toBe(0);
    expect(League::count())->toBe(1);
});

it('assignWeeklyGroup reuses existing league for same week', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);
    $service = app(LeagueService::class);

    $service->assignWeeklyGroup($user);

    expect(League::count())->toBe(1);
});

it('assignWeeklyGroup returns existing standing when called twice', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);
    $service = app(LeagueService::class);

    $first = $service->assignWeeklyGroup($user);
    $second = $service->assignWeeklyGroup($user);

    expect($first->id)->toBe($second->id);
    expect(UserLeagueStanding::where('user_id', $user->id)->count())->toBe(1);
});

it('assignWeeklyGroup creates a new group when existing group is full', function () {
    $league = League::create([
        'period_start' => Carbon::now()->startOfWeek()->toDateString(),
        'period_end' => Carbon::now()->endOfWeek()->toDateString(),
    ]);

    $group = LeagueGroup::create(['league_id' => $league->id, 'tier' => 1]);

    // Fill the group to capacity (30 users)
    User::factory(30)->create(['user_type' => UserType::Student->value])->each(function ($u) use ($group) {
        UserLeagueStanding::create([
            'user_id' => $u->id,
            'league_group_id' => $group->id,
            'xp_in_period' => 0,
            'rank' => null,
        ]);
    });

    $newUser = User::factory()->create(['user_type' => UserType::Student->value]);
    app(LeagueService::class)->assignWeeklyGroup($newUser);

    expect(LeagueGroup::where('league_id', $league->id)->count())->toBe(2);
});

it('addXpToCurrentGroup increments xp for the current week', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);
    $service = app(LeagueService::class);

    $service->assignWeeklyGroup($user);
    $service->addXpToCurrentGroup($user, 50);

    $standing = UserLeagueStanding::where('user_id', $user->id)->first();
    expect($standing->xp_in_period)->toBe(50);
});

it('resolveWeeklyLeagues assigns ranks to standings', function () {
    // Pin "now" to a Wednesday so subWeek()->startOfWeek() is a known Monday
    Carbon::setTestNow(Carbon::parse('2026-04-29')); // Wednesday
    $lastWeekStart = Carbon::parse('2026-04-20');    // The Monday of the prior week

    $league = League::create([
        'period_start' => $lastWeekStart->toDateString(),
        'period_end' => Carbon::parse('2026-04-26')->toDateString(),
    ]);

    $group = LeagueGroup::create(['league_id' => $league->id, 'tier' => 1]);

    $users = User::factory(3)->create(['user_type' => UserType::Student->value]);
    $standings = [
        UserLeagueStanding::create(['user_id' => $users[0]->id, 'league_group_id' => $group->id, 'xp_in_period' => 100, 'rank' => null]),
        UserLeagueStanding::create(['user_id' => $users[1]->id, 'league_group_id' => $group->id, 'xp_in_period' => 200, 'rank' => null]),
        UserLeagueStanding::create(['user_id' => $users[2]->id, 'league_group_id' => $group->id, 'xp_in_period' => 50, 'rank' => null]),
    ];

    app(LeagueService::class)->resolveWeeklyLeagues();

    Carbon::setTestNow(); // reset

    // Highest XP (200) should be rank 1
    $this->assertDatabaseHas('user_league_standings', ['id' => $standings[1]->id, 'rank' => 1]);
    $this->assertDatabaseHas('user_league_standings', ['id' => $standings[0]->id, 'rank' => 2]);
    $this->assertDatabaseHas('user_league_standings', ['id' => $standings[2]->id, 'rank' => 3]);
});
