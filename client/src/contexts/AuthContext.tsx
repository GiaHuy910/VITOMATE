import { createContext } from "react";

export type User = {
  displayname: string;
  userId: number;
  username: string;
  email: string;
  avatar: {
    url: string | null;
  };
};

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);
