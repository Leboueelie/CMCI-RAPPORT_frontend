"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useAssembleeDetail, useUpdateAssemblee } from "@/hooks/useAssemblees";
import { useUsersList } from "@/hooks/useUsers"; // pour récupérer tous les utilisateurs
import { useTerritoires, type Territoire } from "@/hooks/useTerritoires";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { toast } from "sonner";

// Schéma de validation
const assembleeSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  territoireId: z.string().min(1, "Le territoire est requis"),
  dirigeantIds: z.array(z.string()).optional(), // tableau d'IDs
  contact: z.string().optional(),
  adresse: z.string().optional(),
});

type AssembleeFormData = z.infer<typeof assembleeSchema>;

// Filtrer les territoires de niveau SECTEUR
function obtenirSecteurs(
  territoires: Territoire[],
): { id: string; nom: string }[] {
  const secteurs: { id: string; nom: string }[] = [];
  const parcourir = (t: Territoire) => {
    if (t.niveau === "SECTEUR") {
      secteurs.push({ id: t.id, nom: t.nom });
    }
    t.enfants?.forEach(parcourir);
  };
  territoires.forEach(parcourir);
  return secteurs;
}

export default function ModifierAssembleePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: assemblee, isLoading } = useAssembleeDetail(id);
  const updateAssemblee = useUpdateAssemblee();
  const { data: territoires } = useTerritoires();
  const { data: usersData } = useUsersList({ limit: 1000, role: undefined }); // tous les utilisateurs

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (
    !user ||
    (user.role !== "ADMIN_SYSTEME" &&
      user.role !== "DIRIGEANT_ZONE" &&
      user.role !== "MISSIONNAIRE")
  ) {
    router.replace("/dashboard");
    return null;
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AssembleeFormData>({
    resolver: zodResolver(assembleeSchema),
    defaultValues: {
      dirigeantIds: [],
    },
  });

  // Pré-remplissage
  useEffect(() => {
    if (assemblee) {
      // Récupérer les IDs des dirigeants existants
      const existingIds =
        assemblee.dirigeants?.map((d: any) => d.user?.id) || [];
      reset({
        nom: assemblee.nom,
        territoireId: assemblee.territoireId,
        dirigeantIds: existingIds,
        contact: assemblee.contact || "",
        adresse: assemblee.adresse || "",
      });
    }
  }, [assemblee, reset]);

  const selectedDirigeantIds = watch("dirigeantIds") || [];

  const toggleDirigeant = (userId: string) => {
    if (selectedDirigeantIds.includes(userId)) {
      setValue(
        "dirigeantIds",
        selectedDirigeantIds.filter((id) => id !== userId),
      );
    } else {
      setValue("dirigeantIds", [...selectedDirigeantIds, userId]);
    }
  };

  const secteurs = territoires ? obtenirSecteurs(territoires) : [];
  const allUsers = usersData?.data || [];

  const onSubmit = async (data: AssembleeFormData) => {
    setIsSubmitting(true);
    try {
      await updateAssemblee.mutateAsync({ id, ...data });
      toast.success("Assemblée modifiée avec succès.");
      router.push(`/assemblees/${id}`);
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

  if (!assemblee) {
    return (
      <div className="text-center py-12 text-text-secondary">
        Assemblée introuvable.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href={`/assemblees/${id}`}
          className="text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            Modifier l'assemblée
          </h1>
          <p className="text-text-secondary text-sm">{assemblee.nom}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>Informations générales</CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Nom"
              error={errors.nom?.message}
              {...register("nom")}
            />
            <Select
              label="Territoire (Secteur)"
              placeholder="Sélectionnez un secteur"
              options={secteurs.map((s) => ({ value: s.id, label: s.nom }))}
              error={errors.territoireId?.message}
              {...register("territoireId")}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>Dirigeants</CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary mb-4">
              Sélectionnez un ou plusieurs dirigeants pour cette assemblée.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {allUsers.map((u) => (
                <label
                  key={u.id}
                  className="flex items-center gap-2 text-sm p-1 hover:bg-gray-50 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedDirigeantIds.includes(u.id)}
                    onChange={() => toggleDirigeant(u.id)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  {u.prenom || ""} {u.nom || ""} (@{u.username})
                </label>
              ))}
              {allUsers.length === 0 && (
                <p className="text-sm text-text-secondary">
                  Aucun utilisateur disponible.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>Contact</CardHeader>
          <CardContent className="space-y-4">
            <Input label="Contact" {...register("contact")} />
            <Input label="Adresse" {...register("adresse")} />
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-end">
          <Button
            variant="ghost"
            onClick={() => router.push(`/assemblees/${id}`)}
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
