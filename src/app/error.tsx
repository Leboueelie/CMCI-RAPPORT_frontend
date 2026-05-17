"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erreur capturée :", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <EmptyState
        icon={<AlertTriangle className="text-danger" size={48} />}
        title="Une erreur est survenue"
        description={error.message || "Veuillez réessayer."}
        action={
          <div className="flex gap-3">
            <Button
              variant="primary"
              icon={<RotateCcw size={16} />}
              onClick={reset}
            >
              Réessayer
            </Button>
            <Link href="/dashboard">
              <Button variant="ghost" icon={<Home size={16} />}>
                Accueil
              </Button>
            </Link>
          </div>
        }
      />
    </div>
  );
}
