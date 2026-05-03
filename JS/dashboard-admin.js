console.log('🚀 Iniciando dashboard...');

const SUPABASE_URL = 'https://bsxpqofjoojcdvsojcon.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzeHBxb2Zqb29qY2R2c29qY29uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTI5OTUsImV4cCI6MjA5MDgyODk5NX0.N35O61ntwu1HvDQk58xh8Bac2CjE3ctOieE_Hz3rdyA';

let supabaseClient = null;
let currentSection = 'dashboard';
let estudiantesChart = null;
let gradosChart = null;
let todosUsuarios = [];

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

    // Configurar búsqueda y filtro
const searchInput = document.getElementById('searchUsuario');
if (searchInput) {
    searchInput.addEventListener('input', filtrarYMostrarUsuarios);
}

const filtroRol = document.getElementById('filtroRol');
if (filtroRol) {
    filtroRol.addEventListener('change', filtrarYMostrarUsuarios);
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
    const statusSpan = document.querySelectorAll('.stat-card')[0]?.querySelector('.stat-status');
    if (statusSpan) {
        statusSpan.textContent = `${total} roles`;
        statusSpan.className = 'stat-status success';
    }
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
    const statusSpan = document.querySelectorAll('.stat-card')[1]?.querySelector('.stat-status');
    if (statusSpan) {
        statusSpan.textContent = `${total} docentes`;
        statusSpan.className = 'stat-status success';
    }
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
    const statusSpan = document.querySelectorAll('.stat-card')[2]?.querySelector('.stat-status');
    if (statusSpan) {
        statusSpan.textContent = `${total} administrativos`;
        statusSpan.className = 'stat-status success';
    }
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
    const statusSpan = document.querySelectorAll('.stat-card')[3]?.querySelector('.stat-status');
    if (statusSpan) {
        statusSpan.textContent = `${total} materias`;
        statusSpan.className = 'stat-status success';
    }
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
    const statusSpan = document.querySelectorAll('.stat-card')[4]?.querySelector('.stat-status');
    if (statusSpan) {
        statusSpan.textContent = `${total} inscritos`;
        statusSpan.className = 'stat-status success';
    }
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
    const statusSpan = document.querySelectorAll('.stat-card')[5]?.querySelector('.stat-status');
    if (statusSpan) {
        statusSpan.textContent = `${total} grados`;
        statusSpan.className = 'stat-status success';
    }
}

async function cargarListaUsuarios() {
    const { data, error } = await supabaseClient.from('usuarios').select('*');
    const userList = document.getElementById('userList');
    if (!userList) return;
    
    if (error || !data || data.length === 0) {
        userList.innerHTML = '<div class="user-item">No hay usuarios registrados</div>';
        return;
    }
    
    // Guardar todos los usuarios para filtrar
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
                <button class="btn-edit" onclick="editarUsuario(${user.id})">✏️</button>
                <button class="btn-delete" onclick="eliminarUsuario(${user.id})">🗑️</button>
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

function cerrarModal() {
    document.getElementById('userModal').style.display = 'none';
}

// Cerrar modal al hacer click fuera
document.addEventListener('click', function(e) {
    const modal = document.getElementById('userModal');
    if (e.target === modal) {
        cerrarModal();
    }
});

async function cargarListaMaterias() {
    const { data, error } = await supabaseClient.from('materias').select('*');
    const materiaList = document.getElementById('materiaList');
    if (!materiaList) return;
    
    if (error || !data || data.length === 0) {
        materiaList.innerHTML = '<div class="materia-item">No hay materias registradas</div>';
        return;
    }
    
    materiaList.innerHTML = data.map(materia => `
        <div class="materia-item">
            <div>
                <strong>${materia.nombre}</strong><br>
                <small>Código: ${materia.codigo || 'N/A'}</small>
            </div>
            <div class="user-actions">
                <button class="btn-edit" onclick="editarMateria(${materia.id})">✏️</button>
                <button class="btn-delete" onclick="eliminarMateria(${materia.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

async function cargarListaCalificaciones() {
    const { data, error } = await supabaseClient
        .from('calificaciones')
        .select('*, estudiantes(nombre), materias(nombre)');
    const calificacionesList = document.getElementById('calificacionesList');
    if (!calificacionesList) return;
    
    if (error || !data || data.length === 0) {
        calificacionesList.innerHTML = '<div class="calificacion-item">No hay calificaciones registradas</div>';
        return;
    }
    
    calificacionesList.innerHTML = data.map(cal => `
        <div class="calificacion-item">
            <div>
                <strong>${cal.estudiantes?.nombre || 'N/A'}</strong> - ${cal.materias?.nombre || 'N/A'}<br>
                <small>Nota: <span class="${getNotaClase(cal.nota)}">${cal.nota}</span></small>
            </div>
            <div class="user-actions">
                <button class="btn-edit" onclick="editarCalificacion(${cal.id})">✏️</button>
                <button class="btn-delete" onclick="eliminarCalificacion(${cal.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

async function cargarListaGrupos() {
    const { data, error } = await supabaseClient
        .from('grupos')
        .select('*, materias(nombre)');
    const grupoList = document.getElementById('grupoList');
    if (!grupoList) return;
    
    if (error || !data || data.length === 0) {
        grupoList.innerHTML = '<div class="grupo-item">No hay grupos registrados</div>';
        return;
    }
    
    grupoList.innerHTML = data.map(grupo => `
        <div class="grupo-item">
            <div>
                <strong>${grupo.nombre}</strong><br>
                <small>Materia: ${grupo.materias?.nombre || 'N/A'}</small>
            </div>
            <div class="user-actions">
                <button class="btn-edit" onclick="editarGrupo(${grupo.id})">✏️</button>
                <button class="btn-delete" onclick="eliminarGrupo(${grupo.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

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
                    y: {
                        beginAtZero: true,
                        stepSize: 1,
                        ticks: { precision: 0 }
                    }
                }
            }
        });
        return;
    }
    
    // Agrupar por mes (orden cronológico)
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
                    ticks: {
                        precision: 0,
                        callback: function(value) {
                            return Number.isInteger(value) ? value : null;
                        }
                    },
                    title: {
                        display: true,
                        text: 'Cantidad de estudiantes'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Mes'
                    }
                }
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
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        stepSize: 1,
                        ticks: {
                            precision: 0
                        }
                    }
                },
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
        return;
    }
    
    // Contar por grado
    const grados = {};
    data.forEach(est => {
        if (est.grado) {
            grados[est.grado] = (grados[est.grado] || 0) + 1;
        }
    });
    
    // Ordenar grados (1°, 2°, 3°, etc.)
    const ordenGrados = ['6°', '7°', '8°', '9°', '10°', '11°'];
    const labels = Object.keys(grados).sort((a, b) => {
        return ordenGrados.indexOf(a) - ordenGrados.indexOf(b);
    });
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
                    ticks: {
                        precision: 0,
                        callback: function(value) {
                            return Number.isInteger(value) ? value : null;
                        }
                    },
                    title: {
                        display: true,
                        text: 'Número de estudiantes'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Grado'
                    }
                }
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

// Funciones CRUD
window.editarUsuario = function(id) {
    alert(`Editar usuario ID: ${id} (en desarrollo)`);
};

window.eliminarUsuario = async function(id) {
    if (confirm('¿Eliminar este usuario?')) {
        const { error } = await supabaseClient.from('usuarios').delete().eq('id', id);
        if (error) alert('Error: ' + error.message);
        else {
            alert('Usuario eliminado');
            await cargarTodosLosDatos();
        }
    }
};

window.editarMateria = (id) => alert(`Editar materia ID: ${id} (en desarrollo)`);
window.eliminarMateria = async (id) => {
    if (confirm('¿Eliminar esta materia?')) {
        await supabaseClient.from('materias').delete().eq('id', id);
        await cargarTodosLosDatos();
    }
};

window.editarCalificacion = (id) => alert(`Editar calificación ID: ${id} (en desarrollo)`);
window.eliminarCalificacion = async (id) => {
    if (confirm('¿Eliminar esta calificación?')) {
        await supabaseClient.from('calificaciones').delete().eq('id', id);
        await cargarTodosLosDatos();
    }
};

window.editarGrupo = (id) => alert(`Editar grupo ID: ${id} (en desarrollo)`);
window.eliminarGrupo = async (id) => {
    if (confirm('¿Eliminar este grupo?')) {
        await supabaseClient.from('grupos').delete().eq('id', id);
        await cargarTodosLosDatos();
    }
};

// Botones agregar
document.addEventListener('DOMContentLoaded', () => {
    const btnAgregarUsuario = document.getElementById('btnAgregarUsuario');
    if (btnAgregarUsuario) {
        btnAgregarUsuario.addEventListener('click', () => {
            const nombre = prompt('Nombre:');
            const email = prompt('Email:');
            const rol = prompt('Rol (estudiante/docente/administrativo):');
            const password = prompt('Contraseña:');
            if (nombre && email && rol && password) {
                supabaseClient.from('usuarios').insert([{ nombre, email, rol, password_hash: password }])
                    .then(() => cargarTodosLosDatos());
            }
        });
    }
});