import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

const THEME_CLASS_MAP = {
  "dark-purple": "theme-dark-purple",
  "dark-blue": "theme-dark-blue",
  "dark-gray": "theme-dark-gray",
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(
    () => localStorage.getItem("chatsphere_theme") || "dark-purple"
  );

  useEffect(() => {
    const root = document.documentElement;
    Object.values(THEME_CLASS_MAP).forEach((cls) => root.classList.remove(cls));
    root.classList.add(THEME_CLASS_MAP[theme] || THEME_CLASS_MAP["dark-purple"]);
    localStorage.setItem("chatsphere_theme", theme);
  }, [theme]);

  const setTheme = (newTheme) => {
    if (THEME_CLASS_MAP[newTheme]) {
      setThemeState(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
