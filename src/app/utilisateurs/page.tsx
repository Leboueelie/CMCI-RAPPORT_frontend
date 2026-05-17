"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Search, Plus, AlertTriangle, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  useUsersList,
  useCreateUser,
  useToggleUserActive,
  useDeleteUser,
} from "@/hooks/useUsers";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { toast } from "sonner";
import type { UserRole } from "@/hooks/useUsers";

export default function UtilisateursPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [isActiveFilter, setIsActiveFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useUsersList({
    search: search || undefined,
    role: roleFilter || undefined,
    isActive:
      isActiveFilter === "true"
        ? true
        : isActiveFilter === "false"
          ? false
          : undefined,
    page,
    limit: 20,
  });

  const toggleActive = useToggleUserActive();
  const deleteUser = useDeleteUser();

  // Si pas admin, on bloque l'accès
  if (user && user.role !== "ADMIN_SYSTEME") {
    return (
      <EmptyState
        icon={<AlertTriangle className="text-danger" size={48} />}
        title="Accès restreint"
        description="Seul l'administrateur système peut gérer les utilisateurs."
      />
    );
  }

  const handleToggleActive = async (id: string) => {
    try {
      await toggleActive.mutateAsync(id);
      toast.success("Statut modifié.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur");
    }
  };

  const handleDelete = async () => {
    if (!deleteUserId) return;
    try {
      await deleteUser.mutateAsync(deleteUserId);
      toast.success("Utilisateur supprimé.");
      setDeleteUserId(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur");
    }
  };

  const columns = [
    {
      key: "username",
      header: "Nom d'utilisateur",
      render: (item: any) => (
        <span className="font-medium">{item.username}</span>
      ),
    },
    { key: "email", header: "Email" },
    {
      key: "role",
      header: "Rôle",
      render: (item: any) => <Badge>{item.role}</Badge>,
    },
    {
      key: "isActive",
      header: "Statut",
      render: (item: any) =>
        item.isActive ? (
          <Badge variant="success">Actif</Badge>
        ) : (
          <Badge variant="danger">Inactif</Badge>
        ),
    },
    {
      key: "territoire",
      header: "Territoire",
      render: (item: any) => item.territoire?.nom || "—",
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: any) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleActive(item.id);
            }}
          >
            {item.isActive ? "Désactiver" : "Activer"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-danger hover:bg-red-50"
            icon={<Trash2 size={16} />}
            onClick={(e) => {
              e.stopPropagation();
              setDeleteUserId(item.id);
            }}
          >
            Supprimer
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-2">
            <Users className="text-primary" size={28} />
            Utilisateurs
          </h1>
          <p className="text-text-secondary mt-1">
            Gérez les comptes utilisateurs
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={18} />}
          onClick={() => router.push("/utilisateurs/nouveau")}
        >
          Créer un utilisateur
        </Button>
      </div>

      {/* Filtres */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          placeholder="Rechercher..."
          icon={<Search size={18} />}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <Select
          placeholder="Tous les rôles"
          options={[
            { value: "", label: "Tous les rôles" },
            { value: "ADMIN_SYSTEME", label: "Admin système" },
            { value: "DIRIGEANT_ASSEMBLEE", label: "Dirigeant assemblée" },
            { value: "DIRIGEANT_ZONE", label: "Dirigeant zone" },
            { value: "MISSIONNAIRE", label: "Missionnaire" },
            { value: "RESPONSABLE_REGIONAL", label: "Responsable régional" },
            { value: "RESPONSABLE_NATIONAL", label: "Responsable national" },
          ]}
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value as UserRole);
            setPage(1);
          }}
        />
        <Select
          placeholder="Tous les statuts"
          options={[
            { value: "", label: "Tous les statuts" },
            { value: "true", label: "Actif" },
            { value: "false", label: "Inactif" },
          ]}
          value={isActiveFilter}
          onChange={(e) => {
            setIsActiveFilter(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Tableau */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : isError || !data ? (
        <EmptyState
          icon={<AlertTriangle className="text-danger" size={48} />}
          title="Erreur"
          description="Impossible de charger la liste."
          action={
            <Button variant="primary" onClick={() => refetch()}>
              Réessayer
            </Button>
          }
        />
      ) : data.data.length === 0 ? (
        <EmptyState
          title="Aucun utilisateur trouvé"
          description="Ajustez les filtres ou créez un nouvel utilisateur."
        />
      ) : (
        <>
          <Table
            columns={columns}
            data={data.data}
            keyExtractor={(item) => item.id}
            onRowClick={(item) =>
              router.push(`/utilisateurs/${item.id}/modifier`)
            }
          />
          <div className="flex justify-center gap-2 mt-4">
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
        </>
      )}

      {/* Modale de suppression */}
      <Modal
        isOpen={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        title="Confirmer la suppression"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteUserId(null)}>
              Annuler
            </Button>
            <Button
              variant="danger"
              loading={deleteUser.isPending}
              onClick={handleDelete}
            >
              Supprimer
            </Button>
          </>
        }
      >
        <p>
          Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est
          irréversible.
        </p>
      </Modal>
    </div>
  );
}
