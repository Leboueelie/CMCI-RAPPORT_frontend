import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <EmptyState
        icon={
          <div className="text-8xl font-bold text-primary/20 mb-4">404</div>
        }
        title="Page introuvable"
        description="La page que vous recherchez n'existe pas ou a été déplacée."
        action={
          <div className="flex gap-3">
            <Link href="/dashboard">
              <Button variant="primary" icon={<Home size={16} />}>
                Accueil
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" icon={<ArrowLeft size={16} />}>
                Retour
              </Button>
            </Link>
          </div>
        }
      />
    </div>
  );
}
