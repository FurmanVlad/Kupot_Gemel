import React, { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [userId, setUserId] = useState(null);


    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Here, you might want to verify the token on the server
                // For now, we'll just set the authenticated state
                setIsAuthenticated(true);
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUserRole(payload.role);
                setUserId(payload.userId); // Add this line to set the userId

            } catch (error) {
                console.error('Error parsing token:', error);
                logout(); // Clear authentication if token parsing fails
            }
        }
    }, []);

    const login = (token, role) => {
        localStorage.setItem('token', token);
        setIsAuthenticated(true);
        setUserRole(role);
        setUserId(null); // Set the userId when logging in

    };

    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUserRole(null);
        setUserId(null); // Clear the userId when logging out

    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, userRole,userId, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };