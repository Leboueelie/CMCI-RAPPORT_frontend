"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { navigationItems } from "@/config/navigation";

export function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Filtrer les liens autorisés pour le rôle courant
  const allowedItems = navigationItems.filter(
    (item) => user && item.roles.includes(user.role as any),
  );

  return (
    <aside
      className={`
        hidden md:flex flex-col
        bg-surface border-r border-border
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-16" : "w-60"}
      `}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="p-2 m-2 self-end rounded-lg text-text-secondary hover:bg-gray-100 transition-colors"
        aria-label={
          collapsed ? "Étendre la navigation" : "Réduire la navigation"
        }
      >
        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      <nav
        className="flex-1 px-2 pb-4 space-y-1"
        role="navigation"
        aria-label="Navigation principale"
      >
        {allowedItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${isActive ? "bg-primary/10 text-primary" : "text-text-secondary hover:bg-gray-100"}
                ${collapsed ? "justify-center" : ""}
              `}
              title={collapsed ? label : undefined}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
