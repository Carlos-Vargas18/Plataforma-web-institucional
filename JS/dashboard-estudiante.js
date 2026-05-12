console.log('🚀 Dashboard Estudiante iniciado');

const SUPABASE_URL = 'https://bsxpqofjoojcdvsojcon.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzeHBxb2Zqb29qY2R2c29qY29uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTI5OTUsImV4cCI6MjA5MDgyODk5NX0.N35O61ntwu1HvDQk58xh8Bac2CjE3ctOieE_Hz3rdyA';

let supabaseClient = null;

function formatGrade(value) {
    if (value === null || value === undefined || value === '') {
        return '—';
    }

    const number = Number(value);
    if (Number.isNaN(number)) {
        return String(value);
    }

    return number > 20 ? number.toFixed(0) : number.toFixed(1);
}

function getGradeScale(value) {
    const number = Number(value);
    return number > 20 ? 100 : 5;
}

function getGradeStatus(value) {
    const number = Number(value);
    if (Number.isNaN(number)) {
        return 'Pendiente';
    }

    const scale = getGradeScale(number);
    const threshold = scale === 100 ? 60 : 3.0;
    return number >= threshold ? 'Aprobado' : 'En riesgo';
}

function getBadgeClass(value) {
    const number = Number(value);
    if (Number.isNaN(number)) {
        return 'bad';
    }

    const scale = getGradeScale(number);
    if (number >= (scale === 100 ? 90 : 4.5)) return 'excellent';
    if (number >= (scale === 100 ? 80 : 4.0)) return 'good';
    if (number >= (scale === 100 ? 60 : 3.0)) return 'warning';
    return 'bad';
}

function getAverageValue(notes) {
    const validNotes = notes.filter(n => typeof n === 'number' && !Number.isNaN(n));
    if (validNotes.length === 0) return 0;
    return validNotes.reduce((total, note) => total + note, 0) / validNotes.length;
}

function mostrarSeccion(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.toggle('active', section.id === `section-${sectionId}`);
    });

    document.querySelectorAll('.sidebar-nav li').forEach(li => {
        const target = li.getAttribute('data-section');
        li.classList.toggle('active', target === sectionId);
    });
}

function setupSidebarNavigation() {
    document.querySelectorAll('.sidebar-nav li').forEach(li => {
        li.addEventListener('click', () => {
            const section = li.getAttribute('data-section');
            if (section) {
                mostrarSeccion(section);
            }
        });
    });
}

async function fetchStudentProfile(email) {
    if (!email) return null;
    const { data, error } = await supabaseClient
        .from('estudiantes')
        .select('*')
        .eq('email', email)
        .single();

    if (error) {
        console.warn('No se encontró perfil de estudiante:', error.message);
        return null;
    }
    return data;
}

async function fetchGrades(userId) {
    if (!userId) return [];
    const { data, error } = await supabaseClient
        .from('calificaciones')
        .select('*, materias(id,nombre,docente_id)')
        .eq('estudiante_id', userId)
        .order('id', { ascending: true });

    if (error) {
        console.error('Error cargando calificaciones:', error.message);
        return [];
    }
    return data || [];
}

async function fetchDocentes(docenteIds) {
    if (!Array.isArray(docenteIds) || docenteIds.length === 0) {
        return {};
    }

    const { data, error } = await supabaseClient
        .from('usuarios')
        .select('id,nombre')
        .in('id', docenteIds);

    if (error) {
        console.warn('Error al cargar docentes:', error.message);
        return {};
    }

    return (data || []).reduce((map, docente) => {
        if (docente && docente.id) {
            map[docente.id] = docente.nombre;
        }
        return map;
    }, {});
}

async function fetchGroupDetails(groupId) {
    if (!groupId) return null;
    const { data, error } = await supabaseClient
        .from('grupos')
        .select('*, materias(id,nombre), docentes:docente_id(id,nombre)')
        .eq('id', groupId)
        .single();

    if (error) {
        console.warn('No se pudo cargar el grupo:', error.message);
        return null;
    }
    return data;
}

function updateHeader(user, profile) {
    const nameElement = document.getElementById('estudianteName');
    const gradeElement = document.getElementById('studentGrade');

    const fullName = [user.nombre, user.apellido].filter(Boolean).join(' ');
    if (nameElement) {
        nameElement.textContent = fullName || user.email || 'Estudiante';
    }

    if (gradeElement) {
        gradeElement.textContent = profile?.grado || profile?.grupo || 'No asignado';
    }
}

function updateSummary(grades, profile) {
    const averageElement = document.getElementById('averageValue');
    const approvedElement = document.getElementById('approvedValue');
    const currentPeriodElement = document.getElementById('currentPeriodValue');
    const approvedStatus = document.getElementById('approvedStatus');
    const averageStatus = document.getElementById('averageStatus');

    const averageGrades = grades.map(row => {
        const noteValues = [Number(row.nota1), Number(row.nota2), Number(row.nota3)]
            .filter(value => !Number.isNaN(value));
        return getAverageValue(noteValues);
    });

    const summaryAverage = averageGrades.length ? getAverageValue(averageGrades) : 0;
    const approvedCount = grades.filter(row => getGradeStatus(getAverageValue([Number(row.nota1), Number(row.nota2), Number(row.nota3)])) === 'Aprobado').length;
    const totalCount = grades.length;
    const pendingCount = Math.max(totalCount - approvedCount, 0);

    if (averageElement) {
        averageElement.textContent = totalCount ? formatGrade(summaryAverage) : '0.0';
    }
    if (approvedElement) {
        approvedElement.textContent = `${approvedCount}/${totalCount}`;
    }
    if (currentPeriodElement) {
        currentPeriodElement.textContent = profile?.periodo_actual || profile?.periodo || 'Período 2';
    }
    if (approvedStatus) {
        approvedStatus.textContent = pendingCount > 0 ? `${pendingCount} pendiente${pendingCount > 1 ? 's' : ''}` : 'Sin pendientes';
        approvedStatus.className = pendingCount > 0 ? 'stat-status pending' : 'stat-status ok';
    }
    if (averageStatus) {
        const statusText = totalCount === 0 ? 'Sin datos' : (getGradeStatus(summaryAverage) === 'Aprobado' ? '¡Buen desempeño!' : 'En riesgo');
        averageStatus.textContent = statusText;
        averageStatus.className = getGradeStatus(summaryAverage) === 'Aprobado' ? 'stat-status ok' : 'stat-status pending';
    }
}

function renderGrades(grades, docentesMap) {
    const gradesTableBody = document.getElementById('gradesTableBody');
    if (!gradesTableBody) return;

    if (!grades || grades.length === 0) {
        gradesTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding: 2rem; color: #64748b;">Aún no hay calificaciones registradas.</td>
            </tr>
        `;
        return;
    }

    gradesTableBody.innerHTML = grades.map(row => {
        const materiaName = row.materias?.nombre || 'Sin materia';
        const docenteName = docentesMap[row.materias?.docente_id] || 'Docente no asignado';
        const nota1 = Number(row.nota1);
        const nota2 = Number(row.nota2);
        const nota3 = Number(row.nota3);
        const averageRaw = getAverageValue([nota1, nota2, nota3]);
        const promedio = formatGrade(averageRaw);
        const statusText = getGradeStatus(averageRaw);
        const badgeClass = getBadgeClass(averageRaw);

        return `
            <tr>
                <td class="subject-name">${materiaName}</td>
                <td>${docenteName}</td>
                <td>${formatGrade(row.nota1)}</td>
                <td>${formatGrade(row.nota2)}</td>
                <td>${formatGrade(row.nota3)}</td>
                <td><span class="grade-badge ${badgeClass}">${promedio}</span></td>
                <td><span class="stat-status ${statusText === 'Aprobado' ? 'ok' : 'pending'}">${statusText}</span></td>
            </tr>
        `;
    }).join('');
}

function renderSchedule(profile, group) {
    const scheduleContent = document.getElementById('scheduleContent');
    if (!scheduleContent) return;

    const scheduleItems = [];
    if (profile?.horario) {
        scheduleItems.push({ label: 'Horario personal', value: profile.horario });
    }
    if (group?.horario) {
        scheduleItems.push({ label: 'Horario de grupo', value: group.horario });
    }

    if (scheduleItems.length === 0) {
        scheduleContent.innerHTML = `<p>No hay horario asignado por el momento. Consulta con tu coordinación académica para obtener el cronograma.</p>`;
        return;
    }

    scheduleContent.innerHTML = scheduleItems.map(item => `
        <div style="background:#f8fafc; border-radius:14px; padding:1rem; border:1px solid #e2e8f0;">
            <strong>${item.label}</strong>
            <p style="margin:0.5rem 0 0; color:#475569;">${item.value}</p>
        </div>
    `).join('');
}

function renderPrograms(profile, grades, group) {
    const programsContent = document.getElementById('programsContent');
    if (!programsContent) return;

    const subjectNames = Array.from(new Set((grades || []).map(row => row.materias?.nombre).filter(Boolean)));
    const groupName = group?.nombre || profile?.grupo || 'Sin grupo asignado';
    const teacherName = group?.docentes?.nombre || 'No asignado';
    const room = group?.salon || profile?.salon || 'N/A';

    programsContent.innerHTML = `
        <div style="background:#f8fafc; border-radius:16px; padding:1.5rem; border:1px solid #e2e8f0;">
            <h4 style="margin:0 0 0.5rem; color:#1e293b;">Grupo de curso</h4>
            <p style="margin:0 0.65rem; color:#475569;">${groupName}</p>
            <div style="display:grid; gap:0.75rem;">
                <div><strong>Docente:</strong> ${teacherName}</div>
                <div><strong>Salón:</strong> ${room}</div>
                <div><strong>Grado:</strong> ${profile?.grado || 'No asignado'}</div>
            </div>
        </div>
        <div style="background:#fff; border-radius:16px; padding:1.5rem; border:1px solid #e2e8f0;">
            <h4 style="margin:0 0 0.75rem; color:#1e293b;">Materias del grupo</h4>
            ${subjectNames.length ? `<ul style="padding-left:1.2rem; margin:0; color:#475569;">${subjectNames.map(name => `<li>${name}</li>`).join('')}</ul>` : '<p style="margin:0; color:#64748b;">No se encontraron materias relacionadas.</p>'}
        </div>
    `;
}

function renderNews() {
    const newsGrid = document.getElementById('newsGrid');
    if (!newsGrid) return;
    newsGrid.innerHTML = `
        <div class="news-card">
            <span class="news-tag evento">Evento</span>
            <h4>Feria de Ciencias</h4>
            <p>Participa en la feria anual de ciencias el próximo 15 de mayo. ¡Inscríbete ya!</p>
            <span class="news-date">📅 15 Mayo 2025</span>
        </div>
        <div class="news-card">
            <span class="news-tag noticia">Noticia</span>
            <h4>Resultados Período 1</h4>
            <p>Ya están disponibles las calificaciones del primer período académico.</p>
            <span class="news-date">📅 20 Abril 2025</span>
        </div>
        <div class="news-card">
            <span class="news-tag evento">Evento</span>
            <h4>Día de la Familia</h4>
            <p>Los invitamos al encuentro familiar del próximo 28 de abril en el patio principal.</p>
            <span class="news-date">📅 28 Abril 2025</span>
        </div>
    `;
}

async function initializeDashboard() {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
    setupSidebarNavigation();

    const userData = localStorage.getItem('user_data');
    if (!userData) {
        window.location.href = '../index.html';
        return;
    }

    const user = JSON.parse(userData);
    if (!user || user.rol !== 'estudiante') {
        window.location.href = '../index.html';
        return;
    }

    const profile = await fetchStudentProfile(user.email);
    const grades = await fetchGrades(user.id);
    const docenteIds = Array.from(new Set((grades || []).map(item => item.materias?.docente_id).filter(Boolean)));
    const docentesMap = await fetchDocentes(docenteIds);
    const group = await fetchGroupDetails(profile?.grupo_id);

    updateHeader(user, profile);
    updateSummary(grades, profile);
    renderGrades(grades, docentesMap);
    renderSchedule(profile, group);
    renderPrograms(profile, grades, group);
    renderNews();
    mostrarSeccion('inicio');
}

window.addEventListener('DOMContentLoaded', initializeDashboard);
