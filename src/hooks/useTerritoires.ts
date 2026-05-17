"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export interface Territoire {
  id: string;
  nom: string;
  niveau: "PAYS" | "REGION" | "VILLE" | "QUARTIER" | "SECTEUR";
  parentId?: string | null;
  enfants?: Territoire[];
  _count?: {
    users: number;
    assemblees: number;
  };
}

export function useTerritoires() {
  const { user } = useAuth();
  return useQuery<Territoire[]>({
    queryKey: ["territoires", "arbre"],
    queryFn: async () => {
      const { data } = await api.get("/territoires/arbre");
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateTerritoire() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      nom: string;
      niveau: string;
      parentId?: string;
      contact?: string;
      adresse?: string;
    }) => {
      const { data: res } = await api.post("/territoires", data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["territoires"] });
    },
  });
}

export function useUpdateTerritoire() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<Territoire> & { id: string }) => {
      const { data: res } = await api.put(`/territoires/${id}`, data);
      return res;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["territoires"] });
      queryClient.invalidateQueries({
        queryKey: ["territoires", variables.id],
      });
    },
  });
}

export function useDeleteTerritoire() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/territoires/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["territoires"] });
    },
  });
}
