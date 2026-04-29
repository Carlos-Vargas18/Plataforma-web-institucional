/* ============================================================
   CONFIGURACIÓN SUPABASE
   ============================================================ */
const SUPABASE_URL = 'https://bsxpqofjoojcdvsojcon.supabase.co';
const SUPABASE_ANON = 'sb_publishable_fRqKbNMcTrvV1XdpK4mKcQ_SV7GLCf8';

// Rol por defecto para todos los usuarios nuevos
const DEFAULT_ROLE = 'estudiante';

/* ============================================================
   INICIALIZACIÓN
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ EduConnect iniciado');
    
    // Verificar sesión existente
    const token = localStorage.getItem('sb_token');
    if (token) {
        verifyToken(token);
    }
    
    // Event listener para el botón login
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    
    // Permitir Enter en los campos
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (emailInput) {
        emailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLogin();
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLogin();
        });
    }
});

/* ============================================================
   VERIFICAR TOKEN
   ============================================================ */
async function verifyToken(token) {
    try {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_ANON,
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            console.log('✅ Sesión válida');
            showDashboard();
        } else {
            console.log('❌ Sesión expirada');
            localStorage.clear();
        }
    } catch (error) {
        console.error('Error verificando token:', error);
        localStorage.clear();
    }
}

/* ============================================================
   MOSTRAR / OCULTAR CONTRASEÑA
   ============================================================ */
function togglePassword() {
    const input = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');
    
    if (input.type === 'password') {
        input.type = 'text';
        if (eyeIcon) {
            eyeIcon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
        }
    } else {
        input.type = 'password';
        if (eyeIcon) {
            eyeIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
        }
    }
}

/* ============================================================
   MENSAJES DE ERROR
   ============================================================ */
function showError(msg) {
    const el = document.getElementById('errorMsg');
    if (el) {
        el.textContent = '⚠️ ' + msg;
        el.classList.add('show');
        setTimeout(() => {
            el.classList.remove('show');
        }, 5000);
    } else {
        alert(msg);
    }
}

/* ============================================================
   LOGIN CON GOOGLE
   ============================================================ */
async function loginWithGoogle() {
    try {
        const redirectTo = window.location.origin + window.location.pathname;
        window.location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`;
    } catch (err) {
        console.error('Error con Google:', err);
        showError('Error al conectar con Google.');
    }
}

/* ============================================================
   LOGIN
   ============================================================ */
async function handleLogin() {
    console.log('🟢 Intentando login...');
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const btn = document.getElementById('loginBtn');
    
    if (!email || !password) {
        return showError('Por favor completa todos los campos.');
    }
    
    btn.textContent = 'Ingresando...';
    btn.disabled = true;
    
    try {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            if (data.message === 'Invalid login credentials') {
                showError('❌ Correo o contraseña incorrectos.');
            } else if (data.message === 'Email not confirmed') {
                showError('📧 Por favor, confirma tu correo electrónico.');
            } else {
                showError('❌ Error al iniciar sesión.');
            }
        } else {
            console.log('✅ Login exitoso');
            
            // Guardar datos de sesión
            localStorage.setItem('sb_token', data.access_token);
            localStorage.setItem('sb_user_id', data.user.id);
            localStorage.setItem('sb_email', data.user.email);
            localStorage.setItem('sb_user_name', data.user.user_metadata?.name || email);
            
            // REDIRECCIÓN DIRECTA
            window.location.href = './HTML/dashboard-admin.html';
        }
        
    } catch (error) {
        console.error('Error:', error);
        showError('❌ Error de conexión.');
    } finally {
        btn.textContent = 'Iniciar sesión';
        btn.disabled = false;
    }
}

/* ============================================================
   REGISTRO
   ============================================================ */
async function handleRegister() {
    console.log('🟢 Intentando registro...');
    
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const btn = event.target;
    
    if (!name || !email || !password) {
        return alert('❌ Por favor, completa todos los campos.');
    }
    
    if (password.length < 6) {
        return alert('❌ La contraseña debe tener al menos 6 caracteres.');
    }
    
    const originalText = btn.textContent;
    btn.textContent = 'Registrando...';
    btn.disabled = true;
    
    try {
        // Registrar usuario con rol por defecto
        const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON
            },
            body: JSON.stringify({
                email,
                password,
                data: { 
                    name: name,
                    role: DEFAULT_ROLE  // Rol por defecto: 'estudiante'
                }
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            if (data.message === 'User already registered') {
                alert('❌ Este correo ya está registrado.');
            } else {
                alert('❌ Error: ' + (data.message || 'No se pudo registrar.'));
            }
            return;
        }
        
        // Intentar login automático
        const loginResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON
            },
            body: JSON.stringify({ email, password })
        });
        
        const loginData = await loginResponse.json();
        
        if (loginResponse.ok) {
            // Login exitoso
            localStorage.setItem('sb_token', loginData.access_token);
            localStorage.setItem('sb_user_id', loginData.user.id);
            localStorage.setItem('sb_email', loginData.user.email);
            localStorage.setItem('sb_user_name', name);
            
            closeModal('registerModal');
            showDashboard();
            
            // Limpiar campos
            document.getElementById('regName').value = '';
            document.getElementById('regEmail').value = '';
            document.getElementById('regPassword').value = '';
        } else {
            alert('✅ ¡Registro exitoso! Ahora puedes iniciar sesión.');
            closeModal('registerModal');
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error de conexión.');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

/* ============================================================
   RECUPERAR CONTRASEÑA
   ============================================================ */
async function handleForgotPassword() {
    const email = document.getElementById('forgotEmail').value.trim();
    
    if (!email) {
        return alert('Ingresa tu correo electrónico.');
    }
    
    try {
        await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON
            },
            body: JSON.stringify({ email })
        });
        
        alert('✅ Revisa tu correo para restablecer tu contraseña.');
        closeModal('forgotModal');
        document.getElementById('forgotEmail').value = '';
    } catch (error) {
        alert('❌ Error al enviar el correo.');
    }
}

/* ============================================================
   MODALES
   ============================================================ */
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
}

function closeModalOutside(e, id) {
    if (e.target.classList.contains('overlay')) {
        closeModal(id);
    }
}



   /* ============================================================
   FUNCIONES PARA DATOS DEL DASHBOARD EN VIVO
   ============================================================ */

// Obtener estadísticas del dashboard (VERSIÓN COMPLETA - TODAS LAS MÉTRICAS)
async function loadDashboardStats() {
    try {
        const token = localStorage.getItem('sb_token');
        
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_dashboard_stats`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON,
                'Authorization': `Bearer ${token}`
            }
        });
        
        const stats = await response.json();
        console.log('Estadísticas cargadas:', stats);
        
        // === TARJETAS PRINCIPALES ===
        const estudiantesElement = document.querySelector('.stat-card:first-child .stat-info h3');
        const materiasElement = document.querySelector('.stat-card:nth-child(2) .stat-info h3');
        const calificacionesElement = document.querySelector('.stat-card:nth-child(3) .stat-info h3');
        const gruposElement = document.querySelector('.stat-card:nth-child(4) .stat-info h3');
        
        if (estudiantesElement) estudiantesElement.textContent = stats.total_estudiantes || 0;
        if (materiasElement) materiasElement.textContent = stats.total_materias || 0;
        if (calificacionesElement) calificacionesElement.textContent = stats.total_calificaciones || 0;
        if (gruposElement) gruposElement.textContent = stats.total_grupos || 0;
        
        // === MÉTRICA 1: Promedio General ===
        const promedioElement = document.querySelector('.metric-card:first-child .metric-value');
        const promedioTrend = document.querySelector('.metric-card:first-child .metric-trend');
        
        if (promedioElement) promedioElement.textContent = stats.promedio_general || 0;
        if (promedioTrend) {
            promedioTrend.innerHTML = stats.texto_tendencia_promedio;
            promedioTrend.className = 'metric-trend ' + stats.tendencia_promedio;
        }
        
        // === MÉTRICA 2: Tasa de Aprobación ===
        const tasaElement = document.querySelector('.metric-card:nth-child(2) .metric-value');
        const tasaTrend = document.querySelector('.metric-card:nth-child(2) .metric-trend');
        
        if (tasaElement) tasaElement.textContent = (stats.tasa_aprobacion || 0) + '%';
        if (tasaTrend) {
            tasaTrend.innerHTML = stats.texto_tendencia_tasa;
            tasaTrend.className = 'metric-trend ' + stats.tendencia_tasa;
        }
        
        // === MÉTRICA 3: Meta de Graduación ===
        const metaElement = document.querySelector('.metric-card:nth-child(3) .metric-value');
        const metaText = document.querySelector('.metric-card:nth-child(3) .metric-trend');
        
        if (metaElement) metaElement.textContent = stats.meta_graduacion + '%';
        if (metaText) {
            metaText.innerHTML = stats.texto_meta;
            metaText.className = 'metric-trend ' + stats.clase_meta;
        }
        
        // === MÉTRICA 4: Objetivo Anual ===
        const objetivoElement = document.querySelector('.metric-card:nth-child(4) .metric-value');
        const objetivoText = document.querySelector('.metric-card:nth-child(4) .metric-trend');
        
        if (objetivoElement) objetivoElement.textContent = stats.objetivo_anual + '%';
        if (objetivoText) {
            objetivoText.innerHTML = stats.texto_objetivo;
            objetivoText.className = 'metric-trend ' + stats.clase_objetivo;
        }
        
        return stats;
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
        return null;
    }
}

// Obtener rendimiento por materias
async function loadRendimientoMaterias() {
    try {
        const token = localStorage.getItem('sb_token');
        
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_rendimiento_materias`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON,
                'Authorization': `Bearer ${token}`
            }
        });
        
        const materias = await response.json();
        console.log('Rendimiento cargado:', materias);
        
        const tbody = document.querySelector('.data-table tbody');
        
        if (tbody && materias && materias.length > 0) {
            tbody.innerHTML = '';
            materias.forEach(materia => {
                const row = document.createElement('tr');
                let gradeClass = 'good';
                if (materia.promedio >= 4.5) gradeClass = 'excellent';
                else if (materia.promedio >= 3.0) gradeClass = 'good';
                else gradeClass = 'bad';
                
                row.innerHTML = `
                    <td class="subject-name">${materia.materia_nombre}</td>
                    <td><span class="grade-badge ${gradeClass}">${materia.promedio}</span></td>
                    <td>${materia.aprobados}</td>
                    <td>${materia.reprobados}</td>
                    <td>${materia.mejor_estudiante || 'N/A'} (${materia.mejor_nota || 0})</td>
                `;
                tbody.appendChild(row);
            });
        } else if (tbody) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay calificaciones registradas</td></tr>';
        }
    } catch (error) {
        console.error('Error cargando materias:', error);
    }
}

/* ============================================================
   MOSTRAR DASHBOARD
   ============================================================ */




/* ============================================================
   CERRAR SESIÓN
   ============================================================ */
function logout() {
    localStorage.clear();
    window.location.reload();
}

/* ============================================================
   ATAJOS DE TECLADO
   ============================================================ */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal('forgotModal');
        closeModal('registerModal');
    }
});

// Verificar si estamos en el dashboard
if (window.location.pathname.includes('dashboard-admin.html')) {
  // No hacer nada, dejar que el dashboard maneje la sesión
  console.log('Estamos en dashboard, no redirigir');
} else {
  // Solo en login.html verificamos token para redirigir al dashboard
  const token = localStorage.getItem('sb_token');
  if (token && !window.location.pathname.includes('index.html')) {
    verifyToken(token);
  }
}