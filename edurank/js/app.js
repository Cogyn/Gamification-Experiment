// Main Application Logic and Navigation

// Update navigation active state
function updateNavigation() {
  const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'dashboard.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Update user stats display in header
function updateHeaderStats() {
  const user = getUserData();
  const headerStats = document.getElementById('header-stats');

  if (!headerStats) return;

  const progress = getLevelProgress(user);

  headerStats.innerHTML = `
    <div class="stat-item">
      <span class="stat-label">Level</span>
      <span class="stat-value">${user.level}</span>
    </div>
    <div class="stat-item xp-stat">
      <span class="stat-label">XP</span>
      <div class="xp-bar-small">
        <div class="xp-bar-fill" style="width: ${progress}%"></div>
      </div>
      <span class="stat-value-small">${user.xp}/${getXPForNextLevel(user.level) - getXPForCurrentLevel(user.level)}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">🪙</span>
      <span class="stat-value">${user.coins}</span>
    </div>
    ${user.currentStreak > 0 ? `
      <div class="stat-item">
        <span class="stat-label">🔥</span>
        <span class="stat-value">${user.currentStreak}</span>
      </div>
    ` : ''}
  `;
}

// Initialize page
function initializePage() {
  updateNavigation();
  updateHeaderStats();

  // Add logout handler if logout button exists
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }

  // Setup mobile menu toggle
  setupMobileMenu();
}

// Setup mobile menu
function setupMobileMenu() {
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const sidebar = document.getElementById('sidebar');

  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
      if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
        sidebar.classList.remove('active');
      }
    });
  }
}

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Heute';
  if (days === 1) return 'Gestern';
  if (days < 7) return `vor ${days} Tagen`;

  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Format time for display
function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

// Show toast notification
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Confirm dialog
function confirm(message, callback) {
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';

  overlay.innerHTML = `
    <div class="confirm-dialog">
      <p>${message}</p>
      <div class="confirm-actions">
        <button class="btn btn-secondary" id="confirm-cancel">Abbrechen</button>
        <button class="btn btn-primary" id="confirm-ok">OK</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('confirm-ok').addEventListener('click', () => {
    overlay.remove();
    callback(true);
  });

  document.getElementById('confirm-cancel').addEventListener('click', () => {
    overlay.remove();
    callback(false);
  });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', initializePage);

// Refresh stats every 5 seconds if on a page with header stats
setInterval(() => {
  if (document.getElementById('header-stats')) {
    updateHeaderStats();
  }
}, 5000);
