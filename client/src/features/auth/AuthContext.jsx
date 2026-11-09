import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../../lib/api.js';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('budget_token'));
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('budget_user') || 'null'); } catch { return null; } });
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('budget_token')));
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    api.get('/auth/me').then(({ data }) => { setUser(data.user); localStorage.setItem('budget_user', JSON.stringify(data.user)); })
      .catch(() => { localStorage.removeItem('budget_token'); localStorage.removeItem('budget_user'); setToken(null); setUser(null); })
      .finally(() => setLoading(false));
  }, []);
  const signIn = data => { localStorage.setItem('budget_token', data.token); localStorage.setItem('budget_user', JSON.stringify(data.user)); setToken(data.token); setUser(data.user); };
  const updateUser = nextUser => { setUser(nextUser); localStorage.setItem('budget_user', JSON.stringify(nextUser)); };
  const signOut = () => { localStorage.removeItem('budget_token'); localStorage.removeItem('budget_user'); setToken(null); setUser(null); };
  const value = useMemo(() => ({ token, user, loading, signIn, signOut, updateUser }), [token, user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
