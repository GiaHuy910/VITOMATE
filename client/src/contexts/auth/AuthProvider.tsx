import { useEffect, useState, type ReactNode } from "react";

import { AuthContext, type User } from "./AuthContext";
import { logOutUser, getCurrentUser } from "../../api/auth";

type Props = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const data = await getCurrentUser();
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCurrentUser();
  }, []);

  const logout = async () => {
    try {
      await logOutUser();
      setUser(null);
    } catch (error) {
      // change this position to "redicecting to "Something is wrong" page" later
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
