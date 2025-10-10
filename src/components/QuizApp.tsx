import { component$, useSignal, $, useVisibleTask$ } from "@builder.io/qwik";
import { CategorySelection } from "./CategorySelection";
import { QuizQuestion } from "./QuizQuestion";
import { QuizResults } from "./QuizResults";
import { useQuizStore } from "../stores/quizStore";
import { questions } from "../data/questions";
import type { QuizCategory } from "../types/quiz";
import { SettingsPage } from "./SettingsPage";
import { useAIStore } from "../stores/aiStore";

export const QuizApp = component$(() => {
  const currentView = useSignal<"categories" | "quiz" | "results" | "settings">(
    "categories",
  );
  const selectedCategory = useSignal<QuizCategory | null>(null);
  const useAIGen = useSignal(false);
  const aiCount = useSignal(10);
  const aiDifficulty = useSignal<"easy" | "medium" | "hard" | "mixed">("mixed");
  const ai = useAIStore();

  const {
    quizState,
    startQuiz,
    selectAnswer,
    nextQuestion,
    resetQuiz,
    getCurrentQuestion,
    getProgress,
  } = useQuizStore();

  const handleCategorySelect = $(async (category: QuizCategory) => {
    selectedCategory.value = category;

    if (useAIGen.value) {
      const { valid } = ai.validateSettings();
      if (!valid) {
        currentView.value = "settings";
        return;
      }
      const aiQs = await ai.generateQuestions({
        count: aiCount.value,
        category,
        difficulty: aiDifficulty.value,
        language: "en",
      });
      if (aiQs.length > 0) {
        startQuiz(aiQs);
        currentView.value = "quiz";
        return;
      }
    }

    const categoryQuestions = questions.filter((q) => q.category === category);
    startQuiz(categoryQuestions);
    currentView.value = "quiz";
  });

  const handleAnswerSelect = $((answerIndex: number) => {
    selectAnswer(answerIndex);
  });

  const handleNextQuestion = $(() => {
    nextQuestion();
    if (quizState.isFinished) {
      currentView.value = "results";
    }
  });

  const handleRestart = $(() => {
    resetQuiz();
    currentView.value = "quiz";
  });

  const handleBackToCategories = $(() => {
    resetQuiz();
    selectedCategory.value = null;
    currentView.value = "categories";
  });

  const handleOpenSettings = $(() => {
    currentView.value = "settings";
  });

  const handleBackFromSettings = $(() => {
    // Return to quiz by default
    currentView.value = "quiz";
  });

  useVisibleTask$(({ cleanup, track }) => {
    const view = track(() => currentView.value);
    const showResult = track(() => quizState.showResult);
    const isFinished = track(() => quizState.isFinished);
    const questionIndex = track(() => quizState.currentQuestionIndex);

    if (view !== "quiz" || showResult || isFinished) {
      return;
    }

    const id = setInterval(() => {
      if (
        quizState.timeRemaining > 0 &&
        currentView.value === "quiz" &&
        !quizState.showResult &&
        !quizState.isFinished
      ) {
        quizState.timeRemaining--;
        if (quizState.timeRemaining === 0) {
          // Time's up: reveal result and prevent further answering
          if (!quizState.showResult) {
            quizState.showResult = true;
          }
          if (quizState.selectedAnswer === null) {
            // Mark as timed out to disable buttons without affecting score
            quizState.selectedAnswer = -1;
          }
        }
      }
    }, 1000);

    cleanup(() => clearInterval(id));
  });

  return (
    <div class="quiz-app">
      {currentView.value === "categories" && (
        <div class="categories-view">
          <div
            class="categories-toolbar"
            style="display:flex;justify-content:flex-end;align-items:center;gap:12px;padding:12px 16px;"
          >
            <label style="display:flex;align-items:center;gap:8px;font-weight:600;color:var(--text-secondary,#555);">
              Difficulty:
              <select
                value={aiDifficulty.value}
                onChange$={(e) =>
                  (aiDifficulty.value = (e.target as HTMLSelectElement)
                    .value as "easy" | "medium" | "hard" | "mixed")
                }
                style="padding:6px 8px;border:1px solid var(--border,#e0e0e0);border-radius:8px;background:var(--surface-strong,#fff);color:var(--text-primary,#333);"
                aria-label="AI difficulty"
              >
                <option value="mixed">Mixed</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </label>
            <label style="display:flex;align-items:center;gap:8px;font-weight:600;color:var(--text-secondary,#555);">
              Count:
              <input
                type="number"
                min={1}
                max={50}
                value={aiCount.value}
                onInput$={(e) => {
                  const v = parseInt((e.target as HTMLInputElement).value, 10);
                  aiCount.value = Number.isFinite(v)
                    ? Math.min(50, Math.max(1, v))
                    : 10;
                }}
                style="width:80px;padding:6px 8px;border:1px solid var(--border,#e0e0e0);border-radius:8px;background:var(--surface-strong,#fff);color:var(--text-primary,#333);"
                aria-label="AI question count"
              />
            </label>
            <label style="display:flex;align-items:center;gap:8px;font-weight:600;color:var(--text-secondary,#555);">
              <input
                type="checkbox"
                checked={useAIGen.value}
                onChange$={(e) =>
                  (useAIGen.value = (e.target as HTMLInputElement).checked)
                }
              />
              Use AI-generated questions
            </label>
            {ai.state.isGenerating && (
              <span
                aria-live="polite"
                style="font-size:0.9rem;color:var(--text-secondary,#666);"
              >
                Generating…
              </span>
            )}
          </div>
          <CategorySelection onCategorySelect={handleCategorySelect} />
        </div>
      )}

      {currentView.value === "quiz" && (
        <div class="quiz-container">
          <div class="quiz-header">
            <div class="progress-bar">
              <div
                class="progress-fill"
                style={`width: ${getProgress()}%`}
              ></div>
            </div>
            <div class="quiz-info">
              <span class="current-question">
                Question {quizState.currentQuestionIndex + 1} of{" "}
                {quizState.totalQuestions}
              </span>
              <span class="current-score">Score: {quizState.score}</span>
              <button
                class="settings-button"
                aria-label="Settings"
                title="Settings"
                onClick$={handleOpenSettings}
              >
                ⚙️
              </button>
            </div>
          </div>

          <QuizQuestion
            question={getCurrentQuestion()}
            selectedAnswer={quizState.selectedAnswer}
            showResult={quizState.showResult}
            onAnswerSelect={handleAnswerSelect}
            onNext={handleNextQuestion}
            timeRemaining={quizState.timeRemaining}
          />
        </div>
      )}

      {currentView.value === "results" && (
        <QuizResults
          score={quizState.score}
          totalQuestions={quizState.totalQuestions}
          onRestart={handleRestart}
          onBackToCategories={handleBackToCategories}
        />
      )}

      {currentView.value === "settings" && (
        <SettingsPage onBack={handleBackFromSettings} />
      )}
    </div>
  );
});
