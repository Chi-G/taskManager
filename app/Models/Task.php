<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'is_completed',
        'due_date',
        'list_id'
    ];

    protected $casts = [
        'is_completed' => 'boolean',
        'due_date' => 'date'
    ];

    public function list(): BelongsTo
    {
        return $this->belongsTo(TaskList::class, 'list_id');
    }
}