import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { api, setAuthToken } from '../lib/api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'ashram_admin_token';
const ADMIN_KEY = 'ashram_admin_user';

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() =>
        typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_KEY) : null
    );
    const [admin, setAdmin] = useState(() => {
        try {
            const raw = typeof window !== 'undefined' ? window.localStorage.getItem(ADMIN_KEY) : null;
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    });

    const login = useCallback(async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        setToken(data.token);
        setAdmin(data.admin);
        window.localStorage.setItem(TOKEN_KEY, data.token);
        window.localStorage.setItem(ADMIN_KEY, JSON.stringify(data.admin));
        setAuthToken(data.token);
        return data.admin;
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setAdmin(null);
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.removeItem(ADMIN_KEY);
        setAuthToken(null);
    }, []);

    const value = useMemo(
        () => ({ token, admin, isAuthenticated: !!token, login, logout }),
        [token, admin, login, logout]
    );
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be inside AuthProvider');
    return ctx;
}
