function getStoredTheme() {
    return localStorage.getItem("theme");
}

function setStoredTheme(theme: string) {
    localStorage.setItem("theme", theme);
}

function getPreferredTheme() {
    const storedTheme = getStoredTheme();
    if (storedTheme) {
        return storedTheme;
    }

    return getAutoTheme();
}

function getAutoTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

function setTheme(theme: string) {
    const root = document.documentElement;
    if (theme === "auto") {
        root.setAttribute("data-bs-theme", getAutoTheme());
    } else {
        root.setAttribute("data-bs-theme", theme);
    }
}

function showActiveTheme(theme: string, focus: boolean = false) {
    const themeSwitcher = document.querySelector<HTMLSelectElement>(
        "#color-theme-switcher",
    );
    if (!themeSwitcher) {
        return;
    }

    const themeSwitcherText =
        document.querySelector<HTMLSpanElement>("#color-theme-text");
    const activeThemeIcon = document.querySelector<HTMLSpanElement>(
        "#color-theme-icon use",
    );
    const activeThemeButton = document.querySelector<HTMLButtonElement>(
        `[data-bs-theme-value=${theme}]`,
    );
    const activeThemeButtonIcon = activeThemeButton?.querySelector("use");

    document
        .querySelectorAll<HTMLButtonElement>("[data-bs-theme-value]")
        .forEach((button) => {
            button.classList.remove("active");
            button.setAttribute("aria-pressed", "false");
        });

    activeThemeButton?.classList.add("active");
    activeThemeButton?.setAttribute("aria-pressed", "true");
    activeThemeIcon?.setAttribute(
        "xlink:href",
        activeThemeButtonIcon?.getAttribute("xlink:href")!,
    );
    const themeSwitcherTextLabel = `Toggle theme (${theme})`;
    themeSwitcher.setAttribute("aria-label", themeSwitcherTextLabel);

    if (focus) {
        themeSwitcher.focus();
    }
}

window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
        const storedTheme = getStoredTheme();
        if (storedTheme !== "light" && storedTheme !== "dark") {
            showActiveTheme(getAutoTheme());
        }
    });

setTheme(getPreferredTheme());
document.addEventListener("DOMContentLoaded", () => {
    showActiveTheme(getPreferredTheme());

    document
        .querySelectorAll<HTMLButtonElement>("[data-bs-theme-value]")
        .forEach((button) => {
            button.addEventListener("click", () => {
                const theme = button.getAttribute("data-bs-theme-value")!;
                setStoredTheme(theme);
                setTheme(theme);
                showActiveTheme(theme, true);
            });
        });
});
