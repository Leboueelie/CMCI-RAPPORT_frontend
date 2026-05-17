import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { Providers } from "@/providers/Providers";
import { Header } from "@/components/layout/Header";
import { AuthenticatedContent } from "@/components/layout/AuthenticatedContent";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CMCI - Rapports et Comptes Rendus",
  description: "Application de gestion hiérarchique des rapports CMCI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <AuthenticatedContent>{children}</AuthenticatedContent>
          </div>
        </Providers>
      </body>
    </html>
  );
}
