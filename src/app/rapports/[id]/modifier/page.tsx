"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRapportDetail, useUpdateRapport } from "@/hooks/useRapports";
import {
  useAssembleesSelect,
  useAssembleeDuDirigeant,
} from "@/hooks/useAssemblees";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

// Schéma de validation (identique à la création)
const rapportSchema = z.object({
  assembleeId: z.string().min(1, "L'assemblée est requise"),
  territoireId: z.string().min(1, "Le territoire est requis"),
  periode: z.string().min(1, "La période est requise"),
  dateDebut: z.string().min(1, "La date de début est requise"),
  dateFin: z.string().min(1, "La date de fin est requise"),
  activites: z.string().min(1, "Les activités sont requises"),
  effectifs: z.coerce.number().int().min(0, "Doit être ≥ 0"),
  temoignages: z.string().optional(),
  problemes: z.string().optional(),
  besoins: z.string().optional(),
  recommandations: z.string().optional(),
  fichierJoint: z.string().optional(),
});

type RapportFormData = z.infer<typeof rapportSchema>;

export default function ModifierRapportPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const { data: rapport, isLoading } = useRapportDetail(id);
  const updateRapport = useUpdateRapport();

  const { data: assemblees } = useAssembleesSelect();
  const { data: assembleeDirigeant } = useAssembleeDuDirigeant();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role === "ADMIN_SYSTEME";
  const isDirigeant = user?.role === "DIRIGEANT_ASSEMBLEE";
  const isAuteur = rapport?.soumisParId === user?.id;

  // Vérification des droits : l'utilisateur doit être l'auteur ou admin
  const peutModifier = rapport?.statut === "BROUILLON" && (isAuteur || isAdmin);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RapportFormData>({
    resolver: zodResolver(rapportSchema),
  });

  const selectedAssembleeId = watch("assembleeId");
  const selectedTerritoireId = watch("territoireId");

  // Pré-remplissage du formulaire
  useEffect(() => {
    if (rapport) {
      reset({
        assembleeId: rapport.assembleeId,
        territoireId: rapport.territoireId,
        periode: rapport.periode,
        dateDebut: rapport.dateDebut?.split("T")[0] || "",
        dateFin: rapport.dateFin?.split("T")[0] || "",
        activites: rapport.activites,
        effectifs: rapport.effectifs,
        temoignages: rapport.temoignages || "",
        problemes: rapport.problemes || "",
        besoins: rapport.besoins || "",
        recommandations: rapport.recommandations || "",
        fichierJoint: rapport.fichierJoint || "",
      });
    }
  }, [rapport, reset]);

  // Mise à jour automatique du territoire quand l'assemblée change (pour admin)
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
      await updateRapport.mutateAsync({ id, ...data });
      toast.success("Rapport modifié avec succès.");
      router.push(`/rapports/${id}`);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Erreur lors de la modification",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Rapport introuvable
  if (!rapport) {
    return (
      <EmptyState
        icon={<AlertTriangle className="text-danger" size={48} />}
        title="Rapport introuvable"
        description="Ce rapport n'existe pas ou a été supprimé."
        action={
          <Button variant="primary" onClick={() => router.push("/rapports")}>
            Retour à la liste
          </Button>
        }
      />
    );
  }

  // Accès interdit si pas en brouillon ou pas les droits
  if (!peutModifier) {
    return (
      <EmptyState
        icon={<AlertTriangle className="text-danger" size={48} />}
        title="Modification impossible"
        description="Le rapport ne peut plus être modifié car il a déjà été soumis, ou vous n'en êtes pas l'auteur."
        action={
          <Button
            variant="primary"
            onClick={() => router.push(`/rapports/${id}`)}
          >
            Voir le rapport
          </Button>
        }
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <Link
          href={`/rapports/${id}`}
          className="text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            Modifier le rapport
          </h1>
          <p className="text-text-secondary text-sm">{rapport.periode}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Informations générales */}
        <Card>
          <CardHeader>Informations générales</CardHeader>
          <CardContent className="space-y-4">
            {isAdmin && (
              <Select
                label="Assemblée"
                placeholder="Sélectionner une assemblée"
                options={
                  assemblees?.map((a) => ({ value: a.id, label: a.nom })) || []
                }
                error={errors.assembleeId?.message}
                onChange={(e) => setValue("assembleeId", e.target.value)}
              />
            )}
            {isDirigeant && (
              <Input
                label="Assemblée"
                value={assembleeDirigeant?.nom || ""}
                disabled
              />
            )}
            <Input
              label="Période"
              placeholder="Ex: Mai 2026"
              {...register("periode")}
              error={errors.periode?.message}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Date début"
                type="date"
                {...register("dateDebut")}
                error={errors.dateDebut?.message}
              />
              <Input
                label="Date fin"
                type="date"
                {...register("dateFin")}
                error={errors.dateFin?.message}
              />
            </div>
            <Input
              label="Effectifs"
              type="number"
              {...register("effectifs")}
              error={errors.effectifs?.message}
            />
          </CardContent>
        </Card>

        {/* Contenu du rapport */}
        <Card>
          <CardHeader>Contenu du rapport</CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary">
                Activités réalisées *
              </label>
              <textarea
                className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-primary/50"
                rows={4}
                {...register("activites")}
              />
              {errors.activites && (
                <p className="text-sm text-danger">
                  {errors.activites.message}
                </p>
              )}
            </div>
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
          <Button
            variant="ghost"
            onClick={() => router.push(`/rapports/${id}`)}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            icon={<Save size={18} />}
          >
            Enregistrer
          </Button>
        </div>
      </form>
    </div>
  );
}
