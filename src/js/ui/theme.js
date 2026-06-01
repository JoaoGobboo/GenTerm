(function () {
  const STORAGE_KEY = "genterm-theme";
  const DARK_THEME = "dark";
  const LIGHT_THEME = "light";
  let themeToggleButton = null;
  let themeToggleIcon = null;
  let mediaQuery = null;
  let mediaQueryBound = false;

  document.addEventListener("DOMContentLoaded", init);
  document.addEventListener("termos:html-ready", init);

  function init() {
    const currentToggleButton = document.getElementById("theme-toggle");
    const currentToggleIcon = document.getElementById("theme-toggle-icon");

    if (!currentToggleButton) {
      return;
    }

    if (themeToggleButton && themeToggleButton !== currentToggleButton) {
      themeToggleButton.removeEventListener("click", handleThemeToggle);
    }

    if (themeToggleButton !== currentToggleButton) {
      currentToggleButton.addEventListener("click", handleThemeToggle);
    }

    themeToggleButton = currentToggleButton;
    themeToggleIcon = currentToggleIcon;

    if (!mediaQuery) {
      mediaQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    }

    syncThemeButton(getCurrentTheme());

    if (mediaQueryBound || !mediaQuery) {
      return;
    }

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleSystemThemeChange);
      mediaQueryBound = true;
    } else if (typeof mediaQuery.addListener === "function") {
      mediaQuery.addListener(handleSystemThemeChange);
      mediaQueryBound = true;
    }
  }

  function handleThemeToggle() {
    const nextTheme = getCurrentTheme() === DARK_THEME ? LIGHT_THEME : DARK_THEME;
    persistTheme(nextTheme);
    applyTheme(nextTheme);
  }

  function handleSystemThemeChange(event) {
    if (hasSavedTheme()) {
      return;
    }

    applyTheme(event.matches ? DARK_THEME : LIGHT_THEME);
  }

  function getCurrentTheme() {
    return document.documentElement.dataset.theme === DARK_THEME ? DARK_THEME : LIGHT_THEME;
  }

  function hasSavedTheme() {
    try {
      return Boolean(window.localStorage.getItem(STORAGE_KEY));
    } catch (error) {
      return false;
    }
  }

  function persistTheme(theme) {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      return;
    }
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    syncThemeButton(theme);
  }

  function syncThemeButton(theme) {
    if (!themeToggleButton) {
      return;
    }

    const isDark = theme === DARK_THEME;
    if (themeToggleIcon) {
      themeToggleIcon.textContent = isDark ? "☾" : "☀";
    }
    themeToggleButton.setAttribute("aria-pressed", String(isDark));
    themeToggleButton.setAttribute(
      "aria-label",
      isDark ? "Alternar para tema claro" : "Alternar para tema escuro"
    );
    themeToggleButton.setAttribute(
      "title",
      isDark ? "Alternar para tema claro" : "Alternar para tema escuro"
    );
  }
})();
