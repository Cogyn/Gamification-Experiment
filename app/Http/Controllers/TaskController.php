<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Task;
use App\Models\User;

class TaskController extends Controller
{
    /**
     * List all tasks for the authenticated user
     */
    public function index(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);

        $query = Task::query();

        // Filter by user if authenticated
        if ($user) {
            $query->where('user_id', $user->id);
        }

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        if ($request->has('difficulty')) {
            $query->where('difficulty', $request->difficulty);
        }

        $tasks = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'tasks' => $tasks,
            'count' => $tasks->count(),
        ]);
    }

    /**
     * Create a new task
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'content' => 'required|string',
            'subject_id' => 'required|integer|in:1,2,3',
            'topic' => 'nullable|string|max:255',
            'difficulty' => 'nullable|integer|min:1|max:10',
            'has_image' => 'nullable|boolean',
            'image_data' => 'nullable|array',
        ]);

        $user = $this->getAuthenticatedUser($request);

        $task = Task::create([
            'user_id' => $user?->id,
            'content' => $validated['content'],
            'subject_id' => $validated['subject_id'],
            'topic' => $validated['topic'] ?? null,
            'difficulty' => $validated['difficulty'] ?? 5,
            'has_image' => $validated['has_image'] ?? false,
            'image_data' => $validated['image_data'] ?? null,
            'status' => 'ready',
            'xp_reward' => $this->calculateXPReward($validated['difficulty'] ?? 5),
            'coins_reward' => $this->calculateCoinsReward($validated['difficulty'] ?? 5),
        ]);

        // Update user stats
        if ($user) {
            $user->increment('tasks_uploaded');
            if ($validated['has_image'] ?? false) {
                $user->increment('image_tasks_uploaded');
            }
        }

        return response()->json([
            'success' => true,
            'task' => $task,
        ], 201);
    }

    /**
     * Get a specific task
     */
    public function show(Request $request, $id)
    {
        $task = Task::find($id);

        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Aufgabe nicht gefunden',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'task' => $task,
        ]);
    }

    /**
     * Update a task
     */
    public function update(Request $request, $id)
    {
        $task = Task::find($id);

        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Aufgabe nicht gefunden',
            ], 404);
        }

        $validated = $request->validate([
            'status' => 'nullable|string|in:ready,in-progress,solved',
            'attempts' => 'nullable|integer|min:0',
            'solved_at' => 'nullable|date',
        ]);

        $task->update($validated);

        return response()->json([
            'success' => true,
            'task' => $task,
        ]);
    }

    /**
     * Delete a task
     */
    public function destroy(Request $request, $id)
    {
        $task = Task::find($id);

        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Aufgabe nicht gefunden',
            ], 404);
        }

        $task->delete();

        return response()->json([
            'success' => true,
            'message' => 'Aufgabe gelöscht',
        ]);
    }

    /**
     * Record a task attempt
     */
    public function recordAttempt(Request $request, $id)
    {
        $task = Task::find($id);

        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Aufgabe nicht gefunden',
            ], 404);
        }

        $validated = $request->validate([
            'correct' => 'required|boolean',
            'time_spent' => 'nullable|numeric',
            'feedback' => 'nullable|array',
        ]);

        $task->increment('attempts');

        if ($validated['correct']) {
            $task->update([
                'status' => 'solved',
                'solved_at' => now(),
            ]);
        } else {
            $task->update(['status' => 'in-progress']);
        }

        // Store attempt in task history
        $attempts = $task->attempt_history ?? [];
        $attempts[] = [
            'timestamp' => now()->toIso8601String(),
            'correct' => $validated['correct'],
            'time_spent' => $validated['time_spent'] ?? null,
        ];
        $task->update(['attempt_history' => $attempts]);

        return response()->json([
            'success' => true,
            'task' => $task,
            'attempt_number' => $task->attempts,
        ]);
    }

    /**
     * Calculate XP reward based on difficulty
     */
    protected function calculateXPReward(int $difficulty): int
    {
        $baseXP = 50;
        return (int) round($baseXP * (1 + ($difficulty / 10)));
    }

    /**
     * Calculate coins reward based on difficulty
     */
    protected function calculateCoinsReward(int $difficulty): int
    {
        $baseCoins = 10;
        return (int) round($baseCoins * (1 + ($difficulty / 10)));
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
