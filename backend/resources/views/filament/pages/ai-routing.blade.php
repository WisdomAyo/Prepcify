<x-filament-panels::page>

    {{-- Provider Health Cards --}}
    <x-filament::section heading="Provider Status" description="Health, budget, and runtime controls per provider">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            @foreach ($providerStatus as $name => $status)
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4 border-l-4 {{ $status['healthy'] && !$status['disabled'] ? 'border-green-500' : 'border-red-500' }}">
                    <div class="flex items-center justify-between mb-2">
                        <h3 class="text-base font-semibold capitalize text-gray-800 dark:text-white">{{ $name }}</h3>
                        <span class="text-xs px-2 py-0.5 rounded-full font-medium
                            {{ $status['disabled'] ? 'bg-red-100 text-red-700' : ($status['healthy'] ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700') }}">
                            {{ $status['disabled'] ? 'Disabled' : ($status['healthy'] ? 'Healthy' : 'Circuit Open') }}
                        </span>
                    </div>

                    <div class="text-sm text-gray-500 dark:text-gray-400 space-y-1 mb-3">
                        <div class="flex justify-between">
                            <span>Today's spend</span>
                            <span class="font-mono">${{ number_format($status['today_spend'], 4) }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Daily budget</span>
                            <span class="font-mono">${{ number_format($status['budget'], 2) }}</span>
                        </div>
                        @if ($status['budget'] > 0)
                            <div class="mt-1">
                                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                    <div class="h-1.5 rounded-full {{ $status['today_spend'] / $status['budget'] >= 0.9 ? 'bg-red-500' : 'bg-blue-500' }}"
                                         style="width: {{ min(100, round($status['today_spend'] / max(0.0001, $status['budget']) * 100)) }}%">
                                    </div>
                                </div>
                            </div>
                        @endif
                    </div>

                    <div class="flex gap-2 flex-wrap">
                        <button wire:click="toggleProvider('{{ $name }}')"
                            class="text-xs px-3 py-1 rounded border font-medium
                                {{ $status['disabled'] ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100' : 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100' }}">
                            {{ $status['disabled'] ? 'Enable' : 'Disable' }}
                        </button>

                        @if (!$status['healthy'])
                            <button wire:click="clearCircuitBreaker('{{ $name }}')"
                                class="text-xs px-3 py-1 rounded border font-medium bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100">
                                Clear Circuit
                            </button>
                        @endif
                    </div>
                </div>
            @endforeach
        </div>
    </x-filament::section>

    {{-- Feature Routing Table --}}
    <x-filament::section heading="Feature Routes" description="Provider preference order per AI feature. Edit config/ai.php to change.">
        <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
                <thead>
                    <tr class="border-b dark:border-gray-700">
                        <th class="text-left py-2 pr-4 font-medium text-gray-500 dark:text-gray-400">Feature</th>
                        <th class="text-left py-2 font-medium text-gray-500 dark:text-gray-400">Provider Order (primary → fallback)</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($featureRoutes as $feature => $providers)
                        <tr class="border-b dark:border-gray-700">
                            <td class="py-2 pr-4 font-mono text-gray-700 dark:text-gray-300">{{ $feature }}</td>
                            <td class="py-2">
                                <div class="flex gap-2">
                                    @foreach ($providers as $i => $providerName)
                                        @php $s = $providerStatus[$providerName] ?? null; @endphp
                                        <span class="px-2 py-0.5 rounded text-xs font-medium capitalize
                                            {{ $s === null ? 'bg-gray-100 text-gray-500'
                                               : ($s['disabled'] ? 'bg-red-100 text-red-600'
                                                  : ($s['healthy'] ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')) }}">
                                            @if ($i > 0)<span class="text-gray-400 mr-1">→</span>@endif{{ $providerName }}
                                        </span>
                                    @endforeach
                                </div>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <p class="mt-3 text-xs text-gray-400">Green = healthy and active. Amber = circuit breaker open. Red = disabled via toggle above.</p>
    </x-filament::section>

</x-filament-panels::page>
