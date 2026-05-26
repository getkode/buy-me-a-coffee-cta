export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "buy-me-demo-theme";

function resolveDark(mode: ThemeMode): boolean {
  if (mode === "dark") return true;
  if (mode === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function getThemeMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    /* private browsing */
  }
  return "system";
}

export function isDarkMode(): boolean {
  return resolveDark(getThemeMode());
}

export function applySiteTheme(dark: boolean): void {
  document.body.classList.toggle("is-dark", dark);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

export function setThemeMode(mode: ThemeMode, persist = true): void {
  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* private browsing */
    }
  }
  applySiteTheme(resolveDark(mode));
  updateThemeToggle();
  window.dispatchEvent(
    new CustomEvent("demo-theme-change", {
      detail: { dark: resolveDark(mode), mode },
    }),
  );
}

function updateThemeToggle(): void {
  const button = document.getElementById("theme-toggle");
  if (!(button instanceof HTMLButtonElement)) return;

  const dark = isDarkMode();
  button.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  button.setAttribute("aria-pressed", String(dark));
  button.dataset.tooltip = dark ? "Light mode" : "Dark mode";
}

function mountThemeToggle(): void {
  const button = document.getElementById("theme-toggle");
  if (!(button instanceof HTMLButtonElement)) return;

  updateThemeToggle();
  button.addEventListener("click", () => {
    setThemeMode(isDarkMode() ? "light" : "dark");
  });
}

export function initTheme(): void {
  applySiteTheme(isDarkMode());
  mountThemeToggle();

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (getThemeMode() !== "system") return;
    applySiteTheme(isDarkMode());
    updateThemeToggle();
    window.dispatchEvent(
      new CustomEvent("demo-theme-change", {
        detail: { dark: isDarkMode(), mode: "system" },
      }),
    );
  });
}
