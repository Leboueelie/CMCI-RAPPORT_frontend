"use client";

import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";

export function AuthenticatedContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  if (!user) {
    // Pas connecté → on affiche juste la page demandée (ex: login)
    return <>{children}</>;
  }

  return (
    <div className="flex flex-1">
      <Sidebar />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <BottomNav />
    </div>
  );
}
