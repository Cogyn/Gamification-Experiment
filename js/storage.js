// LocalStorage Helper Functions

const STORAGE_KEYS = {
  USER: 'edurank_user',
  TASKS: 'edurank_tasks',
};

// User Data Functions
function getUserData() {
  const data = localStorage.getItem(STORAGE_KEYS.USER);
  if (!data) {
    return initializeUserData();
  }

  // Parse and auto-migrate to add any missing fields
  const userData = JSON.parse(data);
  return migrateUserData(userData);
}

function saveUserData(userData) {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
}

/**
 * Initialize user data with all required fields for achievements and tracking
 * Contains 40+ fields needed for full gamification functionality
 */
function initializeUserData() {
  // Try to get name from auth service
  let userName = "Lernender";
  let userEmail = "";

  try {
    if (window.authService && window.currentUser) {
      userName = window.currentUser.name || "Lernender";
      userEmail = window.currentUser.email || "";
    }
  } catch (e) {
    console.log('[Gamification] Could not get auth user, using defaults');
  }

  const defaultUser = {
    // ===== BASIC INFO =====
    id: 1,
    name: userName,
    email: userEmail,
    createdAt: new Date().toISOString(),

    // ===== LEVEL & XP =====
    level: 1,
    xp: 0,
    totalXPEarned: 0,

    // ===== COINS =====
    coins: 0,
    totalCoinsEarned: 0,

    // ===== ELO RATING =====
    eloRating: 1000,

    // ===== STREAK TRACKING =====
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,

    // ===== CUSTOMIZATION =====
    avatar: null,
    title: null,
    inventory: {},

    // ===== TASK STATISTICS =====
    tasksCompleted: 0,
    tasksUploaded: 0,
    imageTasksUploaded: 0,
    perfectSolves: 0,
    perfectStreak: 0,
    tasksWithoutHints: 0,
    fastestSolve: null,

    // ===== DIFFICULTY TRACKING =====
    attemptedHardTask: false,
    hardTasksSolved: 0,
    olympiadTasksSolved: 0,

    // ===== TIME-BASED TRACKING =====
    hasNightActivity: false,
    hasEarlyActivity: false,
    hasWeekendActivity: false,
    lastTaskDate: null,
    tasksToday: 0,
    maxTasksInOneDay: 0,

    // ===== SPECIAL ACHIEVEMENTS TRACKING =====
    solvedAfterManyAttempts: false,
    hadComeback: false,
    reached777Coins: false,

    // ===== HINT SYSTEM =====
    hintsUsed: 0,
    totalHintsUsed: 0,

    // ===== TOPIC EXPLORATION =====
    topicsExplored: [],

    // ===== SUBJECT MASTERY =====
    subjectMastery: {
      math: { level: 1, xp: 0, tasksCompleted: 0 },
      physics: { level: 1, xp: 0, tasksCompleted: 0 },
      chemistry: { level: 1, xp: 0, tasksCompleted: 0 }
    },

    // ===== ACHIEVEMENTS =====
    achievements: [],
    achievementTimestamps: {}
  };

  saveUserData(defaultUser);
  return defaultUser;
}

/**
 * Migrate existing user data to include any missing fields
 * This ensures backwards compatibility when new fields are added
 */
function migrateUserData(userData) {
  let needsSave = false;

  // Define all required fields with their default values
  const requiredFields = {
    // Basic
    id: 1,
    name: 'Lernender',
    email: '',
    createdAt: new Date().toISOString(),

    // Level & XP
    level: 1,
    xp: 0,
    totalXPEarned: userData.xp || 0,

    // Coins
    coins: 0,
    totalCoinsEarned: userData.coins || 0,

    // Elo
    eloRating: 1000,

    // Streaks
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,

    // Customization
    avatar: null,
    title: null,
    inventory: {},

    // Task stats
    tasksCompleted: 0,
    tasksUploaded: 0,
    imageTasksUploaded: 0,
    perfectSolves: 0,
    perfectStreak: 0,
    tasksWithoutHints: 0,
    fastestSolve: null,

    // Difficulty
    attemptedHardTask: false,
    hardTasksSolved: 0,
    olympiadTasksSolved: 0,

    // Time-based
    hasNightActivity: false,
    hasEarlyActivity: false,
    hasWeekendActivity: false,
    lastTaskDate: null,
    tasksToday: 0,
    maxTasksInOneDay: 0,

    // Special
    solvedAfterManyAttempts: false,
    hadComeback: false,
    reached777Coins: false,

    // Hints
    hintsUsed: 0,
    totalHintsUsed: 0,

    // Topics
    topicsExplored: [],

    // Subject mastery
    subjectMastery: {
      math: { level: 1, xp: 0, tasksCompleted: 0 },
      physics: { level: 1, xp: 0, tasksCompleted: 0 },
      chemistry: { level: 1, xp: 0, tasksCompleted: 0 }
    },

    // Achievements
    achievements: [],
    achievementTimestamps: {}
  };

  // Add missing fields
  for (const [key, defaultValue] of Object.entries(requiredFields)) {
    if (userData[key] === undefined) {
      userData[key] = defaultValue;
      needsSave = true;
      console.log(`[Storage] Migrated missing field: ${key}`);
    }
  }

  // Ensure subjectMastery has all subjects
  if (userData.subjectMastery) {
    const subjects = ['math', 'physics', 'chemistry'];
    for (const subject of subjects) {
      if (!userData.subjectMastery[subject]) {
        userData.subjectMastery[subject] = { level: 1, xp: 0, tasksCompleted: 0 };
        needsSave = true;
        console.log(`[Storage] Migrated missing subject: ${subject}`);
      }
    }
  }

  // Ensure achievementTimestamps exists if achievements exist
  if (userData.achievements && userData.achievements.length > 0 && !userData.achievementTimestamps) {
    userData.achievementTimestamps = {};
    needsSave = true;
  }

  if (needsSave) {
    saveUserData(userData);
    console.log('[Storage] User data migration completed');
  }

  return userData;
}

function resetUserData() {
  localStorage.removeItem(STORAGE_KEYS.USER);
  return initializeUserData();
}

// ==================== API KEY MANAGEMENT ====================

const API_SETTINGS_KEY = 'api_settings';

/**
 * Save OpenAI API key to localStorage
 */
function saveApiKey(apiKey) {
  const settings = getApiSettings();
  settings.openai_api_key = apiKey;
  settings.updatedAt = new Date().toISOString();
  localStorage.setItem(API_SETTINGS_KEY, JSON.stringify(settings));
  console.log('[Storage] API key saved');
}

/**
 * Get OpenAI API key from localStorage
 */
function getApiKey() {
  const settings = getApiSettings();
  return settings.openai_api_key || null;
}

/**
 * Clear API key from localStorage
 */
function clearApiKey() {
  const settings = getApiSettings();
  delete settings.openai_api_key;
  settings.updatedAt = new Date().toISOString();
  localStorage.setItem(API_SETTINGS_KEY, JSON.stringify(settings));
  console.log('[Storage] API key cleared');
}

/**
 * Get all API settings
 */
function getApiSettings() {
  try {
    const data = localStorage.getItem(API_SETTINGS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('[Storage] Error reading API settings:', e);
    return {};
  }
}

/**
 * Test if the API key is valid by making a simple API call
 */
async function testApiKey(apiKey) {
  if (!apiKey || !apiKey.startsWith('sk-')) {
    return { valid: false, error: 'Ungültiges API-Key Format' };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (response.ok) {
      return { valid: true };
    } else if (response.status === 401) {
      return { valid: false, error: 'Ungültiger API-Key' };
    } else {
      const error = await response.json().catch(() => ({}));
      return { valid: false, error: error.error?.message || `Fehler: ${response.status}` };
    }
  } catch (e) {
    return { valid: false, error: 'Netzwerkfehler: ' + e.message };
  }
}

/**
 * Initialize API key UI handlers
 * Call this when DOM is ready
 */
function initApiKeyUI() {
  const apiKeyInput = document.getElementById('openai-api-key');
  const toggleBtn = document.getElementById('toggle-api-key-visibility');
  const saveBtn = document.getElementById('save-api-key');
  const testBtn = document.getElementById('test-api-key');
  const clearBtn = document.getElementById('clear-api-key');
  const statusEl = document.getElementById('api-key-status');

  if (!apiKeyInput) return; // UI elements not present

  // Load existing API key
  const existingKey = getApiKey();
  if (existingKey) {
    apiKeyInput.value = existingKey;
    updateApiKeyStatus(true);
  }

  // Toggle visibility
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isPassword = apiKeyInput.type === 'password';
      apiKeyInput.type = isPassword ? 'text' : 'password';
      const icon = toggleBtn.querySelector('i');
      icon.classList.toggle('fa-eye', !isPassword);
      icon.classList.toggle('fa-eye-slash', isPassword);
    });
  }

  // Save API key
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const key = apiKeyInput.value.trim();
      if (!key) {
        showApiKeyNotification('Bitte gib einen API-Key ein', 'warning');
        return;
      }
      if (!key.startsWith('sk-')) {
        showApiKeyNotification('API-Key muss mit "sk-" beginnen', 'warning');
        return;
      }
      saveApiKey(key);
      updateApiKeyStatus(true);
      showApiKeyNotification('API-Key gespeichert!', 'success');
    });
  }

  // Test API key
  if (testBtn) {
    testBtn.addEventListener('click', async () => {
      const key = apiKeyInput.value.trim();
      if (!key) {
        showApiKeyNotification('Bitte gib einen API-Key ein', 'warning');
        return;
      }

      testBtn.disabled = true;
      testBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Teste...';

      const result = await testApiKey(key);

      testBtn.disabled = false;
      testBtn.innerHTML = '<i class="fas fa-vial"></i> Testen';

      if (result.valid) {
        showApiKeyNotification('API-Key ist gültig!', 'success');
        updateApiKeyStatus(true);
      } else {
        showApiKeyNotification(result.error, 'error');
        updateApiKeyStatus(false, result.error);
      }
    });
  }

  // Clear API key
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('API-Key wirklich löschen?')) {
        clearApiKey();
        apiKeyInput.value = '';
        updateApiKeyStatus(false);
        showApiKeyNotification('API-Key gelöscht', 'info');
      }
    });
  }

  function updateApiKeyStatus(configured, error = null) {
    if (!statusEl) return;

    statusEl.classList.remove('configured', 'not-configured', 'error');

    if (error) {
      statusEl.textContent = error;
      statusEl.classList.add('error');
    } else if (configured) {
      statusEl.textContent = 'Konfiguriert ✓';
      statusEl.classList.add('configured');
    } else {
      statusEl.textContent = 'Nicht konfiguriert';
      statusEl.classList.add('not-configured');
    }
  }

  function showApiKeyNotification(message, type) {
    if (window.MathTutorApp && typeof window.MathTutorApp.showNotification === 'function') {
      window.MathTutorApp.showNotification(message, type);
    } else {
      console.log(`[API Key] ${type}: ${message}`);
      // Fallback: alert for important messages
      if (type === 'error') {
        alert(message);
      }
    }
  }
}

// Initialize API key UI when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApiKeyUI);
} else {
  // DOM already ready, wait a bit for other scripts to load
  setTimeout(initApiKeyUI, 100);
}

// Tasks Data Functions
function getAllTasks() {
  const data = localStorage.getItem(STORAGE_KEYS.TASKS);
  return data ? JSON.parse(data) : [];
}

function saveTask(task) {
  const tasks = getAllTasks();
  tasks.push(task);
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}

function updateTask(taskId, updates) {
  const tasks = getAllTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    return tasks[taskIndex];
  }
  return null;
}

function getTaskById(taskId) {
  const tasks = getAllTasks();
  return tasks.find(t => t.id === taskId);
}

function getTasksByStatus(status) {
  const tasks = getAllTasks();
  return tasks.filter(t => t.status === status);
}

function getTasksBySubject(subjectId) {
  const tasks = getAllTasks();
  return tasks.filter(t => t.subjectId === subjectId);
}

function deleteTask(taskId) {
  const tasks = getAllTasks();
  const filtered = tasks.filter(t => t.id !== taskId);
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(filtered));
}

// Extended Task Management Functions

/**
 * Creates a new task
 * @param {Object} taskData - Task data (content, imageData, subjectId, topic, etc.)
 * @returns {Object} Created task
 */
function createTask(taskData) {
  const user = getUserData();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);

  const task = {
    id: `task-${timestamp}-${random}`,
    userId: user.id,
    subjectId: taskData.subjectId || 1,
    topic: taskData.topic || null,
    content: taskData.content || '',
    imageData: taskData.imageData || null,
    hasImage: !!taskData.imageData,
    taskType: taskData.taskType || 'math',
    status: 'ready',
    difficulty: taskData.difficulty || 5,
    xpReward: calculateXPReward(taskData.difficulty || 5),
    coinsReward: calculateCoinsReward(taskData.difficulty || 5),
    attempts: 0,
    bestTime: null,
    solution: null,
    feedback: null,
    createdAt: new Date().toISOString(),
    solvedAt: null,
    ...taskData
  };

  saveTask(task);
  return task;
}

/**
 * Updates task status
 */
function updateTaskStatus(taskId, status) {
  const updates = { status };
  if (status === 'solved') {
    updates.solvedAt = new Date().toISOString();
  }
  return updateTask(taskId, updates);
}

/**
 * Gets user tasks with optional filters
 */
function getUserTasks(userId, filters = {}) {
  let tasks = getAllTasks().filter(t => t.userId === userId);

  if (filters.subject) {
    tasks = tasks.filter(t => t.subjectId === filters.subject);
  }

  if (filters.status) {
    tasks = tasks.filter(t => t.status === filters.status);
  }

  if (filters.difficulty) {
    tasks = tasks.filter(t => t.difficulty === filters.difficulty);
  }

  // Sort by creation date (newest first)
  tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return tasks;
}

/**
 * Filters tasks by criteria
 */
function filterTasks(filters) {
  let tasks = getAllTasks();

  if (filters.subject) {
    tasks = tasks.filter(t => t.subjectId === filters.subject);
  }

  if (filters.status) {
    tasks = tasks.filter(t => t.status === filters.status);
  }

  if (filters.difficulty) {
    tasks = tasks.filter(t => t.difficulty === filters.difficulty);
  }

  if (filters.hasImage !== undefined) {
    tasks = tasks.filter(t => t.hasImage === filters.hasImage);
  }

  return tasks;
}

/**
 * Records task attempt
 */
function recordTaskAttempt(taskId, wasCorrect, timeSpent, feedback) {
  const task = getTaskById(taskId);
  if (!task) return null;

  const updates = {
    attempts: task.attempts + 1,
    status: wasCorrect ? 'solved' : 'in-progress'
  };

  if (wasCorrect) {
    updates.solvedAt = new Date().toISOString();

    // Update best time if applicable
    if (!task.bestTime || timeSpent < task.bestTime) {
      updates.bestTime = timeSpent;
    }
  }

  if (feedback) {
    updates.feedback = feedback;
  }

  return updateTask(taskId, updates);
}

/**
 * Calculate XP reward based on difficulty
 */
function calculateXPReward(difficulty) {
  const baseXP = 50;
  return Math.round(baseXP * (1 + (difficulty / 10)));
}

/**
 * Calculate coins reward based on difficulty
 */
function calculateCoinsReward(difficulty) {
  const baseCoins = 10;
  return Math.round(baseCoins * (1 + (difficulty / 10)));
}

// Clear all data
function clearAllData() {
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.TASKS);
}
