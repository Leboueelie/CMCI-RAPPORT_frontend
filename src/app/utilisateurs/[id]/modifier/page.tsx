"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useUserDetail, useUpdateUser, type UserRole } from "@/hooks/useUsers";
import { useTerritoires, type Territoire } from "@/hooks/useTerritoires";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { toast } from "sonner";

// Fonction utilitaire pour aplatir l'arbre des territoires
function flattenTerritoires(
  territoires: Territoire[],
  level = 0,
): { value: string; label: string }[] {
  return territoires.flatMap((t) => {
    const prefix = level > 0 ? "└ " + "─ ".repeat(level) : "";
    const current = [{ value: t.id, label: prefix + t.nom }];
    if (t.enfants && t.enfants.length > 0) {
      return current.concat(flattenTerritoires(t.enfants, level + 1));
    }
    return current;
  });
}

// Schéma de modification (seuls certains champs sont modifiables)
const updateUserSchema = z.object({
  username: z.string().min(1, "Le nom d'utilisateur est requis"),
  email: z.string().email("Email invalide"),
  role: z.enum([
    "ADMIN_SYSTEME",
    "DIRIGEANT_ASSEMBLEE",
    "DIRIGEANT_ZONE",
    "MISSIONNAIRE",
    "RESPONSABLE_REGIONAL",
    "RESPONSABLE_NATIONAL",
  ]),
  prenom: z.string().optional(),
  nom: z.string().optional(),
  contact: z.string().optional(),
  territoireId: z.string().optional(),
  // Mot de passe optionnel (laisser vide pour ne pas changer)
  password: z.string().optional(),
});

type UpdateUserFormData = z.infer<typeof updateUserSchema>;

export default function ModifierUtilisateurPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: utilisateur, isLoading } = useUserDetail(id);
  const updateUser = useUpdateUser();
  const { data: territoires } = useTerritoires();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Protection admin
  if (currentUser?.role !== "ADMIN_SYSTEME") {
    router.replace("/dashboard");
    return null;
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
  });

  // Pré-remplir le formulaire quand les données sont chargées
  useEffect(() => {
    if (utilisateur) {
      reset({
        username: utilisateur.username,
        email: utilisateur.email,
        role: utilisateur.role,
        prenom: utilisateur.prenom || "",
        nom: utilisateur.nom || "",
        contact: utilisateur.contact || "",
        territoireId: utilisateur.territoireId || "",
        password: "",
      });
    }
  }, [utilisateur, reset]);

  const onSubmit = async (data: UpdateUserFormData) => {
    setIsSubmitting(true);
    try {
      // Ne pas envoyer le mot de passe s'il est vide
      const payload = { ...data };
      if (!payload.password) delete payload.password;

      await updateUser.mutateAsync({ id, ...payload });
      toast.success("Utilisateur modifié avec succès.");
      router.push("/utilisateurs");
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

  if (!utilisateur) {
    return (
      <div className="text-center py-12 text-text-secondary">
        Utilisateur introuvable.
      </div>
    );
  }

  const territoireOptions = territoires ? flattenTerritoires(territoires) : [];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <Link
          href="/utilisateurs"
          className="text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            Modifier l'utilisateur
          </h1>
          <p className="text-text-secondary text-sm">{utilisateur.username}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Identifiants */}
        <Card>
          <CardHeader>Identifiants</CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Nom d'utilisateur"
              error={errors.username?.message}
              {...register("username")}
            />
            <Input
              label="Email"
              type="email"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Nouveau mot de passe (laisser vide pour ne pas changer)"
              type="password"
              placeholder="••••••••"
              {...register("password")}
            />
          </CardContent>
        </Card>

        {/* Profil */}
        <Card>
          <CardHeader>Profil</CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Prénom" {...register("prenom")} />
              <Input label="Nom" {...register("nom")} />
            </div>
            <Input label="Contact" {...register("contact")} />
          </CardContent>
        </Card>

        {/* Rôle et territoire */}
        <Card>
          <CardHeader>Droits d'accès</CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Rôle"
              options={[
                { value: "ADMIN_SYSTEME", label: "Admin système" },
                {
                  value: "DIRIGEANT_ASSEMBLEE",
                  label: "Dirigeant d'assemblée",
                },
                { value: "DIRIGEANT_ZONE", label: "Dirigeant de zone" },
                { value: "MISSIONNAIRE", label: "Missionnaire" },
                {
                  value: "RESPONSABLE_REGIONAL",
                  label: "Responsable régional",
                },
                {
                  value: "RESPONSABLE_NATIONAL",
                  label: "Responsable national",
                },
              ]}
              {...register("role")}
            />
            <Select
              label="Territoire"
              placeholder="Aucun territoire"
              options={territoireOptions}
              {...register("territoireId")}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <Button variant="ghost" onClick={() => router.push("/utilisateurs")}>
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
