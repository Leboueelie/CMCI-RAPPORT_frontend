import React from "react";
import { Users, Building2, FileText, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import type { DashboardSummary } from "@/hooks/useDashboard";

interface StatCardsProps {
  global: DashboardSummary["global"];
  attenteCount: number;
  role?: string; // Permet d'adapter l'affichage selon le rôle
}

export function StatCards({ global, attenteCount, role }: StatCardsProps) {
  const isAdmin = role === "ADMIN_SYSTEME";

  const stats = [
    {
      label: "Assemblées",
      value: global.assemblees,
      icon: Building2,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Membres",
      value: global.membres,
      icon: Users,
      color: "text-info",
      bg: "bg-info/10",
    },
    {
      label: "Rapports",
      value: global.rapports.total,
      icon: FileText,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      label: "En attente",
      value: attenteCount,
      icon: Clock,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    // Carte supplémentaire visible uniquement par l'admin
    ...(isAdmin
      ? [
          {
            label: "Utilisateurs",
            value: global.utilisateurs.total,
            icon: Users,
            color: "text-primary",
            bg: "bg-primary/10",
          },
        ]
      : []),
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 md:p-5 flex items-center gap-4">
            <div
              className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${stat.bg} flex items-center justify-center`}
            >
              <stat.icon className={`${stat.color}`} size={22} />
            </div>
            <div>
              <p className="text-xs md:text-sm text-text-secondary">
                {stat.label}
              </p>
              <p className="text-xl md:text-2xl font-bold text-text-primary">
                {stat.value}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
