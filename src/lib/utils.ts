import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export {
  formatDate,
  formatDateShort,
  formatDateTime,
  formatTime,
  formatTimeRange,
  formatDateTimeRange,
} from "./format-date";
