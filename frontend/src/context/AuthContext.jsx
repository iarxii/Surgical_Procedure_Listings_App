import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    const login = useCallback(async (email, password) => {
        try {
            const response = await axios.post('http://127.0.0.1:8085/api/login', { email, password });
            const { access_token, user: userData } = response.data;
            
            setToken(access_token);
            setUser(userData);
            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Set default header for axios
            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
            
            return { success: true };
        } catch (error) {
            console.error('Login failed:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Login failed. Please check your credentials.' 
            };
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            if (token) {
                await axios.post('http://127.0.0.1:8085/api/logout', {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setToken(null);
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        setLoading(false);
    }, [token]);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin: user?.is_admin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
