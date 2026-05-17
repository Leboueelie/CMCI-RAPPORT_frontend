"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  BellOff,
  CheckCheck,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
} from "@/hooks/useNotifications";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [filterUnread, setFilterUnread] = useState(false);
  const { data, isLoading, isError } = useNotifications(filterUnread);
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead.mutateAsync(id);
    } catch {
      toast.error("Erreur lors du marquage");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync();
      toast.success("Toutes les notifications ont été lues.");
    } catch {
      toast.error("Erreur lors du marquage");
    }
  };

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
        icon={<AlertTriangle className="text-danger" size={48} />}
        title="Erreur de chargement"
        description="Impossible de récupérer les notifications."
        action={
          <Button variant="primary" onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-2">
            <Bell className="text-primary" size={28} />
            Notifications
          </h1>
          <p className="text-text-secondary mt-1">
            {data.unreadCount} non lue{data.unreadCount > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterUnread ? "primary" : "ghost"}
            size="sm"
            icon={<BellOff size={16} />}
            onClick={() => setFilterUnread(!filterUnread)}
          >
            {filterUnread ? "Toutes" : "Non lues"}
          </Button>
          {data.unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              icon={<CheckCheck size={16} />}
              onClick={handleMarkAllAsRead}
            >
              Tout lire
            </Button>
          )}
        </div>
      </div>

      {/* Liste des notifications */}
      {data.notifications.length === 0 ? (
        <EmptyState
          title="Aucune notification"
          description={
            filterUnread
              ? "Vous avez déjà lu toutes les notifications."
              : "Vous n'avez encore reçu aucune notification."
          }
        />
      ) : (
        <div className="space-y-3">
          {data.notifications.map((notif) => (
            <Card
              key={notif.id}
              className={`transition-colors ${
                !notif.isRead ? "bg-primary/5 border-primary/20" : ""
              }`}
            >
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    )}
                    <h3
                      className={`font-medium ${!notif.isRead ? "text-text-primary" : "text-text-secondary"}`}
                    >
                      {notif.titre}
                    </h3>
                  </div>
                  <p
                    className={`text-sm ${!notif.isRead ? "text-text-primary" : "text-text-secondary"}`}
                  >
                    {notif.message}
                  </p>
                  <p className="text-xs text-text-secondary mt-2">
                    {new Date(notif.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {notif.lien && (
                    <Link href={notif.lien}>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<ArrowRight size={16} />}
                      >
                        Voir
                      </Button>
                    </Link>
                  )}
                  {!notif.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(notif.id)}
                      loading={markAsRead.isPending}
                    >
                      Marquer lue
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
