"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Vérification côté client uniquement
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  return <>{children}</>;
}
