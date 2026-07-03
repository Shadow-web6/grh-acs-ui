import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get("/me")
        .then(res => {
          setUser(res.data);
        })
        .catch((err) => {
          if (err.response?.status === 401) logout();
        })
        .finally(() => {
        // Charge les permissions séparément, sans bloquer ni déconnecter si ça échoue
          api.get("/mes-permissions")
            .then(res => setPermissions(res.data))
            .catch(() => setPermissions([])) // silencieux : pas de permission = tableau vide
            .finally(() => setLoading(false));
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post("/login", { email, password });
    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    // Charge les permissions après login
    const permRes = await api.get("/mes-permissions");
    setPermissions(permRes.data);
    return res.data.user;
  };

  const logout = async () => {
    try { await api.post("/logout"); } catch {}
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setPermissions([]);
  };

  const hasPermission = (module) => permissions.includes(module);

  return (
    <AuthContext.Provider value={{ user, token, permissions, hasPermission, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);