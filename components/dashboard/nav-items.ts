import { LayoutDashboard, Ticket, Users, Settings } from "lucide-react";

export const menuItems = [
  {
    label: "Tableau de bord",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Tickets",
    href: "/dashboard/tickets",
    icon: Ticket,
  },
  {
    label: "Utilisateurs",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    label: "Paramètres",
    href: "/dashboard/settings",
    icon: Settings,
  },
];
