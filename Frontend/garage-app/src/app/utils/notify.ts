import type { TFunction } from "i18next";
import { toast } from "react-toastify";

export function translateError(t: TFunction, message: string): string {
  if (message === "NETWORK_ERROR") return t("error.network");
  if (message === "FORBIDDEN") return t("error.forbidden");
  return message || t("error.unexpected");
}

export const notifyError = (t: TFunction, message: string) =>
  toast.error(translateError(t, message));

export const notifySuccess = (message: string) => toast.success(message);

export const rejectionMessage = (error: unknown): string => (typeof error === "string" ? error : "");
