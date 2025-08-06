import { component$, $ } from '@builder.io/qwik';
import { categoryInfo } from '../data/questions';
import type { QuizCategory } from '../types/quiz';

interface CategorySelectionProps {
  onCategorySelect: (category: QuizCategory) => void;
}

export const CategorySelection = component$<CategorySelectionProps>(({ onCategorySelect }) => {
  const categories = Object.entries(categoryInfo);

  return (
    <div class="category-selection">
      <div class="hero-section">
        <h1 class="hero-title">
          <span class="gradient-text">Epic Quiz</span>
          <span class="hero-subtitle">Challenge Your Knowledge</span>
        </h1>
        <p class="hero-description">
          Choose your battlefield and prove your mastery across different domains of knowledge!
        </p>
      </div>

      <div class="categories-grid">
        {categories.map(([key, category]) => (
          <div
            key={key}
            class="category-card"
            style={`--category-color: ${category.color}`}
            onClick$={() => onCategorySelect(key as QuizCategory)}
          >
            <div class="category-icon">{category.icon}</div>
            <h3 class="category-name">{category.name}</h3>
            <p class="category-description">{category.description}</p>
            <div class="category-glow"></div>
          </div>
        ))}
      </div>

      <div class="footer-note">
        <p>🎯 Each category contains challenging questions to test your expertise!</p>
      </div>
    </div>
  );
}); 