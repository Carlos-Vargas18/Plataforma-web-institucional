import { expect, test, type Page } from '@playwright/test';

const origin = 'http://127.0.0.1:5173';
const password = process.env.APP_SEED_DEFAULT_PASSWORD || '123456';
const roles = [
  ['admin@educonnect.com', '/admin'],
  ['rector@educonnect.com', '/rector'],
  ['coordinador@educonnect.com', '/coordinador'],
  ['prof.silva@educonnect.com', '/docente'],
  ['prof.gomez@educonnect.com', '/docente'],
  ['carlosvargas@educonnect.com', '/estudiante'],
  ['juan.ramirez@gmail.com', '/tutor'],
];

async function login(page: Page, email: string, secret = password) {
  await page.goto(`${origin}/login`);
  await page.locator('#login-identifier').fill(email);
  await page.locator('#login-password').fill(secret);
  const response = page.waitForResponse((res) => res.url().endsWith('/api/v1/auth/login'));
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  return (await response).status();
}

async function selectSection(page: Page, name: string) {
  await expect(page.locator('.ec-sticky-header')).toBeVisible();
  const menu = page.locator('.ec-mobile-menu-btn');
  if (await menu.isVisible()) await menu.click();
  await page.locator('.dashboard-sidebar').getByRole('button', { name, exact: true }).click();
  await expect(page.locator('.ec-breadcrumb strong')).toHaveText(name);
}

test.use({ channel: 'msedge' });

test('public portal, invalid login and protected direct URL', async ({ page }) => {
  await page.goto(origin);
  await expect(page.getByRole('heading').first()).toBeVisible();
  for (const id of ['inicio', 'servicios', 'plataformas', 'filosofia', 'docentes', 'contacto']) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  await page.goto(`${origin}/admin`);
  await expect(page).toHaveURL(`${origin}/login`);
  expect(await login(page, 'unknown@example.test', 'IncorrectAuditPassword')).toBe(401);
  await expect(page.getByText(/Credenciales inválidas/i)).toBeVisible();
});

for (const [email, path] of roles) {
  test(`login and reload ${email}`, async ({ page }, testInfo) => {
    const start = Date.now();
    expect(await login(page, email)).toBe(200);
    await expect(page).toHaveURL(`${origin}${path}`);
    await expect(page.locator('.ec-sticky-header')).toBeVisible();
    const loginToHeaderMs = Date.now() - start;
    await page.reload();
    await expect(page.locator('.ec-sticky-header')).toBeVisible();
    await expect(page).toHaveURL(`${origin}${path}`);
    const sectionNames = await page.locator('.sidebar-item').evaluateAll((items) =>
      items.map((item) => item.getAttribute('aria-label')!),
    );
    for (const section of sectionNames) {
      await selectSection(page, section);
      await expect(page.locator('#main-content')).toBeVisible();
    }
    const resourceTimings = await page.evaluate(() =>
      performance.getEntriesByType('resource')
        .map((entry) => ({ path: new URL(entry.name).pathname, durationMs: Math.round(entry.duration) }))
        .filter((entry) => entry.path.startsWith('/api/v1/')),
    );
    await testInfo.attach('tiempos-locales', {
      body: JSON.stringify({ loginToHeaderMs, resourceTimings }, null, 2),
      contentType: 'application/json',
    });
    if (path === '/estudiante') {
      await page.goto(`${origin}/admin`);
      await expect(page).toHaveURL(`${origin}/estudiante`);
    }
    await page.locator('.btn-logout').click();
    await page.goto(`${origin}${path}`);
    await expect(page).toHaveURL(`${origin}/login`);
  });
}

test('legacy administrative role can open, paginate, search and filter its directory', async ({ page, request }) => {
  const adminLogin = await request.post(`${origin}/api/v1/auth/login`, {
    data: { email: roles[0][0], password },
  });
  expect(adminLogin.status()).toBe(200);
  const headers = { Authorization: `Bearer ${(await adminLogin.json()).token}` };
  const suffix = Date.now();
  const email = `administrativo-${suffix}-0@example.test`;
  const ids: number[] = [];
  try {
    for (const index of [0, 1, 2]) {
      const created = await request.post(`${origin}/api/v1/admin/usuarios`, {
        headers,
        data: {
          email: `administrativo-${suffix}-${index}@example.test`,
          password, rol: index === 0 ? 'ADMINISTRATIVO' : 'RECTOR',
          documento: `AUD-${suffix}-${index}`, primerNombre: 'Auditoría', primerApellido: 'Local',
        },
      });
      expect(created.status()).toBe(201);
      ids.push((await created.json()).id);
    }
    expect(await login(page, email)).toBe(200);
    await expect(page).toHaveURL(`${origin}/admin`);
    await selectSection(page, 'Usuarios y Roles');
    await expect(page.getByText('Directorio institucional')).toBeVisible();
    await page.getByRole('button', { name: 'Siguiente' }).click();
    await expect(page.getByText(/Página 2 de \d/)).toBeVisible();
    await page.getByRole('textbox', { name: /Buscar por nombre/ }).fill(email);
    await expect(page.getByText(email, { exact: true })).toBeVisible();
    await page.getByLabel('Filtrar usuarios por rol').selectOption('TUTOR');
    await expect(page.getByText(email, { exact: true })).toHaveCount(0);
  } finally {
    for (const id of ids) {
      const disabled = await request.delete(`${origin}/api/v1/admin/usuarios/${id}`, { headers });
      expect(disabled.status()).toBe(200);
    }
  }
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 700 }]) {
  test(`admin header and schedule at ${viewport.width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    expect(await login(page, roles[0][0])).toBe(200);
    const header = page.locator('.ec-sticky-header');
    for (const section of ['Usuarios y Roles', 'Horarios Escolares']) {
      await selectSection(page, section);
      await expect.poll(() => page.evaluate(() => {
        window.scrollTo({ top: 400, behavior: 'instant' });
        return window.scrollY;
      })).toBeGreaterThan(0);
      await expect.poll(async () => (await header.boundingBox())?.y).toBe(0);
      await expect(header).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    }
    const openDialog = header.getByRole('button', { name: 'Nuevo Usuario' });
    await openDialog.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Registrar Usuario Institucional' });
    await expect(dialog).toBeFocused();
    expect(await dialog.evaluate(() =>
      !!document.elementFromPoint(innerWidth / 2, 12)?.closest('.ec-modal-overlay'),
    )).toBe(true);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(openDialog).toBeFocused();
    const blocks = page.locator('.ec-schedule-block');
    await expect(blocks.first()).toBeVisible();
    const colors = await blocks.evaluateAll((nodes) => Object.fromEntries(nodes.map((node) => [
      node.getAttribute('data-subject-id'),
      getComputedStyle(node).backgroundColor,
    ])));
    expect(new Set(Object.values(colors)).size).toBeGreaterThan(1);
    await expect(blocks.first()).toHaveCSS('border-inline-start-width', '4px');
    await expect(blocks.first()).toHaveCSS('color', 'rgb(0, 0, 0)');
    await expect(blocks.first().locator('.ec-schedule-time')).toHaveText(/\d{2}:\d{2}/);
    await blocks.first().scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath('horario-administrador.png') });
    await page.reload();
    await selectSection(page, 'Horarios Escolares');
    const firstAfterReload = page.locator('.ec-schedule-block').first();
    await expect(firstAfterReload).toBeVisible();
    const id = await firstAfterReload.getAttribute('data-subject-id');
    await expect(firstAfterReload).toHaveCSS('background-color', colors[id!]);

    for (const [email, section] of [
      ['coordinador@educonnect.com', 'Horarios y Aulas'],
      ['prof.silva@educonnect.com', 'Horario Semanal'],
      ['carlosvargas@educonnect.com', 'Mi Horario de Clases'],
      ['juan.ramirez@gmail.com', 'Horario de Clases'],
    ]) {
      await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
      expect(await login(page, email)).toBe(200);
      await selectSection(page, section);
      await expect(page.locator('.ec-schedule-block').first()).toBeVisible();
      const entries = await page.locator('.ec-schedule-block').evaluateAll((nodes) => nodes.map((node) => [
        node.getAttribute('data-subject-id')!,
        getComputedStyle(node).backgroundColor,
      ]));
      const shared = entries.filter(([subject]) => subject in colors);
      expect(shared.length).toBeGreaterThan(0);
      for (const [subject, color] of shared) expect(color).toBe(colors[subject]);
    }
  });
}

test('admin creates, filters, reloads and deletes an isolated schedule block', async ({ page }) => {
  expect(await login(page, roles[0][0])).toBe(200);
  await selectSection(page, 'Horarios Escolares');
  const room = 'Aula de auditoría';
  const form = page.locator('form').filter({ has: page.getByRole('button', { name: 'Asignar Bloque' }) });
  await form.getByLabel('Grupo', { exact: true }).selectOption('10-A');
  await form.getByLabel('Día', { exact: true }).selectOption('VIERNES');
  await form.getByLabel('Franja Horaria').selectOption('12:30 - 13:30');
  await form.getByLabel('Asignatura').selectOption('Cálculo y Trigonometría');
  await form.getByLabel('Docente').selectOption('Roberto Arturo Silva Pineda');
  await form.getByLabel('Salón / Aula').fill(room);
  const created = page.waitForResponse((res) => res.url().endsWith('/api/v1/horarios') && res.request().method() === 'POST');
  await form.getByRole('button', { name: 'Asignar Bloque' }).dblclick();
  expect((await created).status()).toBe(201);
  const block = page.locator('.ec-schedule-block').filter({ hasText: room });
  await expect(block).toHaveCount(1);
  await page.reload();
  await selectSection(page, 'Horarios Escolares');
  await expect(block).toHaveCount(1);
  await page.getByLabel('Grupo del horario administrativo').selectOption('10-B');
  await expect(block).toHaveCount(0);
  await page.getByLabel('Grupo del horario administrativo').selectOption('10-A');
  await expect(block).toHaveCount(1);
  page.once('dialog', (dialog) => void dialog.accept());
  const deleted = page.waitForResponse((res) => /\/api\/v1\/horarios\/\d+$/.test(res.url()) && res.request().method() === 'DELETE');
  await block.getByRole('button', { name: 'Eliminar bloque horario' }).click();
  expect((await deleted).status()).toBe(200);
  await expect(block).toHaveCount(0);
});

test('teacher saves grade and attendance registers from the browser', async ({ page }) => {
  expect(await login(page, 'prof.silva@educonnect.com')).toBe(200);
  await selectSection(page, 'Planilla Decreto 1290');
  await expect(page.locator('tbody input[type="number"]').first()).toBeVisible();
  const gradesSaved = page.waitForResponse((res) => res.url().endsWith('/calificaciones/planilla')
    && res.request().method() === 'POST');
  await page.getByRole('button', { name: 'Guardar Planilla' }).click();
  const grades = await gradesSaved;
  expect(grades.status()).toBe(200);
  expect((await grades.json()).length).toBeGreaterThan(0);
  await expect(page.getByText(/Planilla Decreto 1290.*estudiantes.*guardada/)).toBeVisible();

  await selectSection(page, 'Asistencia a Clase');
  const attendanceSaved = page.waitForResponse((res) => res.url().endsWith('/asistencias/planilla')
    && res.request().method() === 'POST');
  await page.getByRole('button', { name: 'Guardar Asistencia en Servidor' }).click();
  const attendance = await attendanceSaved;
  expect(attendance.status()).toBe(200);
  expect((await attendance.json()).length).toBeGreaterThan(0);
  await expect(page.getByText(/Registro de asistencia de la sesión guardado/)).toBeVisible();
});

test('session restoration recovers from 503, disconnection and expired credentials', async ({ page }) => {
  expect(await login(page, roles[0][0])).toBe(200);
  await expect(page).toHaveURL(`${origin}/admin`);
  await page.route('**/api/v1/auth/me', (route) => route.fulfill({ status: 503 }));
  await page.reload();
  await expect(page.getByRole('button', { name: 'Reintentar' })).toBeVisible();
  await page.unrouteAll();
  await page.route('**/api/v1/auth/me', (route) => route.abort('internetdisconnected'));
  await page.getByRole('button', { name: 'Reintentar' }).click();
  await expect(page.getByRole('button', { name: 'Reintentar' })).toBeVisible();
  await page.unrouteAll();
  await page.getByRole('button', { name: 'Reintentar' }).click();
  await expect(page.locator('.ec-sticky-header')).toBeVisible();
  await page.route('**/api/v1/auth/me', (route) => route.fulfill({ status: 401 }));
  await page.reload();
  await expect(page).toHaveURL(`${origin}/login`);
});

test('session verification leaves loading when the API does not respond', async ({ page }) => {
  expect(await login(page, roles[0][0])).toBe(200);
  await expect(page).toHaveURL(`${origin}/admin`);
  let releaseRequest: () => void = () => {};
  const holdRequest = new Promise<void>((resolve) => { releaseRequest = resolve; });
  await page.route('**/api/v1/auth/me', async (route) => {
    await holdRequest;
    await route.abort().catch(() => {});
  });
  try {
    await page.reload();
    await expect(page.getByText(/Verificando credenciales/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reintentar' })).toBeVisible({ timeout: 20000 });
  } finally {
    releaseRequest();
    await page.unrouteAll({ behavior: 'wait' });
  }
  await page.getByRole('button', { name: 'Reintentar' }).click();
  await expect(page.locator('.ec-sticky-header')).toBeVisible();
});
