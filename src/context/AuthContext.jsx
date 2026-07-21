import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('gama_jwt_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('gama_user_info');
    return saved ? JSON.parse(saved) : null;
  });
  const [permissions, setPermissions] = useState(() => {
    const saved = localStorage.getItem('gama_user_perms');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);

  // Validar sesión o refrescar perfil si hay un token al iniciar
  useEffect(() => {
    if (token && (!user || permissions.length === 0)) {
      fetchProfile();
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await apiClient('/auth/me');
      setUser({
        id: data.id,
        user_nick: data.user_nick,
        role: data.role,
      });
      setPermissions(data.permissions || []);
      localStorage.setItem('gama_user_info', JSON.stringify({
        id: data.id,
        user_nick: data.user_nick,
        role: data.role,
      }));
      localStorage.setItem('gama_user_perms', JSON.stringify(data.permissions || []));
    } catch (err) {
      console.error('Error cargando perfil:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (user_nick, password) => {
    setLoading(true);
    try {
      const data = await apiClient('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ user_nick, password }),
      });

      const authToken = data.token;
      const userInfo = data.user?.user || data.user;
      const userPerms = data.user?.permissions || [];

      setToken(authToken);
      setUser(userInfo);
      setPermissions(userPerms);

      localStorage.setItem('gama_jwt_token', authToken);
      localStorage.setItem('gama_user_info', JSON.stringify(userInfo));
      localStorage.setItem('gama_user_perms', JSON.stringify(userPerms));

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setPermissions([]);
    localStorage.removeItem('gama_jwt_token');
    localStorage.removeItem('gama_user_info');
    localStorage.removeItem('gama_user_perms');
  };

  const hasPermission = (code) => {
    if (user?.role === 'ADMIN' || user?.user_principal_role === 'ADMIN') return true;
    return permissions.includes(code);
  };

  const hasRole = (role) => {
    return user?.role === role || user?.user_principal_role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        permissions,
        loading,
        login,
        logout,
        hasPermission,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
