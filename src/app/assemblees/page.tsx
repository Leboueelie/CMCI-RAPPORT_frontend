"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Search,
  Plus,
  ArrowRight,
  Users,
  FileText,
  MapPin,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAssembleesList } from "@/hooks/useAssemblees";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AssembleesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useAssembleesList({
    search: search || undefined,
    page,
    limit: 12,
  });

  const canCreate =
    user?.role === "ADMIN_SYSTEME" ||
    user?.role === "DIRIGEANT_ZONE" ||
    user?.role === "MISSIONNAIRE";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <EmptyState
        title="Erreur de chargement"
        description="Impossible de récupérer la liste des assemblées."
        action={
          <Button variant="primary" onClick={() => refetch()}>
            Réessayer
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-2">
            <Building2 className="text-primary" size={28} />
            Assemblées
          </h1>
          <p className="text-text-secondary mt-1">
            {data.meta.total} assemblée{data.meta.total > 1 ? "s" : ""} trouvée
            {data.meta.total > 1 ? "s" : ""}
          </p>
        </div>
        {canCreate && (
          <Button
            variant="primary"
            icon={<Plus size={18} />}
            onClick={() => router.push("/assemblees/nouveau")}
          >
            Nouvelle assemblée
          </Button>
        )}
      </div>

      <div className="max-w-md">
        <Input
          placeholder="Rechercher une assemblée..."
          icon={<Search size={18} />}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {data.data.length === 0 ? (
        <EmptyState
          title="Aucune assemblée trouvée"
          description="Ajustez vos filtres ou créez une nouvelle assemblée."
          action={
            canCreate && (
              <Button
                variant="primary"
                onClick={() => router.push("/assemblees/nouveau")}
              >
                Créer une assemblée
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.data.map((ass) => (
            <Link key={ass.id} href={`/assemblees/${ass.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-text-primary truncate">
                      {ass.nom}
                    </h3>
                    <ArrowRight
                      size={16}
                      className="text-text-secondary mt-1"
                    />
                  </div>
                  <div className="flex items-center gap-1 text-sm text-text-secondary">
                    <MapPin size={14} />
                    <span className="truncate">
                      {ass.territoire?.nom || "Territoire inconnu"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {ass._count?.membres ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText size={14} />
                      {ass._count?.rapports ?? 0}
                    </span>
                  </div>
                  {ass.dirigeants && ass.dirigeants.length > 0 ? (
                    <p className="text-xs text-text-secondary">
                      {ass.dirigeants.length === 1
                        ? `Dirigeant : ${ass.dirigeants[0].user?.prenom || ""} ${ass.dirigeants[0].user?.nom || ""}`
                        : `${ass.dirigeants.length} dirigeants`}
                    </p>
                  ) : (
                    <p className="text-xs text-text-secondary">
                      Aucun dirigeant
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="ghost"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Précédent
          </Button>
          <span className="flex items-center text-sm text-text-secondary">
            Page {page} / {data.meta.totalPages}
          </span>
          <Button
            variant="ghost"
            disabled={page >= data.meta.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}
