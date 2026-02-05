// Mock Authentication System

function login(email, password) {
  // Mock login - accepts any email/password
  const user = getUserData();

  if (!user || user.email !== email) {
    // Create/update user with provided email
    const userData = getUserData();
    userData.email = email;
    userData.name = email.split('@')[0];
    saveUserData(userData);
  }

  // Set login session
  sessionStorage.setItem('edurank_logged_in', 'true');
  return true;
}

function logout() {
  sessionStorage.removeItem('edurank_logged_in');
  window.location.href = 'index.html';
}

function isLoggedIn() {
  return sessionStorage.getItem('edurank_logged_in') === 'true';
}

function requireAuth() {
  if (!isLoggedIn() && !window.location.pathname.endsWith('index.html')) {
    window.location.href = 'index.html';
  }
}

// Check auth on page load
document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname;

  if (currentPage.endsWith('index.html') || currentPage.endsWith('/')) {
    // On login page
    if (isLoggedIn()) {
      // Already logged in, redirect to dashboard
      window.location.href = 'dashboard.html';
    }
  } else {
    // On protected page
    requireAuth();
  }
});
