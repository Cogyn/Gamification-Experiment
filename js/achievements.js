/**
 * Achievements System
 * Defines and manages all achievements and badges
 */

const ACHIEVEMENTS = {
    // ==================== LEVEL MILESTONES ====================
    FIRST_STEPS: {
        id: 'first_steps',
        name: 'Erste Schritte',
        description: 'Erreiche Level 1',
        icon: '🎯',
        category: 'level',
        condition: (user) => user.level >= 1,
        xpReward: 0,
        coinReward: 10
    },

    RISING_STAR: {
        id: 'rising_star',
        name: 'Aufgehender Stern',
        description: 'Erreiche Level 10',
        icon: '⭐',
        category: 'level',
        condition: (user) => user.level >= 10,
        xpReward: 100,
        coinReward: 50
    },

    VETERAN: {
        id: 'veteran',
        name: 'Veteran',
        description: 'Erreiche Level 25',
        icon: '🏅',
        category: 'level',
        condition: (user) => user.level >= 25,
        xpReward: 500,
        coinReward: 200
    },

    MASTER: {
        id: 'master',
        name: 'Meister',
        description: 'Erreiche Level 50',
        icon: '👑',
        category: 'level',
        condition: (user) => user.level >= 50,
        xpReward: 1000,
        coinReward: 500
    },

    LEGEND: {
        id: 'legend',
        name: 'Legende',
        description: 'Erreiche Level 100',
        icon: '🔱',
        category: 'level',
        condition: (user) => user.level >= 100,
        xpReward: 5000,
        coinReward: 2000
    },

    // ==================== COIN MILESTONES ====================
    FIRST_COINS: {
        id: 'first_coins',
        name: 'Erste Münzen',
        description: 'Sammle 100 Brain Coins',
        icon: '🪙',
        category: 'coins',
        condition: (user) => user.coins >= 100,
        xpReward: 50,
        coinReward: 0
    },

    WEALTHY: {
        id: 'wealthy',
        name: 'Wohlhabend',
        description: 'Sammle 1000 Brain Coins',
        icon: '💰',
        category: 'coins',
        condition: (user) => user.coins >= 1000,
        xpReward: 200,
        coinReward: 0
    },

    RICH: {
        id: 'rich',
        name: 'Reich',
        description: 'Sammle 5000 Brain Coins',
        icon: '💎',
        category: 'coins',
        condition: (user) => user.coins >= 5000,
        xpReward: 500,
        coinReward: 0
    },

    TYCOON: {
        id: 'tycoon',
        name: 'Magnat',
        description: 'Sammle 10000 Brain Coins',
        icon: '🏆',
        category: 'coins',
        condition: (user) => user.coins >= 10000,
        xpReward: 1000,
        coinReward: 0
    },

    // ==================== STREAK ACHIEVEMENTS ====================
    CONSISTENT: {
        id: 'consistent',
        name: 'Beständig',
        description: '7 Tage Streak',
        icon: '🔥',
        category: 'streak',
        condition: (user) => user.currentStreak >= 7,
        xpReward: 150,
        coinReward: 75
    },

    DEDICATED: {
        id: 'dedicated',
        name: 'Engagiert',
        description: '30 Tage Streak',
        icon: '🔥🔥',
        category: 'streak',
        condition: (user) => user.currentStreak >= 30,
        xpReward: 500,
        coinReward: 250
    },

    UNSTOPPABLE: {
        id: 'unstoppable',
        name: 'Unaufhaltsam',
        description: '100 Tage Streak',
        icon: '🔥🔥🔥',
        category: 'streak',
        condition: (user) => user.currentStreak >= 100,
        xpReward: 2000,
        coinReward: 1000
    },

    // ==================== TASK ACHIEVEMENTS ====================
    FIRST_TASK: {
        id: 'first_task',
        name: 'Erste Aufgabe',
        description: 'Löse deine erste Aufgabe',
        icon: '✅',
        category: 'tasks',
        condition: (user) => (user.tasksCompleted || 0) >= 1,
        xpReward: 25,
        coinReward: 10
    },

    PROBLEM_SOLVER: {
        id: 'problem_solver',
        name: 'Problemlöser',
        description: 'Löse 10 Aufgaben',
        icon: '📝',
        category: 'tasks',
        condition: (user) => (user.tasksCompleted || 0) >= 10,
        xpReward: 100,
        coinReward: 50
    },

    TASK_MASTER: {
        id: 'task_master',
        name: 'Aufgaben-Meister',
        description: 'Löse 100 Aufgaben',
        icon: '🏆',
        category: 'tasks',
        condition: (user) => (user.tasksCompleted || 0) >= 100,
        xpReward: 1000,
        coinReward: 500
    },

    TASK_LEGEND: {
        id: 'task_legend',
        name: 'Aufgaben-Legende',
        description: 'Löse 500 Aufgaben',
        icon: '👑',
        category: 'tasks',
        condition: (user) => (user.tasksCompleted || 0) >= 500,
        xpReward: 5000,
        coinReward: 2000
    },

    // ==================== SUBJECT MASTERY ACHIEVEMENTS ====================
    MATH_BEGINNER: {
        id: 'math_beginner',
        name: 'Mathe-Anfänger',
        description: 'Erreiche Level 5 in Mathematik',
        icon: '📐',
        category: 'subject',
        condition: (user) => user.subjectMastery?.math?.level >= 5,
        xpReward: 100,
        coinReward: 50
    },

    MATH_PRODIGY: {
        id: 'math_prodigy',
        name: 'Mathe-Genie',
        description: 'Erreiche Level 10 in Mathematik',
        icon: '🧮',
        category: 'subject',
        condition: (user) => user.subjectMastery?.math?.level >= 10,
        xpReward: 300,
        coinReward: 150
    },

    MATH_MASTER: {
        id: 'math_master',
        name: 'Mathe-Meister',
        description: 'Erreiche Level 20 in Mathematik',
        icon: '🎓',
        category: 'subject',
        condition: (user) => user.subjectMastery?.math?.level >= 20,
        xpReward: 1000,
        coinReward: 500
    },

    // ==================== SPECIAL ACHIEVEMENTS ====================
    PERFECTIONIST: {
        id: 'perfectionist',
        name: 'Perfektionist',
        description: 'Löse 10 Aufgaben beim ersten Versuch',
        icon: '💯',
        category: 'special',
        condition: (user) => (user.perfectSolves || 0) >= 10,
        xpReward: 500,
        coinReward: 250
    },

    SPEED_DEMON: {
        id: 'speed_demon',
        name: 'Schnell wie der Blitz',
        description: 'Löse eine Aufgabe in unter 60 Sekunden',
        icon: '⚡',
        category: 'special',
        condition: (user) => (user.fastestSolve || Infinity) < 60,
        xpReward: 200,
        coinReward: 100
    },

    NIGHT_OWL: {
        id: 'night_owl',
        name: 'Nachteule',
        description: 'Löse eine Aufgabe zwischen 22:00 und 06:00',
        icon: '🦉',
        category: 'special',
        condition: (user) => user.hasNightActivity || false,
        xpReward: 100,
        coinReward: 50
    },

    EARLY_BIRD: {
        id: 'early_bird',
        name: 'Frühaufsteher',
        description: 'Löse eine Aufgabe zwischen 05:00 und 07:00',
        icon: '🐦',
        category: 'special',
        condition: (user) => user.hasEarlyActivity || false,
        xpReward: 100,
        coinReward: 50
    },

    SHOPAHOLIC: {
        id: 'shopaholic',
        name: 'Kaufrausch',
        description: 'Kaufe dein erstes Item im Shop',
        icon: '🛒',
        category: 'special',
        condition: (user) => Object.keys(user.inventory || {}).length >= 1,
        xpReward: 50,
        coinReward: 0
    },

    COLLECTOR: {
        id: 'collector',
        name: 'Sammler',
        description: 'Kaufe 10 verschiedene Items',
        icon: '🎁',
        category: 'special',
        condition: (user) => Object.keys(user.inventory || {}).length >= 10,
        xpReward: 300,
        coinReward: 0
    },

    // ==================== UPLOAD ACHIEVEMENTS ====================
    FIRST_UPLOAD: {
        id: 'first_upload',
        name: 'Erster Upload',
        description: 'Lade deine erste Aufgabe hoch',
        icon: '📤',
        category: 'tasks',
        condition: (user) => (user.tasksUploaded || 0) >= 1,
        xpReward: 25,
        coinReward: 15
    },

    CONTENT_CREATOR: {
        id: 'content_creator',
        name: 'Content Creator',
        description: 'Lade 10 Aufgaben hoch',
        icon: '📚',
        category: 'tasks',
        condition: (user) => (user.tasksUploaded || 0) >= 10,
        xpReward: 150,
        coinReward: 100
    },

    TASK_LIBRARY: {
        id: 'task_library',
        name: 'Aufgabenbibliothek',
        description: 'Lade 50 Aufgaben hoch',
        icon: '🏛️',
        category: 'tasks',
        condition: (user) => (user.tasksUploaded || 0) >= 50,
        xpReward: 500,
        coinReward: 300
    },

    // ==================== IMAGE ACHIEVEMENTS ====================
    PHOTOGRAPHER: {
        id: 'photographer',
        name: 'Fotograf',
        description: 'Lade 5 Bild-Aufgaben hoch',
        icon: '📷',
        category: 'tasks',
        condition: (user) => (user.imageTasksUploaded || 0) >= 5,
        xpReward: 75,
        coinReward: 40
    },

    // ==================== DIFFICULTY ACHIEVEMENTS ====================
    BRAVE_BEGINNER: {
        id: 'brave_beginner',
        name: 'Mutiger Anfänger',
        description: 'Versuche eine schwierige Aufgabe (Stufe 7+)',
        icon: '🦁',
        category: 'special',
        condition: (user) => user.attemptedHardTask || false,
        xpReward: 50,
        coinReward: 25
    },

    CHALLENGE_SEEKER: {
        id: 'challenge_seeker',
        name: 'Herausforderungssucher',
        description: 'Löse 5 schwierige Aufgaben (Stufe 7+)',
        icon: '🎯',
        category: 'special',
        condition: (user) => (user.hardTasksSolved || 0) >= 5,
        xpReward: 300,
        coinReward: 150
    },

    OLYMPIAD_WARRIOR: {
        id: 'olympiad_warrior',
        name: 'Olympiade-Kämpfer',
        description: 'Löse eine Olympiade-Aufgabe (Stufe 10)',
        icon: '🏅',
        category: 'special',
        condition: (user) => (user.olympiadTasksSolved || 0) >= 1,
        xpReward: 500,
        coinReward: 250
    },

    // ==================== TIME-BASED ACHIEVEMENTS ====================
    WEEKEND_WARRIOR: {
        id: 'weekend_warrior',
        name: 'Wochenend-Krieger',
        description: 'Löse eine Aufgabe am Wochenende',
        icon: '🗓️',
        category: 'special',
        condition: (user) => user.hasWeekendActivity || false,
        xpReward: 50,
        coinReward: 25
    },

    MARATHON_LEARNER: {
        id: 'marathon_learner',
        name: 'Marathon-Lerner',
        description: 'Löse 10 Aufgaben an einem Tag',
        icon: '🏃',
        category: 'special',
        condition: (user) => (user.maxTasksInOneDay || 0) >= 10,
        xpReward: 200,
        coinReward: 100
    },

    // ==================== ACCURACY ACHIEVEMENTS ====================
    SHARP_MIND: {
        id: 'sharp_mind',
        name: 'Scharfer Verstand',
        description: 'Löse 5 Aufgaben beim ersten Versuch hintereinander',
        icon: '🧠',
        category: 'special',
        condition: (user) => (user.perfectStreak || 0) >= 5,
        xpReward: 250,
        coinReward: 125
    },

    FLAWLESS: {
        id: 'flawless',
        name: 'Makellos',
        description: 'Löse 25 Aufgaben beim ersten Versuch',
        icon: '💎',
        category: 'special',
        condition: (user) => (user.perfectSolves || 0) >= 25,
        xpReward: 750,
        coinReward: 400
    },

    // ==================== EXPLORATION ACHIEVEMENTS ====================
    EXPLORER: {
        id: 'explorer',
        name: 'Entdecker',
        description: 'Löse Aufgaben aus 3 verschiedenen Themengebieten',
        icon: '🧭',
        category: 'subject',
        condition: (user) => {
            const topics = user.topicsExplored || [];
            return topics.length >= 3;
        },
        xpReward: 100,
        coinReward: 50
    },

    POLYMATH: {
        id: 'polymath',
        name: 'Universalgenie',
        description: 'Löse Aufgaben aus 7 verschiedenen Themengebieten',
        icon: '🎓',
        category: 'subject',
        condition: (user) => {
            const topics = user.topicsExplored || [];
            return topics.length >= 7;
        },
        xpReward: 300,
        coinReward: 150
    },

    // ==================== COMEBACK ACHIEVEMENTS ====================
    COMEBACK_KID: {
        id: 'comeback_kid',
        name: 'Comeback-Kind',
        description: 'Komme nach 7+ Tagen Pause zurück und löse eine Aufgabe',
        icon: '🔄',
        category: 'special',
        condition: (user) => user.hadComeback || false,
        xpReward: 100,
        coinReward: 50
    },

    PERSISTENT: {
        id: 'persistent',
        name: 'Beharrlich',
        description: 'Löse eine Aufgabe nach 5+ fehlgeschlagenen Versuchen',
        icon: '💪',
        category: 'special',
        condition: (user) => user.solvedAfterManyAttempts || false,
        xpReward: 150,
        coinReward: 75
    },

    // ==================== MILESTONE ACHIEVEMENTS ====================
    XP_HUNTER: {
        id: 'xp_hunter',
        name: 'XP-Jäger',
        description: 'Sammle insgesamt 10.000 XP',
        icon: '⚡',
        category: 'level',
        condition: (user) => (user.totalXPEarned || user.xp || 0) >= 10000,
        xpReward: 500,
        coinReward: 250
    },

    XP_MASTER: {
        id: 'xp_master',
        name: 'XP-Meister',
        description: 'Sammle insgesamt 50.000 XP',
        icon: '🌟',
        category: 'level',
        condition: (user) => (user.totalXPEarned || user.xp || 0) >= 50000,
        xpReward: 2000,
        coinReward: 1000
    },

    // ==================== FUN ACHIEVEMENTS ====================
    LUCKY_SEVEN: {
        id: 'lucky_seven',
        name: 'Glückliche Sieben',
        description: 'Erreiche genau 777 Coins',
        icon: '🍀',
        category: 'coins',
        condition: (user) => user.coins === 777 || user.reached777Coins || false,
        xpReward: 77,
        coinReward: 0
    },

    CENTURY: {
        id: 'century',
        name: 'Jahrhundert',
        description: 'Löse genau 100 Aufgaben',
        icon: '💯',
        category: 'tasks',
        condition: (user) => (user.tasksCompleted || 0) >= 100,
        xpReward: 1000,
        coinReward: 500
    },

    // ==================== PHYSICS & CHEMISTRY ACHIEVEMENTS ====================
    PHYSICS_PIONEER: {
        id: 'physics_pioneer',
        name: 'Physik-Pionier',
        description: 'Löse deine erste Physik-Aufgabe',
        icon: '⚛️',
        category: 'subject',
        condition: (user) => (user.subjectMastery?.physics?.tasksCompleted || 0) >= 1,
        xpReward: 50,
        coinReward: 25
    },

    CHEMISTRY_CATALYST: {
        id: 'chemistry_catalyst',
        name: 'Chemie-Katalysator',
        description: 'Löse deine erste Chemie-Aufgabe',
        icon: '🧪',
        category: 'subject',
        condition: (user) => (user.subjectMastery?.chemistry?.tasksCompleted || 0) >= 1,
        xpReward: 50,
        coinReward: 25
    },

    // ==================== HELPER ACHIEVEMENTS ====================
    HINT_SEEKER: {
        id: 'hint_seeker',
        name: 'Tipp-Sucher',
        description: 'Nutze die Tipp-Funktion zum ersten Mal',
        icon: '💡',
        category: 'special',
        condition: (user) => (user.hintsUsed || 0) >= 1,
        xpReward: 10,
        coinReward: 5
    },

    INDEPENDENT: {
        id: 'independent',
        name: 'Unabhängig',
        description: 'Löse 10 Aufgaben ohne Tipps',
        icon: '🎖️',
        category: 'special',
        condition: (user) => (user.tasksWithoutHints || 0) >= 10,
        xpReward: 200,
        coinReward: 100
    }
};

/**
 * Checks for newly unlocked achievements
 * @returns {Array} Newly unlocked achievements
 */
function checkAchievements() {
    const user = getUserData();
    const unlockedAchievements = user.achievements || [];
    const newAchievements = [];

    Object.values(ACHIEVEMENTS).forEach(achievement => {
        // Skip if already unlocked
        if (unlockedAchievements.includes(achievement.id)) {
            return;
        }

        // Check condition
        try {
            if (achievement.condition(user)) {
                newAchievements.push(achievement);
            }
        } catch (error) {
            console.error(`[Achievements] Error checking ${achievement.id}:`, error);
        }
    });

    if (newAchievements.length > 0) {
        unlockAchievements(newAchievements);
    }

    return newAchievements;
}

/**
 * Unlocks achievements and awards rewards
 * IMPORTANT: Awards XP/Coins directly to avoid recursive achievement checks
 */
function unlockAchievements(achievements) {
    // Set global flag to prevent recursive achievement checking
    if (typeof _achievementCheckInProgress !== 'undefined') {
        _achievementCheckInProgress = true;
    }

    const user = getUserData();
    user.achievements = user.achievements || [];
    user.achievementTimestamps = user.achievementTimestamps || {};

    achievements.forEach(achievement => {
        user.achievements.push(achievement.id);

        // Store timestamp for when achievement was unlocked
        user.achievementTimestamps[achievement.id] = new Date().toISOString();

        // Award XP directly to user object (NOT through addXP to avoid recursion)
        if (achievement.xpReward) {
            user.xp = (user.xp || 0) + achievement.xpReward;
            user.totalXPEarned = (user.totalXPEarned || 0) + achievement.xpReward;

            // Check for level up after adding XP
            while (user.xp >= (typeof getXPForNextLevel === 'function' ? getXPForNextLevel(user.level) : (user.level + 1) * 100)) {
                const xpNeeded = typeof getXPForNextLevel === 'function' ? getXPForNextLevel(user.level) : (user.level + 1) * 100;
                const currentLevelXP = typeof getXPForCurrentLevel === 'function' ? getXPForCurrentLevel(user.level) : user.level * 100;
                user.xp -= (xpNeeded - currentLevelXP);
                user.level++;

                // Trigger level up animation if available
                if (typeof triggerLevelUpAnimation === 'function') {
                    triggerLevelUpAnimation(user.level);
                }
            }
        }

        // Award Coins directly to user object (NOT through addCoins to avoid recursion)
        if (achievement.coinReward) {
            user.coins = (user.coins || 0) + achievement.coinReward;
            user.totalCoinsEarned = (user.totalCoinsEarned || 0) + achievement.coinReward;
        }

        // Show notification
        showAchievementUnlocked(achievement);

        console.log(`[Achievements] Unlocked: ${achievement.name} (+${achievement.xpReward || 0} XP, +${achievement.coinReward || 0} Coins)`);
    });

    saveUserData(user);

    // Reset global flag after all achievements are processed
    if (typeof _achievementCheckInProgress !== 'undefined') {
        _achievementCheckInProgress = false;
    }
}

/**
 * Shows achievement unlock notification
 */
function showAchievementUnlocked(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-content">
            <div class="achievement-badge">Achievement Unlocked!</div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-description">${achievement.description}</div>
            <div class="achievement-rewards">
                ${achievement.xpReward ? `<span class="reward-xp">+${achievement.xpReward} XP</span>` : ''}
                ${achievement.coinReward ? `<span class="reward-coins">+${achievement.coinReward} Coins</span>` : ''}
            </div>
        </div>
    `;

    document.body.appendChild(notification);

    // Trigger animation
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });

    // Auto-hide after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 5000);

    // Click to dismiss
    notification.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    });
}

/**
 * Gets all achievements with unlock status
 */
function getAllAchievements() {
    const user = getUserData();
    const unlockedIds = user.achievements || [];

    return Object.values(ACHIEVEMENTS).map(achievement => ({
        ...achievement,
        unlocked: unlockedIds.includes(achievement.id),
        unlockedAt: user.achievementTimestamps?.[achievement.id] || null
    }));
}

/**
 * Gets achievements by category
 */
function getAchievementsByCategory(category) {
    return getAllAchievements().filter(a => a.category === category);
}

/**
 * Gets achievement progress
 */
function getAchievementProgress() {
    const all = getAllAchievements();
    const unlocked = all.filter(a => a.unlocked);

    return {
        total: all.length,
        unlocked: unlocked.length,
        percentage: Math.round((unlocked.length / all.length) * 100)
    };
}

/**
 * Gets category counts
 */
function getCategoryProgress() {
    const categories = {};
    const all = getAllAchievements();

    all.forEach(achievement => {
        if (!categories[achievement.category]) {
            categories[achievement.category] = {
                total: 0,
                unlocked: 0
            };
        }

        categories[achievement.category].total++;
        if (achievement.unlocked) {
            categories[achievement.category].unlocked++;
        }
    });

    return categories;
}

/**
 * Checks specific achievement types after actions
 */
function checkTaskAchievements() {
    const user = getUserData();

    // Check time-based achievements
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 6) {
        if (!user.hasNightActivity) {
            user.hasNightActivity = true;
            saveUserData(user);
        }
    }

    if (hour >= 5 && hour < 7) {
        if (!user.hasEarlyActivity) {
            user.hasEarlyActivity = true;
            saveUserData(user);
        }
    }

    checkAchievements();
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ACHIEVEMENTS,
        checkAchievements,
        unlockAchievements,
        showAchievementUnlocked,
        getAllAchievements,
        getAchievementsByCategory,
        getAchievementProgress,
        getCategoryProgress,
        checkTaskAchievements
    };
}

// Export for browser
if (typeof window !== 'undefined') {
    window.Achievements = {
        ACHIEVEMENTS,
        checkAchievements,
        unlockAchievements,
        showAchievementUnlocked,
        getAllAchievements,
        getAchievementsByCategory,
        getAchievementProgress,
        getCategoryProgress,
        checkTaskAchievements
    };
}
