import axios from "axios";
import type { ApiErrorBody } from "../models/Common";

export interface AppError {
  message: string;
  status: number | null;
  fieldErrors?: Record<string, string>;
}

/**
 * Normalises every error shape the Backend can produce:
 *  - validation:  { error: "Validation failed", details: { field: message } }
 *  - business:    { timestamp, error: "message" }
 *  - JWT filter:  { timestamp, status, error: "Unauthorized", message: "..." }
 *  - empty 403/other bodies and network failures.
 * `NETWORK_ERROR` and `FORBIDDEN` are sentinel messages translated by the UI.
 */
export function toAppError(error: unknown, fallback = "Unexpected error"): AppError {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const status = error.response?.status ?? null;
    const data = error.response?.data;
    if (data && typeof data === "object") {
      if (data.details && Object.keys(data.details).length > 0) {
        return {
          status,
          fieldErrors: data.details,
          message: Object.values(data.details).join(" • "),
        };
      }
      const message = data.message || data.error;
      if (message) return { status, message };
    }
    if (!error.response) return { status: null, message: "NETWORK_ERROR" };
    if (status === 403) return { status, message: "FORBIDDEN" };
    return { status, message: error.message || fallback };
  }
  if (error instanceof Error) return { status: null, message: error.message };
  return { status: null, message: fallback };
}

export const getErrorMessage = (error: unknown, fallback?: string): string =>
  toAppError(error, fallback).message;
