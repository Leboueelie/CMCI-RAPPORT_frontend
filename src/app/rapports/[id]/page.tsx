"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Send,
  Check,
  X,
  Calendar,
  Users,
  MapPin,
  FileText,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  useRapportDetail,
  useDeleteRapport,
  useSoumettreRapport,
} from "@/hooks/useRapports";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { RapportValidation } from "@/components/rapports/RapportValidation";
import { toast } from "sonner";

const statutVariant: Record<
  string,
  "success" | "warning" | "danger" | "default"
> = {
  BROUILLON: "default",
  SOUMIS: "warning",
  VALIDE: "success",
  REJETE: "danger",
};

export default function RapportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const { data: rapport, isLoading, isError } = useRapportDetail(id);
  const deleteRapport = useDeleteRapport();
  const soumettre = useSoumettreRapport();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);

  // Permissions
  const isAuteur = rapport?.soumisParId === user?.id;
  const isAdmin = user?.role === "ADMIN_SYSTEME";
  const peutModifier =
    (rapport?.statut === "BROUILLON" && (isAuteur || isAdmin)) || isAdmin;
  const peutSupprimer =
    (rapport?.statut === "BROUILLON" && (isAuteur || isAdmin)) || isAdmin;
  const peutSoumettre =
    rapport?.statut === "BROUILLON" && (isAuteur || isAdmin);
  const peutValider =
    rapport?.statut === "SOUMIS" &&
    (user?.role === "DIRIGEANT_ZONE" ||
      user?.role === "MISSIONNAIRE" ||
      user?.role === "RESPONSABLE_REGIONAL" ||
      user?.role === "RESPONSABLE_NATIONAL" ||
      isAdmin);

  // Chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Erreur ou rapport introuvable
  if (isError || !rapport) {
    return (
      <EmptyState
        icon={<AlertTriangle className="text-danger" size={48} />}
        title="Rapport introuvable"
        description="Ce rapport n'existe pas ou a été supprimé."
        action={
          <Button variant="primary" onClick={() => router.push("/rapports")}>
            Retour à la liste
          </Button>
        }
      />
    );
  }

  const handleDelete = async () => {
    try {
      await deleteRapport.mutateAsync(rapport.id);
      toast.success("Rapport supprimé.");
      router.push("/rapports");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Erreur lors de la suppression",
      );
    }
    setShowDeleteModal(false);
  };

  const handleSoumettre = async () => {
    try {
      await soumettre.mutateAsync(rapport.id);
      toast.success("Rapport soumis !");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Erreur lors de la soumission",
      );
    }
  };

  // Zone de diagnostic (à retirer après vérification) – visible uniquement si pas en brouillon ou pas auteur/admin
  const showDebug = true; // mettre à false pour masquer

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Navigation retour */}
      <Link
        href="/rapports"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft size={20} />
        Retour à la liste
      </Link>

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            Rapport {rapport.periode}
          </h1>
          <p className="text-text-secondary">
            {rapport.assemblee?.nom || "Assemblée inconnue"} ·{" "}
            {rapport.territoire?.nom}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {peutModifier && (
            <Button
              variant="outline"
              icon={<Edit size={16} />}
              onClick={() => router.push(`/rapports/${id}/modifier`)}
            >
              Modifier
            </Button>
          )}
          {peutSupprimer && (
            <Button
              variant="danger"
              icon={<Trash2 size={16} />}
              onClick={() => setShowDeleteModal(true)}
            >
              Supprimer
            </Button>
          )}
          {peutSoumettre && (
            <Button
              variant="primary"
              icon={<Send size={16} />}
              loading={soumettre.isPending}
              onClick={handleSoumettre}
            >
              Soumettre
            </Button>
          )}
          {peutValider && (
            <Button
              variant="secondary"
              icon={<Check size={16} />}
              onClick={() => setShowValidationModal(true)}
            >
              Valider/Rejeter
            </Button>
          )}
        </div>
      </div>

      {/* Badge statut et dates */}
      <div className="flex flex-wrap items-center gap-4">
        <Badge variant={statutVariant[rapport.statut] || "default"}>
          {rapport.statut}
        </Badge>
        <div className="flex items-center gap-1 text-sm text-text-secondary">
          <Calendar size={16} />
          {new Date(rapport.dateDebut).toLocaleDateString("fr-FR")} →{" "}
          {new Date(rapport.dateFin).toLocaleDateString("fr-FR")}
        </div>
      </div>

      {/* Contenu détaillé */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne principale : activités, témoignages, etc. */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>Activités</CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-text-primary">
                {rapport.activites}
              </p>
            </CardContent>
          </Card>

          {rapport.temoignages && (
            <Card>
              <CardHeader>Témoignages</CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-text-primary">
                  {rapport.temoignages}
                </p>
              </CardContent>
            </Card>
          )}

          {rapport.problemes && (
            <Card>
              <CardHeader>Problèmes rencontrés</CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-text-primary">
                  {rapport.problemes}
                </p>
              </CardContent>
            </Card>
          )}

          {rapport.besoins && (
            <Card>
              <CardHeader>Besoins</CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-text-primary">
                  {rapport.besoins}
                </p>
              </CardContent>
            </Card>
          )}

          {rapport.recommandations && (
            <Card>
              <CardHeader>Recommandations</CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-text-primary">
                  {rapport.recommandations}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Colonne latérale : métadonnées */}
        <div className="space-y-6">
          <Card>
            <CardHeader>Détails</CardHeader>
            <CardContent className="space-y-4">
              <InfoItem
                icon={Users}
                label="Effectifs"
                value={String(rapport.effectifs)}
              />
              <InfoItem
                icon={FileText}
                label="Soumis par"
                value={`${rapport.soumisPar?.prenom || ""} ${rapport.soumisPar?.nom || rapport.soumisPar?.username}`}
              />
              {rapport.dateSoumission && (
                <InfoItem
                  icon={Calendar}
                  label="Date de soumission"
                  value={new Date(rapport.dateSoumission).toLocaleDateString(
                    "fr-FR",
                  )}
                />
              )}
              {rapport.validePar && (
                <InfoItem
                  icon={Check}
                  label="Validé par"
                  value={`${rapport.validePar.prenom || ""} ${rapport.validePar.nom || rapport.validePar.username}`}
                />
              )}
              {rapport.dateValidation && (
                <InfoItem
                  icon={Calendar}
                  label="Date de validation"
                  value={new Date(rapport.dateValidation).toLocaleDateString(
                    "fr-FR",
                  )}
                />
              )}
              {rapport.rejetePar && (
                <InfoItem
                  icon={X}
                  label="Rejeté par"
                  value={`${rapport.rejetePar.prenom || ""} ${rapport.rejetePar.nom || rapport.rejetePar.username}`}
                />
              )}
              {rapport.dateRejet && (
                <InfoItem
                  icon={Calendar}
                  label="Date de rejet"
                  value={new Date(rapport.dateRejet).toLocaleDateString(
                    "fr-FR",
                  )}
                />
              )}
              {rapport.commentaireRejet && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-medium text-danger">
                    Motif du rejet
                  </p>
                  <p className="text-sm text-text-primary mt-1">
                    {rapport.commentaireRejet}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {rapport.fichierJoint && (
            <Card>
              <CardHeader>Fichier joint</CardHeader>
              <CardContent>
                <a
                  href={rapport.fichierJoint}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  Accéder au fichier
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modale suppression */}
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
              loading={deleteRapport.isPending}
              onClick={handleDelete}
            >
              Supprimer
            </Button>
          </>
        }
      >
        <p>
          Supprimer définitivement ce rapport ? Cette action est irréversible.
        </p>
      </Modal>

      {/* Modale validation */}
      {showValidationModal && (
        <Modal
          isOpen={showValidationModal}
          onClose={() => setShowValidationModal(false)}
          title="Validation du rapport"
          size="lg"
        >
          <RapportValidation
            rapport={rapport}
            onClose={() => setShowValidationModal(false)}
          />
        </Modal>
      )}
    </div>
  );
}

// Petit composant utilitaire
function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
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
