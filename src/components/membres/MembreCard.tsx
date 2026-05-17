import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import type { Membre } from "@/hooks/useMembres";

// Mapping des statuts vers les variants de couleur du Badge
const statutVariant: Record<
  string,
  "success" | "warning" | "info" | "danger" | "default"
> = {
  ACTIF: "success",
  BAPTISE: "info",
  NOUVEAU: "info",
  REPENTANT: "warning",
  BRISER: "warning",
  INACTIF: "default",
  DECEDE: "danger",
  DEMISSIONNE: "danger",
};

// Mapping des statuts vers un libellé lisible
const statutLabel: Record<string, string> = {
  ACTIF: "Actif",
  BAPTISE: "Baptisé",
  NOUVEAU: "Nouveau",
  REPENTANT: "Repentant",
  BRISER: "Brisé",
  INACTIF: "Inactif",
  DECEDE: "Décédé",
  DEMISSIONNE: "Démissionné",
};

interface MembreCardProps {
  membre: Membre;
}

export function MembreCard({ membre }: MembreCardProps) {
  if (!membre) return null;

  const badgeVariant = statutVariant[membre.statut] || "default";
  const badgeText = statutLabel[membre.statut] || membre.statut;
  const initiales = `${membre.prenom?.[0] || ""}${membre.nom?.[0] || ""}`;

  return (
    <Link href={`/membres/${membre.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardContent className="p-4 flex items-center gap-4">
          <Avatar src={membre.photo} fallback={initiales} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-text-primary truncate">
              {membre.prenom} {membre.nom}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={badgeVariant}>{badgeText}</Badge>
              {membre.fonction && membre.fonction !== "MEMBRE_SIMPLE" && (
                <span className="text-xs text-text-secondary truncate">
                  {membre.fonction}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
