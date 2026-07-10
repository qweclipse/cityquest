<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ModerationAction extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'moderator_id',
        'entity_type',
        'entity_id',
        'action',
        'old_status',
        'new_status',
        'note',
    ];

    public function moderator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'moderator_id');
    }
}
