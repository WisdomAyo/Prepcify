<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Default Hash Driver
    |--------------------------------------------------------------------------
    | Argon2id is required by the Lumio security spec. It offers superior
    | resistance to GPU cracking attacks vs bcrypt.
    |
    | Supported: "bcrypt", "argon", "argon2id"
    */

    'driver' => 'argon2id',

    /*
    |--------------------------------------------------------------------------
    | Bcrypt Options (unused — kept for reference if driver is switched)
    |--------------------------------------------------------------------------
    */

    'bcrypt' => [
        'rounds' => env('BCRYPT_ROUNDS', 12),
        'verify' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Argon Options
    |--------------------------------------------------------------------------
    */

    'argon' => [
        'memory' => 65536,
        'threads' => 1,
        'time' => 4,
        'verify' => true,
    ],

];
