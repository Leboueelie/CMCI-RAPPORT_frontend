"use client";

import React from "react";
import Link from "next/link";
import { Calendar, MapPin, Users, Eye, Send, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Rapport } from "@/hooks/useRapports";
import { useAuth } from "@/hooks/useAuth";
import { useSoumettreRapport } from "@/hooks/useRapports";
import { toast } from "sonner";

// Mapping statut -> couleur du badge
const statutVariant: Record<
  string,
  "success" | "warning" | "danger" | "info" | "default"
> = {
  BROUILLON: "default",
  SOUMIS: "warning",
  VALIDE: "success",
  REJETE: "danger",
};

interface RapportCardProps {
  rapport: Rapport;
  onValider?: () => void; // callback pour ouvrir le dialogue de validation (défini plus tard)
}

export function RapportCard({ rapport, onValider }: RapportCardProps) {
  const { user } = useAuth();
  const soumettre = useSoumettreRapport();

  const isAuteur = rapport.soumisParId === user?.id;
  const peutSoumettre =
    rapport.statut === "BROUILLON" &&
    (isAuteur || user?.role === "ADMIN_SYSTEME");
  const peutValider =
    rapport.statut === "SOUMIS" &&
    (user?.role === "DIRIGEANT_ZONE" ||
      user?.role === "MISSIONNAIRE" ||
      user?.role === "RESPONSABLE_REGIONAL" ||
      user?.role === "RESPONSABLE_NATIONAL" ||
      user?.role === "ADMIN_SYSTEME");

  const handleSoumettre = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await soumettre.mutateAsync(rapport.id);
      toast.success("Rapport soumis avec succès !");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Erreur lors de la soumission",
      );
    }
  };

  const handleValiderClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onValider?.();
  };

  return (
    <Link href={`/rapports/${rapport.id}`} className="block">
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardContent className="p-4 md:p-5 space-y-3">
          {/* En-tête : période et statut */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-text-primary truncate">
                {rapport.periode}
              </h3>
              <div className="flex items-center gap-1 text-sm text-text-secondary mt-0.5">
                <Users size={14} />
                <span className="truncate">
                  {rapport.assemblee?.nom || "Assemblée inconnue"}
                </span>
              </div>
            </div>
            <Badge variant={statutVariant[rapport.statut] || "default"}>
              {rapport.statut}
            </Badge>
          </div>

          {/* Métadonnées */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary">
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span className="truncate">
                {rapport.territoire?.nom || "Territoire inconnu"}
              </span>
            </div>
            {rapport.dateSoumission && (
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>
                  {new Date(rapport.dateSoumission).toLocaleDateString("fr-FR")}
                </span>
              </div>
            )}
          </div>

          {/* Actions contextuelles */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              icon={<Eye size={16} />}
              className="flex-1"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Navigation déjà gérée par le lien parent
              }}
            >
              Détails
            </Button>

            {peutSoumettre && (
              <Button
                variant="primary"
                size="sm"
                icon={<Send size={16} />}
                loading={soumettre.isPending}
                onClick={handleSoumettre}
                className="flex-1"
              >
                Soumettre
              </Button>
            )}

            {peutValider && (
              <Button
                variant="secondary"
                size="sm"
                icon={<Check size={16} />}
                onClick={handleValiderClick}
                className="flex-1"
              >
                Valider
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
