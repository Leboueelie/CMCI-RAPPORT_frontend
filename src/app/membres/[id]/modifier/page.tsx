"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useMembreDetail, useUpdateMembre } from "@/hooks/useMembres";
import {
  useAssembleesSelect,
  useAssembleeDuDirigeant,
} from "@/hooks/useAssemblees";
import { useFonctions } from "@/hooks/useFonctions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { toast } from "sonner";

// Type simple pour le formulaire (sans Zod)
interface MembreFormData {
  assembleeId: string;
  nom: string;
  prenom: string;
  dateNaissance?: string;
  dateConversion?: string;
  contact?: string;
  profession?: string;
  baptiseEau?: boolean;
  baptiseSaintEsprit?: boolean;
  liensBrises?: boolean;
  situationMatrimoniale?: string;
  nombreEnfants?: number;
  faiseurDisciple?: string;
  niveauAcademique?: string;
  statut?: string;
  fonctionIds?: string[];
  photo?: string;
  notes?: string;
}

export default function ModifierMembrePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: membre, isLoading } = useMembreDetail(id);
  const updateMembre = useUpdateMembre();
  const { data: assemblees } = useAssembleesSelect();
  const { data: assembleeDirigeant } = useAssembleeDuDirigeant();
  const { data: fonctions, isLoading: fonctionsLoading } = useFonctions();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role === "ADMIN_SYSTEME";
  const isDirigeant = user?.role === "DIRIGEANT_ASSEMBLEE";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<MembreFormData>({
    defaultValues: {
      statut: "ACTIF",
      baptiseEau: false,
      baptiseSaintEsprit: false,
      liensBrises: false,
      nombreEnfants: 0,
      fonctionIds: [],
    },
  });

  // Pré-remplissage
  useEffect(() => {
    if (membre) {
      const existingIds =
        membre.fonctions?.map((f: any) => f.fonction?.id) || [];
      reset({
        assembleeId: membre.assembleeId,
        nom: membre.nom,
        prenom: membre.prenom,
        dateNaissance: membre.dateNaissance
          ? membre.dateNaissance.split("T")[0]
          : "",
        dateConversion: membre.dateConversion || "",
        contact: membre.contact || "",
        profession: membre.profession || "",
        baptiseEau: membre.baptiseEau ?? false,
        baptiseSaintEsprit: membre.baptiseSaintEsprit ?? false,
        liensBrises: membre.liensBrises ?? false,
        situationMatrimoniale: membre.situationMatrimoniale || "",
        nombreEnfants: membre.nombreEnfants ?? 0,
        faiseurDisciple: membre.faiseurDisciple || "",
        niveauAcademique: membre.niveauAcademique || "",
        statut: membre.statut || "ACTIF",
        fonctionIds: existingIds,
        photo: membre.photo || "",
        notes: membre.notes || "",
      });
    }
  }, [membre, reset]);

  const selectedFonctionIds = watch("fonctionIds") || [];

  const toggleFonction = (fonctionId: string) => {
    if (selectedFonctionIds.includes(fonctionId)) {
      setValue(
        "fonctionIds",
        selectedFonctionIds.filter((id) => id !== fonctionId),
      );
    } else {
      setValue("fonctionIds", [...selectedFonctionIds, fonctionId]);
    }
  };

  const onSubmit = async (data: MembreFormData) => {
    const payload = { ...data };
    if (!payload.dateNaissance) delete payload.dateNaissance;
    if (!payload.dateConversion) delete payload.dateConversion;

    setIsSubmitting(true);
    try {
      await updateMembre.mutateAsync({
        id,
        ...payload,
        statut: payload.statut as "ACTIF" | "RETROGRADE" | undefined,
      });
      toast.success("Membre modifié avec succès.");
      router.push(`/membres/${id}`);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Erreur lors de la modification",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || fonctionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!membre) {
    return (
      <div className="text-center py-12 text-text-secondary">
        Membre introuvable.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href={`/membres/${id}`}
          className="text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            Modifier le membre
          </h1>
          <p className="text-text-secondary text-sm">
            {membre.prenom} {membre.nom}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>Assemblée</CardHeader>
          <CardContent>
            {isDirigeant ? (
              <Input
                label="Assemblée"
                value={assembleeDirigeant?.nom || membre.assembleeId}
                disabled
              />
            ) : (
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>Identité</CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nom"
                {...register("nom", { required: "Le nom est requis" })}
                error={errors.nom?.message}
              />
              <Input
                label="Prénom"
                {...register("prenom", { required: "Le prénom est requis" })}
                error={errors.prenom?.message}
              />
            </div>
            <Input
              label="Date de naissance"
              type="date"
              {...register("dateNaissance")}
            />
            <Input
              label="Date de conversion"
              placeholder="Ex: Mars 2020..."
              {...register("dateConversion")}
            />
            <Input label="Contact" {...register("contact")} />
            <Input label="Profession" {...register("profession")} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>Situation spirituelle & familiale</CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  {...register("baptiseEau")}
                  className="w-4 h-4 rounded border-gray-300"
                />
                Baptisé d'eau
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  {...register("baptiseSaintEsprit")}
                  className="w-4 h-4 rounded border-gray-300"
                />
                Baptisé du Saint‑Esprit
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  {...register("liensBrises")}
                  className="w-4 h-4 rounded border-gray-300"
                />
                Liens brisés
              </label>
            </div>
            <Select
              label="Situation matrimoniale"
              placeholder="Sélectionnez"
              options={[
                { value: "", label: "Non précisé" },
                { value: "MARIE", label: "Marié(e)" },
                { value: "CELIBATAIRE", label: "Célibataire" },
                { value: "CONCUBINAGE", label: "Concubinage" },
                { value: "TRADITIONNEL", label: "Traditionnel" },
                { value: "VEUVE", label: "Veuve/Veuf" },
              ]}
              {...register("situationMatrimoniale")}
            />
            <Input
              label="Nombre d'enfants"
              type="number"
              min={0}
              {...register("nombreEnfants")}
            />
            <Input
              label="Faiseur de disciple / Pasteur référent"
              {...register("faiseurDisciple")}
            />
            <Input
              label="Niveau académique / Profession scolaire"
              {...register("niveauAcademique")}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>Fonctions et statut</CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">
                Fonctions
              </label>
              <div className="flex flex-wrap gap-3">
                {fonctions?.map((f) => (
                  <label key={f.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedFonctionIds.includes(f.id)}
                      onChange={() => toggleFonction(f.id)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    {f.nom}
                  </label>
                ))}
              </div>
            </div>
            <Select
              label="Statut"
              options={[
                { value: "ACTIF", label: "Actif" },
                { value: "RETROGRADE", label: "Rétrogradé" },
              ]}
              {...register("statut")}
            />
            <Input label="Notes" {...register("notes")} />
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-end">
          <Button variant="ghost" onClick={() => router.push(`/membres/${id}`)}>
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
