'use client';

import { Compass, Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 shrink-0 px-6 flex items-center justify-between bg-surface-panel backdrop-blur-xl border-b border-border z-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary-glow">
          <Compass className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-black tracking-tight text-text">
            모여맵 <span className="text-primary text-sm font-bold ml-0.5">MoyeMap</span>
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <p className="hidden sm:block text-xs text-text-muted font-medium">
          오늘 밤, 내 주변 핫한 모임을 한눈에
        </p>
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-border bg-surface-alt hover:bg-surface-elevated transition-colors"
          aria-label={theme === 'dark' ? '라이트 모드' : '다크 모드'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-text-secondary" />
          )}
        </button>
      </div>
    </header>
  );
}
