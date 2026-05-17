"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Calendar,
  Users,
  FileText,
  Edit,
  Plus,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAssembleeDetail, useDeleteAssemblee } from "@/hooks/useAssemblees";
import { useMembresList } from "@/hooks/useMembres";
import { MembreCard } from "@/components/membres/MembreCard";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { toast } from "sonner";

export default function AssembleeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const { data: assemblee, isLoading, isError } = useAssembleeDetail(id);
  const { data: membresData } = useMembresList({ assembleeId: id, limit: 5 });
  const deleteAssemblee = useDeleteAssemblee();

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Permissions
  const canEdit =
    user?.role === "ADMIN_SYSTEME" ||
    user?.role === "DIRIGEANT_ZONE" ||
    user?.role === "MISSIONNAIRE";
  const canDelete = user?.role === "ADMIN_SYSTEME";

  // L'utilisateur peut ajouter un membre s'il est admin ou s'il fait partie des dirigeants de cette assemblée
  const isDirigeant = assemblee?.dirigeants?.some(
    (d: any) => d.user?.id === user?.id,
  );
  const canAddMember =
    user?.role === "ADMIN_SYSTEME" ||
    (user?.role === "DIRIGEANT_ASSEMBLEE" && isDirigeant);

  const handleDelete = async () => {
    try {
      await deleteAssemblee.mutateAsync(id);
      toast.success("Assemblée supprimée.");
      router.push("/assemblees");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Erreur lors de la suppression",
      );
    }
    setShowDeleteModal(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !assemblee) {
    return (
      <EmptyState
        title="Assemblée introuvable"
        description="Cette assemblée n'existe pas ou a été supprimée."
        action={
          <Button variant="primary" onClick={() => router.push("/assemblees")}>
            Retour à la liste
          </Button>
        }
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Link
        href="/assemblees"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft size={20} />
        Retour à la liste
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            {assemblee.nom}
          </h1>
          <div className="flex items-center gap-3 mt-2 text-text-secondary">
            <span className="flex items-center gap-1">
              <MapPin size={16} />
              {assemblee.territoire?.nom || "Territoire inconnu"}
            </span>
            <span className="flex items-center gap-1">
              <Users size={16} />
              {assemblee._count?.membres ?? 0} membres
            </span>
            <span className="flex items-center gap-1">
              <FileText size={16} />
              {assemblee._count?.rapports ?? 0} rapports
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button
              variant="outline"
              icon={<Edit size={16} />}
              onClick={() => router.push(`/assemblees/${id}/modifier`)}
            >
              Modifier
            </Button>
          )}
          {canDelete && (
            <Button
              variant="danger"
              icon={<Trash2 size={16} />}
              onClick={() => setShowDeleteModal(true)}
            >
              Supprimer
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>Informations</CardHeader>
            <CardContent className="space-y-3">
              {assemblee.contact && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={16} className="text-text-secondary" />
                  <span>{assemblee.contact}</span>
                </div>
              )}
              {assemblee.adresse && (
                <div className="text-sm">
                  <p className="text-text-secondary">Adresse</p>
                  <p>{assemblee.adresse}</p>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={16} className="text-text-secondary" />
                <span>
                  Créée le{" "}
                  {new Date(assemblee.dateCreation).toLocaleDateString("fr-FR")}
                </span>
              </div>

              {assemblee.dirigeants && assemblee.dirigeants.length > 0 ? (
                <div className="text-sm">
                  <p className="text-text-secondary">
                    Dirigeant{assemblee.dirigeants.length > 1 ? "s" : ""}
                  </p>
                  <ul className="list-disc list-inside">
                    {assemblee.dirigeants.map((d: any) => (
                      <li key={d.user?.id}>
                        {d.user?.prenom} {d.user?.nom} ({d.user?.username})
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-text-secondary">Aucun dirigeant</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-primary">
              Membres ({assemblee._count?.membres ?? 0})
            </h2>
            <div className="flex gap-2">
              {canAddMember && (
                <Button
                  size="sm"
                  variant="primary"
                  icon={<Plus size={16} />}
                  onClick={() =>
                    router.push(`/membres/nouveau?assembleeId=${id}`)
                  }
                >
                  Ajouter
                </Button>
              )}
              <Link href={`/membres/assemblee/${id}`}>
                <Button size="sm" variant="ghost">
                  Voir tous
                </Button>
              </Link>
            </div>
          </div>

          {membresData && membresData.data.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {membresData.data.map((membre) => (
                <MembreCard key={membre.id} membre={membre} />
              ))}
            </div>
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
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Supprimer l'assemblée"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Annuler
            </Button>
            <Button
              variant="danger"
              loading={deleteAssemblee.isPending}
              onClick={handleDelete}
            >
              Supprimer
            </Button>
          </>
        }
      >
        <p>
          Supprimer définitivement <strong>{assemblee.nom}</strong> ? Les
          membres et rapports associés seront perdus.
        </p>
      </Modal>
    </div>
  );
}
