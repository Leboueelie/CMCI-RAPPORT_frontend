"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  MapPin,
  Building2,
  Users,
  Plus,
  Trash2,
  AlertTriangle,
  Pencil,
} from "lucide-react";
import {
  useTerritoires,
  useDeleteTerritoire,
  type Territoire,
} from "@/hooks/useTerritoires";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { toast } from "sonner";

const niveauLabel: Record<string, string> = {
  PAYS: "Pays",
  REGION: "Région",
  VILLE: "Ville",
  QUARTIER: "Quartier",
  SECTEUR: "Secteur",
};

const niveauVariant: Record<
  string,
  "info" | "success" | "warning" | "default"
> = {
  PAYS: "info",
  REGION: "success",
  VILLE: "warning",
  QUARTIER: "default",
  SECTEUR: "default",
};

function TerritoireNode({
  territoire,
  depth = 0,
  onDelete,
  onEdit, // <-- nouveau callback pour la modification
}: {
  territoire: Territoire;
  depth?: number;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = territoire.enfants && territoire.enfants.length > 0;

  return (
    <div className="space-y-1">
      <div
        className={`flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${
          depth > 0 ? "ml-6" : ""
        }`}
        onClick={() => hasChildren && setOpen(!open)}
      >
        {hasChildren ? (
          open ? (
            <ChevronDown size={16} className="text-text-secondary" />
          ) : (
            <ChevronRight size={16} className="text-text-secondary" />
          )
        ) : (
          <span className="w-4" />
        )}
        <MapPin size={16} className="text-primary" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-text-primary truncate">
            {territoire.nom}
          </p>
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <Badge variant={niveauVariant[territoire.niveau] || "default"}>
              {niveauLabel[territoire.niveau] || territoire.niveau}
            </Badge>
            {territoire._count && (
              <>
                <span className="flex items-center gap-1">
                  <Building2 size={12} />
                  {territoire._count.assemblees}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={12} />
                  {territoire._count.users}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Actions : Modifier et Supprimer */}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(territoire.id);
            }}
            className="p-1 rounded hover:bg-gray-100 text-text-secondary hover:text-primary"
            aria-label="Modifier le territoire"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(territoire.id);
            }}
            className="p-1 rounded hover:bg-red-50 text-text-secondary hover:text-danger"
            aria-label="Supprimer le territoire"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      {open && hasChildren && (
        <div className="border-l border-border ml-[19px]">
          {territoire.enfants!.map((enfant) => (
            <TerritoireNode
              key={enfant.id}
              territoire={enfant}
              depth={depth + 1}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TerritoiresPage() {
  const { user } = useAuth();
  const { data: territoires, isLoading, isError, refetch } = useTerritoires();
  const deleteTerritoire = useDeleteTerritoire();
  const router = useRouter();

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const isAdmin = user?.role === "ADMIN_SYSTEME";

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTerritoire.mutateAsync(deleteId);
      toast.success("Territoire supprimé.");
      setDeleteId(null);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Erreur lors de la suppression",
      );
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/territoires/${id}/modifier`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !territoires) {
    return (
      <EmptyState
        icon={<AlertTriangle className="text-danger" size={48} />}
        title="Erreur de chargement"
        description="Impossible de récupérer l'arbre des territoires."
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
            <MapPin className="text-primary" size={28} />
            Territoires
          </h1>
          <p className="text-text-secondary mt-1">
            Hiérarchie géographique CMCI
          </p>
        </div>
        {isAdmin && (
          <Button
            variant="primary"
            icon={<Plus size={18} />}
            onClick={() => router.push("/territoires/nouveau")}
          >
            Nouveau territoire
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-4 md:p-6">
          {territoires.length === 0 ? (
            <EmptyState
              title="Aucun territoire"
              description="La hiérarchie n'a pas encore été définie."
            />
          ) : (
            <div className="space-y-1">
              {territoires.map((t) => (
                <TerritoireNode
                  key={t.id}
                  territoire={t}
                  onDelete={setDeleteId}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modale de confirmation */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Supprimer le territoire"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteId(null)}>
              Annuler
            </Button>
            <Button
              variant="danger"
              loading={deleteTerritoire.isPending}
              onClick={handleDelete}
            >
              Supprimer
            </Button>
          </>
        }
      >
        <p>
          Supprimer ce territoire ? Les sous-territoires, utilisateurs et
          assemblées ne doivent pas y être rattachés.
        </p>
      </Modal>
    </div>
  );
}
