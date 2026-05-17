"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { UserPlus, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCreateMembre } from "@/hooks/useMembres";
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
import Link from "next/link";

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

export default function NouveauMembrePage() {
  const { user } = useAuth();
  const router = useRouter();
  const createMembre = useCreateMembre();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: assemblees } = useAssembleesSelect();
  const { data: assembleeDirigeant } = useAssembleeDuDirigeant();
  const { data: fonctions, isLoading: fonctionsLoading } = useFonctions();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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

  useEffect(() => {
    if (user?.role === "DIRIGEANT_ASSEMBLEE") {
      if (assembleeDirigeant) {
        setValue("assembleeId", assembleeDirigeant.id);
      } else {
        setValue("assembleeId", "");
      }
    }
  }, [user, assembleeDirigeant, setValue]);

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
    // Nettoyage des champs vides
    const payload = { ...data };
    if (!payload.dateNaissance) delete payload.dateNaissance;
    if (!payload.dateConversion) delete payload.dateConversion;

    // Forcer le typage de statut pour correspondre au type attendu par la mutation
    const cleanPayload = {
      ...payload,
      statut: (payload.statut as "ACTIF" | "RETROGRADE") || undefined,
    };

    setIsSubmitting(true);
    try {
      await createMembre.mutateAsync(cleanPayload);
      toast.success("Membre créé avec succès !");
      router.push("/membres");
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

  if (fonctionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/membres"
          className="text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            Nouveau membre
          </h1>
          <p className="text-text-secondary text-sm">
            Ajoutez un membre à votre assemblée
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Assemblée */}
        <Card>
          <CardHeader>Assemblée</CardHeader>
          <CardContent>
            {isDirigeant && (
              <>
                {assembleeDirigeant ? (
                  <Input
                    label="Assemblée"
                    value={assembleeDirigeant.nom}
                    disabled
                    error={errors.assembleeId?.message}
                  />
                ) : (
                  <div className="p-3 bg-warning/10 text-warning rounded-lg text-sm">
                    Aucune assemblée ne vous est assignée. Contactez
                    l'administrateur.
                  </div>
                )}
              </>
            )}
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
          </CardContent>
        </Card>

        {/* Identité */}
        <Card>
          <CardHeader>Identité</CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nom"
                placeholder="Kouassi"
                {...register("nom", { required: "Le nom est requis" })}
                error={errors.nom?.message}
              />
              <Input
                label="Prénom"
                placeholder="Jean"
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
              placeholder="Ex: Mars 2020, Janvier 2022..."
              {...register("dateConversion")}
            />
            <Input
              label="Contact"
              placeholder="+225 01 23 45 67 89"
              {...register("contact")}
            />
            <Input
              label="Profession"
              placeholder="Commerçant"
              {...register("profession")}
            />
          </CardContent>
        </Card>

        {/* Situation spirituelle & familiale */}
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
              placeholder="Pasteur BAMS"
              {...register("faiseurDisciple")}
            />
            <Input
              label="Niveau académique / Profession scolaire"
              placeholder="Licence"
              {...register("niveauAcademique")}
            />
          </CardContent>
        </Card>

        {/* Fonctions et statut */}
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
            <Input
              label="Notes (optionnel)"
              placeholder="Observations..."
              {...register("notes")}
            />
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-end">
          <Button variant="ghost" onClick={() => router.push("/membres")}>
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            icon={<UserPlus size={18} />}
          >
            Créer le membre
          </Button>
        </div>
      </form>
    </div>
  );
}
