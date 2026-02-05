// Task Management System

// Generate unique task ID
function generateTaskId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `task-${timestamp}-${random}`;
}

// Create new task
function createTask(taskData) {
  const user = getUserData();

  const difficulty = taskData.difficulty || estimateDifficulty(taskData.content);

  const task = {
    id: generateTaskId(),
    userId: user.id,
    subjectId: taskData.subjectId,
    rawContent: taskData.content,
    formattedContent: formatTaskContent(taskData.content),
    solution: taskData.solution || null,
    topic: taskData.topic || 'Allgemein',
    difficulty: difficulty,
    taskType: taskData.taskType || 'text',
    status: 'ready',
    xpReward: calculateXP(difficulty, 0),
    solvedAt: null,
    attempts: 0,
    createdAt: new Date().toISOString(),
    latex: taskData.latex || null,
    hints: taskData.hints || [],
    hasImage: taskData.hasImage || false,
    imageData: taskData.imageData || null,
  };

  saveTask(task);
  return task;
}

// Format task content (basic markdown-like formatting)
function formatTaskContent(content) {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

// Estimate difficulty based on content length (mock AI)
function estimateDifficulty(content) {
  const length = content.length;
  if (length < 50) return 2;
  if (length < 100) return 3;
  if (length < 200) return 5;
  if (length < 400) return 7;
  return 8;
}

// Validate answer
function validateAnswer(task, userAnswer) {
  // Simple string comparison (case-insensitive, trimmed)
  const correctAnswer = task.solution.toLowerCase().trim();
  const submittedAnswer = userAnswer.toLowerCase().trim();

  // Allow for minor variations (remove punctuation, extra spaces)
  const normalize = (str) => str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').replace(/\s+/g, ' ');

  return normalize(correctAnswer) === normalize(submittedAnswer);
}

// Submit answer (async for AI validation)
async function submitAnswer(taskId, answer, useAI = true) {
  const task = getTaskById(taskId);
  if (!task) {
    return { success: false, error: 'Task not found' };
  }

  // Increment attempts
  task.attempts++;

  let isCorrect = false;
  let feedback = '';
  let hint = '';

  // Use AI validation if API key is available and useAI is true
  if (useAI && hasApiKey && typeof hasApiKey === 'function' && hasApiKey()) {
    try {
      // For image tasks, use AI with image
      if (task.hasImage && task.imageData) {
        const aiResult = await validateAnswerWithImage(task.imageData, answer);
        isCorrect = aiResult.correct;
        // Store structured feedback
        feedback = {
          structured: true,
          summary: aiResult.feedback.summary,
          approach: aiResult.feedback.approach,
          calculation: aiResult.feedback.calculation,
          errorAnalysis: aiResult.errorAnalysis,
          hints: aiResult.hints,
          infoBoxes: aiResult.infoBoxes,
          nextSteps: aiResult.nextSteps,
          confidence: aiResult.confidence,
        };
      } else {
        // For text tasks, use regular AI validation
        const aiResult = await validateAnswerWithText(task.rawContent, answer);
        isCorrect = aiResult.correct;
        // Store structured feedback
        feedback = {
          structured: true,
          summary: aiResult.feedback.summary,
          approach: aiResult.feedback.approach,
          calculation: aiResult.feedback.calculation,
          errorAnalysis: aiResult.errorAnalysis,
          hints: aiResult.hints,
          infoBoxes: aiResult.infoBoxes,
          nextSteps: aiResult.nextSteps,
          confidence: aiResult.confidence,
        };
      }
    } catch (error) {
      console.error('AI validation failed:', error);
      // For image tasks without AI, we can't validate
      if (task.hasImage) {
        return {
          success: false,
          error: 'KI-Validierung fehlgeschlagen. Bitte API-Key prüfen oder später erneut versuchen.',
        };
      }
      // Fallback for text tasks
      isCorrect = task.solution ? validateAnswer(task, answer) : false;
      feedback = isCorrect ? 'Korrekt!' : 'Antwort konnte nicht überprüft werden. Bitte API-Key eingeben.';
    }
  } else {
    // Without API key, image tasks can't be validated
    if (task.hasImage) {
      return {
        success: false,
        error: 'Für Bild-Aufgaben wird ein API-Key benötigt. Bitte in den Einstellungen eingeben.',
      };
    }
    // Simple validation for text tasks with solution
    if (task.solution) {
      isCorrect = validateAnswer(task, answer);
      feedback = isCorrect ? 'Korrekt!' : 'Falsche Antwort. Versuche es nochmal!';
    } else {
      return {
        success: false,
        error: 'Für diese Aufgabe wird ein API-Key zur Überprüfung benötigt.',
      };
    }
  }

  if (isCorrect) {
    // Mark task as solved
    task.status = 'solved';
    task.solvedAt = new Date().toISOString();
    updateTask(taskId, task);

    // Award rewards
    const rewards = awardTaskCompletion(task);

    return {
      success: true,
      correct: true,
      rewards,
      task,
      feedback,
    };
  } else {
    // Update attempts count
    updateTask(taskId, { attempts: task.attempts });

    return {
      success: true,
      correct: false,
      attempts: task.attempts,
      feedback,
      hint,
    };
  }
}

// Filter tasks
function filterTasks(filters = {}) {
  let tasks = getAllTasks();

  if (filters.subjectId) {
    tasks = tasks.filter(t => t.subjectId === filters.subjectId);
  }

  if (filters.status) {
    tasks = tasks.filter(t => t.status === filters.status);
  }

  if (filters.difficulty) {
    tasks = tasks.filter(t => t.difficulty === filters.difficulty);
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    tasks = tasks.filter(t =>
      t.rawContent.toLowerCase().includes(searchLower) ||
      t.topic.toLowerCase().includes(searchLower)
    );
  }

  return tasks;
}

// Get recent tasks
function getRecentTasks(limit = 5) {
  const tasks = getAllTasks();
  return tasks
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
}

// Get difficulty stars HTML
function getDifficultyStars(difficulty) {
  const maxStars = 10;
  let html = '<div class="difficulty-stars">';

  for (let i = 1; i <= maxStars; i++) {
    if (i <= difficulty) {
      html += '<span class="star filled">★</span>';
    } else {
      html += '<span class="star">☆</span>';
    }
  }

  html += '</div>';
  return html;
}

// Get subject by ID
function getSubjectById(subjectId) {
  return CONFIG.subjects.find(s => s.id === subjectId);
}

// Get subject badge HTML
function getSubjectBadgeHTML(subjectId) {
  const subject = getSubjectById(subjectId);
  if (!subject) return '';

  return `
    <span class="subject-badge" style="background-color: ${subject.color}20; color: ${subject.color};">
      <span class="subject-icon">${subject.icon}</span>
      <span class="subject-name">${subject.name}</span>
    </span>
  `;
}

// Get status badge HTML
function getStatusBadgeHTML(status) {
  const badges = {
    pending: { text: 'Wartend', color: '#f59e0b' },
    processing: { text: 'Verarbeitung', color: '#3b82f6' },
    ready: { text: 'Bereit', color: '#22c55e' },
    solved: { text: 'Gelöst', color: '#6366f1' },
  };

  const badge = badges[status] || badges.ready;

  return `
    <span class="status-badge" style="background-color: ${badge.color}20; color: ${badge.color};">
      ${badge.text}
    </span>
  `;
}
