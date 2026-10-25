import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeToggleProps {
  onChange?: (theme: Theme) => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ onChange }) => {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) {
      setTheme(stored);
      applyTheme(stored);
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const systemTheme = isDark ? 'dark' : 'light';
      setTheme('system');
      applyTheme(systemTheme);
    }
  }, []);

  const applyTheme = (t: Theme | 'light' | 'dark') => {
    const isDark = t === 'dark' ||
      (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }

    onChange?.(theme);
  };

  const cycles: Theme[] = ['light', 'dark', 'system'];
  const currentIndex = cycles.indexOf(theme);
  const nextTheme = cycles[(currentIndex + 1) % cycles.length];

  const handleToggle = () => {
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      title={`Switch to ${nextTheme} mode`}
      className="rounded-full p-2"
    >
      {theme === 'light' && <Sun className="w-5 h-5" />}
      {theme === 'dark' && <Moon className="w-5 h-5" />}
      {theme === 'system' && <Sun className="w-4 h-4 mr-1" />}
    </Button>
  );
};
