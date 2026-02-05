<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class AchievementController extends Controller
{
    /**
     * All available achievements
     */
    protected array $achievements = [
        // FIRST STEPS
        ['id' => 'FIRST_TASK', 'name' => 'Erste Schritte', 'description' => 'Löse deine erste Aufgabe', 'category' => 'first_steps', 'xp_reward' => 25, 'coin_reward' => 5],
        ['id' => 'FIRST_PERFECT', 'name' => 'Perfektionist', 'description' => 'Löse eine Aufgabe beim ersten Versuch richtig', 'category' => 'first_steps', 'xp_reward' => 50, 'coin_reward' => 10],
        ['id' => 'FIRST_UPLOAD', 'name' => 'Aufgaben-Ersteller', 'description' => 'Lade deine erste eigene Aufgabe hoch', 'category' => 'first_steps', 'xp_reward' => 30, 'coin_reward' => 5],

        // MILESTONES
        ['id' => 'TASK_10', 'name' => 'Anfänger', 'description' => 'Löse 10 Aufgaben', 'category' => 'milestones', 'xp_reward' => 100, 'coin_reward' => 25],
        ['id' => 'TASK_50', 'name' => 'Fortgeschritten', 'description' => 'Löse 50 Aufgaben', 'category' => 'milestones', 'xp_reward' => 250, 'coin_reward' => 75],
        ['id' => 'TASK_100', 'name' => 'Experte', 'description' => 'Löse 100 Aufgaben', 'category' => 'milestones', 'xp_reward' => 500, 'coin_reward' => 150],

        // STREAKS
        ['id' => 'STREAK_3', 'name' => 'Auf Kurs', 'description' => '3 Tage am Stück aktiv', 'category' => 'streaks', 'xp_reward' => 50, 'coin_reward' => 15],
        ['id' => 'STREAK_7', 'name' => 'Wochenläufer', 'description' => '7 Tage am Stück aktiv', 'category' => 'streaks', 'xp_reward' => 100, 'coin_reward' => 30],
        ['id' => 'STREAK_30', 'name' => 'Marathonläufer', 'description' => '30 Tage am Stück aktiv', 'category' => 'streaks', 'xp_reward' => 500, 'coin_reward' => 150],

        // DIFFICULTY
        ['id' => 'HARD_TASK', 'name' => 'Mutig', 'description' => 'Versuche eine schwere Aufgabe', 'category' => 'difficulty', 'xp_reward' => 75, 'coin_reward' => 20],
        ['id' => 'HARD_SOLVED', 'name' => 'Überwindung', 'description' => 'Löse 5 schwere Aufgaben', 'category' => 'difficulty', 'xp_reward' => 200, 'coin_reward' => 60],
        ['id' => 'OLYMPIAD', 'name' => 'Olympionike', 'description' => 'Löse eine Olympiade-Aufgabe', 'category' => 'difficulty', 'xp_reward' => 500, 'coin_reward' => 200],

        // SPECIAL
        ['id' => 'NIGHT_OWL', 'name' => 'Nachteule', 'description' => 'Löse eine Aufgabe zwischen 0 und 5 Uhr', 'category' => 'special', 'xp_reward' => 50, 'coin_reward' => 20],
        ['id' => 'WEEKEND_WARRIOR', 'name' => 'Wochenend-Krieger', 'description' => 'Löse eine Aufgabe am Wochenende', 'category' => 'special', 'xp_reward' => 30, 'coin_reward' => 10],
        ['id' => 'PERSISTENT', 'name' => 'Beharrlich', 'description' => 'Löse eine Aufgabe nach 5+ Versuchen', 'category' => 'special', 'xp_reward' => 100, 'coin_reward' => 35],
    ];

    /**
     * Get all available achievements
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'achievements' => $this->achievements,
        ]);
    }

    /**
     * Get user's unlocked achievements
     */
    public function userAchievements(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Nicht authentifiziert',
            ], 401);
        }

        $userAchievements = $user->achievements ?? [];
        $unlocked = [];
        $locked = [];

        foreach ($this->achievements as $achievement) {
            if (in_array($achievement['id'], $userAchievements)) {
                $unlocked[] = array_merge($achievement, ['unlocked' => true]);
            } else {
                $locked[] = array_merge($achievement, ['unlocked' => false]);
            }
        }

        return response()->json([
            'success' => true,
            'unlocked' => $unlocked,
            'locked' => $locked,
            'total' => count($this->achievements),
            'unlocked_count' => count($unlocked),
        ]);
    }

    /**
     * Check and award achievements based on user stats
     */
    public function checkAchievements(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Nicht authentifiziert',
            ], 401);
        }

        $newlyUnlocked = [];
        $userAchievements = $user->achievements ?? [];

        foreach ($this->achievements as $achievement) {
            if (in_array($achievement['id'], $userAchievements)) {
                continue; // Already unlocked
            }

            if ($this->checkAchievementCondition($user, $achievement['id'])) {
                $userAchievements[] = $achievement['id'];
                $newlyUnlocked[] = $achievement;

                // Award XP and coins
                $user->xp += $achievement['xp_reward'];
                $user->coins += $achievement['coin_reward'];
                $user->total_xp_earned += $achievement['xp_reward'];
                $user->total_coins_earned += $achievement['coin_reward'];
            }
        }

        if (!empty($newlyUnlocked)) {
            $user->achievements = $userAchievements;
            $user->save();
        }

        return response()->json([
            'success' => true,
            'newly_unlocked' => $newlyUnlocked,
            'total_unlocked' => count($userAchievements),
        ]);
    }

    /**
     * Check if a specific achievement condition is met
     */
    protected function checkAchievementCondition(User $user, string $achievementId): bool
    {
        return match ($achievementId) {
            'FIRST_TASK' => $user->tasks_completed >= 1,
            'FIRST_PERFECT' => $user->perfect_solves >= 1,
            'FIRST_UPLOAD' => $user->tasks_uploaded >= 1,
            'TASK_10' => $user->tasks_completed >= 10,
            'TASK_50' => $user->tasks_completed >= 50,
            'TASK_100' => $user->tasks_completed >= 100,
            'STREAK_3' => $user->current_streak >= 3,
            'STREAK_7' => $user->current_streak >= 7,
            'STREAK_30' => $user->current_streak >= 30,
            'HARD_TASK' => $user->attempted_hard_task ?? false,
            'HARD_SOLVED' => ($user->hard_tasks_solved ?? 0) >= 5,
            'OLYMPIAD' => ($user->olympiad_tasks_solved ?? 0) >= 1,
            'NIGHT_OWL' => $user->has_night_activity ?? false,
            'WEEKEND_WARRIOR' => $user->has_weekend_activity ?? false,
            'PERSISTENT' => $user->solved_after_many_attempts ?? false,
            default => false,
        };
    }

    /**
     * Get authenticated user from request
     */
    protected function getAuthenticatedUser(Request $request): ?User
    {
        $token = $request->bearerToken() ?? $request->header('X-API-Token');

        if (!$token) {
            return null;
        }

        return User::where('api_token', $token)->first();
    }
}
