"use client";

import React, { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useValiderRapport, type Rapport } from "@/hooks/useRapports";
import { toast } from "sonner";

interface RapportValidationProps {
  rapport: Rapport;
  onClose: () => void;
}

export function RapportValidation({
  rapport,
  onClose,
}: RapportValidationProps) {
  const [commentaire, setCommentaire] = useState("");
  const valider = useValiderRapport();

  const handleAction = async (action: "valider" | "rejeter") => {
    if (action === "rejeter" && !commentaire.trim()) {
      toast.error("Un commentaire est obligatoire pour rejeter un rapport.");
      return;
    }

    try {
      await valider.mutateAsync({
        id: rapport.id,
        action,
        commentaire: action === "rejeter" ? commentaire : undefined,
      });
      toast.success(
        action === "valider"
          ? "Rapport validé avec succès."
          : "Rapport rejeté.",
      );
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de l'action.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Résumé du rapport */}
      <div className="p-4 bg-gray-50 rounded-lg border border-border">
        <p className="font-semibold text-text-primary">
          {rapport.assemblee?.nom || "Assemblée inconnue"}
        </p>
        <p className="text-sm text-text-secondary">{rapport.periode}</p>
        <p className="text-sm text-text-secondary mt-1">
          Effectifs : {rapport.effectifs}
        </p>
      </div>

      {/* Champ commentaire (obligatoire pour rejet) */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">
          Commentaire (obligatoire pour un rejet)
        </label>
        <Input
          placeholder="Exprimez le motif du rejet..."
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
        />
      </div>

      {/* Boutons d'action */}
      <div className="flex gap-3 justify-end">
        <Button variant="ghost" onClick={onClose}>
          Annuler
        </Button>
        <Button
          variant="danger"
          icon={<X size={16} />}
          onClick={() => handleAction("rejeter")}
          loading={valider.isPending}
        >
          Rejeter
        </Button>
        <Button
          variant="secondary"
          icon={<Check size={16} />}
          onClick={() => handleAction("valider")}
          loading={valider.isPending}
        >
          Valider
        </Button>
      </div>
    </div>
  );
}
