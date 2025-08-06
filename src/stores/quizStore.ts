import { useStore, useSignal } from '@builder.io/qwik';
import type { QuizState, Question } from '../types/quiz';

export const useQuizStore = () => {
  const quizState = useStore<QuizState>({
    currentQuestionIndex: 0,
    score: 0,
    totalQuestions: 0,
    isFinished: false,
    selectedAnswer: null,
    showResult: false,
    timeRemaining: 30
  });

  const currentQuestions = useSignal<Question[]>([]);
  const isLoading = useSignal(false);

  const startQuiz = (questions: Question[]) => {
    currentQuestions.value = questions;
    quizState.currentQuestionIndex = 0;
    quizState.score = 0;
    quizState.totalQuestions = questions.length;
    quizState.isFinished = false;
    quizState.selectedAnswer = null;
    quizState.showResult = false;
    quizState.timeRemaining = 30;
  };

  const selectAnswer = (answerIndex: number) => {
    if (quizState.selectedAnswer !== null) return; // Prevent multiple selections
    
    quizState.selectedAnswer = answerIndex;
    quizState.showResult = true;
    
    const currentQuestion = currentQuestions.value[quizState.currentQuestionIndex];
    if (answerIndex === currentQuestion.correctAnswer) {
      quizState.score++;
    }
  };

  const nextQuestion = () => {
    if (quizState.currentQuestionIndex < quizState.totalQuestions - 1) {
      quizState.currentQuestionIndex++;
      quizState.selectedAnswer = null;
      quizState.showResult = false;
      quizState.timeRemaining = 30;
    } else {
      quizState.isFinished = true;
    }
  };

  const resetQuiz = () => {
    quizState.currentQuestionIndex = 0;
    quizState.score = 0;
    quizState.isFinished = false;
    quizState.selectedAnswer = null;
    quizState.showResult = false;
    quizState.timeRemaining = 30;
  };

  const getCurrentQuestion = () => {
    return currentQuestions.value[quizState.currentQuestionIndex];
  };

  const getProgress = () => {
    return (quizState.currentQuestionIndex / quizState.totalQuestions) * 100;
  };

  const getScorePercentage = () => {
    return (quizState.score / quizState.totalQuestions) * 100;
  };

  return {
    quizState,
    currentQuestions,
    isLoading,
    startQuiz,
    selectAnswer,
    nextQuestion,
    resetQuiz,
    getCurrentQuestion,
    getProgress,
    getScorePercentage
  };
}; 