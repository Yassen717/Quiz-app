import { component$, useSignal, $, useVisibleTask$ } from "@builder.io/qwik";
import { CategorySelection } from "./CategorySelection";
import { QuizQuestion } from "./QuizQuestion";
import { QuizResults } from "./QuizResults";
import { useQuizStore } from "../stores/quizStore";
import { questions } from "../data/questions";
import type { QuizCategory } from "../types/quiz";
import { SettingsPage } from "./SettingsPage";

export const QuizApp = component$(() => {
  const currentView = useSignal<"categories" | "quiz" | "results" | "settings">(
    "categories",
  );
  const selectedCategory = useSignal<QuizCategory | null>(null);

  const {
    quizState,
    startQuiz,
    selectAnswer,
    nextQuestion,
    resetQuiz,
    getCurrentQuestion,
    getProgress,
  } = useQuizStore();

  const handleCategorySelect = $((category: QuizCategory) => {
    selectedCategory.value = category;
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
        <CategorySelection onCategorySelect={handleCategorySelect} />
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
