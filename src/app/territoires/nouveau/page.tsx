"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, MapPin, Plus } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  useTerritoires,
  useCreateTerritoire,
  type Territoire,
} from "@/hooks/useTerritoires";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { toast } from "sonner";

// Schéma de validation
const territoireSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  niveau: z.enum(["PAYS", "REGION", "VILLE", "QUARTIER", "SECTEUR"]),
  parentId: z.string().optional(),
  contact: z.string().optional(),
  adresse: z.string().optional(),
});

type TerritoireFormData = z.infer<typeof territoireSchema>;

// Constante pour les niveaux et leurs parents possibles
const NIVEAUX = ["PAYS", "REGION", "VILLE", "QUARTIER", "SECTEUR"] as const;
type Niveau = (typeof NIVEAUX)[number];

const NIVEAU_PARENT: Record<Niveau, Niveau | null> = {
  PAYS: null,
  REGION: "PAYS",
  VILLE: "REGION",
  QUARTIER: "VILLE",
  SECTEUR: "QUARTIER",
};

// Fonction pour collecter tous les territoires d'un niveau donné à partir de l'arbre
function collecterParNiveau(
  territoires: Territoire[],
  niveau: Niveau,
): { id: string; nom: string }[] {
  const result: { id: string; nom: string }[] = [];
  const parcourir = (t: Territoire) => {
    if (t.niveau === niveau) {
      result.push({ id: t.id, nom: t.nom });
    }
    t.enfants?.forEach(parcourir);
  };
  territoires.forEach(parcourir);
  return result;
}

export default function NouveauTerritoirePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: territoires, isLoading } = useTerritoires();
  const createTerritoire = useCreateTerritoire();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Protection admin (ou autre rôle si besoin)
  if (user?.role !== "ADMIN_SYSTEME") {
    router.replace("/dashboard");
    return null;
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TerritoireFormData>({
    resolver: zodResolver(territoireSchema),
    defaultValues: {
      niveau: "PAYS",
    },
  });

  const niveauSelectionne = watch("niveau");

  // Liste des parents disponibles selon le niveau choisi
  const parentsDisponibles = useMemo(() => {
    if (!territoires || !niveauSelectionne) return [];
    const niveauParent = NIVEAU_PARENT[niveauSelectionne];
    if (!niveauParent) return []; // PAYS n'a pas de parent
    return collecterParNiveau(territoires, niveauParent);
  }, [territoires, niveauSelectionne]);

  const onSubmit = async (data: TerritoireFormData) => {
    setIsSubmitting(true);
    try {
      // Si le niveau est PAYS, on force parentId à undefined
      if (data.niveau === "PAYS") {
        data.parentId = undefined;
      }
      await createTerritoire.mutateAsync(data);
      toast.success("Territoire créé avec succès.");
      router.push("/territoires");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Erreur lors de la création",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <Link
          href="/territoires"
          className="text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            Nouveau territoire
          </h1>
          <p className="text-text-secondary text-sm">
            Ajoutez un territoire à la hiérarchie
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>Informations du territoire</CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Nom"
              placeholder="Ex: Daloa"
              error={errors.nom?.message}
              {...register("nom")}
            />

            <Select
              label="Niveau"
              options={[
                { value: "PAYS", label: "Pays" },
                { value: "REGION", label: "Région" },
                { value: "VILLE", label: "Ville" },
                { value: "QUARTIER", label: "Quartier" },
                { value: "SECTEUR", label: "Secteur" },
              ]}
              {...register("niveau")}
            />

            {niveauSelectionne !== "PAYS" && (
              <Select
                label="Territoire parent"
                placeholder={
                  parentsDisponibles.length === 0
                    ? "Aucun parent disponible"
                    : "Choisir un parent"
                }
                options={parentsDisponibles.map((p) => ({
                  value: p.id,
                  label: p.nom,
                }))}
                disabled={parentsDisponibles.length === 0}
                error={errors.parentId?.message}
                {...register("parentId")}
              />
            )}

            <Input
              label="Contact (optionnel)"
              placeholder="+225 01 23 45 67 89"
              {...register("contact")}
            />
            <Input
              label="Adresse (optionnel)"
              placeholder="Rue des Lauriers, Daloa"
              {...register("adresse")}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <Button variant="ghost" onClick={() => router.push("/territoires")}>
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            icon={<Plus size={18} />}
          >
            Créer le territoire
          </Button>
        </div>
      </form>
    </div>
  );
}
