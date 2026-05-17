"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export type UserRole =
  | "ADMIN_SYSTEME"
  | "DIRIGEANT_ASSEMBLEE"
  | "DIRIGEANT_ZONE"
  | "MISSIONNAIRE"
  | "RESPONSABLE_REGIONAL"
  | "RESPONSABLE_NATIONAL";

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  prenom?: string;
  nom?: string;
  contact?: string;
  isActive: boolean;
  mustChangePassword: boolean;
  dateJoined: string;
  lastLogin?: string;
  territoireId?: string;
  territoire?: { id: string; nom: string; niveau: string };
}

interface PaginatedUsers {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface UsersFilters {
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export function useUsersList(filters: UsersFilters = {}) {
  const { user } = useAuth();

  return useQuery<PaginatedUsers>({
    queryKey: ["users", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.role) params.append("role", filters.role);
      if (filters.isActive !== undefined)
        params.append("isActive", String(filters.isActive));
      if (filters.page) params.append("page", String(filters.page));
      if (filters.limit) params.append("limit", String(filters.limit));

      const { data } = await api.get(`/users?${params.toString()}`);
      return data;
    },
    enabled: !!user && user.role === "ADMIN_SYSTEME",
  });
}

// Mutation pour créer un utilisateur (via /auth/register)
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: {
      username: string;
      email: string;
      password: string;
      role: UserRole;
      prenom?: string;
      nom?: string;
      contact?: string;
      territoireId?: string;
    }) => {
      const { data } = await api.post("/auth/register", userData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Mutation pour activer/désactiver un utilisateur
export function useToggleUserActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/users/${id}/toggle-active`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Récupérer un utilisateur par ID
export function useUserDetail(id: string) {
  const { user } = useAuth();
  return useQuery<User>({
    queryKey: ["users", id],
    queryFn: async () => {
      const { data } = await api.get(`/users/${id}`);
      return data;
    },
    enabled: !!user && user.role === "ADMIN_SYSTEME" && !!id,
  });
}

// Modifier un utilisateur
export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...updateData
    }: Partial<User> & { id: string }) => {
      const { data } = await api.put(`/users/${id}`, updateData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", variables.id] });
    },
  });
}

// Récupère les utilisateurs avec le rôle DIRIGEANT_ASSEMBLEE
export function useDirigeants() {
  const { user } = useAuth();
  return useQuery<User[]>({
    queryKey: ["users", { role: "DIRIGEANT_ASSEMBLEE" }],
    queryFn: async () => {
      const { data } = await api.get(
        "/users?role=DIRIGEANT_ASSEMBLEE&limit=1000",
      );
      return data.data || data;
    },
    enabled: !!user && user.role === "ADMIN_SYSTEME",
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
