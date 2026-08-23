import { createContext } from "react";

type ThemeType = "Light" | "Dark" | "System";

export type User = {
  displayname: string;
  userId: number;
  username: string;
  email: string;
  avatar: {
    url: string | null;
  };
  theme: ThemeType;
};

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);
