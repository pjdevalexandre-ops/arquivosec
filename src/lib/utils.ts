import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  } catch {
    return "—";
  }
}

export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "—";
  }
}

export function formatRelativeTime(dateString?: string | null): string {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 30) return formatDate(dateString);
    if (diffDay > 1) return `Há ${diffDay} dias`;
    if (diffDay === 1) return "Ontem";
    if (diffHour >= 1) return `Há ${diffHour} hora${diffHour > 1 ? "s" : ""}`;
    if (diffMin >= 1) return `Há ${diffMin} minuto${diffMin > 1 ? "s" : ""}`;
    return "Agora mesmo";
  } catch {
    return "—";
  }
}

export function getFileTypeBadge(mimeType: string, extension: string) {
  const ext = extension.toLowerCase().replace(".", "");
  if (mimeType.includes("pdf") || ext === "pdf") {
    return { label: "PDF", bg: "bg-red-50 text-red-700 border-red-200" };
  }
  if (mimeType.includes("image") || ["jpg", "jpeg", "png", "webp", "tiff"].includes(ext)) {
    return { label: "IMG", bg: "bg-blue-50 text-blue-700 border-blue-200" };
  }
  return { label: ext.toUpperCase() || "DOC", bg: "bg-slate-50 text-slate-700 border-slate-200" };
}

export function sanitizeFileName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
}
