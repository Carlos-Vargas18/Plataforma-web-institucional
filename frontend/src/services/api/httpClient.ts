const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const TOKEN_STORAGE_KEY = 'educonnect_jwt_token';

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
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

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
