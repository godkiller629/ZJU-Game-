// js/ui/theme.js
const THEME_KEY = 'ZJU_SIM_THEME';

export function getStoredTheme() {
  return localStorage.getItem(THEME_KEY) || 'light';
}

export function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.body.classList.toggle('theme-dark', isDark);
}

export function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
}

export function initThemeToggle() {
  // 1) 应用存储主题
  applyTheme(getStoredTheme());

  // 2) 初始化开关
  const toggle = document.getElementById('dark-mode-toggle');
  if (!toggle) return;

  toggle.checked = (getStoredTheme() === 'dark');
  toggle.addEventListener('change', () => {
    setTheme(toggle.checked ? 'dark' : 'light');
  });
}

