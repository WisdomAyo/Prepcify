<?php

declare(strict_types=1);

namespace App\Filament\Resources\QuestionDraftsResource\Pages;

use App\Filament\Resources\QuestionDraftsResource;
use Filament\Resources\Pages\ListRecords;

class ListQuestionDrafts extends ListRecords
{
    protected static string $resource = QuestionDraftsResource::class;
}
