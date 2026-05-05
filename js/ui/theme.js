(function () {
  const STORAGE_KEY = "genterm-theme";
  const DARK_THEME = "dark";
  const LIGHT_THEME = "light";
  let themeToggleButton = null;
  let themeToggleIcon = null;
  let mediaQuery = null;

  document.addEventListener("DOMContentLoaded", function onReady() {
    themeToggleButton = document.getElementById("theme-toggle");
    themeToggleIcon = document.getElementById("theme-toggle-icon");

    if (!themeToggleButton) {
      return;
    }

    mediaQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

    syncThemeButton(getCurrentTheme());
    themeToggleButton.addEventListener("click", handleThemeToggle);

    if (mediaQuery && typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleSystemThemeChange);
    } else if (mediaQuery && typeof mediaQuery.addListener === "function") {
      mediaQuery.addListener(handleSystemThemeChange);
    }
  });

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
