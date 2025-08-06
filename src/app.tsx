import { component$ } from '@builder.io/qwik';
import { QuizApp } from './components/QuizApp';
import './app.css';

export const App = component$(() => {
  return (
    <div class="app">
      <QuizApp />
    </div>
  );
});
