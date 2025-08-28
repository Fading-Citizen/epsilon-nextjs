'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { colors, gradients } from './colors';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: any;
  getGradient: (name: string) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Cargar tema desde localStorage al inicializar
  useEffect(() => {
    const savedTheme = localStorage.getItem('epsilon-theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      // Detectar preferencia del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  // Guardar tema en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('epsilon-theme', isDarkMode ? 'dark' : 'light');
    
    // Actualizar CSS custom properties en el root
    const root = document.documentElement;
    const theme = isDarkMode ? colors.dark : colors.light;
    
    root.style.setProperty('--bg-primary', theme.background.primary);
    root.style.setProperty('--bg-secondary', theme.background.secondary);
    root.style.setProperty('--bg-tertiary', theme.background.tertiary);
    root.style.setProperty('--text-primary', theme.text.primary);
    root.style.setProperty('--text-secondary', theme.text.secondary);
    root.style.setProperty('--text-tertiary', theme.text.tertiary);
    root.style.setProperty('--border-color', theme.border);
    root.style.setProperty('--shadow-color', theme.shadow);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const getTheme = () => {
    return {
      colors: {
        ...colors,
        current: isDarkMode ? colors.dark : colors.light,
      },
      gradients,
      isDarkMode,
    };
  };

  const getGradient = (category: string) => {
    const mode = isDarkMode ? 'dark' : 'light';
    const gradientCategory = gradients[category as keyof typeof gradients];
    return gradientCategory ? gradientCategory[mode] : gradients.programacion[mode];
  };

  const value = {
    isDarkMode,
    toggleTheme,
    theme: getTheme(),
    getGradient,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
