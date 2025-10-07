import { component$, $ } from "@builder.io/qwik";
import type { Question } from "../types/quiz";

interface QuizQuestionProps {
  question: Question;
  selectedAnswer: number | null;
  showResult: boolean;
  onAnswerSelect: (answerIndex: number) => void;
  onNext: () => void;
  timeRemaining: number;
}

export const QuizQuestion = component$<QuizQuestionProps>(
  ({
    question,
    selectedAnswer,
    showResult,
    onAnswerSelect,
    onNext,
    timeRemaining,
  }) => {
    const getAnswerClass = (index: number) => {
      if (!showResult) return "answer-option";

      if (index === question.correctAnswer) {
        return "answer-option correct";
      } else if (index === selectedAnswer && index !== question.correctAnswer) {
        return "answer-option incorrect";
      }
      return "answer-option";
    };

    const getAnswerIcon = (index: number) => {
      if (!showResult) return "";

      if (index === question.correctAnswer) {
        return "✅";
      } else if (index === selectedAnswer && index !== question.correctAnswer) {
        return "❌";
      }
      return "";
    };

    return (
      <div class="quiz-question">
        <div class="question-header">
          <div class="question-meta">
            <span class="question-number">Question {question.id}</span>
            <span class="question-difficulty">{question.difficulty}</span>
            <span class="question-category">{question.category}</span>
          </div>
          <div class="timer" aria-live="polite">
            <div
              class="timer-circle"
              style={`--time-deg: ${((Math.max(0, Math.min(30, timeRemaining)) / 30) * 360).toFixed(0)}deg; background: conic-gradient(#ff6b6b var(--time-deg), #ffe0e0 var(--time-deg) 360deg);`}
              aria-label={`Time remaining: ${timeRemaining}s`}
            >
              <span class="timer-text">
                {timeRemaining > 0 ? `${timeRemaining}s` : "Time's up"}
              </span>
            </div>
          </div>
        </div>

        <div class="question-content">
          <h2 class="question-text">{question.question}</h2>

          <div class="answers-grid">
            {question.options.map((option, index) => (
              <button
                key={index}
                class={getAnswerClass(index)}
                onClick$={() => {
                  if (timeRemaining <= 0 || selectedAnswer !== null) return;
                  onAnswerSelect(index);
                }}
                disabled={selectedAnswer !== null || timeRemaining <= 0}
              >
                <span class="answer-letter">
                  {String.fromCharCode(65 + index)}
                </span>
                <span class="answer-text">{option}</span>
                <span class="answer-icon">{getAnswerIcon(index)}</span>
              </button>
            ))}
          </div>

          {showResult && (
            <div class="result-section">
              <div class="explanation">
                <h3>Explanation:</h3>
                <p>{question.explanation}</p>
              </div>
              <button class="next-button" onClick$={onNext}>
                Next Question →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  },
);
