"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { RapportList } from "@/components/rapports/RapportList";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { RapportValidation } from "@/components/rapports/RapportValidation";
import type { Rapport, StatutRapport } from "@/hooks/useRapports";

export default function RapportsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [statut, setStatut] = useState<StatutRapport | "">("");
  const [periode, setPeriode] = useState("");
  const [rapportToValidate, setRapportToValidate] = useState<Rapport | null>(
    null,
  );

  const filters = {
    statut: statut || undefined,
    periode: periode || undefined,
  };

  const canCreate =
    user?.role === "DIRIGEANT_ASSEMBLEE" || user?.role === "ADMIN_SYSTEME";

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            Rapports
          </h1>
          <p className="text-text-secondary mt-1">
            Consultez et gérez vos rapports
          </p>
        </div>
        {canCreate && (
          <Button
            variant="primary"
            icon={<Plus size={18} />}
            onClick={() => router.push("/rapports/nouveau")}
          >
            Nouveau rapport
          </Button>
        )}
      </div>

      {/* Filtres */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          placeholder="Rechercher par période..."
          icon={<Search size={18} />}
          value={periode}
          onChange={(e) => setPeriode(e.target.value)}
        />
        <Select
          placeholder="Tous les statuts"
          options={[
            { value: "", label: "Tous les statuts" },
            { value: "BROUILLON", label: "Brouillon" },
            { value: "SOUMIS", label: "Soumis" },
            { value: "VALIDE", label: "Validé" },
            { value: "REJETE", label: "Rejeté" },
          ]}
          value={statut}
          onChange={(e) => setStatut(e.target.value as StatutRapport)}
        />
      </div>

      {/* Liste des rapports */}
      <RapportList
        filters={filters}
        onValiderRapport={(rapport) => setRapportToValidate(rapport)}
      />

      {/* Modale de validation */}
      {rapportToValidate && (
        <Modal
          isOpen={!!rapportToValidate}
          onClose={() => setRapportToValidate(null)}
          title="Valider ou rejeter le rapport"
          size="lg"
        >
          <RapportValidation
            rapport={rapportToValidate}
            onClose={() => setRapportToValidate(null)}
          />
        </Modal>
      )}
    </div>
  );
}
