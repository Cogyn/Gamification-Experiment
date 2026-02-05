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
  return JSON.parse(data);
}

function saveUserData(userData) {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
}

function initializeUserData() {
  const defaultUser = {
    id: 1,
    name: "Demo User",
    email: "demo@edurank.com",
    level: 1,
    xp: 0,
    coins: 0,
    eloRating: 1000,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    avatar: null,
    title: null,
    subjectMastery: {},
    createdAt: new Date().toISOString(),
  };
  saveUserData(defaultUser);
  return defaultUser;
}

function resetUserData() {
  localStorage.removeItem(STORAGE_KEYS.USER);
  return initializeUserData();
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

// Clear all data
function clearAllData() {
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.TASKS);
}
