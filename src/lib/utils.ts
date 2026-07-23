import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// "satyam2450@gmail.com" -> "sa*******0@gmail.com" — for surfacing an account's
// email in UI copy without fully exposing it on screen.
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  if (local.length <= 2) return `${local.slice(0, 1)}*@${domain}`;
  const visibleStart = local.slice(0, 2);
  const visibleEnd = local.slice(-1);
  const masked = '*'.repeat(Math.max(local.length - 3, 1));
  return `${visibleStart}${masked}${visibleEnd}@${domain}`;
}
