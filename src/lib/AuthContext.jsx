import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session ? session.user : null);
      setIsAuthenticated(!!session);
      setIsLoadingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      function(_event, session) {
        setUser(session ? session.user : null);
        setIsAuthenticated(!!session);
        setIsLoadingAuth(false);
      }
    );

    return function() { subscription.unsubscribe(); };
  }, []);

  const login = async function(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) throw error;
    return data;
  };

  const logout = async function() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoadingAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};