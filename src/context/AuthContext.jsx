import { createContext, useState, useEffect } from "react";
import { getToken, setToken, removeToken } from "../utils/tokenUtils";
import axios from "axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getToken(); 
      if (token) {
        try {
          const response = await axios.get("https://project-backend-grqo.onrender.com/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser({ token, ...response.data }); 
        } catch (error) {
          console.error("Failed to validate token:", error.response?.data || error.message);
          removeToken(); 
        }
      }
      setLoading(false); 
    };

    initializeAuth();
  }, []);

  const login = async (token) => {
    try {
      setToken(token); 
      const response = await axios.get("https://project-backend-grqo.onrender.com/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser({ token, ...response.data }); 
    } catch (error) {
      console.error("Failed to fetch user details:", error.response?.data || error.message);
      removeToken();
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
