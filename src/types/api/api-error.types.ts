export interface ApiErrorPayload {
  statusCode: number;
  message: string | string[];
  errors?: Record<string, string[]>;
  timestamp?: string;
  requestId?: string;
}

export type ApiErrorCategory = "configuration" | "http" | "network" | "timeout";
