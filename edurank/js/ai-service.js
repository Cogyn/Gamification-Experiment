// AI Service for OpenAI GPT-5.1 with Function Calling

// ==================== API KEY MANAGEMENT ====================

function setApiKey(apiKey) {
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error('API Key darf nicht leer sein');
  }
  localStorage.setItem('edurank_api_key', apiKey.trim());
}

function getApiKey() {
  return localStorage.getItem('edurank_api_key');
}

function hasApiKey() {
  const key = getApiKey();
  return key && key.length > 0;
}

function clearApiKey() {
  localStorage.removeItem('edurank_api_key');
}

// ==================== LATEX VALIDATOR & FIXER ====================

const LATEX_COMMANDS = {
  // Command: [required args, optional args]
  'frac': [2, 0],
  'sqrt': [1, 1],
  'sum': [0, 2],
  'int': [0, 2],
  'lim': [0, 1],
  'binom': [2, 0],
  'vec': [1, 0],
  'hat': [1, 0],
  'bar': [1, 0],
  'tilde': [1, 0],
  'overline': [1, 0],
  'underline': [1, 0],
  'text': [1, 0],
  'mathrm': [1, 0],
  'mathbf': [1, 0],
  'mathit': [1, 0],
};

function fixLatexSyntax(latex) {
  if (!latex) return latex;

  let fixed = latex;

  // 1. Fix missing closing braces
  const openBraces = (fixed.match(/\{/g) || []).length;
  const closeBraces = (fixed.match(/\}/g) || []).length;
  if (openBraces > closeBraces) {
    fixed += '}'.repeat(openBraces - closeBraces);
  }

  // 2. Fix common LaTeX commands with missing arguments
  Object.keys(LATEX_COMMANDS).forEach(cmd => {
    const [requiredArgs, optionalArgs] = LATEX_COMMANDS[cmd];

    // Find all occurrences of the command
    const regex = new RegExp(`\\\\${cmd}(?![a-zA-Z])`, 'g');
    let match;
    const matches = [];

    while ((match = regex.exec(fixed)) !== null) {
      matches.push(match.index);
    }

    // Process matches in reverse to preserve indices
    for (let i = matches.length - 1; i >= 0; i--) {
      const pos = matches[i];
      const afterCmd = fixed.substring(pos + cmd.length + 1);

      // Count existing arguments
      let argCount = 0;
      let idx = 0;

      // Skip optional arguments [...]
      while (afterCmd[idx] === '[') {
        let bracketDepth = 1;
        idx++;
        while (idx < afterCmd.length && bracketDepth > 0) {
          if (afterCmd[idx] === '[') bracketDepth++;
          if (afterCmd[idx] === ']') bracketDepth--;
          idx++;
        }
      }

      // Count required arguments {...}
      while (afterCmd[idx] === '{' && argCount < requiredArgs) {
        let braceDepth = 1;
        idx++;
        while (idx < afterCmd.length && braceDepth > 0) {
          if (afterCmd[idx] === '{') braceDepth++;
          if (afterCmd[idx] === '}') braceDepth--;
          idx++;
        }
        argCount++;
      }

      // Add missing arguments
      if (argCount < requiredArgs) {
        const insertPos = pos + cmd.length + 1 + idx;
        const missingArgs = '{}' .repeat(requiredArgs - argCount);
        fixed = fixed.substring(0, insertPos) + missingArgs + fixed.substring(insertPos);
      }
    }
  });

  // 3. Fix unescaped special characters
  fixed = fixed.replace(/([^\\])([%&$#_])/g, '$1\\$2');

  // 4. Ensure proper delimiters
  if (fixed.includes('\\(') && !fixed.includes('\\)')) {
    fixed += '\\)';
  }
  if (fixed.includes('\\[') && !fixed.includes('\\]')) {
    fixed += '\\]';
  }

  // 5. Fix double backslashes
  fixed = fixed.replace(/\\\\\\\\/g, '\\\\');

  return fixed;
}

function validateLatex(latex) {
  if (!latex) return { valid: true, errors: [] };

  const errors = [];

  // Check balanced braces
  let braceDepth = 0;
  for (let i = 0; i < latex.length; i++) {
    if (latex[i] === '{' && (i === 0 || latex[i-1] !== '\\')) {
      braceDepth++;
    }
    if (latex[i] === '}' && (i === 0 || latex[i-1] !== '\\')) {
      braceDepth--;
      if (braceDepth < 0) {
        errors.push('Zu viele schließende Klammern }');
        break;
      }
    }
  }
  if (braceDepth > 0) {
    errors.push('Fehlende schließende Klammern }');
  }

  // Check balanced delimiters
  const openDelims = (latex.match(/\\\(/g) || []).length;
  const closeDelims = (latex.match(/\\\)/g) || []).length;
  if (openDelims !== closeDelims) {
    errors.push('Unbalancierte \\( \\) Delimiters');
  }

  const openDisplay = (latex.match(/\\\[/g) || []).length;
  const closeDisplay = (latex.match(/\\\]/g) || []).length;
  if (openDisplay !== closeDisplay) {
    errors.push('Unbalancierte \\[ \\] Delimiters');
  }

  return {
    valid: errors.length === 0,
    errors: errors,
  };
}

// ==================== FUNCTION CALLING SCHEMAS ====================

const ANSWER_VALIDATION_SCHEMA = {
  name: 'validate_answer',
  description: 'Validates a student answer to a math problem',
  parameters: {
    type: 'object',
    properties: {
      correct: {
        type: 'boolean',
        description: 'Whether the answer is correct',
      },
      confidence: {
        type: 'number',
        description: 'Confidence level (0-100)',
      },
      feedback: {
        type: 'object',
        properties: {
          summary: {
            type: 'string',
            description: 'Short feedback (1-2 sentences)',
          },
          approach: {
            type: 'string',
            description: 'Assessment of the approach used',
          },
          calculation: {
            type: 'string',
            description: 'Assessment of calculation accuracy',
          },
        },
        required: ['summary', 'approach', 'calculation'],
      },
      errorAnalysis: {
        type: 'object',
        properties: {
          hasErrors: {
            type: 'boolean',
            description: 'Whether errors were detected',
          },
          errorTypes: {
            type: 'array',
            items: { type: 'string' },
            description: 'Types of errors (conceptual, calculation, notation)',
          },
          specificErrors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                location: { type: 'string' },
                description: { type: 'string' },
                severity: { type: 'string', enum: ['minor', 'major', 'critical'] },
              },
            },
            description: 'Specific errors found',
          },
        },
        required: ['hasErrors', 'errorTypes', 'specificErrors'],
      },
      hints: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            level: { type: 'string', enum: ['gentle', 'moderate', 'strong'] },
            message: { type: 'string' },
            targetArea: { type: 'string' },
          },
        },
        description: 'Progressive hints (DO NOT reveal solution)',
      },
      infoBoxes: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['tip', 'warning', 'concept', 'formula'] },
            title: { type: 'string' },
            content: { type: 'string' },
            latex: { type: 'string' },
          },
        },
        description: 'Helpful information boxes',
      },
      nextSteps: {
        type: 'array',
        items: { type: 'string' },
        description: 'Suggested next steps (without giving solution)',
      },
    },
    required: ['correct', 'confidence', 'feedback', 'errorAnalysis', 'hints', 'infoBoxes', 'nextSteps'],
  },
};

// ==================== SYSTEM PROMPTS ====================

const SYSTEM_PROMPTS = {
  answerValidation: `Du bist ein erfahrener Mathematik-Lehrer, der Schülerantworten bewertet und konstruktives Feedback gibt.

**WICHTIGE REGELN:**
1. Verrate NIEMALS die Lösung direkt
2. Gib progressive Hints, die zum Nachdenken anregen
3. Analysiere Fehler detailliert ohne die Korrektur zu zeigen
4. Sei ermutigendes aber ehrlich
5. Akzeptiere äquivalente mathematische Darstellungen

**LaTeX-FORMATIERUNG (KRITISCH):**

**Inline Math:** Verwende \\( ... \\) für mathematische Ausdrücke im Text
- Beispiel: \\( x^2 + 5 \\)

**Display Math:** Verwende \\[ ... \\] für zentrierte Formeln
- Beispiel: \\[ \\frac{a}{b} = c \\]

**Befehle und Syntax:**
- Brüche: \\frac{Zähler}{Nenner}
- Wurzeln: \\sqrt{x} oder \\sqrt[n]{x}
- Potenzen: x^{2} (Klammern bei mehreren Zeichen!)
- Indizes: x_{1} (Klammern bei mehreren Zeichen!)
- Griechische Buchstaben: \\alpha, \\beta, \\pi, \\theta
- Summen: \\sum_{i=1}^{n}
- Integrale: \\int_{a}^{b} f(x) \\, dx
- Limiten: \\lim_{x \\to \\infty}
- Binomialkoeffizienten: \\binom{n}{k}
- Vektoren: \\vec{v} oder \\mathbf{v}
- Matrizen: \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}

**Spezielle Operatoren:**
- Mal: \\cdot oder \\times
- Geteilt: \\div oder : oder /
- Plus/Minus: \\pm
- Größer/Kleiner: >, <, \\geq, \\leq, \\gg, \\ll
- Nicht gleich: \\neq
- Ungefähr: \\approx
- Äquivalent: \\equiv

**Text in Formeln:**
- Text: \\text{hier normaler Text}
- Roman Font: \\mathrm{sin}, \\mathrm{cos}

**Klammern (automatisch anpassen):**
- Klein: (x), [x], \\{x\\}
- Groß: \\left( \\frac{a}{b} \\right)
- Verschiedene: \\left[ ... \\right], \\left\\{ ... \\right\\}

**KRITISCH - Klammern:**
- IMMER geschweifte Klammern bei Befehlen: \\frac{a}{b}, nicht \\frac ab
- IMMER Klammern bei Exponenten/Indizes mit mehreren Zeichen: x^{10}, nicht x^10
- IMMER passende öffnende und schließende Klammern

**Beispiele korrekter LaTeX-Formatierung:**
- Einfach: \\( x + 5 = 10 \\)
- Bruch: \\( \\frac{x + 1}{x - 1} \\)
- Komplex: \\[ f(x) = \\int_{0}^{\\infty} e^{-x^2} \\, dx \\]
- Wurzel: \\( \\sqrt{x^2 + y^2} \\)
- Matrix: \\[ A = \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix} \\]

**FEHLERANALYSE:**
Kategorisiere Fehler in:
1. **Konzeptionelle Fehler:** Falsches Verständnis des Problems
2. **Rechenfehler:** Falsche Berechnungen
3. **Notationsfehler:** Falsche mathematische Notation
4. **Vorzeichenfehler:** Fehler bei +/- Zeichen
5. **Algebraische Fehler:** Fehler beim Umformen

**HINTS (Progressive Levels):**
1. **Gentle:** Subtile Hinweise zur Denkrichtung
2. **Moderate:** Konkretere Hinweise zum Ansatz
3. **Strong:** Deutliche Hinweise, aber KEINE Lösung

**INFOBOXEN (Types):**
1. **tip:** Praktische Tipps zur Herangehensweise
2. **warning:** Warnung vor häufigen Fehlern
3. **concept:** Konzeptuelle Erklärung
4. **formula:** Relevante Formel (in LaTeX)

**OUTPUT-STRUKTUR:**
Nutze die definierte Function (validate_answer) mit allen required fields.`,
};

// ==================== OPENAI API INTEGRATION ====================

async function callOpenAI(messages, functionSchema = null) {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('Bitte API Key in den Einstellungen eingeben');
  }

  const requestBody = {
    model: CONFIG.ai.model,
    messages: messages,
    temperature: CONFIG.ai.temperature,
    max_tokens: CONFIG.ai.maxTokens,
  };

  // Add function calling if schema provided (using new tools API)
  if (functionSchema) {
    requestBody.tools = [{
      type: 'function',
      function: functionSchema
    }];
    requestBody.tool_choice = {
      type: 'function',
      function: { name: functionSchema.name }
    };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API Fehler');
    }

    const data = await response.json();

    // Handle function call response (new tools API format)
    if (data.choices[0].message.tool_calls && data.choices[0].message.tool_calls.length > 0) {
      const toolCall = data.choices[0].message.tool_calls[0];
      const result = JSON.parse(toolCall.function.arguments);
      return result;
    }

    // Handle regular response
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
}

// ==================== IMAGE TO BASE64 ====================

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve({
        type: file.type,
        base64: base64,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ==================== ANSWER VALIDATION ====================

async function validateAnswerWithImage(imageData, studentAnswer) {
  const messages = [
    {
      role: 'system',
      content: SYSTEM_PROMPTS.answerValidation,
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: `Analysiere die Mathematik-Aufgabe auf dem Bild und bewerte die folgende Schülerantwort:\n\n**Schülerantwort:** ${studentAnswer}\n\nBewerte die Antwort und gib strukturiertes Feedback gemäß der Function-Definition.`,
        },
        {
          type: 'image_url',
          image_url: {
            url: `data:${imageData.type};base64,${imageData.base64}`,
          },
        },
      ],
    },
  ];

  const result = await callOpenAI(messages, ANSWER_VALIDATION_SCHEMA);

  // Fix LaTeX in all text fields
  result.feedback.summary = fixLatexInText(result.feedback.summary);
  result.feedback.approach = fixLatexInText(result.feedback.approach);
  result.feedback.calculation = fixLatexInText(result.feedback.calculation);

  if (result.hints) {
    result.hints = result.hints.map(hint => ({
      ...hint,
      message: fixLatexInText(hint.message),
    }));
  }

  if (result.infoBoxes) {
    result.infoBoxes = result.infoBoxes.map(box => ({
      ...box,
      content: fixLatexInText(box.content),
      latex: box.latex ? fixLatexSyntax(box.latex) : null,
    }));
  }

  return result;
}

async function validateAnswerWithText(problemText, studentAnswer) {
  const messages = [
    {
      role: 'system',
      content: SYSTEM_PROMPTS.answerValidation,
    },
    {
      role: 'user',
      content: `**Aufgabe:** ${problemText}\n\n**Schülerantwort:** ${studentAnswer}\n\nBewerte die Antwort und gib strukturiertes Feedback gemäß der Function-Definition.`,
    },
  ];

  const result = await callOpenAI(messages, ANSWER_VALIDATION_SCHEMA);

  // Fix LaTeX in all text fields
  result.feedback.summary = fixLatexInText(result.feedback.summary);
  result.feedback.approach = fixLatexInText(result.feedback.approach);
  result.feedback.calculation = fixLatexInText(result.feedback.calculation);

  if (result.hints) {
    result.hints = result.hints.map(hint => ({
      ...hint,
      message: fixLatexInText(hint.message),
    }));
  }

  if (result.infoBoxes) {
    result.infoBoxes = result.infoBoxes.map(box => ({
      ...box,
      content: fixLatexInText(box.content),
      latex: box.latex ? fixLatexSyntax(box.latex) : null,
    }));
  }

  return result;
}

// ==================== LATEX TEXT FIXER ====================

function fixLatexInText(text) {
  if (!text) return text;

  let fixed = text;

  // Find all LaTeX expressions in text
  const inlineMatches = text.match(/\\\((.*?)\\\)/g);
  if (inlineMatches) {
    inlineMatches.forEach(match => {
      const latex = match.substring(2, match.length - 2);
      const fixedLatex = fixLatexSyntax(latex);
      fixed = fixed.replace(match, `\\(${fixedLatex}\\)`);
    });
  }

  const displayMatches = text.match(/\\\[(.*?)\\\]/g);
  if (displayMatches) {
    displayMatches.forEach(match => {
      const latex = match.substring(2, match.length - 2);
      const fixedLatex = fixLatexSyntax(latex);
      fixed = fixed.replace(match, `\\[${fixedLatex}\\]`);
    });
  }

  return fixed;
}

// ==================== BACKWARDS COMPATIBILITY ====================

// Alias for old function names
async function validateAnswerWithAI(problemText, solution, studentAnswer) {
  return await validateAnswerWithText(problemText, studentAnswer);
}
