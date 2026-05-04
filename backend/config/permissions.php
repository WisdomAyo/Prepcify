<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Lumio Permission Registry
|--------------------------------------------------------------------------
| Single source of truth for all permission strings in the system.
|
| Naming convention: resource.action (lowercase, dot-separated)
| Adding a new exam body / feature = add permissions here + re-run seeder.
|
| The 'roles' array maps role names to their permission lists.
| Use '*' for Superadmin (all permissions).
| Use 'resource.*' for wildcard expansion (RoleSeeder handles expansion).
*/

return [

    'permissions' => [
        // User management
        'users.search',
        'users.view',
        'users.edit',
        'users.delete',
        'users.restore',
        'users.grant_pro',
        'users.impersonate',
        'users.export_data',

        // Exam bodies
        'exams.view',
        'exams.create',
        'exams.edit',
        'exams.delete',

        // Subjects
        'subjects.view',
        'subjects.create',
        'subjects.edit',
        'subjects.delete',

        // Questions
        'questions.view',
        'questions.create',
        'questions.edit',
        'questions.delete',
        'questions.review',
        'questions.approve',
        'questions.reject',
        'questions.flag_review',
        'questions.impersonate',

        // Topics
        'topics.view',
        'topics.create',
        'topics.edit',
        'topics.delete',
        'topics.propose',

        // Papers
        'papers.view',
        'papers.create',
        'papers.edit',
        'papers.delete',

        // Diagrams
        'diagrams.view',
        'diagrams.create',
        'diagrams.edit',
        'diagrams.delete',

        // Solutions
        'solutions.view',
        'solutions.create',
        'solutions.edit',
        'solutions.delete',

        // Plans / Billing
        'plans.view',
        'plans.create',
        'plans.edit',
        'plans.delete',
        'coupons.view',
        'coupons.create',
        'coupons.edit',
        'coupons.delete',

        // Payments
        'payments.view',
        'payments.refund_small',
        'payments.refund_large',

        // Flags
        'flags.view',
        'flags.resolve',

        // Notifications
        'notifications.templates.view',
        'notifications.templates.create',
        'notifications.templates.edit',

        // AI configuration
        'ai.config.view',
        'ai.config.edit',

        // Reviewer management
        'reviewers.assign',

        // Support tickets
        'tickets.view',
        'tickets.reply',
        'tickets.close',
        'tickets.assign',

        // System
        'audit.view',
        'roles.view',
        'roles.edit',
    ],

    'roles' => [
        // Wildcard '*' = RoleSeeder assigns ALL permissions
        'Superadmin' => '*',

        'Operations Admin' => [
            'exams.*',
            'subjects.*',
            'plans.*',
            'coupons.*',
            'flags.*',
            'notifications.templates.*',
            'ai.config.*',
            'audit.view',
        ],

        'Content Lead' => [
            'questions.*',
            'topics.*',
            'papers.*',
            'diagrams.*',
            'solutions.*',
            'reviewers.assign',
        ],

        'Content Reviewer' => [
            'questions.review',
            'questions.approve',
            'questions.reject',
            'topics.propose',
        ],

        'Support Agent' => [
            'users.search',
            'users.view',
            'users.grant_pro',
            'users.impersonate',
            'users.export_data',
            'payments.refund_small',
            'questions.flag_review',
            'questions.impersonate',
            'tickets.view',
            'tickets.reply',
            'tickets.close',
            'tickets.assign',
        ],
    ],
];
