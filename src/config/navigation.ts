import {
  LayoutDashboard,
  FileText,
  Users,
  CheckSquare,
  Bell,
  UserCog,
  MapPin,
  Building2,
} from "lucide-react";
import type { UserRole } from "@/hooks/useUsers";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
  mobile?: boolean;
}

export const navigationItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Accueil",
    icon: LayoutDashboard,
    roles: [
      "ADMIN_SYSTEME",
      "DIRIGEANT_ASSEMBLEE",
      "DIRIGEANT_ZONE",
      "MISSIONNAIRE",
      "RESPONSABLE_REGIONAL",
      "RESPONSABLE_NATIONAL",
    ],
    mobile: true,
  },
  {
    href: "/rapports",
    label: "Rapports",
    icon: FileText,
    roles: [
      "ADMIN_SYSTEME",
      "DIRIGEANT_ASSEMBLEE",
      "DIRIGEANT_ZONE",
      "MISSIONNAIRE",
      "RESPONSABLE_REGIONAL",
      "RESPONSABLE_NATIONAL",
    ],
    mobile: true,
  },
  {
    href: "/membres",
    label: "Membres",
    icon: Users,
    roles: [
      "ADMIN_SYSTEME",
      "DIRIGEANT_ASSEMBLEE",
      "DIRIGEANT_ZONE",
      "MISSIONNAIRE",
      "RESPONSABLE_REGIONAL",
      "RESPONSABLE_NATIONAL",
    ],
    mobile: true,
  },
  {
    href: "/validations",
    label: "Validations",
    icon: CheckSquare,
    roles: [
      "ADMIN_SYSTEME",
      "DIRIGEANT_ZONE",
      "MISSIONNAIRE",
      "RESPONSABLE_REGIONAL",
      "RESPONSABLE_NATIONAL",
    ],
    mobile: true,
  },
  {
    href: "/notifications",
    label: "Notifications",
    icon: Bell,
    roles: [
      "ADMIN_SYSTEME",
      "DIRIGEANT_ASSEMBLEE",
      "DIRIGEANT_ZONE",
      "MISSIONNAIRE",
      "RESPONSABLE_REGIONAL",
      "RESPONSABLE_NATIONAL",
    ],
    mobile: true,
  },
  {
    href: "/utilisateurs",
    label: "Utilisateurs",
    icon: UserCog,
    roles: ["ADMIN_SYSTEME"],
    mobile: true,
  },
  {
    href: "/territoires",
    label: "Territoires",
    icon: MapPin,
    roles: [
      "ADMIN_SYSTEME",
      "DIRIGEANT_ZONE",
      "MISSIONNAIRE",
      "RESPONSABLE_REGIONAL",
      "RESPONSABLE_NATIONAL",
    ],
    // pas dans la barre mobile
  },
  {
    href: "/assemblees",
    label: "Assemblées",
    icon: Building2,
    roles: [
      "ADMIN_SYSTEME",
      "DIRIGEANT_ZONE",
      "MISSIONNAIRE",
      "RESPONSABLE_REGIONAL",
      "RESPONSABLE_NATIONAL",
    ],
    // pas dans la barre mobile
  },
];
