import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

// create the context object
const AuthContext = createContext(null);

// provider wraps the app and shares user state
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);              // logged-in user or null
    const [loading, setLoading] = useState(true);        // true while checking login

    // runs once when app loads
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.get("/auth/profile");   // is user logged in?
                setUser(response.data.user);                       // yes - save user
            } catch (err) {
                setUser(null);                                     // no - clear user
            } finally {
                setLoading(false);                                 // done checking
            }
        };

        checkAuth();
    }, []);                                              // empty deps = runs once

    // login function - called from Login page
    const login = async (email, password) => {
        await api.post("/auth/login", { email, password });            // sends credentials

        const profileResponse = await api.get("/auth/profile");        // get full user
        setUser(profileResponse.data.user);                            // save in state

        return profileResponse.data.user;                              // return for redirect
    };

    // logout function - called from LogoutButton
    const logout = async () => {
        await api.post("/auth/logout");                              // backend clears cookie
        setUser(null);                                               // clear user in state
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

// custom hook so any component can do useAuth()
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {                                                  // safety check
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;                                                  // return the context
}