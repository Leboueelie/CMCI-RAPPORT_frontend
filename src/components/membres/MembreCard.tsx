import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import type { Membre } from "@/hooks/useMembres";

const statutVariant: Record<
  string,
  "success" | "warning" | "info" | "danger" | "default"
> = {
  ACTIF: "success",
  RETROGRADE: "danger",
};

const statutLabel: Record<string, string> = {
  ACTIF: "Actif",
  RETROGRADE: "Rétrogradé",
};

interface MembreCardProps {
  membre: Membre;
}

export function MembreCard({ membre }: MembreCardProps) {
  if (!membre) return null;

  const badgeVariant = statutVariant[membre.statut] || "default";
  const badgeText = statutLabel[membre.statut] || membre.statut;
  const initiales = `${membre.prenom?.[0] || ""}${membre.nom?.[0] || ""}`;

  // Récupérer les noms des fonctions (si disponibles)
  const fonctionNoms =
    membre.fonctions?.map((f) => f.fonction?.nom).filter(Boolean) || [];

  return (
    <Link href={`/membres/${membre.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardContent className="p-4 flex items-center gap-4">
          <Avatar src={membre.photo} fallback={initiales} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-text-primary truncate">
              {membre.prenom} {membre.nom}
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant={badgeVariant}>{badgeText}</Badge>
              {fonctionNoms.length > 0 && (
                <>
                  {fonctionNoms.map((nom, idx) => (
                    <Badge key={idx} variant="default">
                      {nom}
                    </Badge>
                  ))}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
