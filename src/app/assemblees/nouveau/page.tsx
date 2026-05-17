"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useCreateAssemblee } from "@/hooks/useAssemblees";
import { useTerritoires, type Territoire } from "@/hooks/useTerritoires";
import { useUsersList } from "@/hooks/useUsers";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { toast } from "sonner";

// Schéma de validation
const assembleeSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  territoireId: z.string().min(1, "Le territoire est requis"),
  dirigeantIds: z.array(z.string()).optional(),
  contact: z.string().optional(),
  adresse: z.string().optional(),
});

type AssembleeFormData = z.infer<typeof assembleeSchema>;

// Filtrer uniquement les territoires de niveau SECTEUR
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

export default function NouvelleAssembleePage() {
  const { user } = useAuth();
  const router = useRouter();
  const createAssemblee = useCreateAssemblee();
  const { data: territoires } = useTerritoires();
  const { data: usersData } = useUsersList({ limit: 1000 }); // tous les utilisateurs

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
    formState: { errors },
  } = useForm<AssembleeFormData>({
    resolver: zodResolver(assembleeSchema),
    defaultValues: {
      dirigeantIds: [],
    },
  });

  const selectedDirigeantIds = watch("dirigeantIds") || [];
  const allUsers = usersData?.data || [];
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

  const onSubmit = async (data: AssembleeFormData) => {
    setIsSubmitting(true);
    try {
      await createAssemblee.mutateAsync(data);
      toast.success("Assemblée créée avec succès.");
      router.push("/assemblees");
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
      <div className="flex items-center gap-4">
        <Link
          href="/assemblees"
          className="text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            Nouvelle assemblée
          </h1>
          <p className="text-text-secondary text-sm">
            Créez une nouvelle assemblée rattachée à un secteur
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Informations générales */}
        <Card>
          <CardHeader>Informations générales</CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Nom de l'assemblée"
              placeholder="Assemblée de la Paix"
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

        {/* Dirigeants */}
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

        {/* Contact */}
        <Card>
          <CardHeader>Contact</CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Contact"
              placeholder="+225 01 23 45 67 89"
              {...register("contact")}
            />
            <Input
              label="Adresse"
              placeholder="Rue des Églises, Daloa"
              {...register("adresse")}
            />
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-end">
          <Button variant="ghost" onClick={() => router.push("/assemblees")}>
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            icon={<Plus size={18} />}
          >
            Créer l'assemblée
          </Button>
        </div>
      </form>
    </div>
  );
}
