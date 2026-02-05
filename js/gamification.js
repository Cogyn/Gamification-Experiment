// Gamification System - XP, Levels, Coins, Streaks

// Global flag to prevent recursive achievement checks
let _achievementCheckInProgress = false;

// XP Calculation based on difficulty and streak
function calculateXP(difficulty, streak = 0) {
  const baseXP = difficulty * CONFIG.baseXPPerDifficulty;
  const streakBonus = Math.min(streak * CONFIG.streakBonusPerDay, CONFIG.maxStreakMultiplier);
  return Math.floor(baseXP * (1 + streakBonus));
}

// Get XP required for next level
function getXPForNextLevel(level) {
  return CONFIG.xpCurve[level + 1] || CONFIG.xpCurve[100];
}

// Get XP required for current level
function getXPForCurrentLevel(level) {
  return CONFIG.xpCurve[level] || 0;
}

// Calculate progress percentage to next level
function getLevelProgress(user) {
  const currentLevelXP = getXPForCurrentLevel(user.level);
  const nextLevelXP = getXPForNextLevel(user.level);
  const totalXP = user.xp + currentLevelXP;
  const progress = ((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

// Add XP and handle level ups
function addXP(amount, fromAchievement = false) {
  const user = getUserData();
  user.xp += amount;

  // Track total XP earned (for achievements like XP_HUNTER)
  user.totalXPEarned = (user.totalXPEarned || 0) + amount;

  let leveledUp = false;
  let newLevel = user.level;

  // Check for level up(s)
  while (user.xp >= getXPForNextLevel(user.level)) {
    const xpNeeded = getXPForNextLevel(user.level);
    user.xp -= (xpNeeded - getXPForCurrentLevel(user.level));
    user.level++;
    leveledUp = true;
    newLevel = user.level;
  }

  saveUserData(user);

  if (leveledUp) {
    triggerLevelUpAnimation(newLevel);
  }

  // Check for achievements after XP gain (but NOT if this XP came from an achievement)
  // This prevents the recursive loop: addXP -> checkAchievements -> unlockAchievements -> addXP
  if (!fromAchievement && !_achievementCheckInProgress && typeof checkAchievements === 'function') {
    checkAchievements();
  }

  return { leveledUp, newLevel };
}

// Level up animation/notification
function triggerLevelUpAnimation(newLevel) {
  // Create level up overlay
  const overlay = document.createElement('div');
  overlay.className = 'level-up-overlay';
  overlay.innerHTML = `
    <div class="level-up-content">
      <div class="level-up-icon">🎉</div>
      <h2>Level Up!</h2>
      <div class="level-up-badge">
        <span class="level-number">${newLevel}</span>
      </div>
      <p>You've reached level ${newLevel}!</p>
    </div>
  `;
  document.body.appendChild(overlay);

  // Remove after 3 seconds
  setTimeout(() => {
    overlay.classList.add('fade-out');
    setTimeout(() => overlay.remove(), 500);
  }, 3000);
}

// Update streak system
function updateStreak() {
  const user = getUserData();
  const today = new Date().toDateString();
  const lastActivity = user.lastActivityDate;

  if (lastActivity === today) {
    return user.currentStreak; // Already counted today
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (lastActivity === yesterday.toDateString()) {
    user.currentStreak++;
  } else {
    user.currentStreak = 1;
  }

  user.longestStreak = Math.max(user.currentStreak, user.longestStreak);
  user.lastActivityDate = today;
  saveUserData(user);

  return user.currentStreak;
}

// Calculate coins reward
function calculateCoins(difficulty) {
  return CONFIG.baseCoinsPerTask + (difficulty * CONFIG.coinsPerDifficulty);
}

// Add coins to user
function addCoins(amount, fromAchievement = false) {
  const user = getUserData();
  user.coins += amount;

  // Track total coins earned
  user.totalCoinsEarned = (user.totalCoinsEarned || 0) + amount;

  saveUserData(user);

  // Check for achievements after coin gain (but NOT if this came from an achievement)
  // This prevents the recursive loop: addCoins -> checkAchievements -> unlockAchievements -> addCoins
  if (!fromAchievement && !_achievementCheckInProgress && typeof checkAchievements === 'function') {
    checkAchievements();
  }
}

// Update subject mastery
function updateSubjectMastery(subjectId, xpGained) {
  const user = getUserData();
  const subject = CONFIG.subjects.find(s => s.id === subjectId);

  if (!subject) return;

  if (!user.subjectMastery[subject.slug]) {
    user.subjectMastery[subject.slug] = {
      level: 1,
      xp: 0,
      tasksCompleted: 0,
    };
  }

  const mastery = user.subjectMastery[subject.slug];
  mastery.xp += xpGained;
  mastery.tasksCompleted++;

  // Simple level up for subject mastery (every 500 XP)
  while (mastery.xp >= mastery.level * 500) {
    mastery.xp -= mastery.level * 500;
    mastery.level++;
  }

  saveUserData(user);
}

// Award rewards for completing a task
function awardTaskCompletion(task) {
  const user = getUserData();
  const streak = updateStreak();
  const xp = calculateXP(task.difficulty, streak);
  const coins = calculateCoins(task.difficulty);

  const result = addXP(xp);
  addCoins(coins);
  updateSubjectMastery(task.subjectId, xp);

  return {
    xp,
    coins,
    leveledUp: result.leveledUp,
    newLevel: result.newLevel,
    streak,
  };
}

// Display reward notification
function showRewardNotification(rewards) {
  const notification = document.createElement('div');
  notification.className = 'reward-notification';

  let content = `
    <div class="reward-item">
      <span class="reward-icon">⭐</span>
      <span>+${rewards.xp} XP</span>
    </div>
    <div class="reward-item">
      <span class="reward-icon">🪙</span>
      <span>+${rewards.coins} Coins</span>
    </div>
  `;

  if (rewards.streak > 1) {
    content += `
      <div class="reward-item streak">
        <span class="reward-icon">🔥</span>
        <span>${rewards.streak} Day Streak!</span>
      </div>
    `;
  }

  notification.innerHTML = content;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}
