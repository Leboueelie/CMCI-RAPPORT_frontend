"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export interface Fonction {
  id: string;
  nom: string;
}

export function useFonctions() {
  const { user } = useAuth();
  return useQuery<Fonction[]>({
    queryKey: ["fonctions"],
    queryFn: async () => {
      const { data } = await api.get("/fonctions");
      return data;
    },
    enabled: !!user,
  });
}
