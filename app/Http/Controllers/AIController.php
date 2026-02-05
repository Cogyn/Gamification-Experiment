<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIController extends Controller
{
    /**
     * OpenAI API Base URL
     */
    protected string $openaiBaseUrl = 'https://api.openai.com/v1';

    /**
     * Anthropic API Base URL
     */
    protected string $anthropicBaseUrl = 'https://api.anthropic.com/v1';

    /**
     * General chat endpoint - proxies requests to OpenAI/Anthropic
     */
    public function chat(Request $request)
    {
        $validated = $request->validate([
            'messages' => 'required|array',
            'messages.*.role' => 'required|string|in:system,user,assistant',
            'messages.*.content' => 'required',
            'model' => 'nullable|string',
            'temperature' => 'nullable|numeric|min:0|max:2',
            'max_tokens' => 'nullable|integer|min:1|max:128000',
            'provider' => 'nullable|string|in:openai,anthropic',
            'tools' => 'nullable|array',
            'tool_choice' => 'nullable',
        ]);

        $provider = $validated['provider'] ?? 'openai';

        try {
            if ($provider === 'anthropic') {
                return $this->callAnthropic($validated);
            }
            return $this->callOpenAI($validated);
        } catch (\Exception $e) {
            Log::error('AI Chat Error: ' . $e->getMessage());
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Validate a student's answer using AI
     */
    public function validateAnswer(Request $request)
    {
        $validated = $request->validate([
            'task' => 'required|array',
            'task.content' => 'required|string',
            'task.hasImage' => 'nullable|boolean',
            'task.imageData' => 'nullable|array',
            'answer' => 'required|string',
        ]);

        $task = $validated['task'];
        $answer = $validated['answer'];

        // Build the validation prompt
        $systemPrompt = $this->buildValidationSystemPrompt();
        $userContent = $this->buildValidationUserContent($task, $answer);

        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user', 'content' => $userContent],
        ];

        // Define the function schema for structured output
        $tools = [[
            'type' => 'function',
            'function' => [
                'name' => 'validate_answer',
                'description' => 'Validates a student answer and provides structured feedback',
                'parameters' => $this->getValidationSchema(),
            ],
        ]];

        try {
            $response = $this->callOpenAI([
                'messages' => $messages,
                'model' => config('services.openai.model', 'gpt-4o'),
                'temperature' => 0.3,
                'tools' => $tools,
                'tool_choice' => ['type' => 'function', 'function' => ['name' => 'validate_answer']],
            ]);

            // Parse the function call response
            $content = $response->json();
            if (isset($content['choices'][0]['message']['tool_calls'][0]['function']['arguments'])) {
                $result = json_decode($content['choices'][0]['message']['tool_calls'][0]['function']['arguments'], true);
                return response()->json($result);
            }

            return $response;
        } catch (\Exception $e) {
            Log::error('Validate Answer Error: ' . $e->getMessage());
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate a new task using AI
     */
    public function generateTask(Request $request)
    {
        $validated = $request->validate([
            'topic' => 'required|string',
            'difficulty' => 'nullable|integer|min:1|max:10',
            'subject' => 'nullable|string|in:math,physics,chemistry',
            'gradeLevel' => 'nullable|string',
        ]);

        $systemPrompt = $this->buildGenerationSystemPrompt($validated);
        $userPrompt = "Erstelle eine Aufgabe zum Thema: " . $validated['topic'];

        if (isset($validated['difficulty'])) {
            $userPrompt .= " mit Schwierigkeitsgrad " . $validated['difficulty'] . "/10";
        }

        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user', 'content' => $userPrompt],
        ];

        try {
            return $this->callOpenAI([
                'messages' => $messages,
                'model' => config('services.openai.model', 'gpt-4o'),
                'temperature' => 0.7,
            ]);
        } catch (\Exception $e) {
            Log::error('Generate Task Error: ' . $e->getMessage());
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Explain a concept or solution
     */
    public function explain(Request $request)
    {
        $validated = $request->validate([
            'question' => 'required|string',
            'context' => 'nullable|string',
            'learningStyle' => 'nullable|string|in:visual,step-by-step,conceptual,practical',
        ]);

        $systemPrompt = "Du bist ein erfahrener Mathematik-Tutor. Erkläre Konzepte klar und verständlich auf Deutsch.";

        if (isset($validated['learningStyle'])) {
            $systemPrompt .= $this->getLearningStyleInstruction($validated['learningStyle']);
        }

        $userContent = $validated['question'];
        if (isset($validated['context'])) {
            $userContent = "Kontext: " . $validated['context'] . "\n\nFrage: " . $userContent;
        }

        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user', 'content' => $userContent],
        ];

        try {
            return $this->callOpenAI([
                'messages' => $messages,
                'model' => config('services.openai.model', 'gpt-4o'),
                'temperature' => 0.5,
            ]);
        } catch (\Exception $e) {
            Log::error('Explain Error: ' . $e->getMessage());
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Call OpenAI API
     */
    protected function callOpenAI(array $params)
    {
        $apiKey = config('services.openai.api_key');

        if (empty($apiKey)) {
            return response()->json([
                'error' => true,
                'message' => 'OpenAI API-Key nicht konfiguriert. Bitte OPENAI_API_KEY in den Umgebungsvariablen setzen.',
            ], 500);
        }

        $payload = [
            'model' => $params['model'] ?? config('services.openai.model', 'gpt-4o'),
            'messages' => $params['messages'],
            'temperature' => $params['temperature'] ?? 0.7,
            'max_tokens' => $params['max_tokens'] ?? config('services.openai.max_tokens', 4096),
        ];

        if (isset($params['tools'])) {
            $payload['tools'] = $params['tools'];
        }

        if (isset($params['tool_choice'])) {
            $payload['tool_choice'] = $params['tool_choice'];
        }

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
        ])->timeout(120)->post($this->openaiBaseUrl . '/chat/completions', $payload);

        if ($response->failed()) {
            $error = $response->json();
            throw new \Exception($error['error']['message'] ?? 'OpenAI API Fehler: ' . $response->status());
        }

        return $response;
    }

    /**
     * Call Anthropic API
     */
    protected function callAnthropic(array $params)
    {
        $apiKey = config('services.anthropic.api_key');

        if (empty($apiKey)) {
            return response()->json([
                'error' => true,
                'message' => 'Anthropic API-Key nicht konfiguriert.',
            ], 500);
        }

        // Convert OpenAI format to Anthropic format
        $messages = $params['messages'];
        $systemPrompt = '';
        $anthropicMessages = [];

        foreach ($messages as $message) {
            if ($message['role'] === 'system') {
                $systemPrompt .= $message['content'] . "\n";
            } else {
                $anthropicMessages[] = [
                    'role' => $message['role'],
                    'content' => $message['content'],
                ];
            }
        }

        $payload = [
            'model' => $params['model'] ?? config('services.anthropic.model'),
            'max_tokens' => $params['max_tokens'] ?? 4096,
            'messages' => $anthropicMessages,
        ];

        if (!empty($systemPrompt)) {
            $payload['system'] = trim($systemPrompt);
        }

        $response = Http::withHeaders([
            'x-api-key' => $apiKey,
            'anthropic-version' => '2023-06-01',
            'Content-Type' => 'application/json',
        ])->timeout(120)->post($this->anthropicBaseUrl . '/messages', $payload);

        if ($response->failed()) {
            $error = $response->json();
            throw new \Exception($error['error']['message'] ?? 'Anthropic API Fehler: ' . $response->status());
        }

        // Convert Anthropic response to OpenAI format for consistency
        $anthropicResponse = $response->json();
        return response()->json([
            'choices' => [[
                'message' => [
                    'role' => 'assistant',
                    'content' => $anthropicResponse['content'][0]['text'] ?? '',
                ],
            ]],
        ]);
    }

    /**
     * Build system prompt for answer validation
     */
    protected function buildValidationSystemPrompt(): string
    {
        return <<<PROMPT
Du bist ein erfahrener Mathematik-Tutor. Analysiere die Aufgabe und bewerte die Lösung des Schülers.

WICHTIG - LaTeX-Formatierung:
- Verwende \$...\$ für inline Mathematik
- Verwende \$\$...\$\$ für display Mathematik
- Beispiel: Die Lösung \$x = 5\$ ist korrekt.

Gib strukturiertes Feedback mit Fokus auf:
1. Ist die Lösung korrekt?
2. Ist der Lösungsweg nachvollziehbar?
3. Welche Fehler wurden gemacht?
4. Was kann verbessert werden?
PROMPT;
    }

    /**
     * Build user content for validation (handles images)
     */
    protected function buildValidationUserContent(array $task, string $answer): array|string
    {
        if (!empty($task['hasImage']) && !empty($task['imageData'])) {
            return [
                [
                    'type' => 'image_url',
                    'image_url' => [
                        'url' => 'data:' . $task['imageData']['type'] . ';base64,' . $task['imageData']['base64'],
                    ],
                ],
                [
                    'type' => 'text',
                    'text' => ($task['content'] !== '[Bild-Aufgabe]' ? "Zusätzlicher Kontext: {$task['content']}\n\n" : '')
                        . "Lösung des Schülers:\n{$answer}",
                ],
            ];
        }

        return "**Aufgabe:**\n{$task['content']}\n\n**Lösung des Schülers:**\n{$answer}";
    }

    /**
     * Get validation schema for function calling
     */
    protected function getValidationSchema(): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'correct' => [
                    'type' => 'boolean',
                    'description' => 'Whether the answer is correct',
                ],
                'confidence' => [
                    'type' => 'number',
                    'description' => 'Confidence level (0-100)',
                ],
                'feedback' => [
                    'type' => 'object',
                    'properties' => [
                        'summary' => ['type' => 'string'],
                        'approach' => ['type' => 'string'],
                        'calculation' => ['type' => 'string'],
                    ],
                    'required' => ['summary', 'approach', 'calculation'],
                ],
                'errorAnalysis' => [
                    'type' => 'object',
                    'properties' => [
                        'hasErrors' => ['type' => 'boolean'],
                        'errorTypes' => [
                            'type' => 'array',
                            'items' => ['type' => 'string'],
                        ],
                        'specificErrors' => [
                            'type' => 'array',
                            'items' => [
                                'type' => 'object',
                                'properties' => [
                                    'location' => ['type' => 'string'],
                                    'description' => ['type' => 'string'],
                                    'severity' => ['type' => 'string'],
                                ],
                            ],
                        ],
                    ],
                ],
                'hints' => [
                    'type' => 'array',
                    'items' => [
                        'type' => 'object',
                        'properties' => [
                            'level' => ['type' => 'string'],
                            'message' => ['type' => 'string'],
                            'targetArea' => ['type' => 'string'],
                        ],
                    ],
                ],
            ],
            'required' => ['correct', 'confidence', 'feedback', 'errorAnalysis'],
        ];
    }

    /**
     * Build system prompt for task generation
     */
    protected function buildGenerationSystemPrompt(array $params): string
    {
        $subject = $params['subject'] ?? 'math';
        $gradeLevel = $params['gradeLevel'] ?? 'Oberstufe';

        return <<<PROMPT
Du bist ein erfahrener Lehrer für deutsche Schulen.
Erstelle eine Aufgabe für das Fach: {$subject}
Klassenstufe: {$gradeLevel}

Die Aufgabe soll:
- Klar und eindeutig formuliert sein
- Alle nötigen Informationen enthalten
- LaTeX für mathematische Ausdrücke verwenden
- Auf Deutsch sein

Formatiere die Antwort als:
**Aufgabe:**
[Die Aufgabenstellung]

**Hinweise:**
[Optionale Hinweise zur Lösung]
PROMPT;
    }

    /**
     * Get learning style specific instructions
     */
    protected function getLearningStyleInstruction(string $style): string
    {
        return match ($style) {
            'visual' => "\n\nVerwende visuelle Beschreibungen, Diagramme und Grafiken wo möglich.",
            'step-by-step' => "\n\nErkläre in klaren, nummerierten Schritten. Gehe langsam vor.",
            'conceptual' => "\n\nFokussiere auf das 'Warum'. Erkläre die zugrundeliegenden Konzepte.",
            'practical' => "\n\nVerwende praktische Beispiele aus dem Alltag.",
            default => '',
        };
    }
}
