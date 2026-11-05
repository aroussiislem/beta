import { TicketComplexity } from "@prisma/client";

// Ticket number generation functionality has been moved to lib/ticket-db.ts
// to avoid using Prisma in client components

// Price calculation based on complexity
export function getComplexityMultiplier(complexity: TicketComplexity): number {
  const multipliers: Record<TicketComplexity, number> = {
    SIMPLE: 1.0,
    MEDIUM: 1.5,
    COMPLEX: 2.0,
    VERY_COMPLEX: 2.5,
  };
  return multipliers[complexity] || 1.0;
}

// Calculate ticket price
export function calculateTicketPrice(
  actualHours: number,
  hourlyRate: number,
  complexity: TicketComplexity,
): number {
  const multiplier = getComplexityMultiplier(complexity);
  return actualHours * hourlyRate * multiplier;
}

// Status color mapping
export const statusColors: Record<string, string> = {
  NEW: "#3b82f6", // Blue
  ASSIGNED: "#8b5cf6", // Purple
  IN_PROGRESS: "#f97316", // Orange
  PENDING: "#eab308", // Yellow
  RESOLVED: "#84cc16", // Light green
  CLOSED: "#22c55e", // Green
  REOPENED: "#ef4444", // Red
};

// Priority color mapping
export const priorityColors: Record<string, string> = {
  LOW: "#64748b", // Gray
  MEDIUM: "#3b82f6", // Blue
  HIGH: "#f97316", // Orange
  URGENT: "#ef4444", // Red
};

// Status badge variants for shadcn/ui
export function getStatusVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  const variants: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    NEW: "default",
    ASSIGNED: "secondary",
    IN_PROGRESS: "default",
    PENDING: "default",
    RESOLVED: "secondary",
    CLOSED: "secondary",
    REOPENED: "destructive",
  };
  return variants[status] || "default";
}

// Priority badge variants for shadcn/ui
export function getPriorityVariant(
  priority: string,
): "default" | "secondary" | "destructive" | "outline" {
  const variants: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    LOW: "secondary",
    MEDIUM: "default",
    HIGH: "default",
    URGENT: "destructive",
  };
  return variants[priority] || "default";
}

// Translate status to French
export function translateStatus(status: string): string {
  const translations: Record<string, string> = {
    NEW: "Nouveau",
    ASSIGNED: "Assigné",
    IN_PROGRESS: "En cours",
    PENDING: "En attente",
    RESOLVED: "Résolu",
    CLOSED: "Fermé",
    REOPENED: "Réouvert",
  };
  return translations[status] || status;
}

// Translate priority to French
export function translatePriority(priority: string): string {
  const translations: Record<string, string> = {
    LOW: "Basse",
    MEDIUM: "Moyenne",
    HIGH: "Haute",
    URGENT: "Urgente",
  };
  return translations[priority] || priority;
}

// Translate complexity to French
export function translateComplexity(complexity: string): string {
  const translations: Record<string, string> = {
    SIMPLE: "Simple",
    MEDIUM: "Moyenne",
    COMPLEX: "Complexe",
    VERY_COMPLEX: "Très complexe",
  };
  return translations[complexity] || complexity;
}

// Translate role to French
export function translateRole(role: string): string {
  const translations: Record<string, string> = {
    ADMIN: "Administrateur",
    MANAGER: "Manager",
    DEVELOPER: "Développeur",
    CLIENT: "Client",
    ACCOUNTANT: "Comptable",
  };
  return translations[role] || role;
}
