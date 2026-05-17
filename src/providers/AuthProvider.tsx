"use client";

import React, { createContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

// Types
interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  prenom?: string;
  nom?: string;
  contact?: string;
  photo?: string;
  isActive: boolean;
  mustChangePassword: boolean;
  territoireId?: string | null;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: string;
  prenom?: string;
  nom?: string;
  contact?: string;
  territoireId?: string;
}

// Contexte
export const AuthContext = createContext<AuthState | undefined>(undefined);

// Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialisation : vérifier si un token existe et récupérer le profil
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const res = await api.get("/auth/me");
          setUser(res.data);
        } catch {
          // Token invalide, on nettoie
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // Connexion
  const login = useCallback(
    async (username: string, password: string) => {
      const res = await api.post("/auth/login", { username, password });
      const { accessToken, refreshToken, user } = res.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      setUser(user);

      // Redirection selon le rôle (optionnelle, on peut laisser le layout décider)
      router.push("/dashboard");
    },
    [router],
  );

  // Déconnexion
  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    router.push("/login");
  }, [router]);

  // Création de compte (admin)
  const register = useCallback(async (data: RegisterData) => {
    await api.post("/auth/register", data);
    // Pas de connexion automatique, l'admin reste sur sa session
  }, []);

  // Rafraîchir le profil utilisateur
  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch {
      // Erreur silencieuse, on garde les données actuelles
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, register, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
