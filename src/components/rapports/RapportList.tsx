"use client";

import React from "react";
import { useRapportsList } from "@/hooks/useRapports";
import { RapportCard } from "./RapportCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton"; // chemin corrigé

// Définition locale du type de filtres
interface RapportsFilters {
  statut?: "BROUILLON" | "SOUMIS" | "VALIDE" | "REJETE";
  assembleeId?: string;
  territoireId?: string;
  periode?: string;
  dateDebut?: string;
  dateFin?: string;
  page?: number;
  limit?: number;
}

interface RapportListProps {
  filters?: RapportsFilters;
  onValiderRapport?: (rapport: any) => void;
}

export function RapportList({
  filters = {},
  onValiderRapport,
}: RapportListProps) {
  const { data, isLoading, isError, refetch } = useRapportsList(filters);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface rounded-xl border border-border p-5 space-y-4"
          >
            <div className="flex justify-between">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2 pt-2 border-t border-border">
              <Skeleton className="h-8 flex-1 rounded-lg" />
              <Skeleton className="h-8 flex-1 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <EmptyState
        icon={<AlertTriangle className="text-danger" size={48} />}
        title="Erreur de chargement"
        description="Impossible de récupérer la liste des rapports."
        action={
          <Button variant="primary" onClick={() => refetch()}>
            Réessayer
          </Button>
        }
      />
    );
  }

  if (data.data.length === 0) {
    return (
      <EmptyState
        title="Aucun rapport trouvé"
        description="Créez votre premier rapport pour commencer."
        action={
          <Button
            variant="primary"
            onClick={() => (window.location.href = "/rapports/nouveau")}
          >
            Créer un rapport
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.data.map((rapport) => (
          <RapportCard
            key={rapport.id}
            rapport={rapport}
            onValider={() => onValiderRapport?.(rapport)}
          />
        ))}
      </div>
      <p className="text-sm text-text-secondary mt-4 text-center">
        {data.meta.total} rapport{data.meta.total > 1 ? "s" : ""}
      </p>
    </div>
  );
}
