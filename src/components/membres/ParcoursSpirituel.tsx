import React from "react";
import { Check, Heart, Droplets, Link2 } from "lucide-react";
import type { Membre } from "@/hooks/useMembres";

interface ParcoursSpirituelProps {
  membre: Membre;
}

export function ParcoursSpirituel({ membre }: ParcoursSpirituelProps) {
  const etapes = [
    {
      key: "baptiseEau",
      label: "Baptisé d'eau",
      icon: Heart,
      color: "text-blue-600",
    },
    {
      key: "baptiseSaintEsprit",
      label: "Baptisé du Saint‑Esprit",
      icon: Droplets,
      color: "text-indigo-600",
    },
    {
      key: "liensBrises",
      label: "Liens brisés",
      icon: Link2,
      color: "text-amber-600",
    },
  ];

  return (
    <div className="space-y-4">
      {etapes.map((etape) => {
        const isComplete = membre[etape.key as keyof Membre] === true;
        return (
          <div key={etape.key} className="flex items-center gap-4">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isComplete
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {isComplete ? (
                <Check size={20} strokeWidth={2.5} />
              ) : (
                <etape.icon size={20} />
              )}
            </div>
            <div>
              <p
                className={`font-medium ${isComplete ? "text-text-primary" : "text-text-secondary"}`}
              >
                {etape.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
