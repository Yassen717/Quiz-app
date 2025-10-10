import { component$, useVisibleTask$, $, useSignal } from "@builder.io/qwik";
import { ThemeToggle } from "./ThemeToggle";
import { useAIStore } from "../stores/aiStore";
import type { AIProvider } from "../stores/aiStore";

interface SettingsPageProps {
  onBack: () => void;
}

export const SettingsPage = component$<SettingsPageProps>(({ onBack }) => {
  useVisibleTask$(({ cleanup }) => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onBack();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    cleanup(() => window.removeEventListener("keydown", onKeyDown));
  });

  const ai = useAIStore();
  const genStatus = useSignal<string>("");
  const isTesting = useSignal(false);
  const resultCount = useSignal<number | null>(null);
  const firstPreview = useSignal<string>("");
  const listStatus = useSignal<string>("");
  const listing = useSignal(false);
  const modelOptions = useSignal<string[]>([]);

  const handleBack = $(() => onBack());

  const handleTestGenerate = $(async () => {
    genStatus.value = "";
    resultCount.value = null;
    firstPreview.value = "";
    isTesting.value = true;
    const questions = await ai.generateQuestions({
      count: 3,
      difficulty: "mixed",
      category: "science",
      language: "en",
    });
    if (ai.state.lastError) {
      genStatus.value = `Error: ${ai.state.lastError}`;
    } else {
      resultCount.value = questions.length;
      firstPreview.value = questions[0]?.question ?? "";
      genStatus.value = `Success: generated ${questions.length} questions.`;
    }
    isTesting.value = false;
  });

  const handleListModels = $(async () => {
    listStatus.value = "";
    modelOptions.value = [];
    listing.value = true;
    try {
      const models = await ai.listModels();
      modelOptions.value = models;
      listStatus.value = models.length
        ? `Loaded ${models.length} models`
        : "No models found for this key";
    } catch (err: any) {
      listStatus.value = `Error: ${err?.message ?? String(err)}`;
    } finally {
      listing.value = false;
    }
  });

  return (
    <div class="settings-page" role="main" aria-labelledby="settings-title">
      <style>{`
        .settings-page {
          display: grid;
          grid-template-rows: auto 1fr;
          width: 100%;
          max-width: 960px;
          min-height: 70vh;
          background: var(--surface, rgba(255,255,255,0.95));
          border-radius: 24px;
          box-shadow: var(--shadow-lg, 0 20px 40px rgba(0,0,0,0.1));
          overflow: hidden;
          backdrop-filter: blur(12px);
          animation: sp-slide-in 400ms ease both;
        }

        .settings-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border, #e0e0e0);
          background: linear-gradient(
            135deg,
            rgba(102, 126, 234, 0.08),
            rgba(118, 75, 162, 0.08)
          );
        }

        .settings-title {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--text-primary, #333);
          letter-spacing: 0.3px;
        }

        .settings-icon {
          width: 28px;
          height: 28px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: #fff;
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.25);
        }

        .back-btn {
          appearance: none;
          border: none;
          background: white;
          color: var(--text-primary, #333);
          border: 1px solid var(--border, #e0e0e0);
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
        }
        .back-btn:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-md, 0 10px 20px rgba(0,0,0,0.1));
          background: rgba(102, 126, 234, 0.06);
        }
        .back-btn:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.35);
        }

        .settings-content {
          display: grid;
          grid-template-columns: 1fr;
          padding: 24px;
          gap: 24px;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 20px;
        }

        .card {
          grid-column: span 12;
          background: var(--surface-strong, #fff);
          border: 1px solid var(--border, #e0e0e0);
          border-radius: 16px;
          padding: 18px;
          box-shadow: var(--shadow-md, 0 10px 20px rgba(0,0,0,0.08));
          animation: sp-fade-in 300ms ease both;
        }

        .card h2 {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-primary, #333);
        }

        .card p.subtle {
          margin: 6px 0 14px;
          color: var(--text-secondary, #666);
          font-size: 0.95rem;
        }

        .row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 12px 10px;
          border-radius: 12px;
          background: rgba(100, 100, 100, 0.04);
          border: 1px dashed var(--border, #e0e0e0);
        }

        .row .label {
          display: grid;
          gap: 6px;
        }

        .row .label .title {
          font-weight: 700;
          color: var(--text-primary, #333);
        }

        .row .label .desc {
          font-size: 0.9rem;
          color: var(--text-secondary, #666);
        }

        .input, .select {
          appearance: none;
          border: 1px solid var(--border, #e0e0e0);
          background: var(--surface-strong, #fff);
          color: var(--text-primary, #333);
          padding: 10px 12px;
          border-radius: 10px;
          min-width: 240px;
        }

        .btn {
          appearance: none;
          border: none;
          padding: 10px 14px;
          border-radius: 12px;
          color: #fff;
          background: linear-gradient(135deg, #667eea, #764ba2);
          font-weight: 700;
          cursor: pointer;
        }
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .status-text {
          font-size: 0.9rem;
          color: var(--text-secondary, #666);
        }

        /* Responsive */
        @media (min-width: 768px) {
          .card--half {
            grid-column: span 6;
          }
          .settings-content {
            padding: 28px;
            gap: 28px;
          }
        }
        @media (min-width: 1024px) {
          .card--third {
            grid-column: span 4;
          }
          .card--two-third {
            grid-column: span 8;
          }
        }

        /* Animations */
        @keyframes sp-slide-in {
          from { opacity: 0; transform: translateY(16px) }
          to { opacity: 1; transform: translateY(0) }
        }
        @keyframes sp-fade-in {
          from { opacity: 0; transform: translateY(8px) }
          to { opacity: 1; transform: translateY(0) }
        }

        /* Dark Mode Overrides (when ThemeToggle sets data-theme) */
        :root[data-theme="dark"] .back-btn {
          background: var(--surface-strong, #1e1e24);
          border-color: var(--border, #2e2e3a);
          color: var(--text-primary, #e8e8f0);
        }
        :root[data-theme="dark"] .row {
          background: rgba(255, 255, 255, 0.04);
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .settings-page,
          .card {
            animation: none !important;
          }
          .back-btn {
            transition: none !important;
          }
        }
      `}</style>

      <header class="settings-header">
        <h1 class="settings-title" id="settings-title">
          <span class="settings-icon" aria-hidden="true">
            {/* Gear icon */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2c-.7.3-1.4.5-2.2.6a1 1 0 0 0-.9.9v.2a2 2 0 1 1-4 0v-.2a1 1 0 0 0-.9-.9c-.8-.1-1.5-.3-2.2-.6a1 1 0 0 0-1.1.2l-.1.1A2 2 0 1 1 3.3 16l.1-.1a1 1 0 0 0 .2-1.1 9.2 9.2 0 0 1 0-2.2 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2c.7-.3 1.4-.5 2.2-.6a1 1 0 0 0 .9-.9V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .9.9c.8.1 1.5.3 2.2.6a1 1 0 0 0 1.1-.2l.1-.1A2 2 0 0 1 21 8.2l-.1.1a1 1 0 0 0-.2 1.1c.1.7.2 1.5.2 2.2s-.1 1.5-.2 2.2Z"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          Settings
        </h1>

        <button
          type="button"
          class="back-btn"
          onClick$={handleBack}
          aria-label="Back"
          title="Back"
        >
          <span aria-hidden="true">←</span>
          Back
        </button>
      </header>

      <div class="settings-content">
        <div class="settings-grid">
          <section class="card card--half" aria-labelledby="appearance-title">
            <h2 id="appearance-title">Appearance</h2>
            <p class="subtle">Choose how the app looks and feels.</p>

            <div class="row" role="group" aria-label="Theme">
              <div class="label">
                <span class="title">Theme</span>
                <span class="desc">
                  Switch between light, dark, or follow your system setting.
                </span>
              </div>
              <ThemeToggle />
            </div>
          </section>

          <section class="card card--half" aria-labelledby="ai-title">
            <h2 id="ai-title">AI Question Generator</h2>
            <p class="subtle">
              Configure your AI provider to generate quiz questions on demand.
            </p>

            <div class="row" role="group" aria-label="Provider">
              <div class="label">
                <span class="title">Provider</span>
                <span class="desc">
                  Choose an AI provider to use for generation.
                </span>
              </div>
              <select
                class="select"
                value={ai.state.settings.provider}
                onChange$={(e) =>
                  ai.setProvider(
                    (e.target as HTMLSelectElement).value as AIProvider,
                  )
                }
                aria-label="AI Provider"
              >
                <option value="openai">OpenAI</option>
                <option value="gemini">Gemini</option>
                <option value="claude">Claude</option>
              </select>
            </div>

            <div class="row" role="group" aria-label="API Key">
              <div class="label">
                <span class="title">API Key</span>
                <span class="desc">
                  Your API key is stored locally in your browser.
                </span>
              </div>
              <input
                class="input"
                type="password"
                placeholder="sk-... (kept locally)"
                value={ai.state.settings.apiKey}
                onInput$={(e) =>
                  ai.setApiKey((e.target as HTMLInputElement).value)
                }
                aria-label="API Key"
              />
            </div>

            <div class="row" role="group" aria-label="Model">
              <div class="label">
                <span class="title">Model</span>
                <span class="desc">
                  Model identifier (e.g. gpt-4o-mini, gemini-1.5-flash-latest).
                </span>
              </div>
              <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                <input
                  class="input"
                  type="text"
                  placeholder="Model name"
                  value={ai.state.settings.model}
                  onInput$={(e) =>
                    ai.setModel((e.target as HTMLInputElement).value)
                  }
                  aria-label="Model"
                />
                {modelOptions.value.length > 0 && (
                  <select
                    class="select"
                    value={ai.state.settings.model}
                    onChange$={(e) =>
                      ai.setModel((e.target as HTMLSelectElement).value)
                    }
                    aria-label="Available models"
                  >
                    {modelOptions.value.map((m) => (
                      <option value={m} key={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  class="btn"
                  onClick$={handleListModels}
                  disabled={listing.value}
                  title="Fetch available models for your API key"
                >
                  {listing.value ? "Listing..." : "List models"}
                </button>
                <span class="status-text">{listStatus.value}</span>
              </div>
            </div>

            <div class="row" role="group" aria-label="Endpoint">
              <div class="label">
                <span class="title">Custom Endpoint</span>
                <span class="desc">
                  Optional: override the API base URL (use a secure proxy in
                  production).
                </span>
              </div>
              <input
                class="input"
                type="text"
                placeholder="https://api.openai.com/v1/chat/completions"
                value={ai.state.settings.endpoint ?? ""}
                onInput$={(e) =>
                  ai.setEndpoint((e.target as HTMLInputElement).value)
                }
                aria-label="Endpoint"
              />
            </div>

            <div class="row" role="group" aria-label="Test generation">
              <div class="label">
                <span class="title">Test Generation</span>
                <span class="desc">
                  Generate 3 mixed questions to verify your setup.
                </span>
              </div>
              <div style="display:flex; align-items:center; gap:10px;">
                <button
                  class="btn"
                  disabled={ai.state.isGenerating || isTesting.value}
                  onClick$={handleTestGenerate}
                >
                  {ai.state.isGenerating || isTesting.value
                    ? "Generating…"
                    : "Generate 3"}
                </button>
                <span class="status-text">{genStatus.value}</span>
              </div>
            </div>

            {(resultCount.value ?? 0) > 0 && (
              <div class="row" role="region" aria-label="Preview">
                <div class="label">
                  <span class="title">Preview</span>
                  <span class="desc">First generated question:</span>
                </div>
                <div class="status-text" style="max-width: 520px;">
                  {firstPreview.value}
                </div>
              </div>
            )}
          </section>

          <section class="card card--half" aria-labelledby="behavior-title">
            <h2 id="behavior-title">Behavior</h2>
            <p class="subtle">
              Defaults for quizzes and interactions (coming soon).
            </p>

            <div class="row" aria-disabled="true">
              <div class="label">
                <span class="title">Auto-advance</span>
                <span class="desc">
                  Automatically go to the next question after answering.
                </span>
              </div>
              <span aria-hidden="true" title="Coming soon">
                ⏳
              </span>
            </div>
          </section>

          <section class="card" aria-labelledby="about-title">
            <h2 id="about-title">About</h2>
            <div class="row">
              <div class="label">
                <span class="title">Epic Quiz</span>
                <span class="desc">
                  A fast, elegant quiz app built with Qwik + Vite.
                </span>
              </div>
              <span aria-hidden="true">✨</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
});

export default SettingsPage;
