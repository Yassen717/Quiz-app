import { useStore } from "@builder.io/qwik";
import type { Question, QuizCategory } from "../types/quiz";

export type AIProvider = "openai" | "gemini" | "claude";

export interface AISettings {
  provider: AIProvider;
  apiKey: string;
  model: string;
  endpoint?: string | null;
}

export interface AIGenerationOptions {
  count: number;
  category?: QuizCategory;
  difficulty?: "easy" | "medium" | "hard" | "mixed";
  language?: string; // e.g. "en", "es", "fr"
}

interface AIState {
  settings: AISettings;
  isGenerating: boolean;
  lastError: string | null;
  lastRequestTokens?: number | null;
  lastResponseTokens?: number | null;
}

/**
 * LocalStorage helpers (CSR-safe)
 */
const STORAGE_KEY = "ai-settings.v1";

function loadSettings(): AISettings {
  if (typeof window === "undefined") {
    return defaultSettings();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings();
    const parsed = JSON.parse(raw) as Partial<AISettings>;
    return {
      provider: (parsed.provider as AIProvider) ?? "openai",
      apiKey: parsed.apiKey ?? "",
      model:
        parsed.model ??
        defaultModelFor((parsed.provider as AIProvider) ?? "openai"),
      endpoint: parsed.endpoint ?? null,
    };
  } catch {
    return defaultSettings();
  }
}

function saveSettings(settings: AISettings) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore storage write failures
  }
}

function defaultModelFor(provider: AIProvider): string {
  switch (provider) {
    case "openai":
      // Small, cost-effective model; feel free to adjust
      return "gpt-4o-mini";
    case "gemini":
      // Default to the latest alias to maximize compatibility with API versions
      return "gemini-1.5-flash-latest";
    case "claude":
      // Placeholder for a Claude model id
      return "claude-3-haiku-20240307";
  }
}

function defaultSettings(): AISettings {
  return {
    provider: "openai",
    apiKey: "",
    model: defaultModelFor("openai"),
    endpoint: null,
  };
}

/**
 * Build a robust prompt instructing the model to return strictly JSON.
 */
function buildPrompt(opts: AIGenerationOptions): string {
  const parts: string[] = [];
  const lang = opts.language ?? "en";
  const intro = `Generate ${opts.count} high-quality multiple-choice quiz questions. Output ONLY valid JSON. No extra text. Language: ${lang}.`;
  parts.push(intro);

  if (opts.category) {
    parts.push(`Category: ${opts.category}`);
  }
  if (opts.difficulty && opts.difficulty !== "mixed") {
    parts.push(`Difficulty: ${opts.difficulty}`);
  } else {
    parts.push(`Difficulty: mixed (use 'easy' | 'medium' | 'hard')`);
  }

  parts.push(
    `Each question must be thoughtful, unambiguous, and factual. Ensure only one correct answer.`,
  );

  parts.push(`JSON schema (exactly this shape and property names):
{
  "questions": [
    {
      "question": "string (the question text)",
      "options": ["string", "string", "string", "string"], // exactly 4 options
      "correctAnswer": 0, // 0-based index of the correct option
      "category": "${opts.category ?? "general"}",
      "difficulty": "${opts.difficulty && opts.difficulty !== "mixed" ? opts.difficulty : "easy" /* placeholder; model should set each */}",
      "explanation": "string (brief explanation for the correct answer)"
    }
  ]
}`);

  parts.push(
    `Rules:
- Return only a JSON object with a "questions" array (no markdown, no code fences).
- "options" must have exactly 4 distinct strings.
- "correctAnswer" must be an integer 0..3.
- "difficulty" must be one of: "easy" | "medium" | "hard". If mixed, vary appropriately.
- Keep neutral tone; no harmful content; ensure accuracy.`,
  );

  return parts.join("\n");
}

function buildStrictPrompt(opts: AIGenerationOptions): string {
  const base = buildPrompt(opts);
  const hardRules = [
    "Return ONLY a valid JSON object. No markdown, no backticks, no commentary.",
    'If you are unsure, still return a syntactically valid JSON object with an empty "questions" array.',
    "Do NOT wrap JSON in code fences.",
    "Ensure all strings are properly escaped and UTF-8 safe.",
  ];
  return `${base}

STRICT MODE:
${hardRules.map((r, i) => `${i + 1}. ${r}`).join("\n")}`;
}

/**
 * Parse model output that should be a JSON object. Cleans up code fences if present.
 */
function parseQuestionsJSON(text: string): Question[] {
  const cleaned = stripCodeFences(text).trim();
  const parsed = JSON.parse(cleaned) as {
    questions: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      category?: string;
      difficulty?: "easy" | "medium" | "hard";
      explanation?: string;
    }>;
  };

  if (!parsed || !Array.isArray(parsed.questions)) {
    throw new Error('Invalid JSON: missing "questions" array.');
  }

  // Map to app Question type with IDs and validated fields
  let idCounter = 1;
  const mapped: Question[] = parsed.questions.map((q) => {
    if (!q || typeof q.question !== "string") {
      throw new Error('Invalid question entry: missing "question"');
    }
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      throw new Error(
        'Invalid question entry: "options" must be an array of exactly 4 strings',
      );
    }
    if (
      typeof q.correctAnswer !== "number" ||
      q.correctAnswer < 0 ||
      q.correctAnswer > 3 ||
      !Number.isInteger(q.correctAnswer)
    ) {
      throw new Error('Invalid "correctAnswer": must be an integer 0..3');
    }

    const category = (q.category as QuizCategory) ?? "science"; // fallback to a valid category if needed
    const difficulty: Question["difficulty"] = q.difficulty ?? "easy";

    return {
      id: idCounter++,
      question: q.question.trim(),
      options: q.options.map((o) => String(o)),
      correctAnswer: q.correctAnswer,
      category: normalizeCategory(category),
      difficulty,
      explanation: q.explanation?.trim() ?? "",
    };
  });

  return mapped;
}

function stripCodeFences(text: string): string {
  // Remove markdown ```json ... ``` or ``` ... ```
  const fenceRe = /```(?:json)?\s*([\s\S]*?)```/gi;
  if (fenceRe.test(text)) {
    return text.replace(fenceRe, "$1");
  }
  return text;
}

/**
 * Normalize category into an allowed QuizCategory, defaulting if out of range.
 */
function normalizeCategory(cat: string): QuizCategory {
  const set: QuizCategory[] = [
    "history",
    "math",
    "science",
    "geography",
    "literature",
    "sports",
  ];
  const lower = (cat ?? "").toLowerCase();
  if (set.includes(lower as QuizCategory)) {
    return lower as QuizCategory;
  }
  // Default to 'science' if unknown
  return "science";
}

/**
 * Provider adapter interface
 */
type ProviderGenerate = (
  settings: AISettings,
  options: AIGenerationOptions,
  strict?: boolean,
) => Promise<{
  questions: Question[];
  usage?: { promptTokens?: number; completionTokens?: number };
}>;

/**
 * OpenAI provider implementation (Chat Completions API).
 * Note: For production use, proxy this through a server to keep API keys secret.
 */
const openAIAdapter: ProviderGenerate = async (settings, options, strict) => {
  if (!settings.apiKey) {
    throw new Error("Missing OpenAI API key.");
  }

  const endpoint =
    settings.endpoint?.trim() || "https://api.openai.com/v1/chat/completions";
  const model = settings.model?.trim() || "gpt-4o-mini";

  const prompt = strict ? buildStrictPrompt(options) : buildPrompt(options);

  const body: Record<string, unknown> = {
    model,
    temperature: strict ? 0.2 : 0.7,
    messages: [
      {
        role: "system",
        content:
          "You are an expert quiz question generator. Always return strictly valid JSON. Do not include code fences.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  };

  // If the target model supports JSON mode, include it (silently ignore if not)
  // @ts-expect-error Some models support response_format
  body.response_format = { type: "json_object" };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${settings.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(
      `OpenAI error (${res.status}): ${errorText || res.statusText}`,
    );
  }

  const data = (await res.json()) as any;
  const text: string =
    data?.choices?.[0]?.message?.content ??
    data?.choices?.[0]?.delta?.content ??
    "";

  if (!text) {
    throw new Error("OpenAI returned an empty response.");
  }

  const questions = parseQuestionsJSON(text);

  return {
    questions,
    usage: {
      promptTokens: data?.usage?.prompt_tokens ?? null,
      completionTokens: data?.usage?.completion_tokens ?? null,
    },
  };
};

/**
 * Stubs for other providers (to be implemented later).
 */
const geminiAdapter: ProviderGenerate = async (settings, options, strict) => {
  if (!settings.apiKey) {
    throw new Error("Missing Gemini API key.");
  }

  const model = settings.model?.trim() || "gemini-1.5-flash-latest";
  const endpointBase =
    settings.endpoint?.trim() ||
    `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(model)}:generateContent`;
  const endpoint = `${endpointBase}?key=${encodeURIComponent(settings.apiKey)}`;

  const prompt = strict ? buildStrictPrompt(options) : buildPrompt(options);

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: strict ? 0.2 : 0.7,
      responseMimeType: "application/json",
    },
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  let data: any | null = null;

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    if (res.status === 400) {
      // Retry same endpoint without responseMimeType (some deployments reject it even on v1)
      const retryBody = {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: strict ? 0.2 : 0.7,
        },
      };
      const retryRes = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(retryBody),
      });
      if (!retryRes.ok) {
        const retryText = await retryRes.text().catch(() => "");
        // If model/route mismatch, try v1beta as final fallback
        if (res.status === 404 || retryRes.status === 404) {
          const fallbackModelBeta = model.replace(/-latest$/, "");
          const fbEndpointBase = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(fallbackModelBeta)}:generateContent`;
          const fbEndpoint = `${fbEndpointBase}?key=${encodeURIComponent(settings.apiKey)}`;
          const fbBody = retryBody; // no responseMimeType
          const fbRes = await fetch(fbEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(fbBody),
          });
          if (!fbRes.ok) {
            const fbText = await fbRes.text().catch(() => "");
            throw new Error(
              `Gemini error (${res.status}): ${errorText || res.statusText} | Retry error (${retryRes.status}): ${retryText || retryRes.statusText} | Fallback error (${fbRes.status}): ${fbText || fbRes.statusText}`,
            );
          }
          data = await fbRes.json();
        } else {
          throw new Error(
            `Gemini error (${res.status}): ${errorText || res.statusText} | Retry error (${retryRes.status}): ${retryText || retryRes.statusText}`,
          );
        }
      } else {
        data = await retryRes.json();
      }
    } else if (res.status === 404) {
      // Fallback: try v1beta endpoint (some models only work on v1beta)
      const fallbackModelBeta = model.replace(/-latest$/, "");
      const fbEndpointBase = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(fallbackModelBeta)}:generateContent`;
      const fbEndpoint = `${fbEndpointBase}?key=${encodeURIComponent(settings.apiKey)}`;
      // For v1beta, omit responseMimeType entirely (some versions reject it)
      const fbBody = {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: strict ? 0.2 : 0.7,
        },
      };
      const fbRes = await fetch(fbEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fbBody),
      });
      if (!fbRes.ok) {
        const fbText = await fbRes.text().catch(() => "");
        throw new Error(
          `Gemini error (${res.status}): ${errorText || res.statusText} | Fallback error (${fbRes.status}): ${fbText || fbRes.statusText}`,
        );
      }
      data = await fbRes.json();
    } else {
      throw new Error(
        `Gemini error (${res.status}): ${errorText || res.statusText}`,
      );
    }
  } else {
    data = await res.json();
  }

  // Try multiple known response shapes for text content
  let text: string =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ??
    data?.candidates?.[0]?.content?.[0]?.text ??
    data?.candidates?.[0]?.content?.[0]?.string_value ??
    data?.candidates?.[0]?.content?.text ??
    "";

  if (!text || typeof text !== "string") {
    // Some SDKs may return top-level "text"
    text = data?.text ?? "";
  }

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  const questions = parseQuestionsJSON(text);

  return {
    questions,
    usage: {
      promptTokens: data?.usageMetadata?.promptTokenCount ?? null,
      completionTokens: data?.usageMetadata?.candidatesTokenCount ?? null,
    },
  };
};

const claudeAdapter: ProviderGenerate = async (settings, options, strict) => {
  if (!settings.apiKey) {
    throw new Error("Missing Claude (Anthropic) API key.");
  }

  const endpoint =
    settings.endpoint?.trim() || "https://api.anthropic.com/v1/messages";
  const model = settings.model?.trim() || "claude-3-haiku-20240307";

  const prompt = strict ? buildStrictPrompt(options) : buildPrompt(options);

  const body = {
    model,
    max_tokens: 1000,
    temperature: strict ? 0.2 : 0.7,
    system:
      "You are an expert quiz question generator. Always return strictly valid JSON with no code fences or extra commentary.",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "x-api-key": settings.apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(
      `Claude error (${res.status}): ${errorText || res.statusText}`,
    );
  }

  const data = (await res.json()) as any;

  // Messages API returns an array of content blocks
  // Typically: data.content[0].text
  const text: string = data?.content?.[0]?.text ?? data?.content?.text ?? "";

  if (!text) {
    throw new Error("Claude returned an empty response.");
  }

  const questions = parseQuestionsJSON(text);

  return {
    questions,
    usage: {
      promptTokens: data?.usage?.input_tokens ?? null,
      completionTokens: data?.usage?.output_tokens ?? null,
    },
  };
};

const providerMap: Record<AIProvider, ProviderGenerate> = {
  openai: openAIAdapter,
  gemini: geminiAdapter,
  claude: claudeAdapter,
};

/**
 * Qwik store for AI settings and on-demand question generation.
 */
async function listOpenAIModels(settings: AISettings): Promise<string[]> {
  const endpoint =
    settings.endpoint?.trim() || "https://api.openai.com/v1/models";
  const res = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${settings.apiKey}`,
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `OpenAI list models error (${res.status}): ${text || res.statusText}`,
    );
  }
  const data = (await res.json()) as any;
  const ids: string[] = Array.isArray(data?.data)
    ? data.data.map((m: any) => m?.id).filter(Boolean)
    : [];
  return ids.sort();
}

async function listGeminiModels(settings: AISettings): Promise<string[]> {
  // Try v1 first
  const baseV1 = "https://generativelanguage.googleapis.com/v1";
  const urlV1 = `${baseV1}/models?key=${encodeURIComponent(settings.apiKey)}`;
  let res = await fetch(urlV1, { method: "GET" });

  if (!res.ok) {
    // Fallback to v1beta
    const baseV1Beta = "https://generativelanguage.googleapis.com/v1beta";
    const urlV1Beta = `${baseV1Beta}/models?key=${encodeURIComponent(settings.apiKey)}`;
    res = await fetch(urlV1Beta, { method: "GET" });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `Gemini list models error (${res.status}): ${text || res.statusText}`,
      );
    }
  }

  const data = (await res.json()) as any;
  const models: any[] = Array.isArray(data?.models) ? data.models : [];
  const names: string[] = models
    .filter((m) =>
      Array.isArray(m?.supportedGenerationMethods)
        ? m.supportedGenerationMethods.includes("generateContent")
        : true,
    )
    .map((m) => String(m?.name || ""))
    .filter((n) => n.startsWith("models/"))
    .map((n) => n.replace(/^models\//, ""));

  // Deduplicate and sort
  return Array.from(new Set(names)).sort();
}

async function listClaudeModels(settings: AISettings): Promise<string[]> {
  const endpoint =
    settings.endpoint?.trim() || "https://api.anthropic.com/v1/models";
  try {
    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        "x-api-key": settings.apiKey,
        "anthropic-version": "2023-06-01",
      },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      // Fall through to static list on error
      throw new Error(
        `Claude list models error (${res.status}): ${text || res.statusText}`,
      );
    }
    const data = (await res.json()) as any;
    const ids: string[] = Array.isArray(data?.data)
      ? data.data.map((m: any) => m?.id).filter(Boolean)
      : [];
    if (ids.length > 0) {
      return ids.sort();
    }
  } catch {
    // ignore and return static list below
  }
  // Static fallback of common Claude 3 models
  return [
    "claude-3-haiku-20240307",
    "claude-3-sonnet-20240229",
    "claude-3-opus-20240229",
    "claude-3-5-sonnet-20240620",
  ].sort();
}

export const useAIStore = () => {
  const state = useStore<AIState>({
    settings: loadSettings(),
    isGenerating: false,
    lastError: null,
    lastRequestTokens: null,
    lastResponseTokens: null,
  });

  const setProvider = (provider: AIProvider) => {
    state.settings.provider = provider;
    // If provider changes, assign a sensible default model
    state.settings.model = defaultModelFor(provider);
    saveSettings(state.settings);
  };

  const setApiKey = (key: string) => {
    state.settings.apiKey = key.trim();
    saveSettings(state.settings);
  };

  const setModel = (model: string) => {
    state.settings.model = model.trim();
    saveSettings(state.settings);
  };

  const setEndpoint = (endpoint: string | null) => {
    state.settings.endpoint = endpoint?.trim() || null;
    saveSettings(state.settings);
  };

  const validateSettings = (): { valid: boolean; reason?: string } => {
    const s = state.settings;
    if (!s.provider) return { valid: false, reason: "Provider is required." };
    if (!s.apiKey) return { valid: false, reason: "API key is required." };
    if (!s.model) return { valid: false, reason: "Model is required." };
    return { valid: true };
  };

  const generateQuestions = async (
    opts: AIGenerationOptions,
  ): Promise<Question[]> => {
    state.lastError = null;
    const { valid, reason } = validateSettings();
    if (!valid) {
      state.lastError = reason ?? "Invalid settings.";
      return [];
    }

    const adapter = providerMap[state.settings.provider];
    state.isGenerating = true;

    try {
      // First attempt: normal prompt/temperature
      const res1 = await adapter(state.settings, opts, false);
      const q1 = res1.questions ?? [];
      if (q1.length > 0) {
        state.lastRequestTokens = res1.usage?.promptTokens ?? null;
        state.lastResponseTokens = res1.usage?.completionTokens ?? null;
        return q1;
      }
      // Retry with strict JSON prompt and lower temperature
      const res2 = await adapter(state.settings, opts, true);
      const q2 = res2.questions ?? [];
      state.lastRequestTokens = res2.usage?.promptTokens ?? null;
      state.lastResponseTokens = res2.usage?.completionTokens ?? null;
      return q2;
    } catch (err1: any) {
      // Retry if first threw
      try {
        const res2 = await adapter(state.settings, opts, true);
        const q2 = res2.questions ?? [];
        state.lastRequestTokens = res2.usage?.promptTokens ?? null;
        state.lastResponseTokens = res2.usage?.completionTokens ?? null;
        return q2;
      } catch (err2: any) {
        state.lastError =
          (err2?.message ?? String(err2)) +
          (err1 ? ` (initial error: ${err1?.message ?? String(err1)})` : "");
        return [];
      }
    } finally {
      state.isGenerating = false;
    }
  };

  const resetErrors = () => {
    state.lastError = null;
    state.lastRequestTokens = null;
    state.lastResponseTokens = null;
  };

  const listModels = async (): Promise<string[]> => {
    const s = state.settings;
    if (!s.apiKey) {
      throw new Error("API key is required to list models.");
    }
    switch (s.provider) {
      case "openai":
        return await listOpenAIModels(s);
      case "gemini":
        return await listGeminiModels(s);
      case "claude":
        return await listClaudeModels(s);
      default:
        return [];
    }
  };

  return {
    state,
    setProvider,
    setApiKey,
    setModel,
    setEndpoint,
    validateSettings,
    listModels,
    generateQuestions,
    resetErrors,
  };
};
