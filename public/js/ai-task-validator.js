/**
 * AI Task Validator
 * Handles task validation using OpenAI API with Vision support
 */

// Answer Validation Schema for Function Calling
const ANSWER_VALIDATION_SCHEMA = {
    name: "validate_answer",
    description: "Validates a student's answer to a math problem and provides detailed feedback",
    parameters: {
        type: "object",
        properties: {
            correct: {
                type: "boolean",
                description: "Whether the answer is correct"
            },
            confidence: {
                type: "number",
                description: "Confidence level in the assessment (0-100)",
                minimum: 0,
                maximum: 100
            },
            feedback: {
                type: "object",
                properties: {
                    summary: {
                        type: "string",
                        description: "Brief summary of the answer quality"
                    },
                    approach: {
                        type: "string",
                        description: "Evaluation of the solution approach"
                    },
                    calculation: {
                        type: "string",
                        description: "Evaluation of calculations and steps"
                    }
                },
                required: ["summary", "approach", "calculation"]
            },
            errorAnalysis: {
                type: "object",
                properties: {
                    hasErrors: {
                        type: "boolean",
                        description: "Whether errors were found"
                    },
                    errorTypes: {
                        type: "array",
                        items: {
                            type: "string",
                            enum: ["conceptual", "calculation", "notation", "incomplete"]
                        },
                        description: "Types of errors found"
                    },
                    specificErrors: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                location: {
                                    type: "string",
                                    description: "Where the error occurred"
                                },
                                description: {
                                    type: "string",
                                    description: "Description of the error"
                                },
                                severity: {
                                    type: "string",
                                    enum: ["minor", "major", "critical"],
                                    description: "Severity of the error"
                                }
                            }
                        }
                    }
                },
                required: ["hasErrors", "errorTypes"]
            },
            hints: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        level: {
                            type: "string",
                            enum: ["gentle", "moderate", "strong"],
                            description: "How direct the hint is"
                        },
                        message: {
                            type: "string",
                            description: "The hint text"
                        },
                        targetArea: {
                            type: "string",
                            description: "What area of the problem this hint addresses"
                        }
                    }
                },
                description: "Progressive hints for improvement"
            },
            nextSteps: {
                type: "array",
                items: {
                    type: "string"
                },
                description: "Recommended next steps for the student"
            }
        },
        required: ["correct", "confidence", "feedback", "errorAnalysis"]
    }
};

/**
 * Validates a task answer using AI
 * Tries backend proxy first, then falls back to direct API call
 * @param {Object} task - Task object with content and imageData
 * @param {string} userAnswer - Student's answer
 * @returns {Promise<Object>} Validation result
 */
async function validateTaskAnswer(task, userAnswer) {
    // Try backend proxy first (recommended)
    const useBackendProxy = window.USE_BACKEND_PROXY !== false;

    if (useBackendProxy) {
        try {
            return await validateAnswerViaBackend(task, userAnswer);
        } catch (proxyError) {
            console.warn('[TaskValidator] Backend validation failed, trying direct API:', proxyError.message);
            // Fall through to direct API call
        }
    }

    // Direct API call (fallback)
    const apiKey = getApiKey();

    if (!apiKey) {
        throw new Error('OpenAI API-Schlüssel nicht konfiguriert. Bitte im Profil unter "API Konfiguration" eingeben.');
    }

    if (task.hasImage && task.imageData) {
        return await validateAnswerWithImage(task.imageData, task.content, userAnswer, apiKey);
    } else {
        return await validateAnswerWithText(task.content, userAnswer, apiKey);
    }
}

/**
 * Validate answer using the backend API proxy
 * This is the recommended method as the API key is stored securely on the server
 */
async function validateAnswerViaBackend(task, userAnswer) {
    const response = await fetch('/api/ai/validate-answer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            task: {
                content: task.content,
                hasImage: task.hasImage || false,
                imageData: task.imageData || null,
            },
            answer: userAnswer
        })
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Backend Fehler: ${response.status}`);
    }

    return await response.json();
}

/**
 * Validates answer with image using Vision API
 */
async function validateAnswerWithImage(imageData, taskText, studentAnswer, apiKey) {
    const messages = [
        {
            role: "system",
            content: `Du bist ein erfahrener Mathematik-Tutor. Analysiere die Aufgabe im Bild und bewerte die Lösung des Schülers.

WICHTIG - LaTeX-Formatierung:
- Verwende $...$ für inline Mathematik
- Verwende $$...$$ für display Mathematik
- Beispiel: Die Lösung $x = 5$ ist korrekt.

Gib strukturiertes Feedback mit Fokus auf:
1. Ist die Lösung korrekt?
2. Ist der Lösungsweg nachvollziehbar?
3. Welche Fehler wurden gemacht?
4. Was kann verbessert werden?`
        },
        {
            role: "user",
            content: [
                {
                    type: "image_url",
                    image_url: {
                        url: `data:${imageData.type};base64,${imageData.base64}`
                    }
                },
                {
                    type: "text",
                    text: `${taskText ? `Zusätzlicher Kontext: ${taskText}\n\n` : ''}Lösung des Schülers:\n${studentAnswer}`
                }
            ]
        }
    ];

    return await callOpenAI(messages, apiKey);
}

/**
 * Validates answer with text only
 */
async function validateAnswerWithText(problemText, studentAnswer, apiKey) {
    const messages = [
        {
            role: "system",
            content: `Du bist ein erfahrener Mathematik-Tutor. Bewerte die Lösung des Schülers zur gegebenen Aufgabe.

WICHTIG - LaTeX-Formatierung:
- Verwende $...$ für inline Mathematik
- Verwende $$...$$ für display Mathematik
- Beispiel: Die Ableitung ist $f'(x) = 3x^2$.

Gib strukturiertes Feedback mit Fokus auf:
1. Korrektheit der Lösung
2. Qualität des Lösungswegs
3. Fehleranalyse
4. Verbesserungsvorschläge`
        },
        {
            role: "user",
            content: `**Aufgabe:**
${problemText}

**Lösung des Schülers:**
${studentAnswer}`
        }
    ];

    return await callOpenAI(messages, apiKey);
}

/**
 * Calls AI API - tries backend proxy first, falls back to direct API call
 */
async function callOpenAI(messages, apiKey) {
    // Try backend proxy first (recommended for production)
    const useBackendProxy = window.USE_BACKEND_PROXY !== false;

    if (useBackendProxy) {
        try {
            return await callBackendProxy(messages);
        } catch (proxyError) {
            console.warn('[TaskValidator] Backend proxy failed, trying direct API:', proxyError.message);
            // Fall through to direct API call
        }
    }

    // Direct API call (fallback or development)
    if (!apiKey) {
        throw new Error('Kein API-Key verfügbar. Bitte im Profil konfigurieren.');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: messages,
            functions: [ANSWER_VALIDATION_SCHEMA],
            function_call: { name: "validate_answer" },
            temperature: 0.3
        })
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `API Fehler: ${response.status}`);
    }

    const data = await response.json();

    // Extract function call result
    if (data.choices[0]?.message?.function_call) {
        const result = JSON.parse(data.choices[0].message.function_call.arguments);
        return result;
    }

    // Fallback to message content
    return {
        correct: false,
        confidence: 50,
        feedback: {
            summary: data.choices[0]?.message?.content || "Konnte nicht validieren",
            approach: "",
            calculation: ""
        },
        errorAnalysis: {
            hasErrors: true,
            errorTypes: []
        }
    };
}

/**
 * Call backend proxy for AI requests
 * The backend handles the API key securely
 */
async function callBackendProxy(messages) {
    const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messages: messages,
            model: 'gpt-4o',
            temperature: 0.3,
            tools: [{
                type: 'function',
                function: {
                    name: 'validate_answer',
                    description: ANSWER_VALIDATION_SCHEMA.description,
                    parameters: ANSWER_VALIDATION_SCHEMA.parameters
                }
            }],
            tool_choice: { type: 'function', function: { name: 'validate_answer' } }
        })
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Backend API Fehler: ${response.status}`);
    }

    const data = await response.json();

    // Extract function call result from backend response
    if (data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments) {
        return JSON.parse(data.choices[0].message.tool_calls[0].function.arguments);
    }

    // Fallback
    return {
        correct: false,
        confidence: 50,
        feedback: {
            summary: data.choices?.[0]?.message?.content || "Konnte nicht validieren",
            approach: "",
            calculation: ""
        },
        errorAnalysis: {
            hasErrors: true,
            errorTypes: []
        }
    };
}

/**
 * Gets API key from storage or config
 * Checks multiple sources for backwards compatibility
 */
function getApiKey() {
    // 1. Try the storage module function (recommended)
    if (typeof window !== 'undefined' && typeof window.getApiKey === 'function') {
        const key = window.getApiKey();
        if (key) return key;
    }

    // 2. Try to get from MathTutorApp
    if (typeof window !== 'undefined' && window.MathTutorApp) {
        const apiKey = window.MathTutorApp.getApiKey?.();
        if (apiKey && apiKey !== 'proxy') return apiKey;
    }

    // 3. Try localStorage api_settings (new format)
    try {
        const settings = JSON.parse(localStorage.getItem('api_settings') || '{}');
        if (settings.openai_api_key) return settings.openai_api_key;
    } catch (e) {
        console.error('[TaskValidator] Error reading api_settings:', e);
    }

    // 4. Try legacy localStorage key
    try {
        const legacyKey = localStorage.getItem('openai_api_key');
        if (legacyKey) return legacyKey;
    } catch (e) {
        // Ignore
    }

    return null;
}

/**
 * LaTeX validation and fixing utilities
 */
function validateLatex(latex) {
    // Check for common LaTeX errors
    const errors = [];

    // Check for unmatched delimiters
    const dollarCount = (latex.match(/\$/g) || []).length;
    if (dollarCount % 2 !== 0) {
        errors.push('Unmatched $ delimiters');
    }

    // Check for unmatched braces
    let braceDepth = 0;
    for (const char of latex) {
        if (char === '{') braceDepth++;
        if (char === '}') braceDepth--;
        if (braceDepth < 0) {
            errors.push('Unmatched closing brace');
            break;
        }
    }
    if (braceDepth > 0) {
        errors.push('Unmatched opening brace');
    }

    return {
        valid: errors.length === 0,
        errors: errors
    };
}

function fixLatexSyntax(latex) {
    let fixed = latex;

    // Fix common issues
    // Add backslash to common functions
    fixed = fixed.replace(/\b(sin|cos|tan|log|ln|sqrt|frac)\b/g, '\\$1');

    // Ensure proper spacing around operators
    fixed = fixed.replace(/([+\-=])/g, ' $1 ');

    // Remove duplicate spaces
    fixed = fixed.replace(/\s+/g, ' ');

    return fixed.trim();
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateTaskAnswer,
        validateLatex,
        fixLatexSyntax,
        ANSWER_VALIDATION_SCHEMA
    };
}

// Export for browser
if (typeof window !== 'undefined') {
    window.TaskValidator = {
        validateTaskAnswer,
        validateLatex,
        fixLatexSyntax,
        ANSWER_VALIDATION_SCHEMA
    };
}
