import { component$, useSignal, $ } from '@builder.io/qwik';
import type { AppSettings } from '../types/quiz';

export interface SettingsProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onClose: () => void;
}

export const Settings = component$<SettingsProps>(({ settings, onSettingsChange, onClose }) => {
  const localSettings = useSignal<AppSettings>({ ...settings });

  const handleToggleDarkMode = $(() => {
    localSettings.value = { 
      ...localSettings.value, 
      darkMode: !localSettings.value.darkMode 
    };
  });

  const handleToggleSound = $(() => {
    localSettings.value = { 
      ...localSettings.value, 
      soundEnabled: !localSettings.value.soundEnabled 
    };
  });

  const handleTimerDurationChange = $((e: any) => {
    localSettings.value = { 
      ...localSettings.value, 
      timerDuration: parseInt(e.target.value, 10) 
    };
  });

  const handleSaveSettings = $(() => {
    onSettingsChange(localSettings.value);
    onClose();
  });

  return (
    <div class="settings-modal">
      <div class="settings-content">
        <h2>Settings</h2>
        
        <div class="setting-item">
          <label>
            <span>Dark Mode</span>
            <input 
              type="checkbox" 
              checked={localSettings.value.darkMode}
              onChange$={handleToggleDarkMode}
            />
          </label>
        </div>

        <div class="setting-item">
          <label>
            <span>Sound Effects</span>
            <input 
              type="checkbox" 
              checked={localSettings.value.soundEnabled}
              onChange$={handleToggleSound}
            />
          </label>
        </div>

        <div class="setting-item">
          <label>
            <span>Timer Duration (seconds)</span>
            <select 
              value={localSettings.value.timerDuration} 
              onChange$={handleTimerDurationChange}
            >
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="45">45</option>
              <option value="60">60</option>
            </select>
          </label>
        </div>

        <div class="settings-actions">
          <button class="btn-cancel" onClick$={onClose}>Cancel</button>
          <button class="btn-save" onClick$={handleSaveSettings}>Save</button>
        </div>
      </div>
    </div>
  );
});