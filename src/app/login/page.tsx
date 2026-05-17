"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const loginSchema = z.object({
  username: z.string().min(1, "Le nom d'utilisateur est requis"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (user) {
    return null;
  }

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await login(data.username, data.password);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Erreur de connexion. Vérifiez vos identifiants.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image
            src="/logo.jpg"
            alt="CMCI"
            width={80}
            height={80}
            className="mx-auto rounded-2xl object-contain"
            priority
          />
          <h1 className="text-2xl font-bold text-text-primary mt-4">CMCI</h1>
          <p className="text-text-secondary mt-1">Rapports & Comptes Rendus</p>
        </div>

        <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-6">
            Connexion
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nom d'utilisateur"
              placeholder="Entrez votre identifiant"
              icon={<User size={18} />}
              error={errors.username?.message}
              {...register("username")}
            />

            {/* Champ mot de passe avec œil */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-secondary">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full rounded-lg border bg-surface pl-10 pr-12 py-2 text-sm md:text-base text-text-primary placeholder:text-text-secondary/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.password ? "border-danger" : "border-border"
                  }`}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-secondary hover:text-text-primary transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-danger">
                  {errors.password.message}
                </p>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-danger/10 text-danger text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              className="w-full"
            >
              Se connecter
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-text-secondary mt-6">
          Communauté Missionnaire Chrétienne Internationale
        </p>
      </div>
    </div>
  );
}
