<x-filament-widgets::widget>
    <x-filament::section heading="AI Cost Dashboard" description="Multi-provider AI spend tracking">

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">Today's Spend</p>
                <p class="text-2xl font-bold text-gray-800 dark:text-white">${{ number_format($todayTotal, 4) }}</p>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">Projected Monthly</p>
                <p class="text-2xl font-bold text-gray-800 dark:text-white">${{ number_format($projectedMonthly, 2) }}</p>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">By Provider (today)</p>
                @foreach ($dailyByProvider as $provider => $cost)
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600 dark:text-gray-400 capitalize">{{ $provider }}</span>
                        <span class="font-mono">${{ number_format($cost, 4) }}</span>
                    </div>
                @endforeach
                @if (empty($dailyByProvider))
                    <p class="text-sm text-gray-400">No AI calls today.</p>
                @endif
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">By Feature (today)</p>
                @foreach ($dailyByFeature as $feature => $cost)
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600 dark:text-gray-400">{{ $feature }}</span>
                        <span class="font-mono">${{ number_format($cost, 4) }}</span>
                    </div>
                @endforeach
                @if (empty($dailyByFeature))
                    <p class="text-sm text-gray-400">No AI calls today.</p>
                @endif
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {{-- Last 7 days --}}
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                <h3 class="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">Last 7 Days</h3>
                @foreach ($last7Days as $day)
                    <div class="flex justify-between text-sm py-0.5">
                        <span class="text-gray-500">{{ $day['date'] }}</span>
                        <span class="font-mono">${{ number_format($day['total'], 4) }}</span>
                    </div>
                @endforeach
                @if (empty($last7Days))
                    <p class="text-sm text-gray-400">No data.</p>
                @endif
            </div>

            {{-- Top outliers --}}
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                <h3 class="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">Top 10 Users (7 days)</h3>
                @foreach ($topOutliers as $outlier)
                    <div class="flex justify-between text-sm py-0.5">
                        <span class="text-gray-500 truncate max-w-[200px]">{{ $outlier['email'] ?? '#'.$outlier['user_id'] }}</span>
                        <span class="font-mono">${{ number_format($outlier['total'], 4) }}</span>
                    </div>
                @endforeach
                @if (empty($topOutliers))
                    <p class="text-sm text-gray-400">No user data.</p>
                @endif
            </div>
        </div>
    </x-filament::section>
</x-filament-widgets::widget>
