import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { getStoredUser, login as apiLogin, logout as apiLogout, storeAuth } from '../auth/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);

  const login = useCallback(async (username, password) => {
    const res = await apiLogin(username, password);
    if (res?.success && res?.data) {
      storeAuth(res.data);
      setUser({
        username: res.data.username,
        role: res.data.role,
        institutionId: res.data.institutionId,
        institutionName: res.data.institutionName,
        mustChangePassword: res.data.mustChangePassword ?? false,
      });
      return res;
    }
    throw new Error(res?.message || 'Login failed');
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      logout,
      hasRole: (role) => user?.role === role,
      hasAnyRole: (roles) => Array.isArray(roles) && roles.includes(user?.role),
    }),
    [user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
