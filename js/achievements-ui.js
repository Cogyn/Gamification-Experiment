/**
 * Achievements UI Initialization
 */

// Initialize Achievements UI
function initAchievementsUI() {
    const achievementsList = document.getElementById('achievements-list');
    if (!achievementsList) return;

    renderAchievements('all');

    // Setup category filters
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderAchievements(btn.dataset.category);
        });
    });

    // Update progress
    updateAchievementsProgress();
}

function renderAchievements(category) {
    const achievementsList = document.getElementById('achievements-list');
    if (!achievementsList) return;

    let achievements = getAllAchievements();

    if (category !== 'all') {
        achievements = achievements.filter(a => a.category === category);
    }

    achievementsList.innerHTML = achievements.map(achievement => {
        const rewardXP = achievement.xpReward > 0 ? `<span class="reward-xp">+${achievement.xpReward} XP</span>` : '';
        const rewardCoins = achievement.coinReward > 0 ? `<span class="reward-coins">+${achievement.coinReward} Coins</span>` : '';

        return `
            <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-header">
                    <div class="achievement-icon-large">${achievement.icon}</div>
                    <div class="achievement-info">
                        <div class="achievement-name">${achievement.name}</div>
                        <div class="achievement-description">${achievement.description}</div>
                    </div>
                </div>
                <div class="achievement-footer">
                    <div class="achievement-rewards">
                        ${rewardXP}
                        ${rewardCoins}
                    </div>
                    <div class="achievement-status ${achievement.unlocked ? 'unlocked' : 'locked'}">
                        ${achievement.unlocked ? '✓ Freigeschaltet' : '🔒 Gesperrt'}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function updateAchievementsProgress() {
    const progress = getAchievementProgress();
    const countEl = document.getElementById('achievements-count');
    const fillEl = document.getElementById('achievements-progress-fill');

    if (countEl) {
        countEl.textContent = `${progress.unlocked}/${progress.total}`;
    }

    if (fillEl) {
        fillEl.style.width = `${progress.percentage}%`;
    }
}

// Auto-initialize when achievements section is shown
document.addEventListener('DOMContentLoaded', () => {
    const achievementsSection = document.getElementById('achievements');
    if (achievementsSection) {
        // Use MutationObserver to detect when section is shown
        const observer = new MutationObserver(() => {
            if (achievementsSection.style.display !== 'none') {
                initAchievementsUI();
            }
        });

        observer.observe(achievementsSection, {
            attributes: true,
            attributeFilter: ['style']
        });

        // Also check on navigation clicks
        document.querySelectorAll('[data-section="achievements"]').forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(() => initAchievementsUI(), 100);
            });
        });
    }
});
