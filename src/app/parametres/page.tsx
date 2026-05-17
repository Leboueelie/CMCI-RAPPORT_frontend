"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useChangePassword } from "@/hooks/useChangePassword";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";

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

export default function ParametresPage() {
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

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
        Paramètres
      </h1>

      <Card>
        <CardHeader>Sécurité</CardHeader>
        <CardContent>
          <p className="text-text-secondary mb-4">
            Modifiez votre mot de passe pour sécuriser votre compte.
          </p>
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
