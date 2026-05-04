<?php

declare(strict_types=1);

namespace App\Livewire;

use App\Services\ImpersonationService;
use Illuminate\View\View;
use Livewire\Component;

class ImpersonationBanner extends Component
{
    public bool $isImpersonating = false;

    public ?int $actorId = null;

    public string $token = '';

    public function mount(): void
    {
        $this->token = (string) request()->header('X-Impersonation-Token', '');

        if ($this->token !== '') {
            $data = app(ImpersonationService::class)->resolve($this->token);

            if ($data !== null) {
                $this->isImpersonating = true;
                $this->actorId = $data['actor_id'];
            }
        }
    }

    public function end(): void
    {
        if ($this->token !== '') {
            app(ImpersonationService::class)->end($this->token);
        }

        $this->isImpersonating = false;
        $this->dispatch('impersonation-ended');
    }

    public function render(): View
    {
        return view('livewire.impersonation-banner');
    }
}
