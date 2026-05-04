<x-filament-widgets::widget>
    <x-filament::section heading="Question Coverage Heatmap" description="Published questions by subject × year">
        @if (empty($rows))
            <p class="text-sm text-gray-400">No published questions with year data yet.</p>
        @else
            <div class="overflow-x-auto">
                <table class="min-w-full text-xs">
                    <thead>
                        <tr>
                            <th class="text-left py-1 pr-4 font-semibold text-gray-500">Subject</th>
                            @foreach ($years as $year)
                                <th class="px-2 py-1 font-mono text-gray-400 text-center">{{ $year }}</th>
                            @endforeach
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($rows as $row)
                            <tr class="border-t border-gray-100 dark:border-gray-700">
                                <td class="py-1 pr-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">{{ $row['subject'] }}</td>
                                @foreach ($years as $year)
                                    @php
                                        $count = $row['by_year'][$year] ?? 0;
                                        $intensity = match(true) {
                                            $count === 0 => 'bg-gray-100 dark:bg-gray-800 text-gray-400',
                                            $count < 10  => 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
                                            $count < 30  => 'bg-green-300 dark:bg-green-700/50 text-green-900 dark:text-green-100',
                                            default      => 'bg-green-500 text-white',
                                        };
                                    @endphp
                                    <td class="px-2 py-1 text-center rounded {{ $intensity }}">
                                        {{ $count > 0 ? $count : '–' }}
                                    </td>
                                @endforeach
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif
    </x-filament::section>
</x-filament-widgets::widget>
