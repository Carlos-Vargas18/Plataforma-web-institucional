console.log('🚀 Iniciando dashboard docente...');

const SUPABASE_URL = 'https://bsxpqofjoojcdvsojcon.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzeHBxb2Zqb29qY2R2c29qY29uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTI5OTUsImV4cCI6MjA5MDgyODk5NX0.N35O61ntwu1HvDQk58xh8Bac2CjE3ctOieE_Hz3rdyA';

let supabaseClient = null;
let docenteActual = null;
let materiasDocente = [];
let gruposDocente = [];
let estudiantesGrupo = [];
let calificacionesDocente = [];

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM cargado - Dashboard Docente');
    
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
    
    // Obtener datos del docente logueado
    const userData = localStorage.getItem('user_data');
    if (!userData) {
        window.location.href = '../index.html';
        return;
    }
    
    docenteActual = JSON.parse(userData);
    
    if (docenteActual.rol !== 'docente') {
        window.location.href = '../index.html';
        return;
    }
    
    // Mostrar nombre del docente
    const docenteNameSpan = document.getElementById('docenteName');
    if (docenteNameSpan) {
        docenteNameSpan.textContent = `Prof. ${docenteActual.nombre || docenteActual.email}`;
    }
    
    // Configurar eventos del sidebar
    document.querySelectorAll('.sidebar-nav li').forEach(li => {
        li.addEventListener('click', () => {
            document.querySelectorAll('.sidebar-nav li').forEach(i => i.classList.remove('active'));
            li.classList.add('active');
        });
    });
    
    // Cargar datos del docente
    await cargarDatosDocente();
    await cargarSelectores();
    await cargarTablaNotas();
});

// ==================== CARGAR DATOS DEL DOCENTE ====================
async function cargarDatosDocente() {
    // Obtener materias del docente
    const { data: materias } = await supabaseClient
        .from('materias')
        .select('*')
        .eq('docente_id', docenteActual.id);
    
    materiasDocente = materias || [];
    
    // Obtener grupos del docente (materias asignadas)
    const { data: grupos } = await supabaseClient
        .from('grupos')
        .select('*, materias(nombre)')
        .in('materia_id', materiasDocente.map(m => m.id));
    
    gruposDocente = grupos || [];
    
    // Contar estudiantes totales
    const estudiantesIds = [];
    for (const grupo of gruposDocente) {
        const { data: estudiantesGrupo } = await supabaseClient
            .from('grupos_estudiantes')
            .select('estudiante_id')
            .eq('grupo_id', grupo.id);
        
        if (estudiantesGrupo) {
            estudiantesIds.push(...estudiantesGrupo.map(e => e.estudiante_id));
        }
    }
    
    const estudiantesUnicos = [...new Set(estudiantesIds)];
    
    // Obtener calificaciones del docente
    const { data: calificaciones } = await supabaseClient
        .from('calificaciones')
        .select('*')
        .in('materia_id', materiasDocente.map(m => m.id));
    
    calificacionesDocente = calificaciones || [];
    
    // Actualizar estadísticas
    actualizarEstadisticas(estudiantesUnicos.length, calificacionesDocente.length);
}

function actualizarEstadisticas(totalEstudiantes, totalNotas) {
    // Actualizar estudiantes
    const estudiantesElem = document.querySelector('.stat-card:first-child .stat-info h3');
    if (estudiantesElem) estudiantesElem.textContent = totalEstudiantes;
    
    const gruposElem = document.querySelector('.stat-card:first-child .stat-info .stat-status');
    if (gruposElem) gruposElem.textContent = `${gruposDocente.length} grupos`;
    
    // Actualizar notas registradas
    const notasElem = document.querySelectorAll('.stat-card')[1]?.querySelector('.stat-info h3');
    if (notasElem) notasElem.textContent = totalNotas;
    
    // Calcular pendientes (estudiantes sin notas)
    const estudiantesConNotas = new Set(calificacionesDocente.map(c => c.estudiante_id));
    const pendientes = totalEstudiantes - estudiantesConNotas.size;
    const pendientesElem = document.querySelectorAll('.stat-card')[1]?.querySelector('.stat-info .stat-status');
    if (pendientesElem) pendientesElem.textContent = `${pendientes} pendientes`;
    
    // Calcular promedio del curso
    if (calificacionesDocente.length > 0) {
        const suma = calificacionesDocente.reduce((acc, cal) => {
            const final = cal.nota_final || 
                (cal.nota1 + cal.nota2 + cal.nota3) / 3;
            return acc + (final || 0);
        }, 0);
        const promedio = (suma / calificacionesDocente.length).toFixed(1);
        const promedioElem = document.querySelectorAll('.stat-card')[2]?.querySelector('.stat-info h3');
        if (promedioElem) promedioElem.textContent = promedio;
    }
}

// ==================== CARGAR SELECTORES ====================
async function cargarSelectores() {
    // Cargar select de materias
    const materiaSelect = document.querySelector('.grade-form .form-row .form-group:first-child select');
    if (materiaSelect && materiasDocente.length > 0) {
        materiaSelect.innerHTML = materiasDocente.map(m => 
            `<option value="${m.id}">${m.nombre}</option>`
        ).join('');
        materiaSelect.addEventListener('change', () => cargarTablaNotas());
    }
    
    // Cargar select de grupos
    const grupoSelect = document.querySelector('.grade-form .form-row .form-group:nth-child(2) select');
    if (grupoSelect && gruposDocente.length > 0) {
        grupoSelect.innerHTML = gruposDocente.map(g => 
            `<option value="${g.id}">${g.nombre}</option>`
        ).join('');
        grupoSelect.addEventListener('change', () => cargarTablaNotas());
    }
}

// ==================== CARGAR TABLA DE NOTAS ====================
async function cargarTablaNotas() {
    const materiaSelect = document.querySelector('.grade-form .form-row .form-group:first-child select');
    const grupoSelect = document.querySelector('.grade-form .form-row .form-group:nth-child(2) select');
    const periodoSelect = document.querySelector('.grade-form .form-row .form-group:nth-child(3) select');
    
    if (!materiaSelect || !grupoSelect) return;
    
    const materiaId = parseInt(materiaSelect.value);
    const grupoId = parseInt(grupoSelect.value);
    const periodo = periodoSelect?.value || 'Período 1';
    
    // Obtener estudiantes del grupo
    const { data: estudiantesAsignados } = await supabaseClient
        .from('grupos_estudiantes')
        .select('estudiante_id')
        .eq('grupo_id', grupoId);
    
    if (!estudiantesAsignados || estudiantesAsignados.length === 0) {
        mostrarTablaVacia();
        return;
    }
    
    // Obtener datos de estudiantes
    const estudianteIds = estudiantesAsignados.map(e => e.estudiante_id);
    const { data: estudiantes } = await supabaseClient
        .from('usuarios')
        .select('id, nombre, email')
        .in('id', estudianteIds);
    
    // Obtener calificaciones existentes
    const { data: calificaciones } = await supabaseClient
        .from('calificaciones')
        .select('*')
        .eq('materia_id', materiaId)
        .in('estudiante_id', estudianteIds);
    
    // Crear mapa de calificaciones por estudiante
    const calificacionesMap = {};
    calificaciones?.forEach(cal => {
        calificacionesMap[cal.estudiante_id] = cal;
    });
    
    // Renderizar tabla
    const tbody = document.querySelector('.data-table tbody');
    if (!tbody) return;
    
    if (!estudiantes || estudiantes.length === 0) {
        mostrarTablaVacia();
        return;
    }
    
    tbody.innerHTML = estudiantes.map(est => {
        const cal = calificacionesMap[est.id] || { nota1: '', nota2: '', nota3: '', nota_final: '' };
        
        const notas = [
            cal.nota1 || 0,
            cal.nota2 || 0,
            cal.nota3 || 0
        ];
        const promedio = (notas.reduce((a, b) => a + b, 0) / 3).toFixed(1);
        const notaClase = getNotaClase(promedio);
        const estado = parseFloat(promedio) >= 3.0 ? 'Aprobado' : 'Reprobado';
        const estadoClase = parseFloat(promedio) >= 3.0 ? 'ok' : 'pending';
        
        return `
            <tr data-estudiante-id="${est.id}">
                <td class="subject-name">${est.nombre || 'Sin nombre'}</td>
                <td><input class="grade-input nota1" type="number" value="${cal.nota1 || ''}" step="0.1" min="1" max="5" placeholder="1.0-5.0"></td>
                <td><input class="grade-input nota2" type="number" value="${cal.nota2 || ''}" step="0.1" min="1" max="5" placeholder="1.0-5.0"></td>
                <td><input class="grade-input nota3" type="number" value="${cal.nota3 || ''}" step="0.1" min="1" max="5" placeholder="1.0-5.0"></td>
                <td><span class="grade-badge ${notaClase} promedio">${promedio}</span></td>
                <td><span class="stat-status ${estadoClase}">${estado}</span></td>
                <td><button class="btn-save-grade" onclick="guardarNotaFila(this)">💾 Guardar</button></td>
            </tr>
        `;
    }).join('');
    
    // Agregar eventos a los inputs para recalcular promedio
    document.querySelectorAll('.data-table tbody tr').forEach(row => {
        const inputs = row.querySelectorAll('.grade-input');
        inputs.forEach(input => {
            input.addEventListener('input', () => calcularPromedioFila(row));
        });
    });
}

function calcularPromedioFila(row) {
    const nota1 = parseFloat(row.querySelector('.nota1')?.value) || 0;
    const nota2 = parseFloat(row.querySelector('.nota2')?.value) || 0;
    const nota3 = parseFloat(row.querySelector('.nota3')?.value) || 0;
    
    let total = 0, cantidad = 0;
    if (nota1 > 0) { total += nota1; cantidad++; }
    if (nota2 > 0) { total += nota2; cantidad++; }
    if (nota3 > 0) { total += nota3; cantidad++; }
    
    const promedio = cantidad > 0 ? (total / cantidad).toFixed(1) : '0';
    const promedioSpan = row.querySelector('.promedio');
    const estadoSpan = row.querySelector('.stat-status');
    
    if (promedioSpan) {
        promedioSpan.textContent = promedio;
        promedioSpan.className = `grade-badge ${getNotaClase(promedio)} promedio`;
    }
    
    if (estadoSpan) {
        const esAprobado = parseFloat(promedio) >= 3.0;
        estadoSpan.textContent = esAprobado ? 'Aprobado' : 'Reprobado';
        estadoSpan.className = `stat-status ${esAprobado ? 'ok' : 'pending'}`;
    }
}

function getNotaClase(nota) {
    nota = parseFloat(nota);
    if (nota >= 4.5) return 'excellent';
    if (nota >= 4.0) return 'good';
    if (nota >= 3.0) return 'warning';
    return 'bad';
}

function mostrarTablaVacia() {
    const tbody = document.querySelector('.data-table tbody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center;">No hay estudiantes asignados a este grupo</td>
            </tr>
        `;
    }
}

// ==================== GUARDAR NOTAS ====================
window.guardarNotaFila = async function(button) {
    const row = button.closest('tr');
    const estudianteId = parseInt(row.getAttribute('data-estudiante-id'));
    const materiaSelect = document.querySelector('.grade-form .form-row .form-group:first-child select');
    const materiaId = parseInt(materiaSelect.value);
    
    const nota1 = parseFloat(row.querySelector('.nota1')?.value) || null;
    const nota2 = parseFloat(row.querySelector('.nota2')?.value) || null;
    const nota3 = parseFloat(row.querySelector('.nota3')?.value) || null;
    
    // Calcular nota final
    let total = 0, cantidad = 0;
    if (nota1) { total += nota1; cantidad++; }
    if (nota2) { total += nota2; cantidad++; }
    if (nota3) { total += nota3; cantidad++; }
    const notaFinal = cantidad > 0 ? parseFloat((total / cantidad).toFixed(1)) : null;
    
    // Verificar si ya existe calificación
    const { data: existente } = await supabaseClient
        .from('calificaciones')
        .select('id')
        .eq('estudiante_id', estudianteId)
        .eq('materia_id', materiaId);
    
    let error;
    if (existente && existente.length > 0) {
        // Actualizar
        const { error: updateError } = await supabaseClient
            .from('calificaciones')
            .update({ nota1, nota2, nota3, nota_final: notaFinal })
            .eq('estudiante_id', estudianteId)
            .eq('materia_id', materiaId);
        error = updateError;
    } else {
        // Insertar nueva
        const { error: insertError } = await supabaseClient
            .from('calificaciones')
            .insert([{ 
                estudiante_id: estudianteId, 
                materia_id: materiaId, 
                nota1, nota2, nota3, 
                nota_final: notaFinal 
            }]);
        error = insertError;
    }
    
    if (error) {
        alert('Error al guardar: ' + error.message);
    } else {
        // Mostrar feedback visual
        const originalText = button.textContent;
        button.textContent = '✓ Guardado';
        button.style.background = '#10b981';
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 1500);
        
        // Recargar estadísticas
        await cargarDatosDocente();
    }
};

// ==================== PUBLICAR TODAS LAS NOTAS ====================
document.querySelector('.btn-publish')?.addEventListener('click', async () => {
    if (confirm('¿Publicar todas las notas? Los estudiantes podrán verlas inmediatamente.')) {
        alert('Notas publicadas correctamente');
    }
});