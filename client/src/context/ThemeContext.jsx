import React, { createContext, useContext, useEffect, useState } from 'react';

export const ACCENT_PRESETS = [
  {
    id: 'nebula',
    name: 'Cosmic Nebula',
    tagline: 'Electric Cyan & Deep Indigo Aurora',
    primary: '#06b6d4',
    secondary: '#6366f1',
    gradient: 'from-cyan-500 to-indigo-600',
    hoverGradient: 'hover:from-cyan-400 hover:to-indigo-500',
    ring: 'ring-cyan-500/20',
    border: 'border-cyan-500/30',
    badge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    orb1: 'rgba(6, 182, 212, 0.22)',
    orb2: 'rgba(99, 102, 241, 0.22)',
    orb3: 'rgba(217, 70, 239, 0.12)',
  },
  {
    id: 'emerald',
    name: 'Imperial Emerald',
    tagline: 'Swiss Vault Jade & Champagne Gold',
    primary: '#10b981',
    secondary: '#f59e0b',
    gradient: 'from-emerald-500 to-amber-500',
    hoverGradient: 'hover:from-emerald-400 hover:to-amber-400',
    ring: 'ring-emerald-500/20',
    border: 'border-emerald-500/30',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    orb1: 'rgba(16, 185, 129, 0.22)',
    orb2: 'rgba(245, 158, 11, 0.20)',
    orb3: 'rgba(5, 150, 105, 0.15)',
  },
  {
    id: 'amethyst',
    name: 'Royal Amethyst',
    tagline: 'Vibrant Space Violet & Neon Fuchsia',
    primary: '#a855f7',
    secondary: '#ec4899',
    gradient: 'from-purple-500 to-pink-500',
    hoverGradient: 'hover:from-purple-400 hover:to-pink-400',
    ring: 'ring-purple-500/20',
    border: 'border-purple-500/30',
    badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    orb1: 'rgba(168, 85, 247, 0.24)',
    orb2: 'rgba(236, 72, 153, 0.22)',
    orb3: 'rgba(124, 58, 237, 0.16)',
  },
  {
    id: 'sunset',
    name: 'Sunset Amber',
    tagline: 'Warm Molten Gold & Crimson Radiance',
    primary: '#f97316',
    secondary: '#e11d48',
    gradient: 'from-amber-500 to-rose-600',
    hoverGradient: 'hover:from-amber-400 hover:to-rose-500',
    ring: 'ring-amber-500/20',
    border: 'border-amber-500/30',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    orb1: 'rgba(249, 115, 22, 0.22)',
    orb2: 'rgba(225, 29, 72, 0.20)',
    orb3: 'rgba(234, 179, 8, 0.15)',
  },
  {
    id: 'azure',
    name: 'Pacific Azure',
    tagline: 'Deep Oceanic Sapphire & Arctic Ice',
    primary: '#3b82f6',
    secondary: '#0284c7',
    gradient: 'from-blue-500 to-cyan-500',
    hoverGradient: 'hover:from-blue-400 hover:to-cyan-400',
    ring: 'ring-blue-500/20',
    border: 'border-blue-500/30',
    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    orb1: 'rgba(59, 130, 246, 0.24)',
    orb2: 'rgba(6, 182, 212, 0.22)',
    orb3: 'rgba(2, 132, 199, 0.16)',
  },
];

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('familyvault_theme');
    if (saved) return saved;
    return 'dark'; // default to premium dark mode
  });

  const [accent, setAccent] = useState(() => {
    const savedAccent = localStorage.getItem('familyvault_accent');
    if (savedAccent && ACCENT_PRESETS.some((a) => a.id === savedAccent)) {
      return savedAccent;
    }
    return 'nebula'; // default to cosmic nebula
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('familyvault_theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-accent', accent);
    localStorage.setItem('familyvault_accent', accent);
  }, [accent]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const currentAccent = ACCENT_PRESETS.find((a) => a.id === accent) || ACCENT_PRESETS[0];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        accent,
        setAccent,
        currentAccent,
        accents: ACCENT_PRESETS,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export default ThemeContext;
