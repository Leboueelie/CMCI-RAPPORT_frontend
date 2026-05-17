"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  useAssembleesList,
  useAssembleeDuDirigeant,
} from "@/hooks/useAssemblees";
import { useMembresList } from "@/hooks/useMembres";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Search, Plus, Building2 } from "lucide-react";
import Link from "next/link";

export default function MembresPage() {
  const { user } = useAuth();
  const router = useRouter();
  const isDirigeant = user?.role === "DIRIGEANT_ASSEMBLEE";
  const { data: assembleeDirigeant, isLoading: loadingAssemblee } =
    useAssembleeDuDirigeant();

  // Redirection immédiate pour le dirigeant vers son assemblée
  useEffect(() => {
    if (!loadingAssemblee && isDirigeant && assembleeDirigeant) {
      router.replace(`/membres/assemblee/${assembleeDirigeant.id}`);
    }
  }, [loadingAssemblee, isDirigeant, assembleeDirigeant, router]);

  if (isDirigeant) {
    return <Spinner size="lg" />; // le temps de rediriger
  }

  // Pour les autres rôles : grille des assemblées
  const [searchAss, setSearchAss] = useState("");
  const { data: assembleesData, isLoading } = useAssembleesList({ limit: 100 });

  if (isLoading) return <Spinner size="lg" />;

  const filtered =
    assembleesData?.data.filter((a) =>
      a.nom.toLowerCase().includes(searchAss.toLowerCase()),
    ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Assemblées</h1>
        {user?.role === "ADMIN_SYSTEME" && (
          <Button
            variant="primary"
            icon={<Plus size={18} />}
            onClick={() => router.push("/assemblees/nouveau")}
          >
            Nouvelle assemblée
          </Button>
        )}
      </div>

      <Input
        placeholder="Rechercher une assemblée..."
        icon={<Search size={18} />}
        value={searchAss}
        onChange={(e) => setSearchAss(e.target.value)}
      />

      {filtered.length === 0 ? (
        <EmptyState
          title="Aucune assemblée"
          description="Aucune assemblée trouvée."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ass) => (
            <Link key={ass.id} href={`/membres/assemblee/${ass.id}`}>
              <Card className="hover:shadow-md cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <Building2 className="text-primary" size={32} />
                  <div>
                    <p className="font-semibold">{ass.nom}</p>
                    <p className="text-sm text-text-secondary">
                      {ass._count?.membres ?? 0} membre
                      {(ass._count?.membres ?? 0) > 1 ? "s" : ""}
                    </p>
                    {ass.dirigeant && (
                      <p className="text-xs text-text-secondary">
                        Dirigeant : {ass.dirigeant.prenom} {ass.dirigeant.nom}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
