"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useCreateUser } from "@/hooks/useUsers";
import { useTerritoires, type Territoire } from "@/hooks/useTerritoires";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { toast } from "sonner";
import type { UserRole } from "@/hooks/useUsers";

// Schéma de validation
const createUserSchema = z.object({
  username: z.string().min(1, "Le nom d'utilisateur est requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "6 caractères minimum"),
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
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

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

export default function NouveauUtilisateurPage() {
  const { user } = useAuth();
  const router = useRouter();
  const createUser = useCreateUser();
  const { data: territoires } = useTerritoires();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Vérification du rôle admin
  if (user && user.role !== "ADMIN_SYSTEME") {
    router.replace("/dashboard");
    return null;
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: "DIRIGEANT_ASSEMBLEE",
    },
  });

  const onSubmit = async (data: CreateUserFormData) => {
    setIsSubmitting(true);
    try {
      await createUser.mutateAsync(data);
      toast.success("Utilisateur créé avec succès.");
      router.push("/utilisateurs");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Erreur lors de la création",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Préparer les options de territoires
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
            Nouvel utilisateur
          </h1>
          <p className="text-text-secondary text-sm">
            Créez un compte pour un nouveau membre du personnel
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Identifiants */}
        <Card>
          <CardHeader>Identifiants</CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Nom d'utilisateur"
              placeholder="jean.dupont"
              error={errors.username?.message}
              {...register("username")}
            />
            <Input
              label="Email"
              type="email"
              placeholder="jean@cmci.ci"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Mot de passe"
              type="password"
              placeholder="Au moins 6 caractères"
              error={errors.password?.message}
              {...register("password")}
            />
          </CardContent>
        </Card>

        {/* Profil */}
        <Card>
          <CardHeader>Profil</CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Prénom"
                placeholder="Jean"
                {...register("prenom")}
              />
              <Input label="Nom" placeholder="Dupont" {...register("nom")} />
            </div>
            <Input
              label="Contact"
              placeholder="+225 01 23 45 67 89"
              {...register("contact")}
            />
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
              placeholder="Aucun territoire (admin)"
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
            icon={<UserPlus size={18} />}
          >
            Créer l'utilisateur
          </Button>
        </div>
      </form>
    </div>
  );
}
