@if ($isImpersonating)
    <div class="bg-yellow-400 text-yellow-900 text-sm font-medium px-4 py-2 flex items-center justify-between">
        <span>
            You are viewing this account as admin (actor #{{ $actorId }}).
            Read-only mode is active — write operations are blocked.
        </span>
        <button
            wire:click="end"
            class="ml-4 bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-semibold px-3 py-1 rounded transition"
        >
            Exit Impersonation
        </button>
    </div>
@endif
