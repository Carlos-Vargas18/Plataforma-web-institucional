const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const TOKEN_STORAGE_KEY = 'educonnect_jwt_token';
const SERVER_URL_STORAGE_KEY = 'educonnect_backend_url';
const DEFAULT_MOBILE_BACKEND_ORIGIN = 'https://sized-pros-helps-investor.trycloudflare.com';

export function isNativeMobileRuntime(): boolean {
  if (typeof window === 'undefined') return false;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  if (cap?.isNativePlatform?.()) return true;
  return window.location.protocol === 'capacitor:' || window.location.protocol === 'file:';
}

export function getServerOrigin(): string {
  try {
    const saved = localStorage.getItem(SERVER_URL_STORAGE_KEY);
    if (saved && saved.trim()) {
      return saved.trim().replace(/\/+$/, '');
    }
  } catch {
    // Ignore storage access issues
  }
  return DEFAULT_MOBILE_BACKEND_ORIGIN;
}

export function setServerOrigin(origin: string): void {
  try {
    const clean = origin.trim().replace(/\/+$/, '');
    if (clean) {
      localStorage.setItem(SERVER_URL_STORAGE_KEY, clean);
    } else {
      localStorage.removeItem(SERVER_URL_STORAGE_KEY);
    }
  } catch {
    // Ignore storage access issues
  }
}

export function getApiBaseUrl(): string {
  if (isNativeMobileRuntime()) {
    return `${getServerOrigin()}/api/v1`;
  }
  return API_BASE_URL;
}

export class ApiClientError extends Error {
  status: number;
  validationErrors?: Record<string, string>;

  constructor(message: string, status: number, validationErrors?: Record<string, string>) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.validationErrors = validationErrors;
  }
}

export function getStoredToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY) || localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage quota errors
  }
}

export async function httpRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiClientError(
      `No se pudo conectar con el servidor (${baseUrl}). Verifica que el servidor este encendido y en el mismo Wi-Fi, o actualiza la IP en "Cambiar IP / URL".`,
      0
    );
  }

  if (response.status === 401 && !endpoint.includes('/auth/login')) {
    setStoredToken(null);
    window.dispatchEvent(new CustomEvent('educonnect:unauthorized'));
  }

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await response.json().catch(() => null) : await response.text().catch(() => '');

  if (!response.ok) {
    const msg =
      (body && typeof body === 'object' && (body.message || body.error || body.mensaje)) ||
      `Error HTTP ${response.status}: No fue posible completar la operación con el servidor.`;
    const validationErrors = body && typeof body === 'object' ? body.validationErrors : undefined;
    throw new ApiClientError(String(msg), response.status, validationErrors);
  }

  return body as T;
}

export const httpClient = {
  get: <T>(endpoint: string) => httpRequest<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, data?: unknown) =>
    httpRequest<T>(endpoint, {
      method: 'POST',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    }),
  put: <T>(endpoint: string, data?: unknown) =>
    httpRequest<T>(endpoint, {
      method: 'PUT',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    }),
  delete: <T>(endpoint: string) => httpRequest<T>(endpoint, { method: 'DELETE' }),
};
