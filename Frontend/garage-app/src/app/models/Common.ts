/** Backend `MessageResponse`. */
export interface MessageResponse {
  message: string;
}

/** Backend `PageResponse<T>` (note the Backend field is spelled `totalElement`). */
export interface PageResponse<T> {
  content: T[];
  totalElement: number;
  totalPages: number;
  number: number;
  size: number;
}

/** Error body shapes produced by GlobalExceptionHandler and the JWT filter. */
export interface ApiErrorBody {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  details?: Record<string, string>;
}
