<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'api_token',
        'avatar',
        'level',
        'xp',
        'total_xp_earned',
        'coins',
        'total_coins_earned',
        'current_streak',
        'longest_streak',
        'last_activity_date',
        'tasks_completed',
        'tasks_uploaded',
        'image_tasks_uploaded',
        'perfect_solves',
        'perfect_streak',
        'hard_tasks_solved',
        'olympiad_tasks_solved',
        'attempted_hard_task',
        'has_night_activity',
        'has_weekend_activity',
        'solved_after_many_attempts',
        'hints_used',
        'learning_style',
        'weak_topics',
        'subject_mastery',
        'achievements',
        'achievement_timestamps',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'api_token',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'last_activity_date' => 'datetime',
        'weak_topics' => 'array',
        'subject_mastery' => 'array',
        'achievements' => 'array',
        'achievement_timestamps' => 'array',
        'attempted_hard_task' => 'boolean',
        'has_night_activity' => 'boolean',
        'has_weekend_activity' => 'boolean',
        'solved_after_many_attempts' => 'boolean',
    ];

    /**
     * Default attribute values
     */
    protected $attributes = [
        'level' => 1,
        'xp' => 0,
        'total_xp_earned' => 0,
        'coins' => 0,
        'total_coins_earned' => 0,
        'current_streak' => 0,
        'longest_streak' => 0,
        'tasks_completed' => 0,
        'tasks_uploaded' => 0,
        'image_tasks_uploaded' => 0,
        'perfect_solves' => 0,
        'perfect_streak' => 0,
        'hard_tasks_solved' => 0,
        'olympiad_tasks_solved' => 0,
        'hints_used' => 0,
    ];

    /**
     * Get public user data (without sensitive fields)
     */
    public function getPublicData(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar' => $this->avatar,
            'level' => $this->level,
            'xp' => $this->xp,
            'total_xp_earned' => $this->total_xp_earned,
            'coins' => $this->coins,
            'current_streak' => $this->current_streak,
            'longest_streak' => $this->longest_streak,
            'tasks_completed' => $this->tasks_completed,
            'tasks_uploaded' => $this->tasks_uploaded,
            'perfect_solves' => $this->perfect_solves,
            'learning_style' => $this->learning_style,
            'achievements' => $this->achievements ?? [],
            'achievements_count' => count($this->achievements ?? []),
        ];
    }

    /**
     * Get XP needed for next level
     */
    public function getXPForNextLevel(): int
    {
        return 100 + ($this->level * 50);
    }

    /**
     * Add XP and check for level up
     */
    public function addXP(int $amount): array
    {
        $this->xp += $amount;
        $this->total_xp_earned += $amount;

        $leveledUp = false;
        $newLevel = $this->level;

        while ($this->xp >= $this->getXPForNextLevel()) {
            $this->xp -= $this->getXPForNextLevel();
            $this->level++;
            $leveledUp = true;
            $newLevel = $this->level;
        }

        $this->save();

        return [
            'leveled_up' => $leveledUp,
            'new_level' => $newLevel,
            'current_xp' => $this->xp,
            'xp_for_next' => $this->getXPForNextLevel(),
        ];
    }

    /**
     * Add coins
     */
    public function addCoins(int $amount): void
    {
        $this->coins += $amount;
        $this->total_coins_earned += $amount;
        $this->save();
    }

    /**
     * Update streak
     */
    public function updateStreak(): void
    {
        $today = now()->startOfDay();
        $lastActivity = $this->last_activity_date?->startOfDay();

        if (!$lastActivity) {
            // First activity
            $this->current_streak = 1;
        } elseif ($lastActivity->equalTo($today)) {
            // Already active today, no change
            return;
        } elseif ($lastActivity->equalTo($today->copy()->subDay())) {
            // Consecutive day
            $this->current_streak++;
        } else {
            // Streak broken
            $this->current_streak = 1;
        }

        $this->last_activity_date = $today;
        $this->longest_streak = max($this->longest_streak, $this->current_streak);
        $this->save();
    }

    /**
     * Get tasks relationship
     */
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
}
