"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export type StatutRapport = "BROUILLON" | "SOUMIS" | "VALIDE" | "REJETE";

export interface Rapport {
  id: string;
  assembleeId: string;
  territoireId: string;
  periode: string;
  dateDebut: string;
  dateFin: string;
  activites: string;
  effectifs: number;
  temoignages?: string;
  problemes?: string;
  besoins?: string;
  recommandations?: string;
  fichierJoint?: string;
  statut: StatutRapport;
  soumisParId: string;
  dateSoumission?: string;
  valideParId?: string;
  dateValidation?: string;
  rejeteParId?: string;
  dateRejet?: string;
  commentaireRejet?: string;
  assemblee?: { id: string; nom: string };
  territoire?: { id: string; nom: string; niveau: string };
  soumisPar?: { id: string; username: string; prenom?: string; nom?: string };
  validePar?: { id: string; username: string; prenom?: string; nom?: string };
  rejetePar?: { id: string; username: string; prenom?: string; nom?: string };
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface RapportsFilters {
  statut?: StatutRapport;
  assembleeId?: string;
  territoireId?: string;
  periode?: string;
  dateDebut?: string;
  dateFin?: string;
  page?: number;
  limit?: number;
}

export function useRapportsList(filters: RapportsFilters = {}) {
  const { user } = useAuth();

  return useQuery<PaginatedResponse<Rapport>>({
    queryKey: ["rapports", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.statut) params.append("statut", filters.statut);
      if (filters.assembleeId)
        params.append("assembleeId", filters.assembleeId);
      if (filters.territoireId)
        params.append("territoireId", filters.territoireId);
      if (filters.periode) params.append("periode", filters.periode);
      if (filters.dateDebut) params.append("dateDebut", filters.dateDebut);
      if (filters.dateFin) params.append("dateFin", filters.dateFin);
      if (filters.page) params.append("page", String(filters.page));
      if (filters.limit) params.append("limit", String(filters.limit));

      const { data } = await api.get(`/rapports?${params.toString()}`);
      return data;
    },
    enabled: !!user,
  });
}

export function useRapportDetail(id: string) {
  const { user } = useAuth();

  return useQuery<Rapport>({
    queryKey: ["rapports", id],
    queryFn: async () => {
      const { data } = await api.get(`/rapports/${id}`);
      return data;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateRapport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rapportData: Partial<Rapport>) => {
      const { data } = await api.post("/rapports", rapportData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rapports"] });
    },
  });
}

export function useUpdateRapport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...rapportData
    }: Partial<Rapport> & { id: string }) => {
      const { data } = await api.put(`/rapports/${id}`, rapportData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rapports"] });
      queryClient.invalidateQueries({ queryKey: ["rapports", variables.id] });
    },
  });
}

export function useDeleteRapport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/rapports/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rapports"] });
    },
  });
}

export function useSoumettreRapport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/rapports/${id}/soumettre`);
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["rapports"] });
      queryClient.invalidateQueries({ queryKey: ["rapports", id] });
    },
  });
}

export function useValiderRapport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      action,
      commentaire,
    }: {
      id: string;
      action: "valider" | "rejeter";
      commentaire?: string;
    }) => {
      const { data } = await api.post(`/rapports/${id}/valider`, {
        action,
        commentaire,
      });
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["rapports"] });
      queryClient.invalidateQueries({ queryKey: ["rapports", id] });
    },
  });
}
