import { component$, useSignal, useVisibleTask$, $ } from '@builder.io/qwik';

type Theme = 'light' | 'dark' | 'system';
const STORAGE_KEY = 'theme-preference';

export const ThemeToggle = component$(() => {
  const theme = useSignal<Theme>('system');
  const systemDark = useSignal(false);

  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    if (t === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', t);
    }
  };

  const persistTheme = (t: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      // ignore storage errors
    }
  };

  useVisibleTask$(({ cleanup }) => {
    // Initialize from storage or system preference
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      theme.value = stored ?? 'system';
    } catch {
      theme.value = 'system';
    }

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    systemDark.value = mql.matches;

    // Apply once on mount
    applyTheme(theme.value);

    // React to system preference changes when on "system"
    const onSystemChange = (e: MediaQueryListEvent) => {
      systemDark.value = e.matches;
      if (theme.value === 'system') {
        applyTheme('system');
      }
    };

    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onSystemChange);
    } else {
      // Safari < 14
      // @ts-expect-error legacy API
      mql.addListener(onSystemChange);
    }

    cleanup(() => {
      if (typeof mql.removeEventListener === 'function') {
        mql.removeEventListener('change', onSystemChange);
      } else {
        // @ts-expect-error legacy API
        mql.removeListener(onSystemChange);
      }
    });
  });

  const setTheme = $((t: Theme) => {
    theme.value = t;
    persistTheme(t);
    applyTheme(t);
  });

  const getActiveLabel = () => {
    if (theme.value === 'system') return `System (${systemDark.value ? 'Dark' : 'Light'})`;
    return theme.value === 'dark' ? 'Dark' : 'Light';
    };

  return (
    <div class="theme-toggle">
      {/* Global overrides so manual theme selection can supersede prefers-color-scheme */}
      <style>{`
        :root[data-theme="dark"] {
          --bg-start: #23233a;
          --bg-end: #3a2f4f;
          --surface: rgba(28, 28, 33, 0.9);
          --surface-strong: #1e1e24;

          --text-primary: #e8e8f0;
          --text-secondary: #b3b3c2;
          --text-tertiary: #9a9ab0;

          --border: #2e2e3a;

          --shadow-lg: 0 20px 40px rgba(0, 0, 0, 0.6);
          --shadow-md: 0 10px 20px rgba(0, 0, 0, 0.5);
        }
        :root[data-theme="light"] {
          --bg-start: #667eea;
          --bg-end: #764ba2;

          --surface: rgba(255, 255, 255, 0.95);
          --surface-strong: #ffffff;

          --text-primary: #333;
          --text-secondary: #666;
          --text-tertiary: #777;

          --border: #e0e0e0;

          --shadow-lg: 0 20px 40px rgba(0, 0, 0, 0.1);
          --shadow-md: 0 10px 20px rgba(0, 0, 0, 0.1);
        }

        .theme-toggle {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 6px;
          background: var(--surface-strong, #fff);
          border: 1px solid var(--border, #e0e0e0);
          border-radius: 999px;
          box-shadow: var(--shadow-md, 0 10px 20px rgba(0,0,0,0.1));
          user-select: none;
        }

        .theme-toggle .label {
          padding: 0 10px;
          font-size: 0.85rem;
          color: var(--text-secondary, #666);
        }

        .segmented {
          display: inline-flex;
          background: rgba(100, 100, 100, 0.06);
          border-radius: 999px;
          padding: 4px;
          gap: 4px;
        }

        .toggle-btn {
          appearance: none;
          border: none;
          background: transparent;
          color: var(--text-primary, #333);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.15s ease, background-color 0.15s ease;
        }

        .toggle-btn:hover {
          transform: translateY(-1px);
          background: rgba(102, 126, 234, 0.12);
        }

        .toggle-btn:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.35);
        }

        .toggle-btn.active {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: #fff;
        }

        @media (prefers-reduced-motion: reduce) {
          .toggle-btn {
            transition: none;
          }
        }
      `}</style>

      <span class="label" aria-live="polite" aria-atomic="true">
        Theme: {getActiveLabel()}
      </span>

      <div class="segmented" role="group" aria-label="Theme selection">
        <button
          type="button"
          class={`toggle-btn ${theme.value === 'light' ? 'active' : ''}`}
          aria-pressed={theme.value === 'light'}
          aria-label="Light theme"
          title="Light theme"
          onClick$={() => setTheme('light')}
        >
          ☀️
        </button>
        <button
          type="button"
          class={`toggle-btn ${theme.value === 'dark' ? 'active' : ''}`}
          aria-pressed={theme.value === 'dark'}
          aria-label="Dark theme"
          title="Dark theme"
          onClick$={() => setTheme('dark')}
        >
          🌙
        </button>
        <button
          type="button"
          class={`toggle-btn ${theme.value === 'system' ? 'active' : ''}`}
          aria-pressed={theme.value === 'system'}
          aria-label="System theme"
          title="System theme"
          onClick$={() => setTheme('system')}
        >
          🖥️
        </button>
      </div>
    </div>
  );
});

export default ThemeToggle;
