"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  useTerritoires,
  useUpdateTerritoire,
  type Territoire,
} from "@/hooks/useTerritoires";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
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

const NIVEAUX = ["PAYS", "REGION", "VILLE", "QUARTIER", "SECTEUR"] as const;
type Niveau = (typeof NIVEAUX)[number];

const NIVEAU_PARENT: Record<Niveau, Niveau | null> = {
  PAYS: null,
  REGION: "PAYS",
  VILLE: "REGION",
  QUARTIER: "VILLE",
  SECTEUR: "QUARTIER",
};

function collecterParNiveau(
  territoires: Territoire[],
  niveau: Niveau,
): { id: string; nom: string }[] {
  const result: { id: string; nom: string }[] = [];
  const parcourir = (t: Territoire) => {
    if (t.niveau === niveau) result.push({ id: t.id, nom: t.nom });
    t.enfants?.forEach(parcourir);
  };
  territoires.forEach(parcourir);
  return result;
}

// Hook local pour récupérer un territoire par ID
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

function useTerritoire(id: string) {
  const { user } = useAuth();
  return useQuery<Territoire>({
    queryKey: ["territoires", id],
    queryFn: async () => {
      const { data } = await api.get(`/territoires/${id}`);
      return data;
    },
    enabled: !!user && !!id,
  });
}

export default function ModifierTerritoirePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: territoire, isLoading } = useTerritoire(id);
  const updateTerritoire = useUpdateTerritoire();
  const { data: territoires } = useTerritoires();

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user?.role !== "ADMIN_SYSTEME") {
    router.replace("/dashboard");
    return null;
  }

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<TerritoireFormData>({
    resolver: zodResolver(territoireSchema),
  });

  useEffect(() => {
    if (territoire) {
      reset({
        nom: territoire.nom,
        niveau: territoire.niveau,
        parentId: territoire.parentId || "",
        contact: territoire.contact || "",
        adresse: territoire.adresse || "",
      });
    }
  }, [territoire, reset]);

  const niveauSelectionne = watch("niveau");

  const parentsDisponibles = useMemo(() => {
    if (!territoires || !niveauSelectionne) return [];
    const niveauParent = NIVEAU_PARENT[niveauSelectionne];
    if (!niveauParent) return [];
    return collecterParNiveau(territoires, niveauParent).filter(
      (p) => p.id !== id, // empêcher de se sélectionner soi-même
    );
  }, [territoires, niveauSelectionne, id]);

  const onSubmit = async (data: TerritoireFormData) => {
    setIsSubmitting(true);
    try {
      if (data.niveau === "PAYS") data.parentId = undefined;
      await updateTerritoire.mutateAsync({ id, ...data });
      toast.success("Territoire modifié avec succès.");
      router.push("/territoires");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Erreur lors de la modification",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!territoire) {
    return (
      <div className="text-center py-12 text-text-secondary">
        Territoire introuvable.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/territoires"
          className="text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            Modifier le territoire
          </h1>
          <p className="text-text-secondary text-sm">{territoire.nom}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>Informations</CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Nom"
              error={errors.nom?.message}
              {...register("nom")}
            />
            <Select
              label="Niveau"
              options={NIVEAUX.map((n) => ({ value: n, label: n }))}
              {...register("niveau")}
            />
            {niveauSelectionne !== "PAYS" && (
              <Select
                label="Territoire parent"
                placeholder="Aucun parent"
                options={[
                  { value: "", label: "Aucun" },
                  ...parentsDisponibles.map((p) => ({
                    value: p.id,
                    label: p.nom,
                  })),
                ]}
                disabled={parentsDisponibles.length === 0}
                error={errors.parentId?.message}
                {...register("parentId")}
              />
            )}
            <Input label="Contact" {...register("contact")} />
            <Input label="Adresse" {...register("adresse")} />
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-end">
          <Button variant="ghost" onClick={() => router.push("/territoires")}>
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
