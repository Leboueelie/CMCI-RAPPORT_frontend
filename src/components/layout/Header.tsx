"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { Avatar } from "@/components/ui/Avatar";
import Image from "next/image";

// Hook pour détecter le clic en dehors d'un élément
function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void,
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

export function Header() {
  const { user, logout } = useAuth();
  const { data: notifData } = useNotifications();
  const router = useRouter();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setDropdownOpen(false));
  useClickOutside(mobileMenuRef, () => setMobileMenuOpen(false));

  // Si pas d'utilisateur, ne rien afficher (page login par exemple)
  if (!user) {
    return null;
  }

  const unreadNotif = notifData?.unreadCount ?? 0;
  const initiales = `${user.prenom?.[0] || ""}${user.nom?.[0] || ""}`;

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-surface border-b border-border shadow-sm">
      <div className="flex items-center justify-between h-14 md:h-16 px-4 md:px-6">
        {/* ---------- Logo / Titre ---------- */}
        <div className="flex items-center gap-2 md:gap-3">
          <Image
            src="/logo.jpg"
            alt="CMCI"
            width={40}
            height={40}
            className="rounded-lg object-contain"
            priority
          />
          <span className="text-lg md:text-xl font-bold text-text-primary hidden sm:block">
            CMCI Rapports
          </span>
        </div>

        {/* ---------- Actions (desktop) ---------- */}
        <div className="hidden md:flex items-center gap-3">
          {/* Notifications */}
          <button
            onClick={() => router.push("/notifications")}
            className="relative p-2 rounded-lg text-text-secondary hover:bg-gray-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadNotif > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-danger text-white text-xs rounded-full flex items-center justify-center font-medium">
                {unreadNotif > 9 ? "9+" : unreadNotif}
              </span>
            )}
          </button>

          {/* Menu utilisateur */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Avatar src={user.photo} fallback={initiales} size="sm" />
              <span className="text-sm font-medium text-text-primary hidden lg:block">
                {user.prenom || user.username} {user.nom || ""}
              </span>
              <ChevronDown
                size={16}
                className={`text-text-secondary transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-surface rounded-lg shadow-lg border border-border py-1 z-50">
                <button
                  onClick={() => {
                    router.push("/profil");
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-gray-50"
                >
                  <User size={16} />
                  Profil
                </button>
                <button
                  onClick={() => {
                    router.push("/parametres");
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-gray-50"
                >
                  <Settings size={16} />
                  Paramètres
                </button>
                <hr className="my-1 border-border" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ---------- Actions (mobile) ---------- */}
        <div className="flex md:hidden items-center gap-1">
          <button
            onClick={() => router.push("/notifications")}
            className="relative p-2 rounded-lg text-text-secondary hover:bg-gray-100"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadNotif > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {unreadNotif > 9 ? "9+" : unreadNotif}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-text-secondary hover:bg-gray-100"
            aria-label="Menu utilisateur"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ---------- Dropdown mobile ---------- */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden border-t border-border bg-surface px-4 py-3 shadow-md"
        >
          <div className="flex items-center gap-3 mb-3">
            <Avatar src={user.photo} fallback={initiales} size="sm" />
            <div>
              <p className="text-sm font-medium text-text-primary">
                {user.prenom || user.username} {user.nom || ""}
              </p>
              <p className="text-xs text-text-secondary">@{user.username}</p>
            </div>
          </div>
          <button
            onClick={() => {
              router.push("/profil");
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-gray-50 rounded-lg"
          >
            <User size={16} />
            Profil
          </button>
          <button
            onClick={() => {
              router.push("/parametres");
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-gray-50 rounded-lg"
          >
            <Settings size={16} />
            Paramètres
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-red-50 rounded-lg"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      )}
    </header>
  );
}
