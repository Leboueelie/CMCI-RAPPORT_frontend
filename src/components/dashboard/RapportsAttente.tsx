import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import type { DashboardSummary } from "@/hooks/useDashboard";

interface RapportsAttenteProps {
  rapports: DashboardSummary["attente"]["rapports"];
  total: number;
}

export function RapportsAttente({ rapports, total }: RapportsAttenteProps) {
  if (rapports.length === 0) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            title="Aucun rapport en attente"
            description="Tous les rapports ont été traités pour le moment."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">
            Rapports en attente <span className="text-warning">({total})</span>
          </h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {rapports.map((rapport) => (
          <Link
            key={rapport.id}
            href={`/rapports/${rapport.id}`}
            className="block p-3 rounded-lg border border-border hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-text-primary">
                  {rapport.assemblee.nom}
                </p>
                <p className="text-sm text-text-secondary">
                  {rapport.periode} • Soumis par{" "}
                  <span className="font-medium">
                    {rapport.soumisPar.prenom || rapport.soumisPar.username}
                  </span>
                </p>
              </div>
              <Badge variant="warning">En attente</Badge>
            </div>
          </Link>
        ))}
      </CardContent>
      {total > rapports.length && (
        <CardFooter>
          <Link href="/validations" className="w-full">
            <Button variant="ghost" className="w-full text-primary">
              Voir les {total} rapports{" "}
              <ArrowRight size={16} className="ml-1" />
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
