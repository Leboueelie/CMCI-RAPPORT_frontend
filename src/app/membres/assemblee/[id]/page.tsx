"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAssembleeDetail } from "@/hooks/useAssemblees";
import { useMembresList } from "@/hooks/useMembres";
import { MembreTable } from "@/components/membres/MembreTable";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default function AssembleeMembresPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: assemblee } = useAssembleeDetail(id);
  const { data: membresData, isLoading } = useMembresList({
    assembleeId: id,
    page,
    limit,
  });

  // Vérifier si l'utilisateur connecté peut ajouter des membres
  // 1. Admin système : toujours oui
  // 2. Dirigeant d'assemblée : oui s'il fait partie des dirigeants de cette assemblée
  const isAdmin = user?.role === "ADMIN_SYSTEME";
  const isDirigeant =
    user?.role === "DIRIGEANT_ASSEMBLEE" &&
    (assemblee?.dirigeants?.some((d: any) => d.user?.id === user?.id) ?? false);

  const canAddMember = isAdmin || isDirigeant;

  const totalPages = membresData?.meta?.totalPages || 1;
  const total = membresData?.meta?.total || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/membres"
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Membres de {assemblee?.nom || "l'assemblée"}
            </h1>
            <p className="text-text-secondary text-sm">
              {total} membre{total > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {canAddMember && (
          <Button
            variant="primary"
            icon={<Plus size={18} />}
            onClick={() => router.push(`/membres/nouveau?assembleeId=${id}`)}
            className="w-full sm:w-auto"
          >
            Ajouter un membre
          </Button>
        )}
      </div>

      {/* Contenu : chargement, tableau ou état vide */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : membresData?.data.length ? (
        <>
          <MembreTable membres={membresData.data} />

          {/* Pagination responsive */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="ghost"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft size={18} />
                <span className="hidden sm:inline ml-1">Précédent</span>
              </Button>

              <span className="text-sm text-text-secondary">
                {page} / {totalPages}
              </span>

              <Button
                variant="ghost"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                <span className="hidden sm:inline mr-1">Suivant</span>
                <ChevronRight size={18} />
              </Button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title="Aucun membre"
          description="Cette assemblée n'a pas encore de membres."
          action={
            canAddMember && (
              <Button
                variant="primary"
                onClick={() =>
                  router.push(`/membres/nouveau?assembleeId=${id}`)
                }
              >
                Ajouter un membre
              </Button>
            )
          }
        />
      )}
    </div>
  );
}
