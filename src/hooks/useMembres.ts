"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

// Types (alignés avec le backend)
export interface Membre {
  id: string;
  assembleeId: string;
  nom: string;
  prenom: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  contact?: string;
  email?: string;
  adresse?: string;
  profession?: string;
  dateConversion?: string;
  baptiseEau?: boolean;
  baptiseSaintEsprit?: boolean;
  liensBrises?: boolean;
  situationMatrimoniale?: string;
  nombreEnfants?: number;
  faiseurDisciple?: string;
  niveauAcademique?: string;
  statut:
    | "NOUVEAU"
    | "REPENTANT"
    | "BRISER"
    | "BAPTISE"
    | "ACTIF"
    | "INACTIF"
    | "DECEDE"
    | "DEMISSIONNE";
  fonction: string;
  photo?: string | null;
  notes?: string;
  assemblee?: { id: string; nom: string };
  createdAt: string;
  updatedAt: string;
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

interface MembresFilters {
  search?: string;
  assembleeId?: string;
  statut?: string;
  fonction?: string;
  page?: number;
  limit?: number;
}

export function useMembresList(filters: MembresFilters = {}) {
  const { user } = useAuth();

  return useQuery<PaginatedResponse<Membre>>({
    queryKey: ["membres", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.assembleeId)
        params.append("assembleeId", filters.assembleeId);
      if (filters.statut) params.append("statut", filters.statut);
      if (filters.fonction) params.append("fonction", filters.fonction);
      if (filters.page) params.append("page", String(filters.page));
      if (filters.limit) params.append("limit", String(filters.limit));

      const { data } = await api.get(`/membres?${params.toString()}`);
      return data;
    },
    enabled: !!user,
  });
}

export function useMembreDetail(id: string) {
  const { user } = useAuth();

  return useQuery<Membre>({
    queryKey: ["membres", id],
    queryFn: async () => {
      const { data } = await api.get(`/membres/${id}`);
      return data;
    },
    enabled: !!user && !!id,
  });
}

export function useMembreHistorique(id: string) {
  const { user } = useAuth();

  return useQuery<any[]>({
    queryKey: ["membres", id, "historique"],
    queryFn: async () => {
      const { data } = await api.get(`/membres/${id}/historique`);
      return data;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateMembre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      membreData: Omit<Membre, "id" | "createdAt" | "updatedAt">,
    ) => {
      const { data } = await api.post("/membres", membreData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membres"] });
    },
  });
}

export function useUpdateMembre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...membreData
    }: Partial<Membre> & { id: string }) => {
      const { data } = await api.put(`/membres/${id}`, membreData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["membres"] });
      queryClient.invalidateQueries({ queryKey: ["membres", variables.id] });
    },
  });
}

export function useDeleteMembre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/membres/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membres"] });
    },
  });
}
