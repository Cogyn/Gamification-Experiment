// EduRank Configuration
const CONFIG = {
  // Backend API Configuration
  api: {
    // Use backend proxy for AI calls (recommended for production)
    // Set to false to use direct API calls with local API key
    useBackendProxy: true,

    // Backend API base URL (auto-detected, or set manually)
    baseUrl: window.location.origin,

    // Endpoints
    endpoints: {
      health: '/api/health',
      aiChat: '/api/ai/chat',
      aiValidate: '/api/ai/validate-answer',
      aiGenerate: '/api/ai/generate-task',
      aiExplain: '/api/ai/explain',
      users: '/api/users',
      tasks: '/api/tasks',
      achievements: '/api/achievements',
    }
  },

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
    { id: 2, name: 'Physik', slug: 'physics', color: '#3b82f6', icon: '⚛️' },
    { id: 3, name: 'Chemie', slug: 'chemistry', color: '#22c55e', icon: '🧪' },
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

// Set global flag for backend proxy usage
// This can be overridden by setting window.USE_BACKEND_PROXY = false before loading
if (typeof window.USE_BACKEND_PROXY === 'undefined') {
  window.USE_BACKEND_PROXY = CONFIG.api.useBackendProxy;
}

// Helper to get API endpoint URL
function getApiEndpoint(endpoint) {
  const baseUrl = CONFIG.api.baseUrl || '';
  return baseUrl + (CONFIG.api.endpoints[endpoint] || endpoint);
}

// Check if backend is available
async function checkBackendHealth() {
  try {
    const response = await fetch(getApiEndpoint('health'), {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (response.ok) {
      const data = await response.json();
      console.log('[Config] Backend health check passed:', data);
      return true;
    }
  } catch (e) {
    console.warn('[Config] Backend not available, using local mode:', e.message);
  }
  window.USE_BACKEND_PROXY = false;
  return false;
}

// Auto-check backend on load (non-blocking)
if (typeof window !== 'undefined') {
  setTimeout(() => {
    checkBackendHealth().catch(() => {});
  }, 1000);
}
