// EduRank Configuration
const CONFIG = {
  // XP curve for leveling (Level: Required Total XP)
  xpCurve: {
    1: 0,
    2: 100,
    3: 250,
    4: 500,
    5: 1000,
    6: 1750,
    7: 2750,
    8: 4000,
    9: 5500,
    10: 7500,
    11: 10000,
    12: 13000,
    13: 16500,
    14: 20500,
    15: 25000,
    16: 30000,
    17: 35500,
    18: 41500,
    19: 48000,
    20: 55000,
    // Extend to 100 levels following exponential curve
  },

  subjects: [
    { id: 1, name: 'Mathematik', slug: 'math', color: '#ef4444', icon: '📐' },
    // More subjects coming in Phase 2
  ],

  // AI Configuration
  ai: {
    provider: 'openai',
    model: 'gpt-4o',
    maxTokens: 4096,
    temperature: 0.3,
  },

  themes: {
    dark: {
      bg: '#1e1e2e',
      bgSecondary: '#181825',
      bgTertiary: '#11111b',
      text: '#cdd6f4',
      textSecondary: '#a6adc8',
      primary: '#6366f1',
      accent: '#f59e0b',
      success: '#22c55e',
      error: '#ef4444',
    }
  },

  // Game balance settings
  baseXPPerDifficulty: 10,
  baseCoinsPerTask: 5,
  coinsPerDifficulty: 2,
  maxStreakMultiplier: 2.0,
  streakBonusPerDay: 0.1,
};

// Generate XP curve up to level 100
for (let level = 21; level <= 100; level++) {
  CONFIG.xpCurve[level] = Math.floor(55000 + (level - 20) * (level - 20) * 250);
}

// Helper function to get XP for a specific level
function getXPForLevel(level) {
  return CONFIG.xpCurve[level] || CONFIG.xpCurve[100];
}
