"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { useAuth } from "@/hooks/useAuth";
import { navigationItems } from "@/config/navigation";

export function BottomNav() {
  const { user } = useAuth();
  const pathname = usePathname();
  const { direction, isTop } = useScrollDirection();
  const hidden = direction === "down" && !isTop;

  const mobileItems = navigationItems.filter(
    (item) => item.mobile && user && item.roles.includes(user.role as any),
  );

  if (mobileItems.length === 0) return null;

  return (
    <nav
      className={`
        md:hidden
        fixed bottom-0 left-0 right-0 z-40
        bg-surface border-t border-border
        flex items-center justify-around
        h-16 safe-area-inset-bottom
        transition-transform duration-300 ease-in-out
        ${hidden ? "translate-y-full" : "translate-y-0"}
      `}
      role="navigation"
      aria-label="Navigation mobile"
    >
      {mobileItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={`
              flex items-center justify-center
              w-12 h-12 rounded-xl
              transition-colors
              ${isActive ? "bg-primary/10 text-primary" : "text-text-secondary"}
            `}
            aria-label={label}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
          </Link>
        );
      })}
    </nav>
  );
}
