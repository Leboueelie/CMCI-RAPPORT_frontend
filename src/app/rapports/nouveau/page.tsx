"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useCreateRapport } from "@/hooks/useRapports";
import {
  useAssembleesSelect,
  useAssembleeDuDirigeant,
} from "@/hooks/useAssemblees";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { toast } from "sonner";

// Type simple pour le formulaire (sans Zod)
interface RapportFormData {
  assembleeId: string;
  territoireId: string;
  periode: string;
  dateDebut: string;
  dateFin: string;
  activites: string;
  effectifs: number;
  temoignages?: string;
  problemes?: string;
  besoins?: string;
  recommandations?: string;
  fichierJoint?: string;
}

export default function NouveauRapportPage() {
  const { user } = useAuth();
  const router = useRouter();
  const createRapport = useCreateRapport();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: assemblees } = useAssembleesSelect();
  const { data: assembleeDirigeant } = useAssembleeDuDirigeant();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RapportFormData>({
    defaultValues: {
      periode: "",
      dateDebut: "",
      dateFin: "",
      activites: "",
      effectifs: 0,
      temoignages: "",
      problemes: "",
      besoins: "",
      recommandations: "",
      fichierJoint: "",
    },
  });

  const selectedAssembleeId = watch("assembleeId");

  // Pré-remplissage automatique pour le dirigeant
  useEffect(() => {
    if (user?.role === "DIRIGEANT_ASSEMBLEE" && assembleeDirigeant) {
      setValue("assembleeId", assembleeDirigeant.id);
      setValue("territoireId", assembleeDirigeant.territoireId);
    }
  }, [user, assembleeDirigeant, setValue]);

  // Mise à jour automatique du territoire lorsque l'assemblée change (pour admin)
  useEffect(() => {
    if (selectedAssembleeId && assemblees) {
      const ass = assemblees.find((a) => a.id === selectedAssembleeId);
      if (ass) {
        setValue("territoireId", ass.territoireId);
      }
    }
  }, [selectedAssembleeId, assemblees, setValue]);

  const onSubmit = async (data: RapportFormData) => {
    setIsSubmitting(true);
    try {
      // S'assurer que les effectifs sont bien un nombre
      await createRapport.mutateAsync({
        ...data,
        effectifs: Number(data.effectifs),
      });
      toast.success("Rapport créé avec succès (brouillon).");
      router.push("/rapports");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Erreur lors de la création",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAdmin = user?.role === "ADMIN_SYSTEME";
  const isDirigeant = user?.role === "DIRIGEANT_ASSEMBLEE";

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <Link
          href="/rapports"
          className="text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            Nouveau rapport
          </h1>
          <p className="text-text-secondary text-sm">
            Créez un rapport d'activité (brouillon)
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Informations générales */}
        <Card>
          <CardHeader>Informations générales</CardHeader>
          <CardContent className="space-y-4">
            {/* Sélection de l'assemblée */}
            {isAdmin && (
              <Select
                label="Assemblée"
                placeholder="Sélectionner une assemblée"
                options={
                  assemblees?.map((a) => ({ value: a.id, label: a.nom })) || []
                }
                error={errors.assembleeId?.message}
                onChange={(e) =>
                  setValue("assembleeId", e.target.value, {
                    shouldValidate: true,
                  })
                }
              />
            )}
            {isDirigeant && (
              <Input
                label="Assemblée"
                value={assembleeDirigeant?.nom || ""}
                disabled
              />
            )}

            {/* Période */}
            <Input
              label="Période"
              placeholder="Ex: Mai 2026"
              {...register("periode", { required: "La période est requise" })}
              error={errors.periode?.message}
            />

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Date début"
                type="date"
                {...register("dateDebut", {
                  required: "La date de début est requise",
                })}
                error={errors.dateDebut?.message}
              />
              <Input
                label="Date fin"
                type="date"
                {...register("dateFin", {
                  required: "La date de fin est requise",
                })}
                error={errors.dateFin?.message}
              />
            </div>

            {/* Effectifs */}
            <Input
              label="Effectifs"
              type="number"
              {...register("effectifs", {
                required: "Les effectifs sont requis",
              })}
              error={errors.effectifs?.message}
            />
          </CardContent>
        </Card>

        {/* Activités et autres sections */}
        <Card>
          <CardHeader>Contenu du rapport</CardHeader>
          <CardContent className="space-y-4">
            {/* Activités obligatoires */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary">
                Activités réalisées *
              </label>
              <textarea
                className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-primary/50"
                rows={4}
                {...register("activites", {
                  required: "Les activités sont requises",
                })}
              />
              {errors.activites && (
                <p className="text-sm text-danger">
                  {errors.activites.message}
                </p>
              )}
            </div>

            {/* Champs optionnels */}
            <Input
              label="Témoignages"
              placeholder="Nouvelles conversions..."
              {...register("temoignages")}
            />
            <Input
              label="Problèmes rencontrés"
              placeholder="Manque de sièges..."
              {...register("problemes")}
            />
            <Input
              label="Besoins"
              placeholder="Bibles, chaises..."
              {...register("besoins")}
            />
            <Input
              label="Recommandations"
              placeholder="Suggestions..."
              {...register("recommandations")}
            />
            <Input
              label="Fichier joint (URL)"
              placeholder="Lien vers un document..."
              {...register("fichierJoint")}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <Button variant="ghost" onClick={() => router.push("/rapports")}>
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            icon={<FileText size={18} />}
          >
            Créer le rapport
          </Button>
        </div>
      </form>
    </div>
  );
}
