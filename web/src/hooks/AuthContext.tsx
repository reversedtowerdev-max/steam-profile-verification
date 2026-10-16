
import {
  createContext,
  useState,
  useContext,
  useEffect,
  type ReactNode
} from "react";

const API_URL = "https://api.reversedtower-dev.workers.dev";

export interface AuthUser {
  id: string;
  username: string;
  avatar: string | null;
  steamID: string | null;
  createdAt: number;
  verified: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;

  refreshAuth: () => Promise<boolean>;
  updateUser: (updatedUser: AuthUser) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  children
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshAuth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: "GET",
        credentials: "include"
      });

      if (!response.ok) {
        setUser(null);
        return false;
      }

      const data = await response.json() as {
        success: boolean;
        user: AuthUser;
      };

      if (!data.success || !data.user) {
        setUser(null);
        return false;
      }

      setUser(data.user);
      return true;

    } catch (error) {
      console.error("Authentication error:", error);
      setUser(null);
      return false;

    } finally {
      setLoading(false);
    }
  }

  function updateUser(updatedUser: AuthUser) {
    setUser(current => {
      if (!current || current.id !== updatedUser.id) {
        return current;
      }

      return updatedUser;
    });
  }

  async function logout() {
    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  useEffect(() => {
    void refreshAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        loading,
        refreshAuth,
        updateUser,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}