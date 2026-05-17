"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

// Types pour les stats globales
export interface DashboardSummary {
  global: {
    assemblees: number;
    membres: number;
    rapports: {
      total: number;
      brouillon: number;
      soumis: number;
      valides: number;
      rejetes: number;
    };
    utilisateurs: {
      total: number;
      actifs: number;
      inactifs: number;
    };
  };
  attente: {
    total: number;
    rapports: {
      id: string;
      periode: string;
      assemblee: { id: string; nom: string };
      territoire: { id: string; nom: string; niveau: string };
      soumisPar: {
        id: string;
        username: string;
        prenom?: string;
        nom?: string;
      };
      dateSoumission: string;
    }[];
  };
  retard: {
    total: number;
    assemblees: {
      id: string;
      nom: string;
      territoire: { id: string; nom: string };
    }[];
  };
  mensuel: {
    mois: string;
    soumis: number;
    valides: number;
    rejetes: number;
  }[];
  perimetre: {
    role: string;
    territoire: string;
  };
}

export function useDashboard() {
  const { user } = useAuth();

  return useQuery<DashboardSummary>({
    queryKey: ["dashboard", user?.id],
    queryFn: async () => {
      const { data } = await api.get("/dashboard/summary");
      return data;
    },
    // Ne pas lancer la requête si l'utilisateur n'est pas connecté
    enabled: !!user,
    // Rafraîchir toutes les 5 minutes
    staleTime: 5 * 60 * 1000,
  });
}
