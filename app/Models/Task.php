<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'content',
        'subject_id',
        'topic',
        'difficulty',
        'has_image',
        'image_data',
        'status',
        'attempts',
        'solved_at',
        'xp_reward',
        'coins_reward',
        'attempt_history',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'has_image' => 'boolean',
        'image_data' => 'array',
        'attempt_history' => 'array',
        'solved_at' => 'datetime',
    ];

    /**
     * Default attribute values
     */
    protected $attributes = [
        'status' => 'ready',
        'attempts' => 0,
        'difficulty' => 5,
        'has_image' => false,
    ];

    /**
     * Subject names mapping
     */
    public const SUBJECTS = [
        1 => 'Mathematik',
        2 => 'Physik',
        3 => 'Chemie',
    ];

    /**
     * Get the user that owns the task
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get subject name
     */
    public function getSubjectNameAttribute(): string
    {
        return self::SUBJECTS[$this->subject_id] ?? 'Unbekannt';
    }

    /**
     * Scope for ready tasks
     */
    public function scopeReady($query)
    {
        return $query->where('status', 'ready');
    }

    /**
     * Scope for solved tasks
     */
    public function scopeSolved($query)
    {
        return $query->where('status', 'solved');
    }

    /**
     * Scope for in-progress tasks
     */
    public function scopeInProgress($query)
    {
        return $query->where('status', 'in-progress');
    }
}
