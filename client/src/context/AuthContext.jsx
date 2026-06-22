import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axiosInstance from "../lib/axios.js";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get("/auth/me");
      setUser(data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const register = async ({ name, email, password }) => {
    setIsAuthenticating(true);
    try {
      const { data } = await axiosInstance.post("/auth/register", {
        name,
        email,
        password,
      });
      localStorage.setItem("chatsphere_token", data.token);
      setUser(data.user);
      toast.success("Account created! Welcome to ChatSphere.");
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      toast.error(message);
      return { success: false, message };
    } finally {
      setIsAuthenticating(false);
    }
  };

  const login = async ({ email, password }) => {
    setIsAuthenticating(true);
    try {
      const { data } = await axiosInstance.post("/auth/login", { email, password });
      localStorage.setItem("chatsphere_token", data.token);
      setUser(data.user);
      toast.success("Welcome back!");
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      toast.error(message);
      return { success: false, message };
    } finally {
      setIsAuthenticating(false);
    }
  };

  const loginWithGoogle = async (credential) => {
    setIsAuthenticating(true);
    try {
      const { data } = await axiosInstance.post("/auth/google", { credential });
      localStorage.setItem("chatsphere_token", data.token);
      setUser(data.user);
      toast.success("Welcome to ChatSphere!");
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Google sign-in failed";
      toast.error(message);
      return { success: false, message };
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (err) {
      // proceed with client-side logout regardless
    } finally {
      localStorage.removeItem("chatsphere_token");
      setUser(null);
      toast.success("Logged out");
    }
  };

  const updateUser = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticating,
        isAuthenticated: !!user,
        register,
        login,
        loginWithGoogle,
        logout,
        updateUser,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
