/**
 * ForcaMaster - Theme Manager
 * Gerencia os 5 temas visuais, alternância instantânea via atributos/variáveis CSS e persistência.
 */

export const THEMES = [
  {
    id: 'nintendo',
    name: 'Nintendo Arcade',
    icon: '🔴',
    primary: '#e60012',
    bg: '#f4f4f6',
    surface: '#ffffff',
    text: '#222222',
    accent: '#10b981'
  },
  {
    id: 'dark-neon',
    name: 'Dark Neon',
    icon: '⚡',
    primary: '#00f2fe',
    bg: '#0f0f1b',
    surface: '#1b1b2f',
    text: '#f1f5f9',
    accent: '#00ff88'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    icon: '🟣',
    primary: '#f72585',
    bg: '#10002b',
    surface: '#240046',
    text: '#f8f9fa',
    accent: '#7209b7'
  },
  {
    id: 'emerald',
    name: 'Emerald Matrix',
    icon: '🟢',
    primary: '#10b981',
    bg: '#061a10',
    surface: '#0d2818',
    text: '#ecfdf5',
    accent: '#34d399'
  },
  {
    id: 'midnight',
    name: 'Midnight AMOLED',
    icon: '🌑',
    primary: '#3b82f6',
    bg: '#000000',
    surface: '#121212',
    text: '#ffffff',
    accent: '#60a5fa'
  }
];

class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('forcamaster_theme') || 'nintendo';
  }

  init() {
    this.applyTheme(this.currentTheme);
  }

  applyTheme(themeId) {
    const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
    this.currentTheme = theme.id;
    document.documentElement.setAttribute('data-theme', theme.id);
    localStorage.setItem('forcamaster_theme', theme.id);

    // Atualiza a meta tag theme-color no HTML para PWA status bar
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme.bg);
    }
  }

  cycleNext() {
    const currentIndex = THEMES.findIndex(t => t.id === this.currentTheme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    this.applyTheme(THEMES[nextIndex].id);
    return THEMES[nextIndex];
  }

  getCurrentTheme() {
    return THEMES.find(t => t.id === this.currentTheme) || THEMES[0];
  }
}

export const themeManager = new ThemeManager();
