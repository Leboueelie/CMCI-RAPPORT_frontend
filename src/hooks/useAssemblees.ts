"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export interface Assemblee {
  id: string;
  nom: string;
  territoireId: string;
  dirigeantId?: string; // gardez-le pour la compatibilité
  dirigeant?: { id: string; username: string; prenom?: string; nom?: string };
  dirigeants?: {
    user: {
      id: string;
      username: string;
      prenom?: string;
      nom?: string;
      contact?: string;
    };
  }[]; // <-- AJOUT
  contact?: string;
  adresse?: string;
  dateCreation: string;
  territoire?: { id: string; nom: string; niveau: string };
  _count?: {
    membres: number;
    rapports: number;
  };
}

interface PaginatedAssemblees {
  data: Assemblee[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface AssembleesFilters {
  search?: string;
  territoireId?: string;
  dirigeantId?: string;
  page?: number;
  limit?: number;
}

// Liste paginée (pour la page Assemblees)
export function useAssembleesList(filters: AssembleesFilters = {}) {
  const { user } = useAuth();

  return useQuery<PaginatedAssemblees>({
    queryKey: ["assemblees", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.territoireId)
        params.append("territoireId", filters.territoireId);
      if (filters.dirigeantId)
        params.append("dirigeantId", filters.dirigeantId);
      if (filters.page) params.append("page", String(filters.page));
      if (filters.limit) params.append("limit", String(filters.limit));

      const { data } = await api.get(`/assemblees?${params.toString()}`);
      return data;
    },
    enabled: !!user,
  });
}

// Liste complète (ou limitée) sans pagination, pour les selects
export function useAssembleesSelect(filters: AssembleesFilters = {}) {
  const { user } = useAuth();
  return useQuery<Assemblee[]>({
    queryKey: ["assemblees", "select", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.dirigeantId)
        params.append("dirigeantId", filters.dirigeantId);
      params.append("limit", "1000"); // Récupère toutes les assemblées

      const { data } = await api.get(`/assemblees?${params.toString()}`);
      return data.data || data; // Retourne toujours un tableau
    },
    enabled: !!user,
  });
}

// Détail d'une assemblée
export function useAssembleeDetail(id: string) {
  const { user } = useAuth();

  return useQuery<Assemblee>({
    queryKey: ["assemblees", id],
    queryFn: async () => {
      const { data } = await api.get(`/assemblees/${id}`);
      return data;
    },
    enabled: !!user && !!id,
  });
}

// Assemblé du dirigeant connecté
export function useAssembleeDuDirigeant() {
  const { user } = useAuth();

  return useQuery<Assemblee | null>({
    queryKey: ["assemblees", "dirigeant", user?.id],
    queryFn: async () => {
      const { data } = await api.get(`/assemblees?dirigeantId=${user?.id}`);
      const list = data.data || data;
      return list.length > 0 ? list[0] : null;
    },
    enabled: !!user && user.role === "DIRIGEANT_ASSEMBLEE",
  });
}

// Création d'une assemblée
export function useCreateAssemblee() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      nom: string;
      territoireId: string;
      dirigeantId?: string;
      contact?: string;
      adresse?: string;
    }) => {
      const { data: res } = await api.post("/assemblees", data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assemblees"] });
    },
  });
}

export function useDeleteAssemblee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/assemblees/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assemblees"] });
    },
  });
}

export function useUpdateAssemblee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<Assemblee> & { id: string }) => {
      const { data: res } = await api.put(`/assemblees/${id}`, data);
      return res;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["assemblees"] });
      queryClient.invalidateQueries({ queryKey: ["assemblees", variables.id] });
    },
  });
}
