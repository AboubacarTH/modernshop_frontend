import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
  setDark: (v: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDark: false,

      toggle: () => {
        const next = !get().isDark;
        set({ isDark: next });
        applyTheme(next);
      },

      setDark: (v) => {
        set({ isDark: v });
        applyTheme(v);
      },
    }),
    { name: 'theme-storage' }
  )
);

export function applyTheme(dark: boolean) {
  if (dark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}
