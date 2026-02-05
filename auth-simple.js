// Simple LocalStorage-based Auth Service
// No backend, no passwords, just local user data

class AuthService {
    constructor() {
        this.STORAGE_KEY = 'cogyn_user';
        this.init();
    }

    /**
     * Initialize auth service
     */
    init() {
        // Check if user exists in localStorage
        const user = this.getCurrentUser();
        if (!user) {
            // Create default user on first visit
            this.createDefaultUser();
        }
    }

    /**
     * Create default user
     */
    createDefaultUser() {
        const defaultUser = {
            id: this.generateUserId(),
            name: 'Lernender',
            email: '',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            isAuthenticated: true
        };

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultUser));
        console.log('[Auth] Default user created:', defaultUser.name);
        return defaultUser;
    }

    /**
     * Generate unique user ID
     */
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get current user from localStorage
     */
    getCurrentUser() {
        try {
            const userStr = localStorage.getItem(this.STORAGE_KEY);
            if (!userStr) return null;

            const user = JSON.parse(userStr);

            // Update last login
            user.lastLogin = new Date().toISOString();
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));

            return user;
        } catch (error) {
            console.error('[Auth] Error getting user:', error);
            return null;
        }
    }

    /**
     * Update user data
     */
    updateUser(updates) {
        try {
            const user = this.getCurrentUser();
            if (!user) {
                console.error('[Auth] No user to update');
                return null;
            }

            // Merge updates
            const updatedUser = {
                ...user,
                ...updates,
                updatedAt: new Date().toISOString()
            };

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedUser));
            console.log('[Auth] User updated:', updatedUser);
            return updatedUser;
        } catch (error) {
            console.error('[Auth] Error updating user:', error);
            return null;
        }
    }

    /**
     * Update user name
     */
    updateUserName(name) {
        return this.updateUser({ name });
    }

    /**
     * Update user email
     */
    updateUserEmail(email) {
        return this.updateUser({ email });
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const user = this.getCurrentUser();
        return user && user.isAuthenticated;
    }

    /**
     * Logout (clear user data)
     * WARNING: This will also clear gamification data!
     */
    logout(clearAllData = false) {
        if (clearAllData) {
            // Clear everything including gamification
            localStorage.clear();
            console.log('[Auth] All data cleared');
        } else {
            // Only clear user auth data
            localStorage.removeItem(this.STORAGE_KEY);
            console.log('[Auth] User logged out');
        }

        // Reload page
        window.location.reload();
    }

    /**
     * Reset user (keep gamification data)
     */
    resetUser() {
        localStorage.removeItem(this.STORAGE_KEY);
        return this.createDefaultUser();
    }

    /**
     * Show welcome dialog on first visit
     */
    showWelcomeDialog() {
        const user = this.getCurrentUser();

        // Check if this is first visit
        const hasSeenWelcome = localStorage.getItem('cogyn_welcome_seen');
        if (hasSeenWelcome) return;

        // Show name input dialog
        const name = prompt(
            '👋 Willkommen bei Cogyn!\n\nWie möchtest du genannt werden?',
            user.name
        );

        if (name && name.trim()) {
            this.updateUserName(name.trim());
        }

        // Mark welcome as seen
        localStorage.setItem('cogyn_welcome_seen', 'true');
    }
}

// Initialize auth service globally
window.AuthService = AuthService;

// Auto-initialize
if (typeof window !== 'undefined') {
    window.authService = new AuthService();
    console.log('[Auth] Simple auth service initialized');
}
