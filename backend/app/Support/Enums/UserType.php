<?php

declare(strict_types=1);

namespace App\Support\Enums;

enum UserType: string
{
    case Student = 'student';
    case Parent = 'parent';
    case Admin = 'admin';

    public function label(): string
    {
        return match ($this) {
            self::Student => 'Student',
            self::Parent => 'Parent',
            self::Admin => 'Admin',
        };
    }
}
