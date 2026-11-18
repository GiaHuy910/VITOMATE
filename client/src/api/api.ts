import { config } from "../config/config";

const baseApi = `${config.api.server_api_dev}`;

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body instanceof FormData) {
    headers.delete("Content-Type");
  } else {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${baseApi}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new ApiError(
      data?.message || response.statusText || "Request failed",
      response.status,
      data,
    );
  }

  return data as T;
}
