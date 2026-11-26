import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProtectedRoute } from '../app/guards/ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';
import { getStoredToken, setStoredToken } from '../services/api/httpClient';

const profile = { id: 1, rol: 'DOCENTE', email: 'docente@example.test', nombreCompleto: 'Docente de prueba' };

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('Restauración de sesión', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    setStoredToken('session-fixture');
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    setStoredToken(null);
    vi.unstubAllGlobals();
  });

  async function render() {
    await act(async () => root.render(
      <MemoryRouter initialEntries={['/docente']}>
        <AuthProvider>
          <Routes>
            <Route path="/docente" element={<ProtectedRoute allowedRoles={['DOCENTE']}>Panel protegido</ProtectedRoute>} />
            <Route path="/login" element={<p>Inicio de sesión</p>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    ));
  }

  it.each(['red', 'servidor'])('preserva la sesión y permite reintentar tras un fallo de %s', async (cause) => {
    const fetchMock = vi.fn();
    if (cause === 'red') fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    else fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Temporalmente indisponible' }, 503));
    fetchMock.mockResolvedValueOnce(jsonResponse(profile));
    vi.stubGlobal('fetch', fetchMock);

    await render();

    expect(getStoredToken()).toBe('session-fixture');
    expect(container.textContent).not.toContain('Panel protegido');
    const retry = container.querySelector('button');
    expect(retry?.textContent).toBe('Reintentar');
    await act(async () => retry.click());
    expect(container.textContent).toContain('Panel protegido');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('borra la sesión vencida cuando la API devuelve 401 y vuelve al acceso', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, 401)));

    await render();

    expect(getStoredToken()).toBeNull();
    expect(container.textContent).toContain('Inicio de sesión');
  });
});
