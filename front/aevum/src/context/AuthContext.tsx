import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { apiClient } from "../api/client";

interface AuthContextType {
  token: string | null;
  user: {
    id: number;
    type?: string;
    name?: string;
    email?: string;
    cpf?: string;
  } | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState<AuthContextType["user"]>(null);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userType");
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
      setToken(null);
      setUser(null);
      return;
    }

    try {
      const decoded = jwtDecode<{ id: number; type?: string }>(currentToken);
      const id = decoded?.id;
      if (!id) {
        logout();
        return;
      }

      localStorage.setItem("userId", String(id));
      if (decoded.type) localStorage.setItem("userType", decoded.type);

      setToken(currentToken);
      setUser((prev) => ({ ...(prev ?? { id }), id, type: decoded.type }));

      // Buscar dados atualizados do usuário
      const response = await apiClient.get(`/users/${id}`);
      const data = response.data;
      setUser({
        id,
        type: decoded.type,
        name: data?.name,
        email: data?.email,
        cpf: data?.cpf,
      });
    } catch {
      logout();
    }
  };

  const login = async (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    await refreshUser();
  };

  useEffect(() => {
    // Reidratar sessão ao abrir/atualizar
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({ token, user, login, logout, refreshUser }),
    [token, user]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth precisa estar dentro do AuthProvider");
  return context;
};
