import { createContext } from "react";

export type ThemeType = "Light" | "Dark" | "System";

export type ThemeContextType = {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
};

export const ThemeContext = createContext<ThemeContextType | null>(null);
