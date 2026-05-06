// Session and UI timing constants used across pages.
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
export const TOAST_DURATION_MS = 2200;

// Allowed role options in employee management forms.
export const EMPLOYEE_ROLE_OPTIONS = [
  "Chef",
  "Waiter",
  "Bartender",
  "Cook",
  "Hostess",
] as const;

// Schedule role colors are applied in the UI through CSS classes.
export function getRoleColorClass(role: string): string {
  const normalized = role.trim().toLowerCase();
  if (normalized === "chef") return "role-color chef";
  if (normalized === "waiter") return "role-color waiter";
  if (normalized === "bartender") return "role-color bartender";
  if (normalized === "cook") return "role-color cook";
  if (normalized === "hostess") return "role-color hostess";
  return "role-color default";
}

// Shared email validation pattern for profile and registration forms.
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
