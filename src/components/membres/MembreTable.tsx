"use client";

import React from "react";
import { useRouter } from "next/navigation";
import type { Membre } from "@/hooks/useMembres";

interface MembreTableProps {
  membres: Membre[];
}

export function MembreTable({ membres }: MembreTableProps) {
  const router = useRouter();

  const handleRowClick = (id: string) => {
    router.push(`/membres/${id}`);
  };

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <table className="min-w-full text-xs sm:text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-2 py-2 text-left font-medium text-text-secondary w-8">
              N°
            </th>
            <th className="px-2 py-2 text-left font-medium text-text-secondary">
              Noms et prénoms
            </th>
            <th className="px-2 py-2 text-center font-medium text-text-secondary">
              Baptisé
            </th>
            <th className="px-2 py-2 text-center font-medium text-text-secondary hidden sm:table-cell">
              St-Esprit
            </th>
            <th className="px-2 py-2 text-center font-medium text-text-secondary hidden sm:table-cell">
              Liens brisés
            </th>
            <th className="px-2 py-2 text-left font-medium text-text-secondary hidden md:table-cell">
              Situation
            </th>
            <th className="px-2 py-2 text-left font-medium text-text-secondary hidden lg:table-cell">
              Contact
            </th>
            <th className="px-2 py-2 text-left font-medium text-text-secondary">
              Date conversion
            </th>
            <th className="px-2 py-2 text-left font-medium text-text-secondary hidden lg:table-cell">
              Faiseur de disciple
            </th>
            <th className="px-2 py-2 text-left font-medium text-text-secondary hidden xl:table-cell">
              Profession
            </th>
          </tr>
        </thead>
        <tbody>
          {membres.map((m, index) => (
            <tr
              key={m.id}
              className="border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => handleRowClick(m.id)}
            >
              <td className="px-2 py-1.5 text-text-secondary text-center">
                {index + 1}
              </td>
              <td className="px-2 py-1.5 font-medium">
                {m.nom} {m.prenom}
              </td>
              <td className="px-2 py-1.5 text-center">
                {m.baptiseEau ? "Oui" : "Non"}
              </td>
              <td className="px-2 py-1.5 text-center hidden sm:table-cell">
                {m.baptiseSaintEsprit ? "Oui" : "Non"}
              </td>
              <td className="px-2 py-1.5 text-center hidden sm:table-cell">
                {m.liensBrises ? "Oui" : "Non"}
              </td>
              <td className="px-2 py-1.5 hidden md:table-cell">
                {m.situationMatrimoniale || "—"}
                {m.nombreEnfants ? ` (${m.nombreEnfants})` : ""}
              </td>
              <td className="px-2 py-1.5 hidden lg:table-cell">
                {m.contact || "—"}
              </td>
              <td className="px-2 py-1.5">{m.dateConversion || "—"}</td>
              <td className="px-2 py-1.5 hidden lg:table-cell">
                {m.faiseurDisciple || "—"}
              </td>
              <td className="px-2 py-1.5 hidden xl:table-cell">
                {m.profession || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
