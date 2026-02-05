/**
 * Task Upload Module
 * Handles task upload, management, and solving functionality
 */

class TaskUploadManager {
    constructor() {
        this.currentTask = null;
        this.uploadMode = 'image'; // 'image' or 'text'
        this.selectedImage = null;

        // Hint System State
        this.hintState = {
            currentLevel: 0,  // 0 = no hints shown, 1 = chips, 2 = approaches, 3 = full solution
            maxLevel: 3,
            hints: [],
            lastFeedback: null
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initHintSystem();
        console.log('[TaskUpload] Initialized');
    }

    /**
     * Initialize the hint system
     */
    initHintSystem() {
        const hintBtn = document.getElementById('task-hint-btn');
        if (hintBtn) {
            hintBtn.addEventListener('click', () => this.toggleHints());
        }
    }

    setupEventListeners() {
        // Upload Tab Switching
        document.querySelectorAll('.upload-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchUploadTab(e.target.dataset.tab));
        });

        // Image Upload
        const dropZone = document.getElementById('task-drop-zone');
        const fileInput = document.getElementById('task-image-input');

        if (dropZone) {
            dropZone.addEventListener('click', () => fileInput?.click());
            dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
            dropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            dropZone.addEventListener('drop', (e) => this.handleDrop(e));
        }

        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        // Clear Image
        const clearBtn = document.getElementById('clear-task-image');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearImage());
        }

        // Submit Task Upload
        const submitBtn = document.getElementById('submit-task-upload');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitTask());
        }

        // Task Filters
        const statusFilter = document.getElementById('task-status-filter');
        const subjectFilter = document.getElementById('task-subject-filter');

        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterTasks());
        }

        if (subjectFilter) {
            subjectFilter.addEventListener('change', () => this.filterTasks());
        }

        // Submit Answer
        const submitAnswerBtn = document.getElementById('submit-task-answer');
        if (submitAnswerBtn) {
            submitAnswerBtn.addEventListener('click', () => this.submitAnswer());
        }

        // Back to Tasks
        const backBtn = document.getElementById('back-to-tasks');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.showTasksList());
        }
    }

    switchUploadTab(tab) {
        this.uploadMode = tab;

        // Update tab buttons
        document.querySelectorAll('.upload-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });

        // Update tab content using CSS classes instead of inline styles
        const imageTab = document.getElementById('image-upload-tab');
        const textTab = document.getElementById('text-upload-tab');

        if (imageTab) {
            imageTab.classList.toggle('active', tab === 'image');
        }
        if (textTab) {
            textTab.classList.toggle('active', tab === 'text');
        }
    }

    /**
     * Navigate to a specific section using CSS classes
     * This ensures consistent navigation without inline style conflicts
     */
    navigateToSection(sectionId) {
        // Hide all tab-content sections
        document.querySelectorAll('.tab-content').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update sidebar navigation active state
        document.querySelectorAll('.nav-item').forEach(item => {
            const itemSection = item.dataset.section;
            item.classList.toggle('active', itemSection === sectionId);
        });

        // Update content tabs active state
        document.querySelectorAll('.tab-btn').forEach(btn => {
            const btnTab = btn.dataset.tab;
            btn.classList.toggle('active', btnTab === sectionId);
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    async processFile(file) {
        // Validate file
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            this.showNotification('Ungültiges Dateiformat. Bitte JPG, PNG oder PDF verwenden.', 'error');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            this.showNotification('Datei zu groß. Maximum 10MB.', 'error');
            return;
        }

        // Convert to base64
        const base64 = await this.fileToBase64(file);

        this.selectedImage = {
            type: file.type,
            base64: base64,
            fileName: file.name
        };

        // Show preview
        this.showImagePreview(base64, file.type);
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    showImagePreview(base64, type) {
        const preview = document.getElementById('task-image-preview');
        const img = document.getElementById('task-preview-img');
        const dropZone = document.getElementById('task-drop-zone');

        if (preview && img && dropZone) {
            img.src = `data:${type};base64,${base64}`;
            preview.style.display = 'block';
            dropZone.style.display = 'none';
        }
    }

    clearImage() {
        this.selectedImage = null;
        const preview = document.getElementById('task-image-preview');
        const dropZone = document.getElementById('task-drop-zone');
        const fileInput = document.getElementById('task-image-input');

        if (preview && dropZone) {
            preview.style.display = 'none';
            dropZone.style.display = 'flex';
        }

        if (fileInput) {
            fileInput.value = '';
        }
    }

    async submitTask() {
        const subjectId = parseInt(document.getElementById('task-subject-select')?.value || '1');
        const topic = document.getElementById('task-topic-input')?.value?.trim() || '';

        let taskData = {
            subjectId,
            topic
        };

        if (this.uploadMode === 'image') {
            if (!this.selectedImage) {
                this.showNotification('Bitte wähle ein Bild aus', 'warning');
                return;
            }

            taskData.hasImage = true;
            taskData.imageData = this.selectedImage;
            taskData.content = '[Bild-Aufgabe]';
        } else {
            const textContent = document.getElementById('task-text-input')?.value?.trim();

            if (!textContent) {
                this.showNotification('Bitte gib eine Aufgabe ein', 'warning');
                return;
            }

            taskData.hasImage = false;
            taskData.content = textContent;
        }

        try {
            // Create task using storage module
            if (typeof createTask === 'function') {
                const task = createTask(taskData);

                // Update user stats for achievements
                const user = getUserData();
                user.tasksUploaded = (user.tasksUploaded || 0) + 1;
                if (taskData.hasImage) {
                    user.imageTasksUploaded = (user.imageTasksUploaded || 0) + 1;
                }
                saveUserData(user);

                // Check for achievements
                if (typeof checkAchievements === 'function') {
                    checkAchievements();
                }

                this.showNotification('Aufgabe erfolgreich hochgeladen!', 'success');

                // Reset form
                this.clearImage();
                const textInput = document.getElementById('task-text-input');
                const topicInput = document.getElementById('task-topic-input');
                if (textInput) textInput.value = '';
                if (topicInput) topicInput.value = '';

                // Navigate to my tasks
                setTimeout(() => {
                    this.showTasksList();
                }, 1000);
            } else {
                throw new Error('Storage-Modul nicht geladen');
            }
        } catch (error) {
            console.error('[TaskUpload] Error:', error);
            this.showNotification('Fehler beim Hochladen: ' + error.message, 'error');
        }
    }

    showTasksList() {
        // Navigate to my-tasks section using CSS classes
        this.navigateToSection('my-tasks');

        this.loadTasks();
    }

    loadTasks() {
        const user = getUserData();
        const statusFilter = document.getElementById('task-status-filter')?.value || 'all';
        const subjectFilter = document.getElementById('task-subject-filter')?.value || 'all';

        const filters = {};
        if (statusFilter !== 'all') filters.status = statusFilter;
        if (subjectFilter !== 'all') filters.subject = parseInt(subjectFilter);

        const tasks = getUserTasks(user.id, filters);

        this.renderTasks(tasks);
    }

    renderTasks(tasks) {
        const tasksList = document.getElementById('tasks-list');
        if (!tasksList) return;

        // Update count
        const countEl = document.getElementById('tasks-count');
        if (countEl) {
            countEl.textContent = `${tasks.length} ${tasks.length === 1 ? 'Aufgabe' : 'Aufgaben'}`;
        }

        if (tasks.length === 0) {
            tasksList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>Keine Aufgaben gefunden</p>
                    <a href="#" class="btn btn-primary" data-section="task-upload">
                        <i class="fas fa-plus"></i> Aufgabe hochladen
                    </a>
                </div>
            `;
            return;
        }

        tasksList.innerHTML = tasks.map(task => this.createTaskCard(task)).join('');

        // Add click handlers
        tasksList.querySelectorAll('.task-card').forEach(card => {
            card.addEventListener('click', () => {
                const taskId = card.dataset.taskId;
                this.openTask(taskId);
            });
        });
    }

    createTaskCard(task) {
        const statusClass = task.status;
        const statusLabel = {
            'ready': 'Bereit',
            'in-progress': 'In Bearbeitung',
            'solved': 'Gelöst'
        }[task.status] || task.status;

        const preview = task.hasImage ? '📷 Bild-Aufgabe' : task.content.substring(0, 100) + (task.content.length > 100 ? '...' : '');

        return `
            <div class="task-card" data-task-id="${task.id}">
                <div class="task-card-header">
                    <span class="task-status-badge ${statusClass}">${statusLabel}</span>
                    ${task.hasImage ? '<i class="fas fa-image"></i>' : '<i class="fas fa-text"></i>'}
                </div>
                <div class="task-card-content">
                    <div class="task-preview">${preview}</div>
                </div>
                <div class="task-card-footer">
                    <div class="task-meta">
                        ${task.topic ? `<div class="task-meta-item"><i class="fas fa-tag"></i> ${task.topic}</div>` : ''}
                        <div class="task-meta-item"><i class="fas fa-calendar"></i> ${this.formatDate(task.createdAt)}</div>
                    </div>
                </div>
            </div>
        `;
    }

    openTask(taskId) {
        const task = getTaskById(taskId);
        if (!task) return;

        this.currentTask = task;

        // Navigate to task-solve section using CSS classes (not inline styles)
        this.navigateToSection('task-solve');

        // Render task
        this.renderTaskSolve(task);
    }

    renderTaskSolve(task) {
        const titleEl = document.getElementById('task-solve-title');
        const displayEl = document.getElementById('task-display');

        if (titleEl) {
            titleEl.textContent = task.topic || 'Aufgabe lösen';
        }

        if (displayEl) {
            if (task.hasImage && task.imageData) {
                displayEl.innerHTML = `
                    <img src="data:${task.imageData.type};base64,${task.imageData.base64}" alt="Aufgabe">
                    ${task.content !== '[Bild-Aufgabe]' ? `<div class="task-display-text">${task.content}</div>` : ''}
                `;
            } else {
                displayEl.innerHTML = `<div class="task-display-text">${this.formatText(task.content)}</div>`;
            }
        }

        // Clear previous answer
        const answerInput = document.getElementById('task-answer-input');
        if (answerInput) {
            answerInput.value = '';
        }

        // Hide feedback
        const feedbackEl = document.getElementById('task-feedback-display');
        if (feedbackEl) {
            feedbackEl.style.display = 'none';
        }

        // Reset hint system for new task
        this.resetHintState();
    }

    async submitAnswer() {
        if (!this.currentTask) return;

        const answer = document.getElementById('task-answer-input')?.value?.trim();

        if (!answer) {
            this.showNotification('Bitte gib eine Lösung ein', 'warning');
            return;
        }

        this.showLoading(true);

        try {
            // Validate answer using AI
            if (typeof TaskValidator !== 'undefined') {
                const startTime = Date.now();
                const result = await TaskValidator.validateTaskAnswer(this.currentTask, answer);
                const timeSpent = (Date.now() - startTime) / 1000;

                // Record attempt
                recordTaskAttempt(this.currentTask.id, result.correct, timeSpent, result);

                // Show feedback
                this.renderFeedback(result);

                // Award XP/Coins if correct
                if (result.correct) {
                    // Update user stats for achievement tracking
                    const user = getUserData();
                    user.tasksCompleted = (user.tasksCompleted || 0) + 1;

                    // Track fastest solve
                    if (!user.fastestSolve || timeSpent < user.fastestSolve) {
                        user.fastestSolve = timeSpent;
                    }

                    // Track perfect solves (first attempt, no hints used)
                    const usedHintsForTask = this.hintState.currentLevel > 0;
                    if (this.currentTask.attempts === 0 && !usedHintsForTask) {
                        user.perfectSolves = (user.perfectSolves || 0) + 1;
                        user.perfectStreak = (user.perfectStreak || 0) + 1;
                        user.tasksWithoutHints = (user.tasksWithoutHints || 0) + 1;
                    } else {
                        user.perfectStreak = 0; // Reset streak on non-first-try solve
                    }

                    // Track difficulty-based achievements
                    const difficulty = this.currentTask.difficulty || 5;
                    if (difficulty >= 7) {
                        user.attemptedHardTask = true;
                        user.hardTasksSolved = (user.hardTasksSolved || 0) + 1;
                    }
                    if (difficulty >= 10) {
                        user.olympiadTasksSolved = (user.olympiadTasksSolved || 0) + 1;
                    }

                    // Track topic exploration
                    if (this.currentTask.topic) {
                        user.topicsExplored = user.topicsExplored || [];
                        if (!user.topicsExplored.includes(this.currentTask.topic)) {
                            user.topicsExplored.push(this.currentTask.topic);
                        }
                    }

                    // Track weekend activity
                    const day = new Date().getDay();
                    if (day === 0 || day === 6) {
                        user.hasWeekendActivity = true;
                    }

                    // Track tasks solved today for marathon achievement
                    const today = new Date().toDateString();
                    if (user.lastTaskDate !== today) {
                        user.lastTaskDate = today;
                        user.tasksToday = 1;
                    } else {
                        user.tasksToday = (user.tasksToday || 0) + 1;
                    }
                    user.maxTasksInOneDay = Math.max(user.maxTasksInOneDay || 0, user.tasksToday);

                    // Track persistent achievement (solved after many attempts)
                    if (this.currentTask.attempts >= 5) {
                        user.solvedAfterManyAttempts = true;
                    }

                    // Track comeback achievement
                    if (user.lastActivityDate) {
                        const lastDate = new Date(user.lastActivityDate);
                        const daysSinceLastActivity = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));
                        if (daysSinceLastActivity >= 7) {
                            user.hadComeback = true;
                        }
                    }

                    // Track lucky 777 coins (check before adding new coins)
                    if (user.coins === 777) {
                        user.reached777Coins = true;
                    }

                    saveUserData(user);

                    // Use centralized awardTaskCompletion for XP/Coins/Subject mastery
                    // This handles streak updates, XP calculation, coin rewards, and subject mastery
                    if (typeof awardTaskCompletion === 'function') {
                        const rewards = awardTaskCompletion(this.currentTask);

                        // Show reward notification if available
                        if (typeof showRewardNotification === 'function') {
                            showRewardNotification(rewards);
                        }

                        console.log(`[TaskUpload] Awarded: +${rewards.xp} XP, +${rewards.coins} Coins, Streak: ${rewards.streak}`);
                    } else {
                        // Fallback to direct XP/Coins if centralized function not available
                        const xp = this.currentTask.xpReward || 50;
                        const coins = this.currentTask.coinsReward || 10;

                        if (typeof addXP === 'function') {
                            addXP(xp);
                        }
                        if (typeof addCoins === 'function') {
                            addCoins(coins);
                        }

                        console.log('[TaskUpload] Used fallback reward system');
                    }

                    // Update gamification UI
                    if (typeof updateGamificationUI === 'function') {
                        updateGamificationUI();
                    }

                    // Check for achievements (includes time-based achievements)
                    if (typeof checkTaskAchievements === 'function') {
                        checkTaskAchievements();
                    }
                } else {
                    // Track attempted hard task even if failed
                    const user = getUserData();
                    const difficulty = this.currentTask.difficulty || 5;
                    if (difficulty >= 7) {
                        user.attemptedHardTask = true;
                        saveUserData(user);
                    }
                }

            } else {
                throw new Error('Task Validator nicht geladen');
            }
        } catch (error) {
            console.error('[TaskUpload] Validation error:', error);
            this.showNotification('Fehler bei der Validierung: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    renderFeedback(result) {
        const feedbackEl = document.getElementById('task-feedback-display');
        if (!feedbackEl) return;

        // Prepare hints from the feedback for the hint system
        this.prepareHints(result);

        const iconClass = result.correct ? 'correct' : 'incorrect';
        const icon = result.correct ? '✓' : '✗';
        const title = result.correct ? 'Richtig!' : 'Nicht ganz richtig';

        let html = `
            <div class="feedback-header">
                <div class="feedback-icon ${iconClass}">${icon}</div>
                <div>
                    <div class="feedback-title">${title}</div>
                    <div style="color: var(--text-secondary);">Konfidenz: ${result.confidence}%</div>
                </div>
            </div>

            <div class="feedback-section">
                <h5>Zusammenfassung</h5>
                <p>${result.feedback.summary}</p>
            </div>

            ${result.feedback.approach ? `
            <div class="feedback-section">
                <h5>Lösungsweg</h5>
                <p>${result.feedback.approach}</p>
            </div>
            ` : ''}

            ${result.feedback.calculation ? `
            <div class="feedback-section">
                <h5>Berechnung</h5>
                <p>${result.feedback.calculation}</p>
            </div>
            ` : ''}
        `;

        if (result.errorAnalysis?.hasErrors && result.errorAnalysis.specificErrors?.length > 0) {
            html += `
                <div class="feedback-section">
                    <h5>Gefundene Fehler</h5>
                    <ul class="error-list">
                        ${result.errorAnalysis.specificErrors.map(err => `
                            <li class="error-item ${err.severity}">
                                <strong>${err.location}</strong>: ${err.description}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        if (result.hints?.length > 0) {
            html += `
                <div class="feedback-section">
                    <h5>Tipps für die Zukunft</h5>
                    <ul class="hint-list">
                        ${result.hints.map(hint => `
                            <li class="hint-item">${hint.message}</li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        feedbackEl.innerHTML = html;
        feedbackEl.style.display = 'block';

        // Render LaTeX if available
        if (typeof renderMathInElement !== 'undefined') {
            renderMathInElement(feedbackEl, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false}
                ]
            });
        }
    }

    filterTasks() {
        this.loadTasks();
    }

    formatDate(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHours < 1) return 'Gerade eben';
        if (diffHours < 24) return `Vor ${diffHours} Std.`;
        if (diffDays < 7) return `Vor ${diffDays} Tagen`;

        return date.toLocaleDateString('de-DE');
    }

    formatText(text) {
        // Convert line breaks to <br>
        return text.replace(/\n/g, '<br>');
    }

    // ==================== HINT SYSTEM ====================

    /**
     * Prepare hints from AI feedback result
     * Extracts and structures hints for the 3-level system
     */
    prepareHints(result) {
        this.hintState.lastFeedback = result;
        this.hintState.currentLevel = 0;

        // Extract hints from feedback
        const hints = [];

        // Level 1: Quick chips/keywords
        if (result.hints && result.hints.length > 0) {
            hints.push({
                level: 1,
                type: 'chips',
                content: result.hints.map(h => h.message || h).slice(0, 5)
            });
        } else if (result.feedback?.approach) {
            // Generate chips from approach keywords
            const keywords = this.extractKeywords(result.feedback.approach);
            hints.push({
                level: 1,
                type: 'chips',
                content: keywords.slice(0, 5)
            });
        }

        // Level 2: Solution approaches
        if (result.feedback?.approach) {
            hints.push({
                level: 2,
                type: 'approach',
                content: result.feedback.approach
            });
        }

        // Level 3: Full solution/calculation
        if (result.feedback?.calculation || result.feedback?.summary) {
            hints.push({
                level: 3,
                type: 'solution',
                content: result.feedback.calculation || result.feedback.summary
            });
        }

        this.hintState.hints = hints;
        return hints;
    }

    /**
     * Extract keywords from text for hint chips
     */
    extractKeywords(text) {
        const mathTerms = [
            'Ableitung', 'Integral', 'Grenzwert', 'Funktion', 'Gleichung',
            'Variable', 'Konstante', 'Faktor', 'Term', 'Potenz',
            'Wurzel', 'Bruch', 'Quotient', 'Produkt', 'Summe',
            'Kettenregel', 'Produktregel', 'Quotientenregel', 'Substitution',
            'Umformung', 'Vereinfachung', 'Auflösung', 'Einsetzung'
        ];

        const found = [];
        const lowerText = text.toLowerCase();

        for (const term of mathTerms) {
            if (lowerText.includes(term.toLowerCase()) && !found.includes(term)) {
                found.push(term);
            }
        }

        // If we didn't find math terms, extract key phrases
        if (found.length < 3) {
            const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 10);
            for (const sentence of sentences.slice(0, 3)) {
                const shortPhrase = sentence.trim().substring(0, 40) + (sentence.length > 40 ? '...' : '');
                if (!found.includes(shortPhrase)) {
                    found.push(shortPhrase);
                }
            }
        }

        return found;
    }

    /**
     * Toggle hints - progressively reveal more help
     */
    toggleHints() {
        if (!this.hintState.lastFeedback) {
            this.showNotification('Reiche zuerst eine Lösung ein, um Tipps zu erhalten.', 'info');
            return;
        }

        // Progress to next hint level
        this.hintState.currentLevel = Math.min(
            this.hintState.currentLevel + 1,
            this.hintState.maxLevel
        );

        // Track hint usage for achievements
        this.trackHintUsage();

        // Show the appropriate hint popup
        this.showHintPopup(this.hintState.currentLevel);

        // Update button text
        this.updateHintButton();
    }

    /**
     * Track hint usage for achievements
     */
    trackHintUsage() {
        const user = getUserData();
        user.hintsUsed = (user.hintsUsed || 0) + 1;
        user.totalHintsUsed = (user.totalHintsUsed || 0) + 1;

        // Reset tasksWithoutHints counter if hints are used for current task
        if (this.currentTask && this.hintState.currentLevel === 1) {
            // Only reset on first hint, not on progressive hints
            user.perfectStreak = 0;
        }

        saveUserData(user);

        // Check for HINT_SEEKER achievement
        if (typeof checkAchievements === 'function') {
            checkAchievements();
        }

        console.log(`[Hints] User has used ${user.totalHintsUsed} hints total`);
    }

    /**
     * Update the hint button text based on current level
     */
    updateHintButton() {
        const hintBtn = document.getElementById('task-hint-btn');
        if (!hintBtn) return;

        const labels = {
            0: 'Tipp anfordern',
            1: 'Mehr Hilfe (Stufe 2)',
            2: 'Lösung zeigen (Stufe 3)',
            3: 'Alle Tipps gezeigt'
        };

        hintBtn.innerHTML = `<i class="fas fa-lightbulb"></i> ${labels[this.hintState.currentLevel]}`;

        if (this.hintState.currentLevel >= this.hintState.maxLevel) {
            hintBtn.disabled = true;
        }
    }

    /**
     * Show hint popup with the specified level
     */
    showHintPopup(level) {
        // Remove any existing hint popup
        const existingPopup = document.querySelector('.hint-popup-overlay');
        if (existingPopup) {
            existingPopup.remove();
        }

        const hint = this.hintState.hints.find(h => h.level === level);
        if (!hint) {
            // If no hint for this level, try to generate one
            if (level === 3) {
                this.showFullSolution();
                return;
            }
            this.showNotification('Keine weiteren Tipps verfügbar.', 'info');
            return;
        }

        // Create popup overlay
        const overlay = document.createElement('div');
        overlay.className = 'hint-popup-overlay';

        let content = '';
        let title = '';

        switch (level) {
            case 1:
                title = '💡 Tipp Stufe 1 - Stichworte';
                content = `
                    <div class="hint-chips">
                        ${hint.content.map(chip => `<span class="hint-chip">${chip}</span>`).join('')}
                    </div>
                    <p class="hint-explanation">Diese Begriffe sind wichtig für die Lösung.</p>
                `;
                break;

            case 2:
                title = '📝 Tipp Stufe 2 - Lösungsansatz';
                content = `
                    <div class="hint-approach">
                        <p>${hint.content}</p>
                    </div>
                    <p class="hint-explanation">Versuche diesen Ansatz auf deine Aufgabe anzuwenden.</p>
                `;
                break;

            case 3:
                title = '✅ Tipp Stufe 3 - Musterlösung';
                content = `
                    <div class="hint-solution">
                        <p>${hint.content}</p>
                    </div>
                    <p class="hint-warning">⚠️ Versuche die Aufgabe beim nächsten Mal selbst zu lösen!</p>
                `;
                break;
        }

        overlay.innerHTML = `
            <div class="hint-popup">
                <div class="hint-popup-header">
                    <h4>${title}</h4>
                    <button class="hint-popup-close">&times;</button>
                </div>
                <div class="hint-popup-content">
                    ${content}
                </div>
                <div class="hint-popup-footer">
                    <span class="hint-level-indicator">Stufe ${level} von ${this.hintState.maxLevel}</span>
                    ${level < this.hintState.maxLevel ?
                        '<button class="btn btn-secondary hint-more-btn">Mehr Hilfe</button>' :
                        '<button class="btn btn-primary hint-close-btn">Verstanden</button>'}
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Event listeners
        overlay.querySelector('.hint-popup-close').addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });

        const moreBtn = overlay.querySelector('.hint-more-btn');
        if (moreBtn) {
            moreBtn.addEventListener('click', () => {
                overlay.remove();
                this.toggleHints();
            });
        }

        const closeBtn = overlay.querySelector('.hint-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => overlay.remove());
        }

        // Render LaTeX if available
        if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
            MathJax.typesetPromise([overlay]);
        }
    }

    /**
     * Show full solution (Level 3)
     */
    showFullSolution() {
        const feedback = this.hintState.lastFeedback;
        if (!feedback) return;

        const solution = feedback.feedback?.calculation ||
                        feedback.feedback?.approach ||
                        feedback.feedback?.summary ||
                        'Keine detaillierte Lösung verfügbar.';

        // Create popup overlay
        const overlay = document.createElement('div');
        overlay.className = 'hint-popup-overlay';
        overlay.innerHTML = `
            <div class="hint-popup hint-popup-large">
                <div class="hint-popup-header">
                    <h4>✅ Musterlösung</h4>
                    <button class="hint-popup-close">&times;</button>
                </div>
                <div class="hint-popup-content">
                    <div class="hint-solution">
                        ${this.formatText(solution)}
                    </div>
                    <p class="hint-warning">⚠️ Das Betrachten der Musterlösung beeinflusst dein Achievement-Tracking.</p>
                </div>
                <div class="hint-popup-footer">
                    <span class="hint-level-indicator">Stufe 3 von 3 (Maximum)</span>
                    <button class="btn btn-primary hint-close-btn">Verstanden</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Event listeners
        overlay.querySelector('.hint-popup-close').addEventListener('click', () => overlay.remove());
        overlay.querySelector('.hint-close-btn').addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });

        // Render LaTeX if available
        if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
            MathJax.typesetPromise([overlay]);
        }
    }

    /**
     * Reset hint state for new task
     */
    resetHintState() {
        this.hintState = {
            currentLevel: 0,
            maxLevel: 3,
            hints: [],
            lastFeedback: null
        };

        const hintBtn = document.getElementById('task-hint-btn');
        if (hintBtn) {
            hintBtn.innerHTML = '<i class="fas fa-lightbulb"></i> Tipp anfordern';
            hintBtn.disabled = false;
        }
    }

    // ==================== NOTIFICATIONS ====================

    showNotification(message, type = 'info') {
        if (window.MathTutorApp && typeof window.MathTutorApp.showNotification === 'function') {
            window.MathTutorApp.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    showLoading(show) {
        const loadingEl = document.getElementById('loading-indicator');
        if (loadingEl) {
            loadingEl.style.display = show ? 'flex' : 'none';
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.taskUploadManager = new TaskUploadManager();
    });
} else {
    window.taskUploadManager = new TaskUploadManager();
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaskUploadManager;
}
