// EduRank Integration Bridge
// Connects Cogyn's learning features with EduRank gamification mechanics

/**
 * Main integration function called after task completion
 * @param {string} taskType - Type of task: 'error_analysis', 'theory', 'task_generation'
 * @param {Object} performanceData - Performance data from the task
 * @returns {Object} Rewards earned
 */
function onTaskCompleted(taskType, performanceData) {
    try {
        // 1. Estimate difficulty based on performance
        const difficulty = estimateDifficulty(taskType, performanceData);

        // 2. Update streak first
        const streak = updateStreak();

        // 3. Calculate XP and coins
        const xp = calculateXP(difficulty, streak);
        const coins = calculateCoins(difficulty);

        // 4. Award XP and check for level up
        const levelUpResult = addXP(xp);

        // 5. Add coins
        addCoins(coins);

        // 6. Update subject mastery
        updateSubjectMasteryFromTask(taskType, performanceData, xp);

        // 7. Prepare rewards object
        const rewards = {
            xp,
            coins,
            streak,
            levelUp: levelUpResult.leveledUp,
            newLevel: levelUpResult.newLevel
        };

        // 8. Show reward notification
        showRewardNotification(rewards);

        // 9. Update UI elements
        updateGamificationUI();

        return rewards;
    } catch (error) {
        console.error('Error in onTaskCompleted:', error);
        return null;
    }
}

/**
 * Estimate difficulty level (1-10) based on task type and performance
 * @param {string} taskType - Type of task
 * @param {Object} performanceData - Performance data
 * @returns {number} Difficulty level (1-10)
 */
function estimateDifficulty(taskType, performanceData) {
    let baseDifficulty = 3; // Default medium difficulty

    switch (taskType) {
        case 'error_analysis':
            // Analyze error complexity
            if (performanceData.steps) {
                const stepCount = performanceData.steps.length;
                const errorCount = performanceData.steps.filter(s => s.errorType !== 'none').length;
                const errorRatio = errorCount / stepCount;

                // More steps = harder task
                baseDifficulty += Math.min(Math.floor(stepCount / 3), 3);

                // More errors = more learning opportunity (higher reward)
                if (errorRatio > 0.5) baseDifficulty += 2;
                else if (errorRatio > 0.3) baseDifficulty += 1;
            }
            break;

        case 'theory':
            // Theory questions are medium difficulty by default
            baseDifficulty = 4;
            if (performanceData.complexity) {
                baseDifficulty += performanceData.complexity;
            }
            break;

        case 'task_generation':
            // Task generation difficulty based on parameters
            if (performanceData.difficulty) {
                baseDifficulty = Math.min(10, performanceData.difficulty + 2);
            }
            break;
    }

    return Math.min(Math.max(baseDifficulty, 1), 10);
}

/**
 * Update subject mastery based on Cogyn's competency tracking
 * @param {string} taskType - Type of task
 * @param {Object} performanceData - Performance data
 * @param {number} xpGained - XP gained from this task
 */
function updateSubjectMasteryFromTask(taskType, performanceData, xpGained) {
    // Map task to subject
    const subjectId = mapTaskToSubject(taskType, performanceData);

    if (subjectId) {
        updateSubjectMastery(subjectId, xpGained);
    }
}

/**
 * Map Cogyn task/competency to EduRank subject
 * @param {string} taskType - Type of task
 * @param {Object} performanceData - Performance data
 * @returns {number|null} Subject ID
 */
function mapTaskToSubject(taskType, performanceData) {
    // For now, default to Mathematics (id: 1)
    // This can be extended based on topic/competency data

    if (performanceData.topic || performanceData.competency) {
        // Check if topic/competency is math-related
        const topic = (performanceData.topic || performanceData.competency || '').toLowerCase();

        // Mathematics patterns
        if (topic.includes('math') || topic.includes('algebra') ||
            topic.includes('geometry') || topic.includes('calculus') ||
            topic.includes('gleichung') || topic.includes('funktion') ||
            topic.includes('rechnung')) {
            return 1; // Mathematics
        }
    }

    // Default to Mathematics for now
    return 1;
}

/**
 * Update all gamification UI elements
 */
function updateGamificationUI() {
    const user = getUserData();

    // Update sidebar widgets
    updateSidebarStats(user);

    // Update dashboard if visible
    const dashboard = document.getElementById('dashboard');
    if (dashboard && dashboard.style.display !== 'none') {
        updateDashboardStats(user);
    }

    // Update profile if visible
    const profile = document.getElementById('user-profile');
    if (profile && profile.style.display !== 'none') {
        updateProfileStats(user);
    }
}

/**
 * Update sidebar statistics widgets
 * @param {Object} user - User data
 */
function updateSidebarStats(user) {
    // Level badge
    const levelElement = document.getElementById('user-level');
    if (levelElement) {
        levelElement.textContent = user.level;
    }

    // XP bar
    const currentXPElement = document.getElementById('current-xp');
    const nextLevelXPElement = document.getElementById('next-level-xp');
    const xpFillElement = document.getElementById('xp-fill');

    if (currentXPElement && nextLevelXPElement && xpFillElement) {
        const nextLevelXP = getXPForNextLevel(user.level);
        const progress = getLevelProgress(user);

        currentXPElement.textContent = user.xp;
        nextLevelXPElement.textContent = nextLevelXP - getXPForCurrentLevel(user.level);
        xpFillElement.style.width = `${progress}%`;
    }

    // Coins
    const coinsElement = document.getElementById('coins');
    if (coinsElement) {
        coinsElement.textContent = user.coins;
    }

    // Streak
    const streakElement = document.getElementById('streak');
    if (streakElement) {
        streakElement.textContent = user.currentStreak;
    }
}

/**
 * Update dashboard statistics
 * @param {Object} user - User data
 */
function updateDashboardStats(user) {
    // Dashboard level
    const dashboardLevel = document.getElementById('dashboard-level');
    if (dashboardLevel) {
        dashboardLevel.textContent = user.level;
    }

    // Dashboard XP
    const dashboardCurrentXP = document.getElementById('dashboard-current-xp');
    const dashboardNextXP = document.getElementById('dashboard-next-xp');
    const dashboardXPFill = document.getElementById('dashboard-xp-fill');

    if (dashboardCurrentXP && dashboardNextXP && dashboardXPFill) {
        const nextLevelXP = getXPForNextLevel(user.level);
        const currentLevelXP = getXPForCurrentLevel(user.level);
        const progress = getLevelProgress(user);

        dashboardCurrentXP.textContent = user.xp;
        dashboardNextXP.textContent = nextLevelXP - currentLevelXP;
        dashboardXPFill.style.width = `${progress}%`;
    }

    // Dashboard streak
    const dashboardStreak = document.getElementById('dashboard-streak');
    const dashboardLongestStreak = document.getElementById('dashboard-longest-streak');

    if (dashboardStreak) {
        dashboardStreak.textContent = user.currentStreak;
    }
    if (dashboardLongestStreak) {
        dashboardLongestStreak.textContent = user.longestStreak;
    }

    // Dashboard coins
    const dashboardCoins = document.getElementById('dashboard-coins');
    if (dashboardCoins) {
        dashboardCoins.textContent = user.coins;
    }

    // Subject mastery
    renderSubjectMastery();
}

/**
 * Update profile statistics
 * @param {Object} user - User data
 */
function updateProfileStats(user) {
    // Profile level
    const profileLevel = document.getElementById('profile-level');
    const profileLevelText = document.getElementById('profile-level-text');

    if (profileLevel) {
        profileLevel.textContent = user.level;
    }
    if (profileLevelText) {
        profileLevelText.textContent = user.level;
    }

    // Profile coins
    const profileCoins = document.getElementById('profile-coins');
    if (profileCoins) {
        profileCoins.textContent = user.coins;
    }

    // Profile streak
    const profileStreak = document.getElementById('profile-streak');
    if (profileStreak) {
        profileStreak.textContent = user.currentStreak;
    }

    // Profile XP progress
    const profileCurrentXP = document.getElementById('profile-current-xp');
    const profileNextXP = document.getElementById('profile-next-xp');
    const profileXPFill = document.getElementById('profile-xp-fill');
    const profileNextLevel = document.getElementById('profile-next-level');

    if (profileCurrentXP && profileNextXP && profileXPFill) {
        const nextLevelXP = getXPForNextLevel(user.level);
        const currentLevelXP = getXPForCurrentLevel(user.level);
        const progress = getLevelProgress(user);

        profileCurrentXP.textContent = user.xp;
        profileNextXP.textContent = nextLevelXP - currentLevelXP;
        profileXPFill.style.width = `${progress}%`;
    }

    if (profileNextLevel) {
        profileNextLevel.textContent = user.level + 1;
    }
}

/**
 * Render subject mastery display
 */
function renderSubjectMastery() {
    const container = document.getElementById('subject-mastery-list');
    if (!container) return;

    const user = getUserData();
    const subjects = CONFIG.subjects;

    let html = '';

    subjects.forEach(subject => {
        const mastery = user.subjectMastery[subject.slug] || { level: 1, xp: 0, tasksCompleted: 0 };
        const nextLevelXP = mastery.level * 500;
        const progress = (mastery.xp / nextLevelXP) * 100;

        html += `
            <div class="subject-mastery-item">
                <div class="subject-icon" style="background: ${subject.color}20; color: ${subject.color};">
                    ${subject.icon}
                </div>
                <div class="subject-info">
                    <div class="subject-name">${subject.name}</div>
                    <div class="subject-level">Level ${mastery.level} • ${mastery.tasksCompleted} Aufgaben</div>
                </div>
                <div class="subject-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%; background: ${subject.color};"></div>
                    </div>
                    <div class="subject-xp">${mastery.xp} / ${nextLevelXP} XP</div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

/**
 * Initialize gamification system on page load
 */
function initializeGamification() {
    // Initialize user data if needed
    getUserData();

    // Update all UI elements
    updateGamificationUI();

    console.log('Gamification system initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGamification);
} else {
    initializeGamification();
}
