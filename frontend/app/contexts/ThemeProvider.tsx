'use client';
import React, { createContext, useState, useEffect } from "react";
import { LOCAL_STORAGE_THEME_KEY } from "../constants";

const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => { },
});

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return false;
  });

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem(LOCAL_STORAGE_THEME_KEY, newMode ? "dark" : "light");
      return newMode;
    });
  };

  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isDarkMode) {
      htmlElement.classList.add("dark");
    } else {
      htmlElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeProvider, ThemeContext };