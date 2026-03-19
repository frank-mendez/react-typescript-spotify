import { useTheme } from '../hooks/useTheme';
import { Moon, Sun } from 'lucide-react';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div data-testid="settings-element" className="p-8 flex flex-col gap-8 max-w-2xl">
      <h1 className="text-text-primary text-2xl font-bold">Settings</h1>
      <section className="flex flex-col gap-4">
        <h2 className="text-text-primary font-semibold">Appearance</h2>
        <div className="flex items-center justify-between bg-surface-hover rounded-lg p-4">
          <div className="flex flex-col gap-1">
            <span className="text-text-primary text-sm font-medium">Theme</span>
            <span className="text-text-muted text-xs">
              {theme === 'dark' ? 'Dark mode' : 'Light mode'}
            </span>
          </div>
          <button
            data-testid="theme-toggle-element"
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface hover:bg-border transition-colors text-text-primary text-sm"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default Settings;
