"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ClipboardCheck, Eye, Check, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFileAttente } from "@/hooks/useValidations";
import type { Rapport } from "@/hooks/useRapports";
import { RapportCard } from "@/components/rapports/RapportCard";
import { Modal } from "@/components/ui/Modal";
import { RapportValidation } from "@/components/rapports/RapportValidation";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";

export default function ValidationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { data, isLoading, isError } = useFileAttente();

  const [selectedRapport, setSelectedRapport] = useState<Rapport | null>(null);

  // Vérifier que l'utilisateur a le droit de valider
  if (
    user &&
    user.role !== "ADMIN_SYSTEME" &&
    user.role !== "DIRIGEANT_ZONE" &&
    user.role !== "MISSIONNAIRE" &&
    user.role !== "RESPONSABLE_REGIONAL" &&
    user.role !== "RESPONSABLE_NATIONAL"
  ) {
    return (
      <EmptyState
        icon={<AlertTriangle className="text-danger" size={48} />}
        title="Accès restreint"
        description="Vous n'avez pas les droits pour accéder à cette page."
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <EmptyState
        icon={<AlertTriangle className="text-danger" size={48} />}
        title="Erreur de chargement"
        description="Impossible de récupérer la file d’attente."
        action={
          <Button variant="primary" onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-2">
          <ClipboardCheck className="text-primary" size={28} />
          Rapports à valider
        </h1>
        <p className="text-text-secondary mt-1">
          {data.total} rapport{data.total > 1 ? "s" : ""} en attente de votre
          validation
        </p>
      </div>

      {/* Liste */}
      {data.rapports.length === 0 ? (
        <EmptyState
          title="Aucun rapport en attente"
          description="Tous les rapports ont été traités pour le moment."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.rapports.map((rapport) => (
            <RapportCard
              key={rapport.id}
              rapport={rapport}
              onValider={() => setSelectedRapport(rapport)}
            />
          ))}
        </div>
      )}

      {/* Modale de validation */}
      {selectedRapport && (
        <Modal
          isOpen={!!selectedRapport}
          onClose={() => setSelectedRapport(null)}
          title={`Validation : ${selectedRapport.periode}`}
          size="lg"
        >
          <RapportValidation
            rapport={selectedRapport}
            onClose={() => setSelectedRapport(null)}
          />
        </Modal>
      )}
    </div>
  );
}
