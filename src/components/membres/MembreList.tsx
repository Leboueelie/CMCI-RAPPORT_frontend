"use client";

import React from "react";
import { useMembresList, type MembresFilters } from "@/hooks/useMembres";
import { MembreCard } from "./MembreCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";
import { Skeleton } from "../ui/Skeleton";

interface MembreListProps {
  filters?: MembresFilters;
}

export function MembreList({ filters = {} }: MembreListProps) {
  const { data, isLoading, isError, refetch } = useMembresList(filters);

  // Gestion du chargement
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface rounded-xl border border-border p-4 space-y-3"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="w-14 h-14 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Gestion des erreurs
  if (isError || !data) {
    return (
      <EmptyState
        icon={<AlertTriangle className="text-danger" size={48} />}
        title="Erreur de chargement"
        description="Impossible de récupérer la liste des membres."
        action={
          <Button variant="primary" onClick={() => refetch()}>
            Réessayer
          </Button>
        }
      />
    );
  }

  // État vide
  if (data.data.length === 0) {
    return (
      <EmptyState
        title="Aucun membre trouvé"
        description="Ajoutez votre premier membre à l'assemblée."
        action={
          <Button
            variant="primary"
            onClick={() => {
              /* navigation vers création */
            }}
          >
            Ajouter un membre
          </Button>
        }
      />
    );
  }

  // Grille de cartes
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.data.map((membre) => (
          <MembreCard key={membre.id} membre={membre} />
        ))}
      </div>

      {/* Informations de pagination (optionnel, si besoin d'afficher le total) */}
      <p className="text-sm text-text-secondary mt-4 text-center">
        {data.meta.total} membre{data.meta.total > 1 ? "s" : ""}
      </p>
    </div>
  );
}
