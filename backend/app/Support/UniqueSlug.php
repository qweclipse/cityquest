<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class UniqueSlug
{
    /**
     * @param class-string<Model> $modelClass
     */
    public static function make(string $modelClass, string $source, ?callable $scope = null): string
    {
        $base = Str::slug(Str::ascii($source));

        if ($base === '') {
            $base = 'cityquest-'.Str::lower(Str::random(6));
        }

        $slug = $base;
        $counter = 2;

        while (self::exists($modelClass, $slug, $scope)) {
            $slug = $base.'-'.$counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * @param class-string<Model> $modelClass
     */
    private static function exists(string $modelClass, string $slug, ?callable $scope): bool
    {
        /** @var Builder $query */
        $query = $modelClass::query()->where('slug', $slug);

        if ($scope !== null) {
            $scope($query);
        }

        return $query->exists();
    }
}
