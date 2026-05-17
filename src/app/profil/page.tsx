"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useChangePassword } from "@/hooks/useChangePassword";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, "L'ancien mot de passe est requis"),
    newPassword: z.string().min(6, "6 caractères minimum"),
    confirmPassword: z.string().min(6, "Confirmation requise"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export default function ProfilPage() {
  const { user } = useAuth();
  const changePassword = useChangePassword();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  if (!user) return null;

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await changePassword.mutateAsync({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      toast.success("Mot de passe modifié avec succès.");
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors du changement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const initiales = `${user.prenom?.[0] || ""}${user.nom?.[0] || ""}`;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
        Mon Profil
      </h1>

      {/* Informations personnelles */}
      <Card>
        <CardHeader>Informations personnelles</CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar src={user.photo} fallback={initiales} size="xl" />
            <div>
              <p className="text-xl font-semibold">
                {user.prenom || ""} {user.nom || ""}
              </p>
              <p className="text-text-secondary">@{user.username}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-text-secondary">Email</span>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <span className="text-sm text-text-secondary">Rôle</span>
              <div>
                <Badge>{user.role}</Badge>
              </div>
            </div>
            <div>
              <span className="text-sm text-text-secondary">Contact</span>
              <p>{user.contact || "—"}</p>
            </div>
            <div>
              <span className="text-sm text-text-secondary">Statut</span>
              <Badge variant={user.isActive ? "success" : "danger"}>
                {user.isActive ? "Actif" : "Inactif"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Changement de mot de passe */}
      <Card>
        <CardHeader>Changer le mot de passe</CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Ancien mot de passe"
              type="password"
              {...register("oldPassword")}
              error={errors.oldPassword?.message}
            />
            <Input
              label="Nouveau mot de passe"
              type="password"
              {...register("newPassword")}
              error={errors.newPassword?.message}
            />
            <Input
              label="Confirmer le mot de passe"
              type="password"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
            />
            <Button type="submit" loading={isSubmitting} variant="primary">
              Modifier le mot de passe
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
