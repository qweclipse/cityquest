import { getStoredAuthToken } from "@/lib/api/auth-token";
import type { ApiErrorPayload } from "@/lib/api/types";

const DEVELOPMENT_API_URL = "http://localhost:8000/api";

export type ApiQuery = object;

interface ApiRequestOptions {
  body?: unknown;
  headers?: HeadersInit;
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  query?: ApiQuery;
  token?: string | null;
}

export class ApiError extends Error {
  readonly status: number;
  readonly payload: ApiErrorPayload | null;

  constructor(message: string, status: number, payload: ApiErrorPayload | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }

  get validationErrors(): Record<string, string[]> | undefined {
    return this.payload?.errors;
  }
}

export function apiBaseUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, "");
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_API_URL is required in production.");
  }

  return DEVELOPMENT_API_URL;
}

export async function apiFetch<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const method = options.method ?? (options.body === undefined ? "GET" : "POST");
  const token = options.token === undefined ? getStoredAuthToken() : options.token;
  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildApiUrl(path, options.query), {
    method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
  });

  const payload = await parseJson(response);

  if (!response.ok) {
    const errorPayload = toApiErrorPayload(payload);

    throw new ApiError(
      errorPayload?.message ?? `CityQuest API request failed with ${response.status}`,
      response.status,
      errorPayload,
    );
  }

  return payload as T;
}

function buildApiUrl(path: string, query?: ApiQuery): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${apiBaseUrl()}${normalizedPath}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => appendQueryValue(url, key, item));
        return;
      }

      appendQueryValue(url, key, value);
    });
  }

  return url.toString();
}

function appendQueryValue(url: URL, key: string, value: unknown): void {
  if (value === null || value === undefined || value === "") {
    return;
  }

  if (
    typeof value !== "string" &&
    typeof value !== "number" &&
    typeof value !== "boolean"
  ) {
    return;
  }

  url.searchParams.append(key, String(value));
}

async function parseJson(response: Response): Promise<ApiErrorPayload | unknown | null> {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return {
      message: text,
    };
  }
}

function toApiErrorPayload(payload: unknown): ApiErrorPayload | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const errors =
    record.errors && typeof record.errors === "object"
      ? (record.errors as Record<string, string[]>)
      : undefined;

  return {
    errors,
    message: typeof record.message === "string" ? record.message : undefined,
  };
}
