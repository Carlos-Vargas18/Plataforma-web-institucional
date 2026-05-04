console.log('🚀 Iniciando dashboard...');

const SUPABASE_URL = 'https://bsxpqofjoojcdvsojcon.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzeHBxb2Zqb29qY2R2c29qY29uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTI5OTUsImV4cCI6MjA5MDgyODk5NX0.N35O61ntwu1HvDQk58xh8Bac2CjE3ctOieE_Hz3rdyA';

let supabaseClient = null;
let currentSection = 'dashboard';
let estudiantesChart = null;
let gradosChart = null;
let todosUsuarios = [];
let usuarioEditandoId = null;
let todasMaterias = [];
let materiaSeleccionadaId = null;
let todasCalificaciones = [];
let calificacionEditandoId = null;
let materiasParaFiltro = [];
let estudianteSeleccionadoGlobal = null;
let materiaSeleccionadaGlobal = null;
let todosGrupos = [];
let grupoSeleccionadoId = null;
let materiaGrupoSeleccionada = null;
let docenteGrupoSeleccionado = null;
let docenteSeleccionadoGlobal = null;
let estudianteMatriculaSeleccionado = null;
let docenteGrupoAsignarSeleccionado = null;
let estudianteGrupoAsignarSeleccionado = null;

function cerrarSesion() {
    localStorage.removeItem('user_data');
    window.location.href = '../index.html';
}
window.cerrarSesion = cerrarSesion;
window.logout = cerrarSesion;

function mostrarSeccion(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    const selectedSection = document.getElementById(`${sectionId}Section`);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
    
    document.querySelectorAll('.sidebar-nav li').forEach(li => {
        li.classList.remove('active');
        if (li.getAttribute('data-section') === sectionId) {
            li.classList.add('active');
        }
    });
    
    const titles = {
        dashboard: 'Panel de Administración',
        usuarios: 'Gestión de Usuarios',
        materias: 'Gestión de Materias',
        calificaciones: 'Gestión de Calificaciones',
        grupos: 'Gestión de Grupos'
    };
    
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.textContent = titles[sectionId] || 'Panel de Administración';
    }
    currentSection = sectionId;
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM cargado');
    
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
    
    const userData = localStorage.getItem('user_data');
    if (!userData) {
        window.location.href = '../index.html';
        return;
    }
    
    const user = JSON.parse(userData);
    if (user.rol !== 'admin') {
        window.location.href = '../index.html';
        return;
    }
    
    const userNameSpan = document.getElementById('userNameDisplay');
    if (userNameSpan) {
        userNameSpan.textContent = user.nombre || 'Administrador';
    }
    
    // Configurar navegación del sidebar
    document.querySelectorAll('.sidebar-nav li').forEach(li => {
        li.addEventListener('click', () => {
            const section = li.getAttribute('data-section');
            if (section) {
                mostrarSeccion(section);
            }
        });
    });

    // Configurar búsqueda y filtro de usuarios
    const searchInput = document.getElementById('searchUsuario');
    if (searchInput) {
        searchInput.addEventListener('input', filtrarYMostrarUsuarios);
    }

    const filtroRol = document.getElementById('filtroRol');
    if (filtroRol) {
        filtroRol.addEventListener('change', filtrarYMostrarUsuarios);
    }
    
    // Eventos para materias
    const btnAgregarMateria = document.getElementById('btnAgregarMateria');
    if (btnAgregarMateria) {
        btnAgregarMateria.addEventListener('click', abrirModalAgregarMateria);
    }
    
    const searchMateria = document.getElementById('searchMateria');
    if (searchMateria) {
        searchMateria.addEventListener('input', filtrarYMostrarMaterias);
    }
    
    // Eventos para calificaciones
    const btnRegistrarCalificacion = document.getElementById('btnRegistrarCalificacion');
    if (btnRegistrarCalificacion) {
        btnRegistrarCalificacion.addEventListener('click', abrirModalRegistrarCalificacion);
    }
    
    const searchCalificacion = document.getElementById('searchCalificacion');
    if (searchCalificacion) {
        searchCalificacion.addEventListener('input', filtrarYMostrarCalificaciones);
    }
    
    const filtroMateriaCalificacion = document.getElementById('filtroMateriaCalificacion');
    if (filtroMateriaCalificacion) {
        filtroMateriaCalificacion.addEventListener('change', filtrarYMostrarCalificaciones);
    }
    
    // Eventos para grupos
    const btnCrearGrupo = document.getElementById('btnCrearGrupo');
    if (btnCrearGrupo) {
        btnCrearGrupo.addEventListener('click', abrirModalCrearGrupo);
    }
    
    const searchGrupo = document.getElementById('searchGrupo');
    if (searchGrupo) {
        searchGrupo.addEventListener('input', filtrarYMostrarGrupos);
    }
    
    await cargarTodosLosDatos();
});

async function cargarTodosLosDatos() {
    await cargarRoles();
    await cargarDocentes();
    await cargarAdministrativos();
    await cargarMateriasRegistradas();
    await cargarEstudiantesInscritos();
    await cargarGrados();
    await cargarListaUsuarios();
    await cargarListaMaterias();
    await cargarListaCalificaciones();
    await cargarListaGrupos();
    await cargarGraficos();
}

async function cargarRoles() {
    const { data, error } = await supabaseClient.from('usuarios').select('rol', { distinct: true });
    const element = document.getElementById('totalRoles');
    if (!element) return;
    
    if (error) {
        element.textContent = 'Error';
        return;
    }
    const total = data?.length || 0;
    element.textContent = total;
}

async function cargarDocentes() {
    const { data, error } = await supabaseClient.from('usuarios').select('*').eq('rol', 'docente');
    const element = document.getElementById('totalDocentes');
    if (!element) return;
    
    if (error) {
        element.textContent = 'Error';
        return;
    }
    const total = data?.length || 0;
    element.textContent = total;
}

async function cargarAdministrativos() {
    const { data, error } = await supabaseClient.from('usuarios').select('*').eq('rol', 'administrativo');
    const element = document.getElementById('totalAdministrativos');
    if (!element) return;
    
    if (error) {
        element.textContent = 'Error';
        return;
    }
    const total = data?.length || 0;
    element.textContent = total;
}

async function cargarMateriasRegistradas() {
    const { data, error } = await supabaseClient.from('materias').select('*');
    const element = document.getElementById('totalMateriasRegistradas');
    if (!element) return;
    
    if (error) {
        element.textContent = 'Error';
        return;
    }
    const total = data?.length || 0;
    element.textContent = total;
}

async function cargarEstudiantesInscritos() {
    const { data, error } = await supabaseClient.from('estudiantes').select('*');
    const element = document.getElementById('totalEstudiantesInscritos');
    if (!element) return;
    
    if (error) {
        element.textContent = 'Error';
        return;
    }
    const total = data?.length || 0;
    element.textContent = total;
}

async function cargarGrados() {
    const { data, error } = await supabaseClient.from('estudiantes').select('grado');
    const element = document.getElementById('totalGrados');
    if (!element) return;
    
    if (error) {
        element.textContent = 'Error';
        return;
    }
    const gradosUnicos = [...new Set(data?.map(e => e.grado).filter(g => g) || [])];
    const total = gradosUnicos.length;
    element.textContent = total;
}

// ==================== USUARIOS ====================
async function cargarListaUsuarios() {
    const { data, error } = await supabaseClient.from('usuarios').select('*');
    const userList = document.getElementById('userList');
    if (!userList) return;
    
    if (error || !data || data.length === 0) {
        userList.innerHTML = '<div class="user-item">No hay usuarios registrados</div>';
        return;
    }
    
    todosUsuarios = data;
    filtrarYMostrarUsuarios();
}

function filtrarYMostrarUsuarios() {
    const searchTerm = document.getElementById('searchUsuario')?.value.toLowerCase() || '';
    const rolFiltro = document.getElementById('filtroRol')?.value || 'todos';
    
    const usuariosFiltrados = todosUsuarios.filter(user => {
        const matchesSearch = 
            (user.nombre?.toLowerCase() || '').includes(searchTerm) ||
            (user.email?.toLowerCase() || '').includes(searchTerm) ||
            (user.rol?.toLowerCase() || '').includes(searchTerm);
        
        const matchesRol = rolFiltro === 'todos' || user.rol === rolFiltro;
        
        return matchesSearch && matchesRol;
    });
    
    const userList = document.getElementById('userList');
    if (usuariosFiltrados.length === 0) {
        userList.innerHTML = '<div class="user-item">No se encontraron usuarios</div>';
        return;
    }
    
    userList.innerHTML = usuariosFiltrados.map(user => `
        <div class="user-item">
            <div class="user-avatar-sm">
                <span>${user.rol === 'docente' ? '👨‍🏫' : user.rol === 'administrativo' ? '👔' : user.rol === 'admin' ? '👨‍💼' : '👨‍🎓'}</span>
            </div>
            <div class="user-details">
                <strong>${user.nombre || 'Sin nombre'}</strong>
                <span>${user.email || 'Sin email'}</span>
                <span class="user-role">${user.rol || 'Sin rol'}</span>
            </div>
            <div class="user-status active">Activo</div>
            <div class="user-actions">
                <button class="btn-view" onclick="verUsuario(${user.id})" title="Ver detalles">👁️</button>
                <button class="btn-edit" onclick="abrirModalEditar(${user.id})" title="Editar">✏️</button>
                <button class="btn-delete" onclick="eliminarUsuario(${user.id})" title="Eliminar">🗑️</button>
            </div>
        </div>
    `).join('');
}

window.verUsuario = async function(id) {
    const user = todosUsuarios.find(u => u.id === id);
    if (!user) return;
    
    let datosExtra = '';
    if (user.rol === 'estudiante') {
        const { data } = await supabaseClient.from('estudiantes').select('*').eq('email', user.email).single();
        if (data) {
            datosExtra = `
                <div class="user-detail-item">
                    <div class="user-detail-label">📚 Grado:</div>
                    <div class="user-detail-value">${data.grado || 'No asignado'}</div>
                </div>
                <div class="user-detail-item">
                    <div class="user-detail-label">📅 Fecha inscripción:</div>
                    <div class="user-detail-value">${data.fecha_inscripcion ? new Date(data.fecha_inscripcion).toLocaleDateString() : 'No registrada'}</div>
                </div>
            `;
        }
    }
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div class="user-detail-avatar">
            ${user.rol === 'docente' ? '👨‍🏫' : user.rol === 'administrativo' ? '👔' : user.rol === 'admin' ? '👨‍💼' : '👨‍🎓'}
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">👤 Nombre:</div>
            <div class="user-detail-value">${user.nombre || 'Sin nombre'}</div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">📧 Email:</div>
            <div class="user-detail-value">${user.email || 'Sin email'}</div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">🎭 Rol:</div>
            <div class="user-detail-value">
                <span style="background: #e0e7ff; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem;">
                    ${user.rol || 'Sin rol'}
                </span>
            </div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">📅 Registrado:</div>
            <div class="user-detail-value">${user.created_at ? new Date(user.created_at).toLocaleDateString() : 'No registrada'}</div>
        </div>
        ${datosExtra}
        <div class="user-detail-item">
            <div class="user-detail-label">🔒 Estado:</div>
            <div class="user-detail-value">
                <span style="background: #dcfce7; color: #15803d; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem;">
                    Activo
                </span>
            </div>
        </div>
    `;
    
    document.getElementById('userModal').style.display = 'flex';
};

window.abrirModalEditar = function(id) {
    const user = todosUsuarios.find(u => u.id === id);
    if (!user) return;
    
    usuarioEditandoId = id;
    
    if (user.rol === 'estudiante') {
        supabaseClient.from('estudiantes').select('grado').eq('email', user.email).single()
            .then(({ data }) => {
                actualizarModalEditar(user, data?.grado || '');
            });
    } else {
        actualizarModalEditar(user, '');
    }
};

function actualizarModalEditar(user, gradoActual) {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div class="user-detail-avatar" style="margin-bottom: 10px;">
            ${user.rol === 'docente' ? '👨‍🏫' : user.rol === 'administrativo' ? '👔' : user.rol === 'admin' ? '👨‍💼' : '👨‍🎓'}
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">👤 Nombre:</div>
            <div class="user-detail-value">
                <input type="text" id="editNombre" value="${user.nombre || ''}" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
            </div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">📧 Email:</div>
            <div class="user-detail-value">
                <input type="email" id="editEmail" value="${user.email || ''}" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
            </div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">🎭 Rol:</div>
            <div class="user-detail-value">
                <select id="editRol" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <option value="estudiante" ${user.rol === 'estudiante' ? 'selected' : ''}>Estudiante</option>
                    <option value="docente" ${user.rol === 'docente' ? 'selected' : ''}>Docente</option>
                    <option value="administrativo" ${user.rol === 'administrativo' ? 'selected' : ''}>Administrativo</option>
                    <option value="admin" ${user.rol === 'admin' ? 'selected' : ''}>Administrador</option>
                </select>
            </div>
        </div>
        <div class="user-detail-item" id="gradoFieldEdit" style="display: ${user.rol === 'estudiante' ? 'flex' : 'none'};">
            <div class="user-detail-label">📚 Grado:</div>
            <div class="user-detail-value">
                <select id="editGrado" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <option value="6°" ${gradoActual === '6°' ? 'selected' : ''}>6° Grado</option>
                    <option value="7°" ${gradoActual === '7°' ? 'selected' : ''}>7° Grado</option>
                    <option value="8°" ${gradoActual === '8°' ? 'selected' : ''}>8° Grado</option>
                    <option value="9°" ${gradoActual === '9°' ? 'selected' : ''}>9° Grado</option>
                    <option value="10°" ${gradoActual === '10°' ? 'selected' : ''}>10° Grado</option>
                    <option value="11°" ${gradoActual === '11°' ? 'selected' : ''}>11° Grado</option>
                </select>
            </div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">🔑 Nueva contraseña:</div>
            <div class="user-detail-value">
                <input type="password" id="editPassword" placeholder="Dejar vacío para no cambiar" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
            </div>
        </div>
        <div style="display: flex; gap: 12px; margin-top: 20px;">
            <button onclick="guardarEdicionUsuario()" style="flex: 1; padding: 10px; background: #1e3a8a; color: white; border: none; border-radius: 8px; cursor: pointer;">💾 Guardar</button>
            <button onclick="cerrarModal()" style="flex: 1; padding: 10px; background: #e2e8f0; border: none; border-radius: 8px; cursor: pointer;">Cancelar</button>
        </div>
    `;
    
    const rolSelect = document.getElementById('editRol');
    const gradoField = document.getElementById('gradoFieldEdit');
    
    if (rolSelect) {
        rolSelect.addEventListener('change', function() {
            gradoField.style.display = this.value === 'estudiante' ? 'flex' : 'none';
        });
    }
    
    document.getElementById('userModal').style.display = 'flex';
    document.querySelector('.modal-header h3').textContent = '✏️ Editar Usuario';
}

window.guardarEdicionUsuario = async function() {
    const nombre = document.getElementById('editNombre')?.value;
    const email = document.getElementById('editEmail')?.value;
    const rol = document.getElementById('editRol')?.value;
    const nuevaPassword = document.getElementById('editPassword')?.value;
    const grado = document.getElementById('editGrado')?.value;
    
    if (!nombre || !email) {
        alert('Nombre y email son obligatorios');
        return;
    }
    
    const updateData = { nombre, email, rol };
    if (nuevaPassword) {
        updateData.password_hash = nuevaPassword;
    }
    
    const { error } = await supabaseClient
        .from('usuarios')
        .update(updateData)
        .eq('id', usuarioEditandoId);
    
    if (error) {
        alert('Error al actualizar: ' + error.message);
    } else {
        if (rol === 'estudiante' && grado) {
            const { error: errEst } = await supabaseClient
                .from('estudiantes')
                .update({ nombre, email, grado })
                .eq('email', email);
            
            if (errEst && errEst.code !== 'PGRST116') {
                await supabaseClient.from('estudiantes').insert([{ 
                    nombre, 
                    email, 
                    grado,
                    fecha_inscripcion: new Date().toISOString().split('T')[0]
                }]);
            }
        }
        
        alert('Usuario actualizado correctamente');
        cerrarModal();
        await cargarTodosLosDatos();
    }
};

window.abrirModalAgregar = function() {
    usuarioEditandoId = null;
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div class="user-detail-avatar" style="margin-bottom: 10px;">➕</div>
        <div class="user-detail-item">
            <div class="user-detail-label">👤 Nombre:</div>
            <div class="user-detail-value">
                <input type="text" id="editNombre" placeholder="Nombre completo" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
            </div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">📧 Email:</div>
            <div class="user-detail-value">
                <input type="email" id="editEmail" placeholder="correo@ejemplo.com" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
            </div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">🎭 Rol:</div>
            <div class="user-detail-value">
                <select id="editRol" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <option value="estudiante">Estudiante</option>
                    <option value="docente">Docente</option>
                    <option value="administrativo">Administrativo</option>
                    <option value="admin">Administrador</option>
                </select>
            </div>
        </div>
        <div class="user-detail-item" id="gradoField" style="display: none;">
            <div class="user-detail-label">📚 Grado:</div>
            <div class="user-detail-value">
                <select id="editGrado" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <option value="6°">6° Grado</option>
                    <option value="7°">7° Grado</option>
                    <option value="8°">8° Grado</option>
                    <option value="9°">9° Grado</option>
                    <option value="10°">10° Grado</option>
                    <option value="11°">11° Grado</option>
                </select>
            </div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">🔑 Contraseña:</div>
            <div class="user-detail-value">
                <input type="password" id="editPassword" placeholder="Contraseña" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
            </div>
        </div>
        <div style="display: flex; gap: 12px; margin-top: 20px;">
            <button onclick="guardarNuevoUsuario()" style="flex: 1; padding: 10px; background: #1e3a8a; color: white; border: none; border-radius: 8px; cursor: pointer;">➕ Crear Usuario</button>
            <button onclick="cerrarModal()" style="flex: 1; padding: 10px; background: #e2e8f0; border: none; border-radius: 8px; cursor: pointer;">Cancelar</button>
        </div>
    `;
    
    const rolSelect = document.getElementById('editRol');
    const gradoField = document.getElementById('gradoField');
    
    rolSelect.addEventListener('change', function() {
        gradoField.style.display = this.value === 'estudiante' ? 'flex' : 'none';
    });
    
    document.getElementById('userModal').style.display = 'flex';
    document.querySelector('.modal-header h3').textContent = '➕ Agregar Usuario';
};

window.guardarNuevoUsuario = async function() {
    const nombre = document.getElementById('editNombre')?.value;
    const email = document.getElementById('editEmail')?.value;
    const rol = document.getElementById('editRol')?.value;
    const password = document.getElementById('editPassword')?.value;
    const grado = document.getElementById('editGrado')?.value;
    
    if (!nombre || !email || !password) {
        alert('Nombre, email y contraseña son obligatorios');
        return;
    }
    
    const { error } = await supabaseClient
        .from('usuarios')
        .insert([{ nombre, email, rol, password_hash: password, activo: true }]);
    
    if (error) {
        alert('Error al crear: ' + error.message);
    } else {
        alert('Usuario creado correctamente');
        
        if (rol === 'estudiante') {
            const fechaActual = new Date().toISOString().split('T')[0];
            await supabaseClient.from('estudiantes').insert([{ 
                nombre, 
                email, 
                grado: grado || 'No asignado',
                fecha_inscripcion: fechaActual
            }]);
        }
        
        cerrarModal();
        await cargarTodosLosDatos();
    }
};

function cerrarModal() {
    document.getElementById('userModal').style.display = 'none';
    document.querySelector('.modal-header h3').textContent = '👤 Detalles del Usuario';
}

document.addEventListener('click', function(e) {
    const modal = document.getElementById('userModal');
    if (e.target === modal) {
        cerrarModal();
    }
});

window.eliminarUsuario = async function(id) {
    const user = todosUsuarios.find(u => u.id === id);
    if (!user) return;
    
    if (confirm(`¿Eliminar al usuario "${user.nombre}"? Esta acción no se puede deshacer.`)) {
        try {
            if (user.rol === 'estudiante') {
                await supabaseClient.from('estudiantes').delete().eq('email', user.email);
            }
            
            const { error } = await supabaseClient.from('usuarios').delete().eq('id', id);
            
            if (error) {
                alert('Error al eliminar: ' + error.message);
            } else {
                alert('Usuario eliminado correctamente');
                await cargarTodosLosDatos();
            }
        } catch (err) {
            console.error('Error:', err);
            alert('Error al eliminar usuario');
        }
    }
};

// ==================== MATERIAS ====================
async function cargarListaMaterias() {
    const { data, error } = await supabaseClient
        .from('materias')
        .select('*, docente_id, usuarios!materias_docente_id_fkey(id, nombre)');
    
    const materiaList = document.getElementById('materiaList');
    if (!materiaList) return;
    
    if (error || !data || data.length === 0) {
        materiaList.innerHTML = '<div class="materia-item">No hay materias registradas</div>';
        return;
    }
    
    todasMaterias = data;
    filtrarYMostrarMaterias();
}

function filtrarYMostrarMaterias() {
    const searchTerm = document.getElementById('searchMateria')?.value.toLowerCase() || '';
    
    const materiasFiltradas = todasMaterias.filter(materia => 
        materia.nombre?.toLowerCase().includes(searchTerm) ||
        materia.codigo?.toLowerCase().includes(searchTerm)
    );
    
    const materiaList = document.getElementById('materiaList');
    if (materiasFiltradas.length === 0) {
        materiaList.innerHTML = '<div class="materia-item">No se encontraron materias</div>';
        return;
    }
    
    materiaList.innerHTML = materiasFiltradas.map(materia => `
        <div class="materia-item">
            <div style="flex: 1;">
                <strong>${materia.nombre}</strong><br>
                <small>Código: ${materia.codigo || 'N/A'}</small>
                <small style="display: block; color: #3B5BDB;">👨‍🏫 Docente: ${materia.usuarios?.nombre || 'No asignado'}</small>
            </div>
            <div class="user-actions">
                <button class="btn-view" onclick="verEstudiantesMatriculados(${materia.id})" title="Ver estudiantes">👨‍🎓</button>
                <button class="btn-edit" onclick="asignarDocente(${materia.id})" title="Asignar docente">👨‍🏫</button>
                <button class="btn-edit" onclick="matricularEstudiante(${materia.id})" title="Matricular estudiante">➕</button>
                <button class="btn-edit" onclick="editarMateria(${materia.id})">✏️</button>
                <button class="btn-delete" onclick="eliminarMateria(${materia.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

window.abrirModalAgregarMateria = function() {
    materiaSeleccionadaId = null;
    
    const modalBody = document.getElementById('materiaModalBody');
    modalBody.innerHTML = `
        <div class="user-detail-item">
            <div class="user-detail-label">📚 Nombre:</div>
            <div class="user-detail-value">
                <input type="text" id="materiaNombre" placeholder="Ej: Matemáticas" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
            </div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">🔢 Código:</div>
            <div class="user-detail-value">
                <input type="text" id="materiaCodigo" placeholder="Ej: MAT101" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
            </div>
        </div>
        <div style="display: flex; gap: 12px; margin-top: 20px;">
            <button onclick="guardarMateria()" style="flex: 1; padding: 10px; background: #1e3a8a; color: white; border: none; border-radius: 8px; cursor: pointer;">💾 Guardar</button>
            <button onclick="cerrarMateriaModal()" style="flex: 1; padding: 10px; background: #e2e8f0; border: none; border-radius: 8px; cursor: pointer;">Cancelar</button>
        </div>
    `;
    
    document.getElementById('materiaModal').style.display = 'flex';
    document.getElementById('materiaModalTitle').textContent = '📚 Agregar Materia';
};

window.editarMateria = async function(id) {
    const materia = todasMaterias.find(m => m.id === id);
    if (!materia) return;
    
    materiaSeleccionadaId = id;
    
    const modalBody = document.getElementById('materiaModalBody');
    modalBody.innerHTML = `
        <div class="user-detail-item">
            <div class="user-detail-label">📚 Nombre:</div>
            <div class="user-detail-value">
                <input type="text" id="materiaNombre" value="${materia.nombre || ''}" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
            </div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">🔢 Código:</div>
            <div class="user-detail-value">
                <input type="text" id="materiaCodigo" value="${materia.codigo || ''}" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
            </div>
        </div>
        <div style="display: flex; gap: 12px; margin-top: 20px;">
            <button onclick="guardarMateria()" style="flex: 1; padding: 10px; background: #1e3a8a; color: white; border: none; border-radius: 8px; cursor: pointer;">💾 Guardar</button>
            <button onclick="cerrarMateriaModal()" style="flex: 1; padding: 10px; background: #e2e8f0; border: none; border-radius: 8px; cursor: pointer;">Cancelar</button>
        </div>
    `;
    
    document.getElementById('materiaModal').style.display = 'flex';
    document.getElementById('materiaModalTitle').textContent = '✏️ Editar Materia';
};

window.guardarMateria = async function() {
    const nombre = document.getElementById('materiaNombre')?.value;
    const codigo = document.getElementById('materiaCodigo')?.value;
    
    if (!nombre) {
        alert('El nombre es obligatorio');
        return;
    }
    
    if (materiaSeleccionadaId) {
        const { error } = await supabaseClient
            .from('materias')
            .update({ nombre, codigo })
            .eq('id', materiaSeleccionadaId);
        
        if (error) {
            alert('Error al actualizar: ' + error.message);
        } else {
            alert('Materia actualizada correctamente');
            cerrarMateriaModal();
            await cargarTodosLosDatos();
        }
    } else {
        const { error } = await supabaseClient
            .from('materias')
            .insert([{ nombre, codigo }]);
        
        if (error) {
            alert('Error al crear: ' + error.message);
        } else {
            alert('Materia creada correctamente');
            cerrarMateriaModal();
            await cargarTodosLosDatos();
        }
    }
};

// ==================== ASIGNAR DOCENTE ====================
window.asignarDocente = async function(materiaId) {
    const materia = todasMaterias.find(m => m.id === materiaId);
    if (!materia) return;
    
    materiaSeleccionadaId = materiaId;
    
    const modalBody = document.getElementById('asignarDocenteModalBody');
    modalBody.innerHTML = `
        <div class="user-detail-item">
            <div class="user-detail-label">📚 Materia:</div>
            <div class="user-detail-value"><strong>${materia.nombre}</strong></div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">👨‍🏫 Docente:</div>
            <div class="user-detail-value">
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input type="text" id="docenteSeleccionadoDisplay" readonly placeholder="Ninguno seleccionado" style="flex: 1; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc;">
                    <button onclick="abrirBuscarDocente()" style="padding: 8px 12px; background: #dbeafe; border: none; border-radius: 8px; cursor: pointer;">🔍 Buscar</button>
                </div>
            </div>
        </div>
        <div style="display: flex; gap: 12px; margin-top: 20px;">
            <button onclick="guardarAsignacionDocente()" style="flex: 1; padding: 10px; background: #1e3a8a; color: white; border: none; border-radius: 8px; cursor: pointer;">💾 Asignar</button>
            <button onclick="cerrarAsignarDocenteModal()" style="flex: 1; padding: 10px; background: #e2e8f0; border: none; border-radius: 8px; cursor: pointer;">Cancelar</button>
        </div>
    `;
    
    document.getElementById('asignarDocenteModal').style.display = 'flex';
};

window.abrirBuscarDocente = async function() {
    const { data: docentes } = await supabaseClient
        .from('usuarios')
        .select('id, nombre, email')
        .eq('rol', 'docente');
    
    const listaDiv = document.getElementById('listaDocentesBusqueda');
    listaDiv.innerHTML = docentes?.map(d => `
        <div class="user-item" style="cursor: pointer;" onclick="seleccionarDocente(${d.id}, '${d.nombre}', '${d.email}')">
            <div class="user-avatar-sm"><span>👨‍🏫</span></div>
            <div class="user-details">
                <strong>${d.nombre}</strong>
                <span>${d.email}</span>
            </div>
        </div>
    `).join('') || '<div class="user-item">No hay docentes registrados</div>';
    
    const searchInput = document.getElementById('buscarDocenteInput');
    if (searchInput) {
        searchInput.oninput = function() {
            const term = this.value.toLowerCase();
            const filtrados = docentes?.filter(d => 
                d.nombre.toLowerCase().includes(term) || 
                d.email.toLowerCase().includes(term)
            );
            listaDiv.innerHTML = filtrados?.map(d => `
                <div class="user-item" style="cursor: pointer;" onclick="seleccionarDocente(${d.id}, '${d.nombre}', '${d.email}')">
                    <div class="user-avatar-sm"><span>👨‍🏫</span></div>
                    <div class="user-details">
                        <strong>${d.nombre}</strong>
                        <span>${d.email}</span>
                    </div>
                </div>
            `).join('') || '<div class="user-item">No se encontraron docentes</div>';
        };
    }
    
    document.getElementById('buscarDocenteModal').style.display = 'flex';
};

window.seleccionarDocente = function(id, nombre, email) {
    docenteSeleccionadoGlobal = { id, nombre, email };
    document.getElementById('docenteSeleccionadoDisplay').value = `${nombre} (${email})`;
    cerrarBuscarDocenteModal();
};

function cerrarBuscarDocenteModal() {
    document.getElementById('buscarDocenteModal').style.display = 'none';
}

window.guardarAsignacionDocente = async function() {
    if (!docenteSeleccionadoGlobal) {
        alert('Selecciona un docente');
        return;
    }
    
    const { error } = await supabaseClient
        .from('materias')
        .update({ docente_id: docenteSeleccionadoGlobal.id })
        .eq('id', materiaSeleccionadaId);
    
    if (error) {
        alert('Error al asignar docente: ' + error.message);
    } else {
        alert('Docente asignado correctamente');
        docenteSeleccionadoGlobal = null;
        cerrarAsignarDocenteModal();
        await cargarTodosLosDatos();
    }
};

// ==================== MATRICULAR ESTUDIANTE ====================
window.matricularEstudiante = async function(materiaId) {
    const materia = todasMaterias.find(m => m.id === materiaId);
    if (!materia) return;
    
    materiaSeleccionadaId = materiaId;
    
    const modalBody = document.getElementById('matricularModalBody');
    modalBody.innerHTML = `
        <div class="user-detail-item">
            <div class="user-detail-label">📚 Materia:</div>
            <div class="user-detail-value"><strong>${materia.nombre}</strong></div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">👨‍🎓 Estudiante:</div>
            <div class="user-detail-value">
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input type="text" id="estudianteMatriculaSeleccionadoDisplay" readonly placeholder="Ninguno seleccionado" style="flex: 1; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc;">
                    <button onclick="abrirBuscarEstudianteMatricula()" style="padding: 8px 12px; background: #dbeafe; border: none; border-radius: 8px; cursor: pointer;">🔍 Buscar</button>
                </div>
            </div>
        </div>
        <div style="display: flex; gap: 12px; margin-top: 20px;">
            <button onclick="guardarMatricula()" style="flex: 1; padding: 10px; background: #1e3a8a; color: white; border: none; border-radius: 8px; cursor: pointer;">📝 Matricular</button>
            <button onclick="cerrarMatricularModal()" style="flex: 1; padding: 10px; background: #e2e8f0; border: none; border-radius: 8px; cursor: pointer;">Cancelar</button>
        </div>
    `;
    
    document.getElementById('matricularEstudianteModal').style.display = 'flex';
};

window.abrirBuscarEstudianteMatricula = async function() {
    const { data: matriculados } = await supabaseClient
        .from('materias_estudiantes')
        .select('estudiante_id')
        .eq('materia_id', materiaSeleccionadaId);
    
    const matriculadosIds = matriculados?.map(m => m.estudiante_id) || [];
    
    const { data: estudiantes } = await supabaseClient
        .from('usuarios')
        .select('id, nombre, email')
        .eq('rol', 'estudiante');
    
    const estudiantesNoMatriculados = estudiantes?.filter(e => !matriculadosIds.includes(e.id)) || [];
    
    const listaDiv = document.getElementById('listaEstudiantesMatriculaBusqueda');
    listaDiv.innerHTML = estudiantesNoMatriculados?.map(e => `
        <div class="user-item" style="cursor: pointer;" onclick="seleccionarEstudianteMatricula(${e.id}, '${e.nombre}', '${e.email}')">
            <div class="user-avatar-sm"><span>👨‍🎓</span></div>
            <div class="user-details">
                <strong>${e.nombre}</strong>
                <span>${e.email}</span>
            </div>
        </div>
    `).join('') || '<div class="user-item">No hay estudiantes disponibles</div>';
    
    const searchInput = document.getElementById('buscarEstudianteMatriculaInput');
    if (searchInput) {
        searchInput.oninput = function() {
            const term = this.value.toLowerCase();
            const filtrados = estudiantesNoMatriculados?.filter(e => 
                e.nombre.toLowerCase().includes(term) || 
                e.email.toLowerCase().includes(term)
            );
            listaDiv.innerHTML = filtrados?.map(e => `
                <div class="user-item" style="cursor: pointer;" onclick="seleccionarEstudianteMatricula(${e.id}, '${e.nombre}', '${e.email}')">
                    <div class="user-avatar-sm"><span>👨‍🎓</span></div>
                    <div class="user-details">
                        <strong>${e.nombre}</strong>
                        <span>${e.email}</span>
                    </div>
                </div>
            `).join('') || '<div class="user-item">No se encontraron estudiantes</div>';
        };
    }
    
    document.getElementById('buscarEstudianteMatriculaModal').style.display = 'flex';
};

window.seleccionarEstudianteMatricula = function(id, nombre, email) {
    estudianteMatriculaSeleccionado = { id, nombre, email };
    document.getElementById('estudianteMatriculaSeleccionadoDisplay').value = `${nombre} (${email})`;
    cerrarBuscarEstudianteMatriculaModal();
};

function cerrarBuscarEstudianteMatriculaModal() {
    document.getElementById('buscarEstudianteMatriculaModal').style.display = 'none';
}

window.guardarMatricula = async function() {
    if (!estudianteMatriculaSeleccionado) {
        alert('Selecciona un estudiante');
        return;
    }
    
    const { error } = await supabaseClient
        .from('materias_estudiantes')
        .insert([{ 
            materia_id: materiaSeleccionadaId, 
            estudiante_id: estudianteMatriculaSeleccionado.id,
            fecha_matricula: new Date().toISOString().split('T')[0]
        }]);
    
    if (error) {
        alert('Error al matricular: ' + error.message);
    } else {
        alert('Estudiante matriculado correctamente');
        estudianteMatriculaSeleccionado = null;
        cerrarMatricularModal();
        await cargarTodosLosDatos();
    }
};

window.verEstudiantesMatriculados = async function(materiaId) {
    const materia = todasMaterias.find(m => m.id === materiaId);
    if (!materia) return;
    
    const { data: matriculados } = await supabaseClient
        .from('materias_estudiantes')
        .select('*, estudiantes:estudiante_id(id, nombre, email, grado)')
        .eq('materia_id', materiaId);
    
    const modalBody = document.getElementById('verEstudiantesModalBody');
    
    if (!matriculados || matriculados.length === 0) {
        modalBody.innerHTML = `<p style="text-align: center;">No hay estudiantes matriculados en ${materia.nombre}</p>`;
    } else {
        modalBody.innerHTML = `
            <div style="margin-bottom: 15px;">
                <strong>📚 ${materia.nombre}</strong> - ${matriculados.length} estudiantes
            </div>
            ${matriculados.map(m => `
                <div class="user-detail-item">
                    <div class="user-detail-value">
                        <strong>${m.estudiantes?.nombre || 'N/A'}</strong><br>
                        <small>${m.estudiantes?.email || 'N/A'} | Grado: ${m.estudiantes?.grado || 'N/A'}</small>
                    </div>
                    <button onclick="eliminarMatricula(${m.materia_id}, ${m.estudiante_id})" style="background: #fee2e2; border: none; border-radius: 8px; padding: 5px 10px; cursor: pointer;">🗑️</button>
                </div>
            `).join('')}
        `;
    }
    
    document.getElementById('verEstudiantesModal').style.display = 'flex';
};

window.eliminarMatricula = async function(materiaId, estudianteId) {
    if (confirm('¿Eliminar este estudiante de la materia?')) {
        const { error } = await supabaseClient
            .from('materias_estudiantes')
            .delete()
            .eq('materia_id', materiaId)
            .eq('estudiante_id', estudianteId);
        
        if (error) {
            alert('Error al eliminar: ' + error.message);
        } else {
            alert('Estudiante eliminado de la materia');
            await verEstudiantesMatriculados(materiaId);
            await cargarTodosLosDatos();
        }
    }
};

window.eliminarMateria = async function(id) {
    const materia = todasMaterias.find(m => m.id === id);
    if (!materia) return;
    
    if (confirm(`¿Eliminar la materia "${materia.nombre}"? También se eliminarán las matrículas asociadas.`)) {
        const { error } = await supabaseClient.from('materias').delete().eq('id', id);
        if (error) {
            alert('Error al eliminar: ' + error.message);
        } else {
            alert('Materia eliminada correctamente');
            await cargarTodosLosDatos();
        }
    }
};

function cerrarMateriaModal() {
    document.getElementById('materiaModal').style.display = 'none';
}

function cerrarAsignarDocenteModal() {
    document.getElementById('asignarDocenteModal').style.display = 'none';
}

function cerrarMatricularModal() {
    document.getElementById('matricularEstudianteModal').style.display = 'none';
}

function cerrarVerEstudiantesModal() {
    document.getElementById('verEstudiantesModal').style.display = 'none';
}

// ==================== CALIFICACIONES ====================
async function cargarListaCalificaciones() {
    const { data, error } = await supabaseClient
        .from('calificaciones')
        .select('*, materias(id, nombre, codigo)');
    
    const calificacionesList = document.getElementById('calificacionesList');
    if (!calificacionesList) return;
    
    if (error) {
        console.error('Error cargando calificaciones:', error);
        calificacionesList.innerHTML = '<div class="calificacion-item">Error al cargar calificaciones</div>';
        return;
    }
    
    if (!data || data.length === 0) {
        calificacionesList.innerHTML = '<div class="calificacion-item">No hay calificaciones registradas</div>';
        return;
    }
    
    const { data: usuarios } = await supabaseClient
        .from('usuarios')
        .select('id, nombre, email')
        .eq('rol', 'estudiante');
    
    const calificacionesConNombres = data.map(cal => {
        const estudiante = usuarios?.find(u => u.id === cal.estudiante_id);
        return {
            ...cal,
            estudiantes: estudiante || { nombre: 'Desconocido', email: '' }
        };
    });
    
    todasCalificaciones = calificacionesConNombres;
    await cargarMateriasParaFiltroCalificaciones();
    filtrarYMostrarCalificaciones();
}

async function cargarMateriasParaFiltroCalificaciones() {
    const { data } = await supabaseClient.from('materias').select('id, nombre');
    materiasParaFiltro = data || [];
    
    const filtroSelect = document.getElementById('filtroMateriaCalificacion');
    if (filtroSelect && materiasParaFiltro.length > 0) {
        const opciones = materiasParaFiltro.map(m => `<option value="${m.id}">${m.nombre}</option>`).join('');
        filtroSelect.innerHTML = '<option value="todos">Todas las materias</option>' + opciones;
    }
}

function filtrarYMostrarCalificaciones() {
    const searchTerm = document.getElementById('searchCalificacion')?.value.toLowerCase() || '';
    const materiaFiltro = document.getElementById('filtroMateriaCalificacion')?.value || 'todos';
    
    const calificacionesFiltradas = todasCalificaciones.filter(cal => {
        const matchesSearch = 
            (cal.estudiantes?.nombre?.toLowerCase() || '').includes(searchTerm) ||
            (cal.materias?.nombre?.toLowerCase() || '').includes(searchTerm);
        
        const matchesMateria = materiaFiltro === 'todos' || cal.materia_id === parseInt(materiaFiltro);
        
        return matchesSearch && matchesMateria;
    });
    
    const calificacionesList = document.getElementById('calificacionesList');
    if (calificacionesFiltradas.length === 0) {
        calificacionesList.innerHTML = '<div class="calificacion-item">No se encontraron calificaciones</div>';
        return;
    }
    
    calificacionesList.innerHTML = calificacionesFiltradas.map(cal => {
        const notas = [cal.nota1, cal.nota2, cal.nota3];
        const notaFinal = cal.nota_final || ((notas.reduce((a, b) => a + b, 0) / 3) || 0).toFixed(1);
        const notaClase = getNotaClase(parseFloat(notaFinal));
        
        let desempeno = '';
        if (notaFinal >= 4.5) desempeno = 'Excelente';
        else if (notaFinal >= 4.0) desempeno = 'Sobresaliente';
        else if (notaFinal >= 3.5) desempeno = 'Aceptable';
        else if (notaFinal >= 3.0) desempeno = 'Básico';
        else desempeno = 'Bajo';
        
        return `
            <div class="calificacion-item" style="flex-wrap: wrap;">
                <div style="flex: 2; min-width: 150px;">
                    <strong>${cal.estudiantes?.nombre || 'N/A'}</strong><br>
                    <small>📚 ${cal.materias?.nombre || 'N/A'}</small>
                </div>
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    <div style="text-align: center;">
                        <small>📝 Corte 1</small><br>
                        <strong>${cal.nota1 || '-'}</strong>
                    </div>
                    <div style="text-align: center;">
                        <small>📝 Corte 2</small><br>
                        <strong>${cal.nota2 || '-'}</strong>
                    </div>
                    <div style="text-align: center;">
                        <small>📝 Corte 3</small><br>
                        <strong>${cal.nota3 || '-'}</strong>
                    </div>
                    <div style="text-align: center; min-width: 80px;">
                        <small>⭐ Final</small><br>
                        <span class="${notaClase}">${notaFinal}</span>
                        <small style="display: block; font-size: 0.7rem;">${desempeno}</small>
                    </div>
                </div>
                <div class="user-actions">
                    <button class="btn-edit" onclick="abrirModalEditarCalificacion(${cal.id})" title="Editar">✏️</button>
                    <button class="btn-delete" onclick="eliminarCalificacion(${cal.id})" title="Eliminar">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

window.abrirModalRegistrarCalificacion = function() {
    calificacionEditandoId = null;
    estudianteSeleccionadoGlobal = null;
    materiaSeleccionadaGlobal = null;
    
    const modalBody = document.getElementById('calificacionModalBody');
    modalBody.innerHTML = `
        <div class="user-detail-item">
            <div class="user-detail-label">👨‍🎓 Estudiante:</div>
            <div class="user-detail-value">
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input type="text" id="estudianteSeleccionadoDisplay" readonly placeholder="Ninguno seleccionado" style="flex: 1; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc;">
                    <button onclick="abrirBuscarEstudiante()" style="padding: 8px 12px; background: #dbeafe; border: none; border-radius: 8px; cursor: pointer;">🔍 Buscar</button>
                </div>
            </div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">📚 Materia:</div>
            <div class="user-detail-value">
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input type="text" id="materiaSeleccionadaDisplay" readonly placeholder="Ninguna seleccionada" style="flex: 1; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc;">
                    <button onclick="abrirBuscarMateria()" style="padding: 8px 12px; background: #dbeafe; border: none; border-radius: 8px; cursor: pointer;">🔍 Buscar</button>
                </div>
            </div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">📝 Nota Corte 1:</div>
            <div class="user-detail-value">
                <input type="number" id="nota1" step="0.1" min="1" max="5" placeholder="1.0 - 5.0" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
            </div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">📝 Nota Corte 2:</div>
            <div class="user-detail-value">
                <input type="number" id="nota2" step="0.1" min="1" max="5" placeholder="1.0 - 5.0" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
            </div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">📝 Nota Corte 3:</div>
            <div class="user-detail-value">
                <input type="number" id="nota3" step="0.1" min="1" max="5" placeholder="1.0 - 5.0" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
            </div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">⭐ Nota Final:</div>
            <div class="user-detail-value">
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input type="number" id="notaFinal" step="0.1" min="1" max="5" placeholder="Calculada automáticamente" readonly style="flex: 1; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f1f5f9;">
                    <button onclick="calcularNotaFinal()" style="padding: 8px 12px; background: #e0e7ff; border: none; border-radius: 8px; cursor: pointer;">Calcular</button>
                </div>
            </div>
        </div>
        <div style="display: flex; gap: 12px; margin-top: 20px;">
            <button onclick="guardarCalificacion()" style="flex: 1; padding: 10px; background: #1e3a8a; color: white; border: none; border-radius: 8px; cursor: pointer;">💾 Guardar</button>
            <button onclick="cerrarCalificacionModal()" style="flex: 1; padding: 10px; background: #e2e8f0; border: none; border-radius: 8px; cursor: pointer;">Cancelar</button>
        </div>
    `;
    
    ['nota1', 'nota2', 'nota3'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', calcularNotaFinal);
        }
    });
    
    document.getElementById('calificacionModal').style.display = 'flex';
    document.getElementById('calificacionModalTitle').textContent = '📝 Registrar Calificación';
};

function calcularNotaFinal() {
    const nota1 = parseFloat(document.getElementById('nota1')?.value) || 0;
    const nota2 = parseFloat(document.getElementById('nota2')?.value) || 0;
    const nota3 = parseFloat(document.getElementById('nota3')?.value) || 0;
    
    let total = 0;
    let cantidad = 0;
    
    if (nota1 > 0) { total += nota1; cantidad++; }
    if (nota2 > 0) { total += nota2; cantidad++; }
    if (nota3 > 0) { total += nota3; cantidad++; }
    
    const final = cantidad > 0 ? (total / cantidad).toFixed(1) : '';
    document.getElementById('notaFinal').value = final;
}

window.abrirBuscarEstudiante = async function() {
    const { data: estudiantes } = await supabaseClient
        .from('usuarios')
        .select('id, nombre, email')
        .eq('rol', 'estudiante');
    
    const listaDiv = document.getElementById('listaEstudiantesBusqueda');
    listaDiv.innerHTML = estudiantes?.map(e => `
        <div class="user-item" style="cursor: pointer;" onclick="seleccionarEstudiante(${e.id}, '${e.nombre}', '${e.email}')">
            <div class="user-avatar-sm"><span>👨‍🎓</span></div>
            <div class="user-details">
                <strong>${e.nombre}</strong>
                <span>${e.email}</span>
            </div>
        </div>
    `).join('') || '<div class="user-item">No hay estudiantes</div>';
    
    const searchInput = document.getElementById('buscarEstudianteInput');
    if (searchInput) {
        searchInput.oninput = function() {
            const term = this.value.toLowerCase();
            const filtrados = estudiantes?.filter(e => 
                e.nombre.toLowerCase().includes(term) || 
                e.email.toLowerCase().includes(term)
            );
            listaDiv.innerHTML = filtrados?.map(e => `
                <div class="user-item" style="cursor: pointer;" onclick="seleccionarEstudiante(${e.id}, '${e.nombre}', '${e.email}')">
                    <div class="user-avatar-sm"><span>👨‍🎓</span></div>
                    <div class="user-details">
                        <strong>${e.nombre}</strong>
                        <span>${e.email}</span>
                    </div>
                </div>
            `).join('') || '<div class="user-item">No se encontraron estudiantes</div>';
        };
    }
    
    document.getElementById('buscarEstudianteModal').style.display = 'flex';
};

window.seleccionarEstudiante = function(id, nombre, email) {
    estudianteSeleccionadoGlobal = { id, nombre, email };
    document.getElementById('estudianteSeleccionadoDisplay').value = `${nombre} (${email})`;
    cerrarBuscarEstudianteModal();
};

function cerrarBuscarEstudianteModal() {
    document.getElementById('buscarEstudianteModal').style.display = 'none';
}

window.abrirBuscarMateria = async function() {
    const { data: materias } = await supabaseClient
        .from('materias')
        .select('id, nombre, codigo');
    
    const listaDiv = document.getElementById('listaMateriasBusqueda');
    listaDiv.innerHTML = materias?.map(m => `
        <div class="materia-item" style="cursor: pointer;" onclick="seleccionarMateria(${m.id}, '${m.nombre}', '${m.codigo || ''}')">
            <div>
                <strong>${m.nombre}</strong><br>
                <small>Código: ${m.codigo || 'N/A'}</small>
            </div>
        </div>
    `).join('') || '<div class="materia-item">No hay materias</div>';
    
    const searchInput = document.getElementById('buscarMateriaInput');
    if (searchInput) {
        searchInput.oninput = function() {
            const term = this.value.toLowerCase();
            const filtrados = materias?.filter(m => 
                m.nombre.toLowerCase().includes(term) || 
                (m.codigo && m.codigo.toLowerCase().includes(term))
            );
            listaDiv.innerHTML = filtrados?.map(m => `
                <div class="materia-item" style="cursor: pointer;" onclick="seleccionarMateria(${m.id}, '${m.nombre}', '${m.codigo || ''}')">
                    <div>
                        <strong>${m.nombre}</strong><br>
                        <small>Código: ${m.codigo || 'N/A'}</small>
                    </div>
                </div>
            `).join('') || '<div class="materia-item">No se encontraron materias</div>';
        };
    }
    
    document.getElementById('buscarMateriaModal').style.display = 'flex';
};

window.seleccionarMateria = function(id, nombre, codigo) {
    materiaSeleccionadaGlobal = { id, nombre, codigo };
    document.getElementById('materiaSeleccionadaDisplay').value = `${nombre} (${codigo || 'N/A'})`;
    cerrarBuscarMateriaModal();
};

function cerrarBuscarMateriaModal() {
    document.getElementById('buscarMateriaModal').style.display = 'none';
}

window.abrirModalEditarCalificacion = async function(id) {
    const calificacion = todasCalificaciones.find(c => c.id === id);
    if (!calificacion) return;
    
    calificacionEditandoId = id;
    estudianteSeleccionadoGlobal = calificacion.estudiantes;
    materiaSeleccionadaGlobal = calificacion.materias;
    
    const modalBody = document.getElementById('calificacionModalBody');
    modalBody.innerHTML = `
        <div class="user-detail-item">
            <div class="user-detail-label">👨‍🎓 Estudiante:</div>
            <div class="user-detail-value">
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input type="text" id="estudianteSeleccionadoDisplay" readonly value="${calificacion.estudiantes?.nombre || ''} (${calificacion.estudiantes?.email || ''})" style="flex: 1; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc;">
                    <button onclick="abrirBuscarEstudiante()" style="padding: 8px 12px; background: #dbeafe; border: none; border-radius: 8px; cursor: pointer;">🔍 Buscar</button>
                </div>
            </div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">📚 Materia:</div>
            <div class="user-detail-value">
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input type="text" id="materiaSeleccionadaDisplay" readonly value="${calificacion.materias?.nombre || ''} (${calificacion.materias?.codigo || ''})" style="flex: 1; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc;">
                    <button onclick="abrirBuscarMateria()" style="padding: 8px 12px; background: #dbeafe; border: none; border-radius: 8px; cursor: pointer;">🔍 Buscar</button>
                </div>
            </div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">📝 Nota Corte 1:</div>
            <div class="user-detail-value">
                <input type="number" id="nota1" step="0.1" min="1" max="5" value="${calificacion.nota1 || ''}" placeholder="1.0 - 5.0" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
            </div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">📝 Nota Corte 2:</div>
            <div class="user-detail-value">
                <input type="number" id="nota2" step="0.1" min="1" max="5" value="${calificacion.nota2 || ''}" placeholder="1.0 - 5.0" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
            </div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">📝 Nota Corte 3:</div>
            <div class="user-detail-value">
                <input type="number" id="nota3" step="0.1" min="1" max="5" value="${calificacion.nota3 || ''}" placeholder="1.0 - 5.0" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
            </div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">⭐ Nota Final:</div>
            <div class="user-detail-value">
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input type="number" id="notaFinal" step="0.1" min="1" max="5" value="${calificacion.nota_final || ''}" placeholder="Calculada automáticamente" style="flex: 1; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <button onclick="calcularNotaFinal()" style="padding: 8px 12px; background: #e0e7ff; border: none; border-radius: 8px; cursor: pointer;">Calcular</button>
                </div>
            </div>
        </div>
        <div style="display: flex; gap: 12px; margin-top: 20px;">
            <button onclick="guardarCalificacion()" style="flex: 1; padding: 10px; background: #1e3a8a; color: white; border: none; border-radius: 8px; cursor: pointer;">💾 Actualizar</button>
            <button onclick="cerrarCalificacionModal()" style="flex: 1; padding: 10px; background: #e2e8f0; border: none; border-radius: 8px; cursor: pointer;">Cancelar</button>
        </div>
    `;
    
    ['nota1', 'nota2', 'nota3'].forEach(notaId => {
        const input = document.getElementById(notaId);
        if (input) {
            input.addEventListener('input', calcularNotaFinal);
        }
    });
    
    document.getElementById('calificacionModal').style.display = 'flex';
    document.getElementById('calificacionModalTitle').textContent = '✏️ Editar Calificación';
};

window.guardarCalificacion = async function() {
    if (!estudianteSeleccionadoGlobal) {
        alert('Selecciona un estudiante');
        return;
    }
    
    if (!materiaSeleccionadaGlobal) {
        alert('Selecciona una materia');
        return;
    }
    
    const nota1 = parseFloat(document.getElementById('nota1')?.value) || null;
    const nota2 = parseFloat(document.getElementById('nota2')?.value) || null;
    const nota3 = parseFloat(document.getElementById('nota3')?.value) || null;
    let notaFinal = parseFloat(document.getElementById('notaFinal')?.value) || null;
    
    const validarNota = (n) => n === null || (n >= 1 && n <= 5);
    if (!validarNota(nota1) || !validarNota(nota2) || !validarNota(nota3)) {
        alert('Las notas deben estar entre 1 y 5');
        return;
    }
    
    if (!notaFinal) {
        let total = 0;
        let cantidad = 0;
        if (nota1) { total += nota1; cantidad++; }
        if (nota2) { total += nota2; cantidad++; }
        if (nota3) { total += nota3; cantidad++; }
        notaFinal = cantidad > 0 ? parseFloat((total / cantidad).toFixed(1)) : null;
    }
    
    const data = {
        estudiante_id: estudianteSeleccionadoGlobal.id,
        materia_id: materiaSeleccionadaGlobal.id,
        nota1: nota1,
        nota2: nota2,
        nota3: nota3,
        nota_final: notaFinal
    };
    
    if (calificacionEditandoId) {
        const { error } = await supabaseClient
            .from('calificaciones')
            .update(data)
            .eq('id', calificacionEditandoId);
        
        if (error) {
            alert('Error al actualizar: ' + error.message);
        } else {
            alert('Calificación actualizada correctamente');
            cerrarCalificacionModal();
            await cargarTodosLosDatos();
        }
    } else {
        const { data: existente } = await supabaseClient
            .from('calificaciones')
            .select('id')
            .eq('estudiante_id', estudianteSeleccionadoGlobal.id)
            .eq('materia_id', materiaSeleccionadaGlobal.id);
        
        if (existente && existente.length > 0) {
            alert('Ya existe una calificación para este estudiante en esta materia. Puedes editarla.');
            return;
        }
        
        const { error } = await supabaseClient
            .from('calificaciones')
            .insert([data]);
        
        if (error) {
            alert('Error al registrar: ' + error.message);
        } else {
            alert('Calificación registrada correctamente');
            cerrarCalificacionModal();
            await cargarTodosLosDatos();
        }
    }
};

window.eliminarCalificacion = async function(id) {
    if (confirm('¿Eliminar esta calificación? Esta acción no se puede deshacer.')) {
        const { error } = await supabaseClient
            .from('calificaciones')
            .delete()
            .eq('id', id);
        
        if (error) {
            alert('Error al eliminar: ' + error.message);
        } else {
            alert('Calificación eliminada correctamente');
            await cargarTodosLosDatos();
        }
    }
};

function cerrarCalificacionModal() {
    document.getElementById('calificacionModal').style.display = 'none';
    estudianteSeleccionadoGlobal = null;
    materiaSeleccionadaGlobal = null;
}

// ==================== GRUPOS ====================
async function cargarListaGrupos() {
    const { data, error } = await supabaseClient
        .from('grupos')
        .select('*, materias(id, nombre, codigo), docentes:docente_id(id, nombre)');
    
    const grupoList = document.getElementById('grupoList');
    if (!grupoList) return;
    
    if (error) {
        grupoList.innerHTML = '<div class="grupo-item">Error al cargar grupos</div>';
        return;
    }
    
    if (!data || data.length === 0) {
        grupoList.innerHTML = '<div class="grupo-item">No hay grupos registrados</div>';
        return;
    }
    
    todosGrupos = data;
    filtrarYMostrarGrupos();
}

function filtrarYMostrarGrupos() {
    const searchTerm = document.getElementById('searchGrupo')?.value.toLowerCase() || '';
    
    const gruposFiltrados = todosGrupos.filter(grupo => 
        grupo.nombre?.toLowerCase().includes(searchTerm)
    );
    
    const grupoList = document.getElementById('grupoList');
    if (gruposFiltrados.length === 0) {
        grupoList.innerHTML = '<div class="grupo-item">No se encontraron grupos</div>';
        return;
    }
    
    grupoList.innerHTML = gruposFiltrados.map(grupo => `
        <div class="grupo-item">
            <div style="flex: 2;">
                <strong>${grupo.nombre}</strong><br>
                <small>📚 Materia: ${grupo.materias?.nombre || 'No asignada'}</small><br>
                <small>👨‍🏫 Docente: ${grupo.docentes?.nombre || 'No asignado'}</small>
                <small>🕐 Horario: ${grupo.horario || 'No definido'} | 📍 Salón: ${grupo.salon || 'N/A'}</small>
            </div>
            <div class="user-actions">
                <button class="btn-view" onclick="verEstudiantesGrupo(${grupo.id})" title="Ver estudiantes">👨‍🎓</button>
                <button class="btn-edit" onclick="asignarDocenteGrupo(${grupo.id})" title="Asignar docente">👨‍🏫</button>
                <button class="btn-edit" onclick="asignarEstudianteGrupo(${grupo.id})" title="Asignar estudiante">➕</button>
                <button class="btn-edit" onclick="editarGrupo(${grupo.id})">✏️</button>
                <button class="btn-delete" onclick="eliminarGrupo(${grupo.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

window.abrirModalCrearGrupo = function() {
    grupoSeleccionadoId = null;
    materiaGrupoSeleccionada = null;
    docenteGrupoSeleccionado = null;
    
    const modalBody = document.getElementById('grupoModalBody');
    modalBody.innerHTML = `
        <div class="user-detail-item">
            <div class="user-detail-label">👥 Nombre:</div>
            <div class="user-detail-value">
                <input type="text" id="grupoNombre" placeholder="Ej: Grupo A - Matemáticas" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
            </div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">📚 Materia:</div>
            <div class="user-detail-value">
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input type="text" id="materiaGrupoDisplay" readonly placeholder="Ninguna seleccionada" style="flex: 1; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc;">
                    <button onclick="abrirBuscarMateriaGrupo()" style="padding: 8px 12px; background: #dbeafe; border: none; border-radius: 8px; cursor: pointer;">🔍 Buscar</button>
                </div>
            </div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">👨‍🏫 Docente:</div>
            <div class="user-detail-value">
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input type="text" id="docenteGrupoDisplay" readonly placeholder="Ninguno seleccionado" style="flex: 1; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc;">
                    <button onclick="abrirBuscarDocenteGrupo()" style="padding: 8px 12px; background: #dbeafe; border: none; border-radius: 8px; cursor: pointer;">🔍 Buscar</button>
                </div>
            </div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">🕐 Horario:</div>
            <div class="user-detail-value">
                <input type="text" id="grupoHorario" placeholder="Ej: Lunes 10:00 - 12:00" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
            </div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">📍 Salón:</div>
            <div class="user-detail-value">
                <input type="text" id="grupoSalon" placeholder="Ej: 101" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
            </div>
        </div>
        <div style="display: flex; gap: 12px; margin-top: 20px;">
            <button onclick="guardarGrupo()" style="flex: 1; padding: 10px; background: #1e3a8a; color: white; border: none; border-radius: 8px; cursor: pointer;">💾 Guardar</button>
            <button onclick="cerrarGrupoModal()" style="flex: 1; padding: 10px; background: #e2e8f0; border: none; border-radius: 8px; cursor: pointer;">Cancelar</button>
        </div>
    `;
    
    document.getElementById('grupoModal').style.display = 'flex';
    document.getElementById('grupoModalTitle').textContent = '👥 Crear Grupo';
};

window.editarGrupo = async function(id) {
    const grupo = todosGrupos.find(g => g.id === id);
    if (!grupo) return;
    
    grupoSeleccionadoId = id;
    materiaGrupoSeleccionada = grupo.materias;
    docenteGrupoSeleccionado = grupo.docentes;
    
    const modalBody = document.getElementById('grupoModalBody');
    modalBody.innerHTML = `
        <div class="user-detail-item">
            <div class="user-detail-label">👥 Nombre:</div>
            <div class="user-detail-value">
                <input type="text" id="grupoNombre" value="${grupo.nombre || ''}" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
            </div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">📚 Materia:</div>
            <div class="user-detail-value">
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input type="text" id="materiaGrupoDisplay" readonly value="${grupo.materias?.nombre || 'Ninguna'}" style="flex: 1; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc;">
                    <button onclick="abrirBuscarMateriaGrupo()" style="padding: 8px 12px; background: #dbeafe; border: none; border-radius: 8px; cursor: pointer;">🔍 Buscar</button>
                </div>
            </div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">👨‍🏫 Docente:</div>
            <div class="user-detail-value">
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input type="text" id="docenteGrupoDisplay" readonly value="${grupo.docentes?.nombre || 'Ninguno'}" style="flex: 1; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc;">
                    <button onclick="abrirBuscarDocenteGrupo()" style="padding: 8px 12px; background: #dbeafe; border: none; border-radius: 8px; cursor: pointer;">🔍 Buscar</button>
                </div>
            </div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">🕐 Horario:</div>
            <div class="user-detail-value">
                <input type="text" id="grupoHorario" value="${grupo.horario || ''}" placeholder="Ej: Lunes 10:00 - 12:00" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
            </div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">📍 Salón:</div>
            <div class="user-detail-value">
                <input type="text" id="grupoSalon" value="${grupo.salon || ''}" placeholder="Ej: 101" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
            </div>
        </div>
        <div style="display: flex; gap: 12px; margin-top: 20px;">
            <button onclick="guardarGrupo()" style="flex: 1; padding: 10px; background: #1e3a8a; color: white; border: none; border-radius: 8px; cursor: pointer;">💾 Actualizar</button>
            <button onclick="cerrarGrupoModal()" style="flex: 1; padding: 10px; background: #e2e8f0; border: none; border-radius: 8px; cursor: pointer;">Cancelar</button>
        </div>
    `;
    
    document.getElementById('grupoModal').style.display = 'flex';
    document.getElementById('grupoModalTitle').textContent = '✏️ Editar Grupo';
};

window.guardarGrupo = async function() {
    const nombre = document.getElementById('grupoNombre')?.value;
    const horario = document.getElementById('grupoHorario')?.value;
    const salon = document.getElementById('grupoSalon')?.value;
    
    if (!nombre) {
        alert('El nombre del grupo es obligatorio');
        return;
    }
    
    const data = {
        nombre: nombre,
        horario: horario || null,
        salon: salon || null,
        materia_id: materiaGrupoSeleccionada?.id || null,
        docente_id: docenteGrupoSeleccionado?.id || null
    };
    
    if (grupoSeleccionadoId) {
        const { error } = await supabaseClient
            .from('grupos')
            .update(data)
            .eq('id', grupoSeleccionadoId);
        
        if (error) {
            alert('Error al actualizar: ' + error.message);
        } else {
            alert('Grupo actualizado correctamente');
            cerrarGrupoModal();
            await cargarTodosLosDatos();
        }
    } else {
        const { error } = await supabaseClient
            .from('grupos')
            .insert([data]);
        
        if (error) {
            alert('Error al crear: ' + error.message);
        } else {
            alert('Grupo creado correctamente');
            cerrarGrupoModal();
            await cargarTodosLosDatos();
        }
    }
};

window.abrirBuscarMateriaGrupo = async function() {
    const { data: materias } = await supabaseClient
        .from('materias')
        .select('id, nombre, codigo');
    
    const listaDiv = document.getElementById('listaMateriasGrupoBusqueda');
    listaDiv.innerHTML = materias?.map(m => `
        <div class="materia-item" style="cursor: pointer;" onclick="seleccionarMateriaGrupo(${m.id}, '${m.nombre}', '${m.codigo || ''}')">
            <div>
                <strong>${m.nombre}</strong><br>
                <small>Código: ${m.codigo || 'N/A'}</small>
            </div>
        </div>
    `).join('') || '<div class="materia-item">No hay materias</div>';
    
    const searchInput = document.getElementById('buscarMateriaGrupoInput');
    if (searchInput) {
        searchInput.oninput = function() {
            const term = this.value.toLowerCase();
            const filtrados = materias?.filter(m => 
                m.nombre.toLowerCase().includes(term) || 
                (m.codigo && m.codigo.toLowerCase().includes(term))
            );
            listaDiv.innerHTML = filtrados?.map(m => `
                <div class="materia-item" style="cursor: pointer;" onclick="seleccionarMateriaGrupo(${m.id}, '${m.nombre}', '${m.codigo || ''}')">
                    <div>
                        <strong>${m.nombre}</strong><br>
                        <small>Código: ${m.codigo || 'N/A'}</small>
                    </div>
                </div>
            `).join('') || '<div class="materia-item">No se encontraron materias</div>';
        };
    }
    
    document.getElementById('buscarMateriaGrupoModal').style.display = 'flex';
};

window.seleccionarMateriaGrupo = function(id, nombre, codigo) {
    materiaGrupoSeleccionada = { id, nombre, codigo };
    document.getElementById('materiaGrupoDisplay').value = `${nombre} (${codigo || 'N/A'})`;
    cerrarBuscarMateriaGrupoModal();
};

function cerrarBuscarMateriaGrupoModal() {
    document.getElementById('buscarMateriaGrupoModal').style.display = 'none';
}

window.abrirBuscarDocenteGrupo = async function() {
    const { data: docentes } = await supabaseClient
        .from('usuarios')
        .select('id, nombre, email')
        .eq('rol', 'docente');
    
    const listaDiv = document.getElementById('listaDocentesGrupoBusqueda');
    listaDiv.innerHTML = docentes?.map(d => `
        <div class="user-item" style="cursor: pointer;" onclick="seleccionarDocenteGrupo(${d.id}, '${d.nombre}', '${d.email}')">
            <div class="user-avatar-sm"><span>👨‍🏫</span></div>
            <div class="user-details">
                <strong>${d.nombre}</strong>
                <span>${d.email}</span>
            </div>
        </div>
    `).join('') || '<div class="user-item">No hay docentes</div>';
    
    const searchInput = document.getElementById('buscarDocenteGrupoInput');
    if (searchInput) {
        searchInput.oninput = function() {
            const term = this.value.toLowerCase();
            const filtrados = docentes?.filter(d => 
                d.nombre.toLowerCase().includes(term) || 
                d.email.toLowerCase().includes(term)
            );
            listaDiv.innerHTML = filtrados?.map(d => `
                <div class="user-item" style="cursor: pointer;" onclick="seleccionarDocenteGrupo(${d.id}, '${d.nombre}', '${d.email}')">
                    <div class="user-avatar-sm"><span>👨‍🏫</span></div>
                    <div class="user-details">
                        <strong>${d.nombre}</strong>
                        <span>${d.email}</span>
                    </div>
                </div>
            `).join('') || '<div class="user-item">No se encontraron docentes</div>';
        };
    }
    
    document.getElementById('buscarDocenteGrupoModal').style.display = 'flex';
};

window.seleccionarDocenteGrupo = function(id, nombre, email) {
    docenteGrupoSeleccionado = { id, nombre, email };
    document.getElementById('docenteGrupoDisplay').value = `${nombre} (${email})`;
    cerrarBuscarDocenteGrupoModal();
};

function cerrarBuscarDocenteGrupoModal() {
    document.getElementById('buscarDocenteGrupoModal').style.display = 'none';
}

window.asignarDocenteGrupo = async function(grupoId) {
    const grupo = todosGrupos.find(g => g.id === grupoId);
    if (!grupo) return;
    
    grupoSeleccionadoId = grupoId;
    
    const modalBody = document.getElementById('asignarDocenteGrupoModalBody');
    modalBody.innerHTML = `
        <div class="user-detail-item">
            <div class="user-detail-label">👥 Grupo:</div>
            <div class="user-detail-value"><strong>${grupo.nombre}</strong></div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">👨‍🏫 Docente:</div>
            <div class="user-detail-value">
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input type="text" id="docenteGrupoAsignarDisplay" readonly placeholder="Ninguno seleccionado" style="flex: 1; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc;">
                    <button onclick="abrirBuscarDocenteGrupoAsignar()" style="padding: 8px 12px; background: #dbeafe; border: none; border-radius: 8px; cursor: pointer;">🔍 Buscar</button>
                </div>
            </div>
        </div>
        <div style="display: flex; gap: 12px; margin-top: 20px;">
            <button onclick="guardarAsignacionDocenteGrupo()" style="flex: 1; padding: 10px; background: #1e3a8a; color: white; border: none; border-radius: 8px; cursor: pointer;">💾 Asignar</button>
            <button onclick="cerrarAsignarDocenteGrupoModal()" style="flex: 1; padding: 10px; background: #e2e8f0; border: none; border-radius: 8px; cursor: pointer;">Cancelar</button>
        </div>
    `;
    
    document.getElementById('asignarDocenteGrupoModal').style.display = 'flex';
};

window.abrirBuscarDocenteGrupoAsignar = async function() {
    const { data: docentes } = await supabaseClient
        .from('usuarios')
        .select('id, nombre, email')
        .eq('rol', 'docente');
    
    const listaDiv = document.getElementById('listaDocentesGrupoBusqueda');
    listaDiv.innerHTML = docentes?.map(d => `
        <div class="user-item" style="cursor: pointer;" onclick="seleccionarDocenteGrupoAsignar(${d.id}, '${d.nombre}', '${d.email}')">
            <div class="user-avatar-sm"><span>👨‍🏫</span></div>
            <div class="user-details">
                <strong>${d.nombre}</strong>
                <span>${d.email}</span>
            </div>
        </div>
    `).join('') || '<div class="user-item">No hay docentes</div>';
    
    const searchInput = document.getElementById('buscarDocenteGrupoInput');
    if (searchInput) {
        searchInput.oninput = function() {
            const term = this.value.toLowerCase();
            const filtrados = docentes?.filter(d => 
                d.nombre.toLowerCase().includes(term) || 
                d.email.toLowerCase().includes(term)
            );
            listaDiv.innerHTML = filtrados?.map(d => `
                <div class="user-item" style="cursor: pointer;" onclick="seleccionarDocenteGrupoAsignar(${d.id}, '${d.nombre}', '${d.email}')">
                    <div class="user-avatar-sm"><span>👨‍🏫</span></div>
                    <div class="user-details">
                        <strong>${d.nombre}</strong>
                        <span>${d.email}</span>
                    </div>
                </div>
            `).join('') || '<div class="user-item">No se encontraron docentes</div>';
        };
    }
    
    document.getElementById('buscarDocenteGrupoModal').style.display = 'flex';
};

window.seleccionarDocenteGrupoAsignar = function(id, nombre, email) {
    docenteGrupoAsignarSeleccionado = { id, nombre, email };
    document.getElementById('docenteGrupoAsignarDisplay').value = `${nombre} (${email})`;
    cerrarBuscarDocenteGrupoModal();
};

window.guardarAsignacionDocenteGrupo = async function() {
    if (!docenteGrupoAsignarSeleccionado) {
        alert('Selecciona un docente');
        return;
    }
    
    const { error } = await supabaseClient
        .from('grupos')
        .update({ docente_id: docenteGrupoAsignarSeleccionado.id })
        .eq('id', grupoSeleccionadoId);
    
    if (error) {
        alert('Error al asignar docente: ' + error.message);
    } else {
        alert('Docente asignado correctamente');
        docenteGrupoAsignarSeleccionado = null;
        cerrarAsignarDocenteGrupoModal();
        await cargarTodosLosDatos();
    }
};

window.asignarEstudianteGrupo = async function(grupoId) {
    const grupo = todosGrupos.find(g => g.id === grupoId);
    if (!grupo) return;
    
    grupoSeleccionadoId = grupoId;
    
    const modalBody = document.getElementById('asignarEstudianteGrupoModalBody');
    modalBody.innerHTML = `
        <div class="user-detail-item">
            <div class="user-detail-label">👥 Grupo:</div>
            <div class="user-detail-value"><strong>${grupo.nombre}</strong></div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">👨‍🎓 Estudiante:</div>
            <div class="user-detail-value">
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input type="text" id="estudianteGrupoAsignarDisplay" readonly placeholder="Ninguno seleccionado" style="flex: 1; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc;">
                    <button onclick="abrirBuscarEstudianteGrupoAsignar()" style="padding: 8px 12px; background: #dbeafe; border: none; border-radius: 8px; cursor: pointer;">🔍 Buscar</button>
                </div>
            </div>
        </div>
        <div style="display: flex; gap: 12px; margin-top: 20px;">
            <button onclick="guardarAsignacionEstudianteGrupo()" style="flex: 1; padding: 10px; background: #1e3a8a; color: white; border: none; border-radius: 8px; cursor: pointer;">➕ Asignar</button>
            <button onclick="cerrarAsignarEstudianteGrupoModal()" style="flex: 1; padding: 10px; background: #e2e8f0; border: none; border-radius: 8px; cursor: pointer;">Cancelar</button>
        </div>
    `;
    
    document.getElementById('asignarEstudianteGrupoModal').style.display = 'flex';
};

window.abrirBuscarEstudianteGrupoAsignar = async function() {
    const { data: asignados } = await supabaseClient
        .from('grupos_estudiantes')
        .select('estudiante_id')
        .eq('grupo_id', grupoSeleccionadoId);
    
    const asignadosIds = asignados?.map(a => a.estudiante_id) || [];
    
    const { data: estudiantes } = await supabaseClient
        .from('usuarios')
        .select('id, nombre, email')
        .eq('rol', 'estudiante');
    
    const estudiantesNoAsignados = estudiantes?.filter(e => !asignadosIds.includes(e.id)) || [];
    
    const listaDiv = document.getElementById('listaEstudiantesMatriculaBusqueda');
    if (listaDiv) {
        listaDiv.innerHTML = estudiantesNoAsignados?.map(e => `
            <div class="user-item" style="cursor: pointer;" onclick="seleccionarEstudianteGrupoAsignar(${e.id}, '${e.nombre}', '${e.email}')">
                <div class="user-avatar-sm"><span>👨‍🎓</span></div>
                <div class="user-details">
                    <strong>${e.nombre}</strong>
                    <span>${e.email}</span>
                </div>
            </div>
        `).join('') || '<div class="user-item">No hay estudiantes disponibles</div>';
    }
    
    const searchInput = document.getElementById('buscarEstudianteMatriculaInput');
    if (searchInput) {
        searchInput.oninput = function() {
            const term = this.value.toLowerCase();
            const filtrados = estudiantesNoAsignados?.filter(e => 
                e.nombre.toLowerCase().includes(term) || 
                e.email.toLowerCase().includes(term)
            );
            if (listaDiv) {
                listaDiv.innerHTML = filtrados?.map(e => `
                    <div class="user-item" style="cursor: pointer;" onclick="seleccionarEstudianteGrupoAsignar(${e.id}, '${e.nombre}', '${e.email}')">
                        <div class="user-avatar-sm"><span>👨‍🎓</span></div>
                        <div class="user-details">
                            <strong>${e.nombre}</strong>
                            <span>${e.email}</span>
                        </div>
                    </div>
                `).join('') || '<div class="user-item">No se encontraron estudiantes</div>';
            }
        };
    }
    
    document.getElementById('buscarEstudianteMatriculaModal').style.display = 'flex';
};

window.seleccionarEstudianteGrupoAsignar = function(id, nombre, email) {
    estudianteGrupoAsignarSeleccionado = { id, nombre, email };
    document.getElementById('estudianteGrupoAsignarDisplay').value = `${nombre} (${email})`;
    cerrarBuscarEstudianteMatriculaModal();
};

window.guardarAsignacionEstudianteGrupo = async function() {
    if (!estudianteGrupoAsignarSeleccionado) {
        alert('Selecciona un estudiante');
        return;
    }
    
    const { error } = await supabaseClient
        .from('grupos_estudiantes')
        .insert([{ 
            grupo_id: grupoSeleccionadoId, 
            estudiante_id: estudianteGrupoAsignarSeleccionado.id,
            fecha_asignacion: new Date().toISOString().split('T')[0]
        }]);
    
    if (error) {
        alert('Error al asignar estudiante: ' + error.message);
    } else {
        alert('Estudiante asignado correctamente');
        estudianteGrupoAsignarSeleccionado = null;
        cerrarAsignarEstudianteGrupoModal();
        await cargarTodosLosDatos();
    }
};

window.verEstudiantesGrupo = async function(grupoId) {
    const grupo = todosGrupos.find(g => g.id === grupoId);
    if (!grupo) return;
    
    const { data: asignados } = await supabaseClient
        .from('grupos_estudiantes')
        .select('*, estudiantes:estudiante_id(id, nombre, email)')
        .eq('grupo_id', grupoId);
    
    const modalBody = document.getElementById('verEstudiantesGrupoModalBody');
    
    if (!asignados || asignados.length === 0) {
        modalBody.innerHTML = `<p style="text-align: center;">No hay estudiantes asignados al grupo "${grupo.nombre}"</p>`;
    } else {
        modalBody.innerHTML = `
            <div style="margin-bottom: 15px;">
                <strong>👥 ${grupo.nombre}</strong> - ${asignados.length} estudiantes
            </div>
            ${asignados.map(a => `
                <div class="user-detail-item">
                    <div class="user-detail-value">
                        <strong>${a.estudiantes?.nombre || 'N/A'}</strong><br>
                        <small>${a.estudiantes?.email || 'N/A'}</small>
                    </div>
                    <button onclick="eliminarEstudianteGrupo(${grupoId}, ${a.estudiante_id})" style="background: #fee2e2; border: none; border-radius: 8px; padding: 5px 10px; cursor: pointer;">🗑️</button>
                </div>
            `).join('')}
        `;
    }
    
    document.getElementById('verEstudiantesGrupoModal').style.display = 'flex';
};

window.eliminarEstudianteGrupo = async function(grupoId, estudianteId) {
    if (confirm('¿Eliminar este estudiante del grupo?')) {
        const { error } = await supabaseClient
            .from('grupos_estudiantes')
            .delete()
            .eq('grupo_id', grupoId)
            .eq('estudiante_id', estudianteId);
        
        if (error) {
            alert('Error al eliminar: ' + error.message);
        } else {
            alert('Estudiante eliminado del grupo');
            await verEstudiantesGrupo(grupoId);
            await cargarTodosLosDatos();
        }
    }
};

window.eliminarGrupo = async function(id) {
    const grupo = todosGrupos.find(g => g.id === id);
    if (!grupo) return;
    
    if (confirm(`¿Eliminar el grupo "${grupo.nombre}"? También se eliminarán las asignaciones de estudiantes.`)) {
        const { error } = await supabaseClient.from('grupos').delete().eq('id', id);
        if (error) {
            alert('Error al eliminar: ' + error.message);
        } else {
            alert('Grupo eliminado correctamente');
            await cargarTodosLosDatos();
        }
    }
};

function cerrarGrupoModal() {
    document.getElementById('grupoModal').style.display = 'none';
    materiaGrupoSeleccionada = null;
    docenteGrupoSeleccionado = null;
}

function cerrarAsignarDocenteGrupoModal() {
    document.getElementById('asignarDocenteGrupoModal').style.display = 'none';
}

function cerrarAsignarEstudianteGrupoModal() {
    document.getElementById('asignarEstudianteGrupoModal').style.display = 'none';
}

function cerrarVerEstudiantesGrupoModal() {
    document.getElementById('verEstudiantesGrupoModal').style.display = 'none';
}

// ==================== GRÁFICOS ====================
async function cargarGraficos() {
    await cargarGraficoEstudiantes();
    await cargarGraficoGrados();
}

async function cargarGraficoEstudiantes() {
    const { data, error } = await supabaseClient
        .from('estudiantes')
        .select('fecha_inscripcion');
    
    const canvas = document.getElementById('estudiantesChart');
    if (!canvas) return;
    
    if (error || !data || data.length === 0) {
        const ctx = canvas.getContext('2d');
        if (estudiantesChart) estudiantesChart.destroy();
        estudiantesChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Sin datos'],
                datasets: [{
                    label: 'Estudiantes inscritos',
                    data: [0],
                    borderColor: '#3B5BDB'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true, stepSize: 1, ticks: { precision: 0 } }
                }
            }
        });
        return;
    }
    
    const mesesOrden = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const meses = {};
    
    data.forEach(est => {
        if (est.fecha_inscripcion) {
            const fecha = new Date(est.fecha_inscripcion);
            const mes = mesesOrden[fecha.getMonth()];
            meses[mes] = (meses[mes] || 0) + 1;
        }
    });
    
    const ctx = canvas.getContext('2d');
    if (estudiantesChart) estudiantesChart.destroy();
    
    estudiantesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: mesesOrden.filter(mes => meses[mes]),
            datasets: [{
                label: 'Estudiantes inscritos',
                data: mesesOrden.filter(mes => meses[mes]).map(mes => meses[mes]),
                borderColor: '#3B5BDB',
                backgroundColor: 'rgba(59, 91, 219, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#3B5BDB',
                pointBorderColor: '#fff',
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    stepSize: 1,
                    ticks: { precision: 0 },
                    title: { display: true, text: 'Cantidad de estudiantes' }
                },
                x: { title: { display: true, text: 'Mes' } }
            },
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.raw} estudiante${context.raw !== 1 ? 's' : ''} inscrito${context.raw !== 1 ? 's' : ''}`;
                        }
                    }
                }
            }
        }
    });
}

async function cargarGraficoGrados() {
    const { data, error } = await supabaseClient
        .from('estudiantes')
        .select('grado');
    
    const canvas = document.getElementById('gradosChart');
    if (!canvas) return;
    
    if (error || !data || data.length === 0) {
        const ctx = canvas.getContext('2d');
        if (gradosChart) gradosChart.destroy();
        gradosChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Sin datos'],
                datasets: [{
                    label: 'Estudiantes por grado',
                    data: [0],
                    backgroundColor: '#F76707'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true, stepSize: 1, ticks: { precision: 0 } }
                }
            }
        });
        return;
    }
    
    const grados = {};
    data.forEach(est => {
        if (est.grado) {
            grados[est.grado] = (grados[est.grado] || 0) + 1;
        }
    });
    
    const ordenGrados = ['6°', '7°', '8°', '9°', '10°', '11°'];
    const labels = Object.keys(grados).sort((a, b) => ordenGrados.indexOf(a) - ordenGrados.indexOf(b));
    const valores = labels.map(g => grados[g]);
    
    const ctx = canvas.getContext('2d');
    if (gradosChart) gradosChart.destroy();
    
    gradosChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Estudiantes por grado',
                data: valores,
                backgroundColor: '#F76707',
                borderRadius: 8,
                barPercentage: 0.7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    stepSize: 1,
                    ticks: { precision: 0 },
                    title: { display: true, text: 'Número de estudiantes' }
                },
                x: { title: { display: true, text: 'Grado' } }
            },
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.raw} estudiante${context.raw !== 1 ? 's' : ''}`;
                        }
                    }
                }
            }
        }
    });
}

function getNotaClase(nota) {
    if (nota >= 4.5) return 'nota-excelente';
    if (nota >= 4.0) return 'nota-sobresaliente';
    if (nota >= 3.5) return 'nota-aceptable';
    if (nota >= 3.0) return 'nota-basica';
    return 'nota-baja';
}

// Botón agregar usuario
document.addEventListener('DOMContentLoaded', () => {
    const btnAgregarUsuario = document.getElementById('btnAgregarUsuario');
    if (btnAgregarUsuario) {
        btnAgregarUsuario.addEventListener('click', abrirModalAgregar);
    }
});