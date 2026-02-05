<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'api_token' => Str::random(60),
        ]);

        return response()->json([
            'success' => true,
            'user' => $user->only(['id', 'name', 'email']),
            'token' => $user->api_token,
        ], 201);
    }

    /**
     * Login user
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Ungültige Anmeldedaten',
            ], 401);
        }

        // Regenerate token
        $user->api_token = Str::random(60);
        $user->save();

        return response()->json([
            'success' => true,
            'user' => $user->getPublicData(),
            'token' => $user->api_token,
        ]);
    }

    /**
     * Get user profile
     */
    public function profile(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Nicht authentifiziert',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'user' => $user->getPublicData(),
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Nicht authentifiziert',
            ], 401);
        }

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'avatar' => 'nullable|string',
            'learning_style' => 'nullable|string|in:visual,step-by-step,conceptual,practical',
            'weak_topics' => 'nullable|array',
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'user' => $user->getPublicData(),
        ]);
    }

    /**
     * Get user stats
     */
    public function stats(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Nicht authentifiziert',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'stats' => [
                'level' => $user->level,
                'xp' => $user->xp,
                'total_xp' => $user->total_xp_earned,
                'coins' => $user->coins,
                'current_streak' => $user->current_streak,
                'longest_streak' => $user->longest_streak,
                'tasks_completed' => $user->tasks_completed,
                'perfect_solves' => $user->perfect_solves,
                'achievements_count' => count($user->achievements ?? []),
            ],
        ]);
    }

    /**
     * Add XP to user
     */
    public function addXP(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Nicht authentifiziert',
            ], 401);
        }

        $validated = $request->validate([
            'amount' => 'required|integer|min:1|max:10000',
        ]);

        $result = $user->addXP($validated['amount']);

        return response()->json([
            'success' => true,
            'xp' => $user->xp,
            'level' => $user->level,
            'leveled_up' => $result['leveled_up'],
        ]);
    }

    /**
     * Add coins to user
     */
    public function addCoins(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Nicht authentifiziert',
            ], 401);
        }

        $validated = $request->validate([
            'amount' => 'required|integer|min:1|max:10000',
        ]);

        $user->addCoins($validated['amount']);

        return response()->json([
            'success' => true,
            'coins' => $user->coins,
        ]);
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
