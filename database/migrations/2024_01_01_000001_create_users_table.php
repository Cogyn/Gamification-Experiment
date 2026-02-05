<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('api_token', 80)->nullable()->unique();
            $table->string('avatar')->nullable();
            $table->rememberToken();

            // Gamification fields
            $table->integer('level')->default(1);
            $table->integer('xp')->default(0);
            $table->integer('total_xp_earned')->default(0);
            $table->integer('coins')->default(0);
            $table->integer('total_coins_earned')->default(0);

            // Streak tracking
            $table->integer('current_streak')->default(0);
            $table->integer('longest_streak')->default(0);
            $table->timestamp('last_activity_date')->nullable();

            // Task statistics
            $table->integer('tasks_completed')->default(0);
            $table->integer('tasks_uploaded')->default(0);
            $table->integer('image_tasks_uploaded')->default(0);
            $table->integer('perfect_solves')->default(0);
            $table->integer('perfect_streak')->default(0);

            // Difficulty tracking
            $table->integer('hard_tasks_solved')->default(0);
            $table->integer('olympiad_tasks_solved')->default(0);
            $table->boolean('attempted_hard_task')->default(false);

            // Special achievement tracking
            $table->boolean('has_night_activity')->default(false);
            $table->boolean('has_weekend_activity')->default(false);
            $table->boolean('solved_after_many_attempts')->default(false);

            // Hints
            $table->integer('hints_used')->default(0);

            // Learning preferences
            $table->string('learning_style')->nullable();
            $table->json('weak_topics')->nullable();

            // Subject mastery
            $table->json('subject_mastery')->nullable();

            // Achievements
            $table->json('achievements')->nullable();
            $table->json('achievement_timestamps')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
