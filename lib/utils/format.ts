import { format } from "date-fns";

export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return "₱0.00";
  
  const number = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(number);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  return format(new Date(date), "MMM d, yyyy");
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  return format(new Date(date), "MMM d, yyyy h:mm a");
}

export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return "N/A";
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");
  
  // Format as: +63 XXX XXX XXXX
  if (cleaned.length === 11 && cleaned.startsWith("0")) {
    return `+63 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  
  // If not in expected format, return as is
  return phone;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}