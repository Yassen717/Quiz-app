import { component$, useSignal, $ } from '@builder.io/qwik';
import { CategorySelection } from './CategorySelection';
import { QuizQuestion } from './QuizQuestion';
import { QuizResults } from './QuizResults';
import { Settings } from './Settings';
import { useQuizStore } from '../stores/quizStore';
import { questions } from '../data/questions';
import type { QuizCategory, AppSettings } from '../types/quiz';

export const QuizApp = component$(() => {
  const currentView = useSignal<'categories' | 'quiz' | 'results' | 'settings'>('categories');
  const selectedCategory = useSignal<QuizCategory | null>(null);
  const showSettings = useSignal<boolean>(false);
  const appSettings = useSignal<AppSettings>({
    darkMode: false,
    soundEnabled: true,
    timerDuration: 30
  });
  
  const {
    quizState,
    startQuiz,
    selectAnswer,
    nextQuestion,
    resetQuiz,
    getCurrentQuestion,
    getProgress,
    setTimerDuration
  } = useQuizStore();

  const handleCategorySelect = $((category: QuizCategory) => {
    selectedCategory.value = category;
    const categoryQuestions = questions.filter(q => q.category === category);
    startQuiz(categoryQuestions);
    currentView.value = 'quiz';
  });

  const handleAnswerSelect = $((answerIndex: number) => {
    selectAnswer(answerIndex);
  });

  const handleNextQuestion = $(() => {
    nextQuestion();
    if (quizState.isFinished) {
      currentView.value = 'results';
    }
  });

  const handleRestart = $(() => {
    resetQuiz();
    currentView.value = 'quiz';
  });

  const handleBackToCategories = $(() => {
    resetQuiz();
    selectedCategory.value = null;
    currentView.value = 'categories';
  });

  const handleToggleSettings = $(() => {
    showSettings.value = !showSettings.value;
  });

  const handleSettingsChange = $((newSettings: AppSettings) => {
    appSettings.value = newSettings;
    // Update timer in quiz store
    setTimerDuration(newSettings.timerDuration);
  });

  return (
    <div class={`quiz-app ${appSettings.value.darkMode ? 'dark-mode' : ''}`}>
      <div class="app-header">
        <h1>Quiz App</h1>
        <button class="settings-button" onClick$={handleToggleSettings}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </div>

      {currentView.value === 'categories' && (
        <CategorySelection onCategorySelect={handleCategorySelect} />
      )}

      {showSettings.value && (
        <Settings 
          settings={appSettings.value} 
          onSettingsChange={handleSettingsChange} 
          onClose={handleToggleSettings} 
        />
      )}

      {currentView.value === 'quiz' && (
        <div class="quiz-container">
          <div class="quiz-header">
            <div class="progress-bar">
              <div class="progress-fill" style={`width: ${getProgress()}%`}></div>
            </div>
            <div class="quiz-info">
              <span class="current-question">
                Question {quizState.currentQuestionIndex + 1} of {quizState.totalQuestions}
              </span>
              <span class="current-score">Score: {quizState.score}</span>
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

      {currentView.value === 'results' && (
        <QuizResults
          score={quizState.score}
          totalQuestions={quizState.totalQuestions}
          onRestart={handleRestart}
          onBackToCategories={handleBackToCategories}
        />
      )}
    </div>
  );
});