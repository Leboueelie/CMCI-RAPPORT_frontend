"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { Rapport } from "@/hooks/useRapports";

interface FileAttenteResponse {
  total: number;
  rapports: Rapport[];
}

interface StatsResponse {
  fileAttente: number;
  parStatut: {
    brouillon: number;
    soumis: number;
    valide: number;
    rejete: number;
  };
  total: number;
}

export function useFileAttente() {
  const { user } = useAuth();
  return useQuery<FileAttenteResponse>({
    queryKey: ["validations", "file-attente"],
    queryFn: async () => {
      const { data } = await api.get("/validations/file-attente");
      return data;
    },
    // Désactiver si l'utilisateur n'est pas un validateur
    enabled:
      !!user &&
      (user.role === "ADMIN_SYSTEME" ||
        user.role === "DIRIGEANT_ZONE" ||
        user.role === "MISSIONNAIRE" ||
        user.role === "RESPONSABLE_REGIONAL" ||
        user.role === "RESPONSABLE_NATIONAL"),
  });
}

export function useValidationsStats() {
  const { user } = useAuth();
  return useQuery<StatsResponse>({
    queryKey: ["validations", "stats"],
    queryFn: async () => {
      const { data } = await api.get("/validations/stats");
      return data;
    },
    enabled: !!user,
  });
}
