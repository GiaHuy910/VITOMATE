import { useEffect, useState, type ReactNode } from "react";
import { ThemeContext, type ThemeType } from "./ThemeContext";
import { useAuth } from "../auth/useAuth";

type Props = {
  children: ReactNode;
};

const getIntialTheme = (): ThemeType => {
  const savedTheme = localStorage.getItem("theme");
  if (
    savedTheme === "Dark" ||
    savedTheme === "Light" ||
    savedTheme === "System"
  ) {
    return savedTheme;
  }
  return "System";
};
const getSystemTheme = (): "Dark" | "Light" => {
  return window.matchMedia("(prefers-color-scheme : dark)").matches
    ? "Dark"
    : "Light";
};

export const ThemeProvider = ({ children }: Props) => {
  const { user, loading: authLoading } = useAuth();
  const [theme, setTheme] = useState<ThemeType>(getIntialTheme);

  useEffect(() => {
    if (authLoading) return;
    if (user?.theme) {
      setTheme(user.theme);
      return;
    }
    const savedTheme = localStorage.getItem("theme");
    if (
      savedTheme === "Dark" ||
      savedTheme === "Light" ||
      savedTheme === "System"
    ) {
      setTheme(savedTheme);
    }
  }, [user, authLoading]);

  useEffect(() => {
    const root = document.documentElement;
    const appliedTheme = theme === "System" ? getSystemTheme() : theme;
    root.setAttribute("data-bs-theme", appliedTheme.toLowerCase());
    localStorage.setItem("theme", theme);
  }, [theme]);
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
