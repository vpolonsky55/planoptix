import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('access_token');
        if (token) {
            // Здесь можно загрузить данные пользователя
            // Но пока просто считаем, что пользователь авторизован
            setUser({ isAuthenticated: true });
        }
        setLoading(false);
    };

    const login = async (username, password) => {
        try {
            setError(null);
            const response = await api.post('/token/', { username, password });
            
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            
            setUser({ username });
            return { success: true };
        } catch (err) {
            setError(err.response?.data?.detail || 'Ошибка входа');
            return { success: false, error: err.response?.data?.detail };
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};