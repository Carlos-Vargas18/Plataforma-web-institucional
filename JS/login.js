/* ============================================================
   CONFIGURACIÓN SUPABASE
   ============================================================ */
const SUPABASE_URL = 'https://bsxpqofjoojcdvsojcon.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzeHBxb2Zqb29qY2R2c29qY29uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTI5OTUsImV4cCI6MjA5MDgyODk5NX0.N35O61ntwu1HvDQk58xh8Bac2CjE3ctOieE_Hz3rdyA';

const getHeaders = () => ({
    'apikey': SUPABASE_ANON,
    'Authorization': `Bearer ${SUPABASE_ANON}`,
    'Content-Type': 'application/json'
});

/* ============================================================
   INICIALIZACIÓN - SOLO PARA LA PÁGINA DE LOGIN
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ EduConnect - Página de Login');
    
    // Verificar si ya hay sesión (solo para redirigir)
    const userData = localStorage.getItem('user_data');
    if (userData) {
        const user = JSON.parse(userData);
        if (user.rol === 'admin') {
            console.log('Sesión existente, redirigiendo a dashboard...');
            window.location.href = 'HTML/dashboard-admin.html';
            return;
        }
    }
    
    // Configurar evento del botón login
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    
    // Enter key
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
   LOGIN
   ============================================================ */
async function handleLogin() {
    console.log('🔐 Intentando login...');
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');
    const loginBtn = document.getElementById('loginBtn');
    
    if (!email || !password) {
        showError('❌ Completa todos los campos', errorMsg);
        return;
    }
    
    if (loginBtn) {
        loginBtn.textContent = 'Ingresando...';
        loginBtn.disabled = true;
    }
    
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/usuarios?email=eq.${encodeURIComponent(email)}`, {
            method: 'GET',
            headers: getHeaders()
        });
        
        if (!response.ok) {
            showError('❌ Error de conexión', errorMsg);
            resetButton(loginBtn);
            return;
        }
        
        const usuarios = await response.json();
        
        if (!usuarios || usuarios.length === 0) {
            showError('❌ Usuario no encontrado', errorMsg);
            resetButton(loginBtn);
            return;
        }
        
        const usuario = usuarios[0];
        console.log('Usuario encontrado:', usuario.email, 'Rol:', usuario.rol);
        
        if (usuario.password_hash !== password) {
            showError('❌ Contraseña incorrecta', errorMsg);
            resetButton(loginBtn);
            return;
        }
        
        if (!usuario.activo) {
            showError('⚠️ Usuario inactivo', errorMsg);
            resetButton(loginBtn);
            return;
        }
        
        // ELIMINA ESTA VERIFICACIÓN - PERMITIR TODOS LOS ROLES
        // if (usuario.rol !== 'admin') {
        //     showError('⛔ Solo administradores pueden acceder', errorMsg);
        //     resetButton(loginBtn);
        //     return;
        // }
        
        // LOGIN EXITOSO
        console.log('✅ Login exitoso. Rol:', usuario.rol);
        
        localStorage.setItem('user_data', JSON.stringify({
            id: usuario.id,
            email: usuario.email,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            rol: usuario.rol
        }));
        
        showError('✅ ¡Bienvenido! Redirigiendo...', errorMsg);
        
        // Redirigir según el rol
        setTimeout(() => {
            if (usuario.rol === 'admin') {
                window.location.href = 'HTML/dashboard-admin.html';
            } else if (usuario.rol === 'docente') {
                window.location.href = 'HTML/dashboard-docente.html';
            } else if (usuario.rol === 'estudiante') {
                window.location.href = 'HTML/dashboard-estudiante.html';
            } else if (usuario.rol === 'administrativo') {
                window.location.href = 'HTML/dashboard-administrativo.html';
            } else {
                // Por defecto, redirigir a dashboard estudiante
                window.location.href = 'HTML/dashboard-estudiante.html';
            }
        }, 1000);
        
    } catch (error) {
        console.error('Error:', error);
        showError('❌ Error de conexión', errorMsg);
        resetButton(loginBtn);
    }
}

/* ============================================================
   REGISTRO
   ============================================================ */
async function handleRegister() {
    console.log('📝 Registrando nuevo usuario...');
    
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const errorMsg = document.getElementById('errorMsg');
    const registerBtn = event.target;
    
    if (!name || !email || !password) {
        showError('❌ Completa todos los campos', errorMsg);
        return;
    }
    
    if (password.length < 6) {
        showError('❌ La contraseña debe tener al menos 6 caracteres', errorMsg);
        return;
    }
    
    const originalText = registerBtn.textContent;
    registerBtn.textContent = 'Registrando...';
    registerBtn.disabled = true;
    
    try {
        const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/usuarios?email=eq.${encodeURIComponent(email)}`, {
            method: 'GET',
            headers: getHeaders()
        });
        
        const existingUsers = await checkResponse.json();
        
        if (existingUsers && existingUsers.length > 0) {
            showError('❌ Este correo ya está registrado', errorMsg);
            registerBtn.textContent = originalText;
            registerBtn.disabled = false;
            return;
        }
        
        const nombrePartes = name.split(' ');
        const newUser = {
            email: email,
            password_hash: password,
            nombre: nombrePartes[0],
            apellido: nombrePartes.slice(1).join(' ') || 'Usuario',
            rol: 'estudiante',
            activo: true
        };
        
        const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/usuarios`, {
            method: 'POST',
            headers: {
                ...getHeaders(),
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(newUser)
        });
        
        if (!createResponse.ok) {
            showError('❌ Error al crear la cuenta', errorMsg);
            registerBtn.textContent = originalText;
            registerBtn.disabled = false;
            return;
        }
        
        showError('✅ ¡Cuenta creada! Ahora puedes iniciar sesión', errorMsg);
        
        document.getElementById('regName').value = '';
        document.getElementById('regEmail').value = '';
        document.getElementById('regPassword').value = '';
        
        setTimeout(() => {
            closeModal('registerModal');
        }, 2000);
        
    } catch (error) {
        console.error('Error:', error);
        showError('❌ Error de conexión', errorMsg);
    } finally {
        registerBtn.textContent = originalText;
        registerBtn.disabled = false;
    }
}

/* ============================================================
   MODALES
   ============================================================ */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
}

function closeModalOutside(event, modalId) {
    if (event.target.classList.contains('overlay')) {
        closeModal(modalId);
    }
}

function handleForgotPassword() {
    const errorMsg = document.getElementById('errorMsg');
    showError('📧 Contacta al administrador para recuperar tu contraseña', errorMsg);
    setTimeout(() => {
        closeModal('forgotModal');
    }, 2000);
}

function loginWithGoogle() {
    const errorMsg = document.getElementById('errorMsg');
    showError('🔧 Google Login deshabilitado', errorMsg);
}

/* ============================================================
   FUNCIONES AUXILIARES
   ============================================================ */
function showError(message, errorMsgElement) {
    if (errorMsgElement) {
        errorMsgElement.textContent = message;
        errorMsgElement.classList.add('show');
        
        if (message.includes('✅')) {
            errorMsgElement.style.background = '#d4edda';
            errorMsgElement.style.color = '#155724';
        } else {
            errorMsgElement.style.background = '#f8d7da';
            errorMsgElement.style.color = '#721c24';
        }
        
        setTimeout(() => {
            errorMsgElement.classList.remove('show');
        }, 4000);
    }
}

function resetButton(button) {
    if (button) {
        button.textContent = 'Iniciar sesión';
        button.disabled = false;
    }
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        if (eyeIcon) {
            eyeIcon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
        }
    } else {
        passwordInput.type = 'password';
        if (eyeIcon) {
            eyeIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
        }
    }
}