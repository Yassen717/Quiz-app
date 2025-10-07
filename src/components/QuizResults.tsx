import { component$, $ } from "@builder.io/qwik";

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
  onBackToCategories: () => void;
}

export const QuizResults = component$<QuizResultsProps>(
  ({ score, totalQuestions, onRestart, onBackToCategories }) => {
    const percentage = (score / totalQuestions) * 100;

    const getPerformanceMessage = () => {
      if (percentage >= 90) return "🏆 Legendary! You're a true master!";
      if (percentage >= 80) return "🌟 Excellent! Outstanding performance!";
      if (percentage >= 70) return "🎯 Great job! You really know your stuff!";
      if (percentage >= 60) return "👍 Good work! You have solid knowledge!";
      if (percentage >= 50) return "📚 Not bad! Keep learning and improving!";
      return "💪 Keep practicing! Every expert was once a beginner!";
    };

    const getPerformanceColor = () => {
      if (percentage >= 90) return "#FFD700";
      if (percentage >= 80) return "#32CD32";
      if (percentage >= 70) return "#4169E1";
      if (percentage >= 60) return "#FFA500";
      if (percentage >= 50) return "#FF6347";
      return "#DC143C";
    };

    return (
      <div class="quiz-results">
        <div class="results-container">
          <div class="results-header">
            <h1 class="results-title">Quiz Complete!</h1>
            <div
              class="score-display"
              style={`--score-color: ${getPerformanceColor()}; --percentage: ${percentage.toFixed(0)}`}
            >
              <div
                class="score-circle"
                role="img"
                aria-describedby="score-percentage"
                aria-label={`Score: ${score} out of ${totalQuestions} (${percentage.toFixed(0)}%)`}
              >
                <span class="score-number">{score}</span>
                <span class="score-total">/ {totalQuestions}</span>
              </div>
              <div class="score-percentage" id="score-percentage">
                {percentage.toFixed(0)}%
              </div>
            </div>
          </div>

          <div
            class="performance-message"
            aria-live="polite"
            role="status"
            tabIndex={0}
          >
            <p>{getPerformanceMessage()}</p>
          </div>

          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">Correct Answers</span>
              <span class="stat-value correct">{score}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Incorrect Answers</span>
              <span class="stat-value incorrect">{totalQuestions - score}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Accuracy</span>
              <span class="stat-value">{percentage.toFixed(1)}%</span>
            </div>
          </div>

          <div class="action-buttons">
            <button
              class="action-button primary"
              onClick$={onRestart}
              title="Restart the quiz"
            >
              🔄 Play Again
            </button>
            <button
              class="action-button secondary"
              onClick$={onBackToCategories}
              title="Back to category selection"
            >
              🏠 Back to Categories
            </button>
          </div>

          <div class="motivation-quote">
            <p>"The only way to do great work is to love what you do."</p>
            <span>- Steve Jobs</span>
          </div>
        </div>
      </div>
    );
  },
);
