// Paleta de colores basada en las sub-marcas educativas
export const colors = {
  // Colores principales por nivel educativo
  primary: {
    kids: '#F0E23D',        // E-KIDS PRIMARIA - Energía, riqueza, felicidad
    bachillerato: '#F7750b', // BACHILLERATO - Juventud, diversión y atrevimiento
    preU: '#6969bc',        // Pre-U UNIVERSITARIOS - Optimismo comedido, intensidad
    profes: '#087799',      // Profes - Integridad y profesionalismo
  },
  
  // Color secundario
  secondary: '#18e2a2',     // Crecimiento y frescura
  
  // Paleta de grises
  gray: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  
  // Estados
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Modo claro
  light: {
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      tertiary: '#64748b',
    },
    border: '#e2e8f0',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  
  // Modo oscuro
  dark: {
    background: {
      primary: '#0f172a',
      secondary: '#1e293b',
      tertiary: '#334155',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      tertiary: '#94a3b8',
    },
    border: '#334155',
    shadow: 'rgba(0, 0, 0, 0.3)',
  }
};

// Gradientes para categorías académicas
export const gradients = {
  matematicas: {
    light: 'linear-gradient(135deg, #6969bc 0%, #5a5aa8 100%)',
    dark: 'linear-gradient(135deg, #5a5aa8 0%, #4b4b94 100%)',
  },
  fisica: {
    light: 'linear-gradient(135deg, #F7750b 0%, #e6690a 100%)',
    dark: 'linear-gradient(135deg, #e6690a 0%, #d55d09 100%)',
  },
  quimica: {
    light: 'linear-gradient(135deg, #087799 0%, #076687 100%)',
    dark: 'linear-gradient(135deg, #076687 0%, #065575 100%)',
  },
  programacion: {
    light: 'linear-gradient(135deg, #18e2a2 0%, #15c78a 100%)',
    dark: 'linear-gradient(135deg, #15c78a 0%, #12b172 100%)',
  },
  historia: {
    light: 'linear-gradient(135deg, #F0E23D 0%, #d9cb35 100%)',
    dark: 'linear-gradient(135deg, #d9cb35 0%, #c2b42e 100%)',
  },
  biologia: {
    light: 'linear-gradient(135deg, #18e2a2 0%, #F0E23D 100%)',
    dark: 'linear-gradient(135deg, #15c78a 0%, #d9cb35 100%)',
  },
};
