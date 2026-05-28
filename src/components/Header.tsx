'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-12 shrink-0 px-4 flex items-center justify-between bg-surface-panel backdrop-blur-xl border-b border-border z-50 transition-colors">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md shadow-primary/30 overflow-hidden bg-gradient-to-br from-primary to-amber-400">
          <span className="text-lg leading-none">🗺️</span>
        </div>
        <h1 className="text-sm font-black tracking-tight leading-none">
          <span className="bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">모여맵</span>
          <span className="text-text-muted text-[11px] font-semibold ml-1.5 align-middle">MoyeMap</span>
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <p className="hidden md:block text-[11px] text-text-muted font-medium">
          오늘 밤, 내 주변 핫한 모임 한눈에
        </p>
        <button
          onClick={toggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-xl border border-border bg-surface-alt hover:bg-surface-elevated transition-colors"
          aria-label={theme === 'dark' ? '라이트 모드' : '다크 모드'}
        >
          {theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-text-secondary" />
          )}
        </button>
      </div>
    </header>
  );
}
