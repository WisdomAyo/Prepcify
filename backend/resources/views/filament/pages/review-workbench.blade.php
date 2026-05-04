<x-filament-panels::page>
    <div
        x-data="{
            startTime: Date.now(),
            elapsedMs() { return Date.now() - this.startTime; },
            resetTimer() { this.startTime = Date.now(); },
            showHelp: false,
        }"
        @keydown.window="
            if ($event.key === '?' && !$event.target.matches('textarea, input')) { showHelp = !showHelp; return; }
            if ($event.target.matches('textarea, input')) return;
            if ($event.key === 'a' || $event.key === 'A') { $wire.approve(elapsedMs()); resetTimer(); }
            if ($event.key === 'r' || $event.key === 'R') { $wire.reject(elapsedMs()); resetTimer(); }
            if ($event.key === 'e' || $event.key === 'E') { $wire.escalate(elapsedMs()); resetTimer(); }
            if ($event.key === 's' || $event.key === 'S') { $wire.skip(elapsedMs()); resetTimer(); }
        "
        class="flex flex-col h-full"
    >
        {{-- Help overlay --}}
        <div
            x-show="showHelp"
            x-cloak
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            @click.self="showHelp = false"
        >
            <div class="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 max-w-sm w-full">
                <h2 class="text-lg font-bold mb-4">Keyboard Shortcuts</h2>
                <table class="w-full text-sm">
                    <tbody>
                        <tr><td class="font-mono pr-4 py-1">A</td><td>Approve</td></tr>
                        <tr><td class="font-mono pr-4 py-1">R</td><td>Reject</td></tr>
                        <tr><td class="font-mono pr-4 py-1">E</td><td>Escalate</td></tr>
                        <tr><td class="font-mono pr-4 py-1">S</td><td>Skip</td></tr>
                        <tr><td class="font-mono pr-4 py-1">?</td><td>Toggle help</td></tr>
                    </tbody>
                </table>
                <button @click="showHelp = false" class="mt-4 text-sm text-gray-500 hover:text-gray-800">Close</button>
            </div>
        </div>

        {{-- Queue counter + help button --}}
        <div class="flex items-center justify-between mb-4">
            <div class="text-sm text-gray-500 dark:text-gray-400">
                <span class="font-semibold text-gray-800 dark:text-gray-200">{{ $queueCount }}</span> pending in queue
            </div>
            <button @click="showHelp = true" class="text-xs text-gray-400 hover:text-gray-600 border rounded px-2 py-1">
                ? Help
            </button>
        </div>

        @if ($currentDraft === null)
            <div class="flex-1 flex items-center justify-center text-gray-400 text-lg">
                No pending drafts — you're all caught up!
            </div>
        @else
            <div class="grid grid-cols-12 gap-4 flex-1 min-h-0">

                {{-- Column 1: Source evidence (35%) --}}
                <div class="col-span-4 flex flex-col gap-4 overflow-y-auto">
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                        <h3 class="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">Question</h3>
                        <p class="text-sm leading-relaxed">{{ $currentDraft['question']['stem'] ?? '—' }}</p>
                    </div>

                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                        <h3 class="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">Submitted by</h3>
                        <p class="text-sm">{{ $currentDraft['submitter'] ?? 'Unknown' }}</p>
                        <p class="text-xs text-gray-400 mt-1">{{ $currentDraft['submitted_at'] ?? '' }}</p>
                    </div>
                </div>

                {{-- Column 2: Editable draft / solution (40%) --}}
                <div class="col-span-5 flex flex-col gap-4 overflow-y-auto">
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex-1">
                        <h3 class="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">Solution / Explanation</h3>
                        <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ $currentDraft['question']['explanation'] ?? 'No explanation provided.' }}</p>
                    </div>

                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                        <h3 class="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">Reviewer Notes</h3>
                        <textarea
                            wire:model="reviewerNotes"
                            rows="4"
                            placeholder="Add notes for rejection or escalation..."
                            class="w-full text-sm border-0 bg-transparent resize-none focus:ring-0 dark:text-gray-200 dark:placeholder-gray-500"
                        ></textarea>
                    </div>
                </div>

                {{-- Column 3: Actions (25%) --}}
                <div class="col-span-3 flex flex-col gap-3">
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                        <h3 class="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-3">Actions</h3>

                        <button
                            @click="$wire.approve(elapsedMs()); resetTimer()"
                            class="w-full mb-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg py-2 flex items-center justify-between px-3 transition"
                        >
                            <span>Approve</span>
                            <span class="font-mono text-xs opacity-70">A</span>
                        </button>

                        <button
                            @click="$wire.reject(elapsedMs()); resetTimer()"
                            class="w-full mb-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg py-2 flex items-center justify-between px-3 transition"
                        >
                            <span>Reject</span>
                            <span class="font-mono text-xs opacity-70">R</span>
                        </button>

                        <button
                            @click="$wire.escalate(elapsedMs()); resetTimer()"
                            class="w-full mb-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-lg py-2 flex items-center justify-between px-3 transition"
                        >
                            <span>Escalate</span>
                            <span class="font-mono text-xs opacity-70">E</span>
                        </button>

                        <button
                            @click="$wire.skip(elapsedMs()); resetTimer()"
                            class="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg py-2 flex items-center justify-between px-3 transition"
                        >
                            <span>Skip</span>
                            <span class="font-mono text-xs opacity-70">S</span>
                        </button>
                    </div>

                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4 text-xs text-gray-400">
                        Draft #{{ $currentDraftId }}
                    </div>
                </div>

            </div>
        @endif
    </div>
</x-filament-panels::page>
