import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import clsx from 'clsx';

interface Props {
  className?: string;
}

export default function ThemeToggle({ className }: Props) {
  const { isDark, toggle } = useThemeStore();

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={clsx(
        'relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
        isDark ? 'bg-primary-600' : 'bg-dark-200',
        className
      )}
    >
      {/* Track icons */}
      <Sun  size={12} className="absolute left-1.5 top-1/2 -translate-y-1/2 text-amber-400 transition-opacity" style={{ opacity: isDark ? 0 : 1 }} />
      <Moon size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-white transition-opacity"   style={{ opacity: isDark ? 1 : 0 }} />

      {/* Knob */}
      <span
        className={clsx(
          'absolute top-0.5 w-6 h-6 rounded-full shadow-md transition-transform duration-300 flex items-center justify-center',
          isDark ? 'translate-x-7 bg-dark-950' : 'translate-x-0.5 bg-white'
        )}
      >
        {isDark
          ? <Moon  size={12} className="text-primary-400" />
          : <Sun   size={12} className="text-amber-500" />
        }
      </span>
    </button>
  );
}
