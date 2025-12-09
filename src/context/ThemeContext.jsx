// Theme Context - Dark/Light/System theme management
import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // Get saved theme or default to system
        return localStorage.getItem("zychat-theme") || "system";
    });
    const [resolvedTheme, setResolvedTheme] = useState("dark");

    // Apply theme to document
    useEffect(() => {
        const applyTheme = (themeName) => {
            document.documentElement.setAttribute("data-theme", themeName);
            setResolvedTheme(themeName);
        };

        if (theme === "system") {
            // Check system preference
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            applyTheme(mediaQuery.matches ? "dark" : "light");

            // Listen for system theme changes
            const handler = (e) => applyTheme(e.matches ? "dark" : "light");
            mediaQuery.addEventListener("change", handler);
            return () => mediaQuery.removeEventListener("change", handler);
        } else {
            applyTheme(theme);
        }
    }, [theme]);

    // Save theme to localStorage
    const changeTheme = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem("zychat-theme", newTheme);
    };

    const value = {
        theme,
        resolvedTheme,
        setTheme: changeTheme,
        isDark: resolvedTheme === "dark",
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
