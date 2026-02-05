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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');

            // Task content
            $table->text('content');
            $table->tinyInteger('subject_id'); // 1=Math, 2=Physics, 3=Chemistry
            $table->string('topic')->nullable();
            $table->tinyInteger('difficulty')->default(5); // 1-10

            // Image data
            $table->boolean('has_image')->default(false);
            $table->json('image_data')->nullable();

            // Status and progress
            $table->string('status')->default('ready'); // ready, in-progress, solved
            $table->integer('attempts')->default(0);
            $table->timestamp('solved_at')->nullable();

            // Rewards
            $table->integer('xp_reward')->default(50);
            $table->integer('coins_reward')->default(10);

            // Attempt history
            $table->json('attempt_history')->nullable();

            $table->timestamps();

            // Indexes
            $table->index('status');
            $table->index('subject_id');
            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
