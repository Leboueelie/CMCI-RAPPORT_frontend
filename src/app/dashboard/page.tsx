"use client";

import { useDashboard } from "@/hooks/useDashboard";
import { useAuth } from "@/hooks/useAuth";
import { StatCards } from "@/components/dashboard/StatCards";
import { RapportsAttente } from "@/components/dashboard/RapportsAttente";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { AlertTriangle, ArrowRight, LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useDashboard();

  // Gestion du chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Gestion des erreurs
  if (isError || !data) {
    return (
      <EmptyState
        icon={<AlertTriangle className="text-danger" size={48} />}
        title="Erreur de chargement"
        description="Impossible de récupérer les données du tableau de bord. Veuillez réessayer."
        action={
          <Button variant="primary" onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        }
      />
    );
  }

  const isAdmin = user?.role === "ADMIN_SYSTEME";
  const showAttente =
    user?.role === "DIRIGEANT_ZONE" ||
    user?.role === "MISSIONNAIRE" ||
    user?.role === "RESPONSABLE_REGIONAL" ||
    user?.role === "RESPONSABLE_NATIONAL" ||
    isAdmin;

  return (
    <div className="space-y-6">
      {/* En-tête avec titre et indication du périmètre */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-2">
          <LayoutDashboard className="text-primary" size={28} />
          Tableau de bord
        </h1>
        <p className="text-text-secondary mt-1">
          {data.perimetre.territoire} • {data.perimetre.role}
        </p>
      </div>

      {/* Cartes de statistiques */}
      <StatCards
        global={data.global}
        attenteCount={data.attente.total}
        role={user?.role}
      />

      {/* Section : Rapports en attente + Rapports en retard (2 colonnes sur desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {showAttente && (
          <RapportsAttente
            rapports={data.attente.rapports}
            total={data.attente.total}
          />
        )}

        {/* Rapports en retard (assemblées sans rapport ce mois-ci) */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-text-primary">
              Assemblées sans rapport{" "}
              <span className="text-danger">({data.retard.total})</span>
            </h3>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.retard.assemblees.length === 0 ? (
              <EmptyState
                title="Aucun retard"
                description="Toutes les assemblées ont soumis leur rapport ce mois-ci."
              />
            ) : (
              <>
                {data.retard.assemblees.map((ass) => (
                  <div
                    key={ass.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <div>
                      <p className="font-medium text-text-primary">{ass.nom}</p>
                      <p className="text-sm text-text-secondary">
                        {ass.territoire.nom}
                      </p>
                    </div>
                    <Badge variant="danger">En retard</Badge>
                  </div>
                ))}
                {data.retard.total > data.retard.assemblees.length && (
                  <Link
                    href="/assemblees"
                    className="flex items-center justify-center text-primary text-sm mt-2"
                  >
                    Voir toutes les assemblées en retard{" "}
                    <ArrowRight size={16} className="ml-1" />
                  </Link>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats supplémentaires (admin) */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-text-primary">
              Utilisateurs
            </h3>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-sm text-text-secondary">Actifs</p>
                <p className="text-2xl font-bold text-secondary">
                  {data.global.utilisateurs.actifs}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Inactifs</p>
                <p className="text-2xl font-bold text-danger">
                  {data.global.utilisateurs.inactifs}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Total</p>
                <p className="text-2xl font-bold text-text-primary">
                  {data.global.utilisateurs.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
