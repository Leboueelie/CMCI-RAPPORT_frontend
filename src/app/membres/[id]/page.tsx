"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Phone,
  Briefcase,
  Heart,
  Droplets,
  Link2,
  Users,
  GraduationCap,
  Baby,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  useMembreDetail,
  useMembreHistorique,
  useDeleteMembre,
} from "@/hooks/useMembres";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { ParcoursSpirituel } from "@/components/membres/ParcoursSpirituel";
import { toast } from "sonner";

const statutVariant: Record<string, "success" | "danger"> = {
  ACTIF: "success",
  RETROGRADE: "danger",
};
const statutLabel: Record<string, string> = {
  ACTIF: "Actif",
  RETROGRADE: "Rétrogradé",
};

export default function MembreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const { data: membre, isLoading, isError } = useMembreDetail(id);
  const { data: historique } = useMembreHistorique(id);
  const deleteMembre = useDeleteMembre();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const canEdit =
    user?.role === "DIRIGEANT_ASSEMBLEE" || user?.role === "ADMIN_SYSTEME";
  const canDelete = user?.role === "ADMIN_SYSTEME";

  const handleDelete = async () => {
    try {
      await deleteMembre.mutateAsync(id);
      toast.success("Membre supprimé avec succès.");
      router.push("/membres");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Erreur lors de la suppression",
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

  if (isError || !membre) {
    return (
      <EmptyState
        title="Membre introuvable"
        description="Ce membre n'existe pas ou a été supprimé."
        action={
          <Button variant="primary" onClick={() => router.push("/membres")}>
            Retour à la liste
          </Button>
        }
      />
    );
  }

  const initiales = `${membre.prenom?.[0] || ""}${membre.nom?.[0] || ""}`;
  const badgeVariant = statutVariant[membre.statut] || "default";
  const badgeText = statutLabel[membre.statut] || membre.statut;
  const fonctions = membre.fonctions?.map((f: any) => f.fonction?.nom) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link
        href="/membres"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft size={20} />
        Retour à la liste
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex items-center gap-5">
          <Avatar src={membre.photo} fallback={initiales} size="xl" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
              {membre.prenom} {membre.nom}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant={badgeVariant}>{badgeText}</Badge>
              {fonctions.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {fonctions.map((nom, idx) => (
                    <Badge key={idx} variant="default">
                      {nom}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              icon={<Edit size={16} />}
              onClick={() => router.push(`/membres/${id}/modifier`)}
            >
              Modifier
            </Button>
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
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>Informations personnelles</CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem
                  icon={Calendar}
                  label="Date de naissance"
                  value={membre.dateNaissance}
                />
                <InfoItem
                  icon={Calendar}
                  label="Date de conversion"
                  value={membre.dateConversion}
                />
                <InfoItem icon={Phone} label="Contact" value={membre.contact} />
                <InfoItem
                  icon={Briefcase}
                  label="Profession"
                  value={membre.profession}
                />
                <InfoItem
                  icon={Calendar}
                  label="Date d'adhésion"
                  value={membre.dateAdhesion}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>Situation spirituelle & familiale</CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem
                  icon={Heart}
                  label="Baptisé d'eau"
                  value={membre.baptiseEau ? "Oui" : "Non"}
                />
                <InfoItem
                  icon={Droplets}
                  label="Baptisé du Saint‑Esprit"
                  value={membre.baptiseSaintEsprit ? "Oui" : "Non"}
                />
                <InfoItem
                  icon={Link2}
                  label="Liens brisés"
                  value={membre.liensBrises ? "Oui" : "Non"}
                />
                <InfoItem
                  icon={Users}
                  label="Situation matrimoniale"
                  value={membre.situationMatrimoniale || "—"}
                />
                <InfoItem
                  icon={Baby}
                  label="Nombre d'enfants"
                  value={
                    membre.nombreEnfants !== undefined
                      ? String(membre.nombreEnfants)
                      : "—"
                  }
                />
                <InfoItem
                  icon={GraduationCap}
                  label="Niveau académique"
                  value={membre.niveauAcademique || "—"}
                />
                <InfoItem
                  icon={Users}
                  label="Faiseur de disciple"
                  value={membre.faiseurDisciple || "—"}
                />
              </div>
            </CardContent>
          </Card>

          {membre.notes && (
            <div className="p-4 bg-gray-50 rounded-lg border border-border">
              <p className="text-sm text-text-secondary mb-2">Notes</p>
              <p className="text-text-primary whitespace-pre-wrap">
                {membre.notes}
              </p>
            </div>
          )}

          <Card>
            <CardHeader>Historique des rapports</CardHeader>
            <CardContent>
              {historique && historique.length > 0 ? (
                <div className="space-y-3">
                  {historique.slice(0, 5).map((rapport: any) => (
                    <Link
                      key={rapport.id}
                      href={`/rapports/${rapport.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-text-primary">
                          {rapport.periode}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {rapport.assemblee?.nom || "Assemblée inconnue"}
                        </p>
                      </div>
                      <Badge
                        variant={
                          rapport.statut === "VALIDE"
                            ? "success"
                            : rapport.statut === "SOUMIS"
                              ? "warning"
                              : "default"
                        }
                      >
                        {rapport.statut}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Aucun rapport"
                  description="Aucun rapport n'a été trouvé pour l'assemblée de ce membre."
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>Parcours spirituel</CardHeader>
            <CardContent>
              <ParcoursSpirituel membre={membre} />
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmer la suppression"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Annuler
            </Button>
            <Button
              variant="danger"
              loading={deleteMembre.isPending}
              onClick={handleDelete}
            >
              Supprimer
            </Button>
          </>
        }
      >
        <p className="text-text-secondary">
          Êtes-vous sûr de vouloir supprimer définitivement le membre{" "}
          <strong className="text-text-primary">
            {membre.prenom} {membre.nom}
          </strong>{" "}
          ? Cette action est irréversible.
        </p>
      </Modal>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon size={18} className="text-text-secondary mt-0.5" />
      <div>
        <p className="text-sm text-text-secondary">{label}</p>
        <p className="text-text-primary">{value}</p>
      </div>
    </div>
  );
}
