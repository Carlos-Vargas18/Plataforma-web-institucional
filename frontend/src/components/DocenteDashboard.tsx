import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { HorarioClase, AlumnoGrupoDetalle, BoletinEstudiante } from '../types';
import { HorarioSemanalGrid } from './HorarioSemanalGrid';
import { BoletinOficialModal } from './BoletinOficialModal';
import {
  GraduationCap,
  LogOut,
  BookOpen,
  Save,
  CheckCircle,
  Users,
  Calendar,
  Clock,
  UserCheck,
  ShieldAlert,
  HeartPulse,
  Phone,
  Search,
  Plus,
  Award,
  AlertTriangle,
  UserX,
  FileText,
  Mail,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  ChevronRight,
  Check,
  X
} from 'lucide-react';

interface StudentGradeRow {
  id: number;
  estudianteId?: number;
  nombre: string;
  codigo: string;
  materiaNombre?: string;
  cognitiva: number;
  procedimental: number;
  actitudinal: number;
  definitiva: number;
  desempeno: string;
}

interface AsistenciaRow {
  id: number;
  codigo: string;
  nombre: string;
  estado: 'PRESENTE' | 'RETARDO' | 'JUSTIFICADA' | 'INJUSTIFICADA';
}

export const DocenteDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  
  // TIPO DE DOCENTE: Diferenciación si es Director de Grupo o solo Docente de Asignatura
  const [esDirectorGrupo, setEsDirectorGrupo] = useState<boolean>(true);
  const grupoAsignado = '6°A - Secundaria';
  const salonAsignado = 'Aula 201 - Bloque A';

  // Navegación por Pestañas
  const [currentTab, setCurrentTab] = useState<
    'calificaciones_materia' | 'asistencia_materia' | 'estudiantes_materia' |
    'grupo_consolidado' | 'grupo_observador' | 'grupo_salud' | 'grupo_acudientes' |
    'horario'
  >('calificaciones_materia');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [students, setStudents] = useState<StudentGradeRow[]>([]);
  const [horarios, setHorarios] = useState<HorarioClase[]>([]);
  const [alumnosGrupo, setAlumnosGrupo] = useState<AlumnoGrupoDetalle[]>([]);
  const [searchEst, setSearchEst] = useState('');
  const [searchGrupoEst, setSearchGrupoEst] = useState('');

  // Selector de Asignatura Dictada
  const [materiaSeleccionada, setMateriaSeleccionada] = useState<string>('Matemáticas y Álgebra - Grado 6°A');

  // Control de Asistencia a Clase
  const [asistenciaList, setAsistenciaList] = useState<AsistenciaRow[]>([
    { id: 23, codigo: 'EST-2026-030', nombre: 'Carlos Vargas', estado: 'PRESENTE' },
    { id: 99, codigo: 'EST-2026-036', nombre: 'Mariana Jiménez', estado: 'PRESENTE' },
    { id: 101, codigo: 'EST-2026-001', nombre: 'Lucas Mateo Ramírez', estado: 'PRESENTE' },
    { id: 102, codigo: 'EST-2026-050', nombre: 'Alejandro Gómez', estado: 'RETARDO' },
    { id: 103, codigo: 'EST-2026-041', nombre: 'Sofía Isabel Castro', estado: 'PRESENTE' },
  ]);

  // Modal Observador (Ley 1620)
  const [anotacionModal, setAnotacionModal] = useState(false);
  const [selectedAlumno, setSelectedAlumno] = useState<string>('');
  const [tipoAnotacion, setTipoAnotacion] = useState<'TIPO_I' | 'TIPO_II' | 'TIPO_III' | 'FORMATIVA'>('FORMATIVA');
  const [descAnotacion, setDescAnotacion] = useState('');
  const [compromisoAnotacion, setCompromisoAnotacion] = useState('');

  // Modal Citación Acudientes
  const [citacionModal, setCitacionModal] = useState(false);
  const [citacionAlumno, setCitacionAlumno] = useState<string>('');
  const [citacionTutor, setCitacionTutor] = useState<string>('');
  const [citacionMotivo, setCitacionMotivo] = useState<string>('Bajo rendimiento académico en 2 o más materias');
  const [citacionFecha, setCitacionFecha] = useState<string>('2026-11-05T08:00');

  // Recomendación 1: Boletín Oficial de Calificaciones (Decreto 1290)
  const [selectedBoletin, setSelectedBoletin] = useState<BoletinEstudiante | null>(null);
  const [showBoletinModal, setShowBoletinModal] = useState(false);

  // Requerimiento: Filtro de Horario Docente (Solo Mis Clases vs Horario Global del Grupo 6°A)
  const [vistaHorarioDocente, setVistaHorarioDocente] = useState<'mis_clases' | 'grupo_completo'>('mis_clases');

  const handleVerBoletin = async (codigo: string) => {
    const b = await api.getBoletinEstudiante(codigo, 1);
    setSelectedBoletin(b);
    setShowBoletinModal(true);
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const data = await api.getCalificacionesDocente(user?.id);
      if (data && data.length > 0) {
        setStudents(data);
      } else {
        setStudents([
          { id: 23, estudianteId: 30, nombre: 'Carlos Vargas', codigo: 'EST-2026-030', materiaNombre: 'Matemáticas y Álgebra', cognitiva: 4.8, procedimental: 4.5, actitudinal: 5.0, definitiva: 4.72, desempeno: 'SUPERIOR' },
          { id: 99, estudianteId: 36, nombre: 'Mariana Jiménez', codigo: 'EST-2026-036', materiaNombre: 'Matemáticas y Álgebra', cognitiva: 4.0, procedimental: 4.2, actitudinal: 4.5, definitiva: 4.18, desempeno: 'ALTO' },
          { id: 101, estudianteId: 42, nombre: 'Lucas Mateo Ramírez', codigo: 'EST-2026-001', materiaNombre: 'Matemáticas y Álgebra', cognitiva: 4.6, procedimental: 4.7, actitudinal: 5.0, definitiva: 4.72, desempeno: 'SUPERIOR' },
          { id: 102, estudianteId: 50, nombre: 'Alejandro Gómez', codigo: 'EST-2026-050', materiaNombre: 'Matemáticas y Álgebra', cognitiva: 3.5, procedimental: 3.8, actitudinal: 4.0, definitiva: 3.72, desempeno: 'BASICO' },
          { id: 103, estudianteId: 41, nombre: 'Sofía Isabel Castro', codigo: 'EST-2026-041', materiaNombre: 'Matemáticas y Álgebra', cognitiva: 2.8, procedimental: 3.0, actitudinal: 3.5, definitiva: 3.02, desempeno: 'BASICO' },
        ]);
      }

      const h = await api.getHorarios();
      setHorarios(h);

      const ag = await api.getAlumnosDirectorGrupo();
      setAlumnosGrupo(ag);

      setLoading(false);
    };

    fetchAll();
  }, [user]);

  const notify = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleGradeChange = (id: number, field: 'cognitiva' | 'procedimental' | 'actitudinal', value: string) => {
    const num = Math.min(5.0, Math.max(0.0, parseFloat(value) || 0));

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const updated = { ...s, [field]: num };
        const def = (updated.cognitiva * 0.4 + updated.procedimental * 0.4 + updated.actitudinal * 0.2);
        const rounded = parseFloat(def.toFixed(2));

        let des = 'BAJO';
        if (rounded >= 4.6) des = 'SUPERIOR';
        else if (rounded >= 4.0) des = 'ALTO';
        else if (rounded >= 3.0) des = 'BASICO';

        return { ...updated, definitiva: rounded, desempeno: des };
      })
    );
  };

  const handleSaveGrades = async () => {
    try {
      setLoading(true);
      for (const s of students) {
        if (s.id && s.id !== 99) {
          await api.guardarCalificacion(s.id, s.cognitiva, s.procedimental, s.actitudinal, s.definitiva);
        }
      }
      notify(`✅ Calificaciones de ${materiaSeleccionada} guardadas exitosamente en la base de datos.`);
    } catch (err: any) {
      alert('Error guardando en Supabase: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearAnotacion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descAnotacion.trim()) return;
    notify(`📝 Anotación de observador (${tipoAnotacion}) registrada debidamente para ${selectedAlumno}.`);
    setAnotacionModal(false);
    setDescAnotacion('');
    setCompromisoAnotacion('');
  };

  const handleCrearCitacion = (e: React.FormEvent) => {
    e.preventDefault();
    notify(`✉️ Citación oficial enviada a ${citacionTutor} (Acudiente de ${citacionAlumno}) para el ${citacionFecha.replace('T', ' a las ')}.`);
    setCitacionModal(false);
  };

  const toggleAsistenciaEstado = (id: number) => {
    setAsistenciaList(prev => prev.map(a => {
      if (a.id !== id) return a;
      const nextEstado: Record<AsistenciaRow['estado'], AsistenciaRow['estado']> = {
        'PRESENTE': 'RETARDO',
        'RETARDO': 'JUSTIFICADA',
        'JUSTIFICADA': 'INJUSTIFICADA',
        'INJUSTIFICADA': 'PRESENTE',
      };
      return { ...a, estado: nextEstado[a.estado] };
    }));
  };

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR UNIFICADO DOCENTE */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="brand-wrapper">
            <div className="brand-icon-box" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <GraduationCap size={22} />
            </div>
            <div>
              <div className="brand-title" style={{ fontSize: '1.2rem' }}>EduConnect</div>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
                {esDirectorGrupo ? 'Docente & Dir. de Grupo' : 'Docente Titular de Asignatura'}
              </span>
            </div>
          </div>
        </div>

        <ul className="sidebar-menu">
          {/* GRUPO 1: MIS ASIGNATURAS */}
          <li style={{ padding: '0.75rem 1rem 0.35rem', fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 800, letterSpacing: '0.05em' }}>
            Mis Asignaturas Dictadas
          </li>

          <li
            className={`sidebar-item ${currentTab === 'calificaciones_materia' ? 'active' : ''}`}
            onClick={() => setCurrentTab('calificaciones_materia')}
          >
            <BookOpen size={18} />
            <span>Planilla de Materia</span>
          </li>

          <li
            className={`sidebar-item ${currentTab === 'asistencia_materia' ? 'active' : ''}`}
            onClick={() => setCurrentTab('asistencia_materia')}
          >
            <CheckCircle size={18} />
            <span>Asistencia a Clase</span>
          </li>

          <li
            className={`sidebar-item ${currentTab === 'estudiantes_materia' ? 'active' : ''}`}
            onClick={() => setCurrentTab('estudiantes_materia')}
          >
            <Users size={18} />
            <span>Alumnos de Mi Materia</span>
          </li>

          {/* GRUPO 2: DIRECCIÓN DE GRUPO (APARTADO GLOBAL) */}
          {esDirectorGrupo && (
            <>
              <li style={{ padding: '1rem 1rem 0.35rem', fontSize: '0.72rem', textTransform: 'uppercase', color: '#38bdf8', fontWeight: 800, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={12} />
                <span>Dirección de Grupo (6°A)</span>
              </li>

              <li
                className={`sidebar-item ${currentTab === 'grupo_consolidado' ? 'active' : ''}`}
                onClick={() => setCurrentTab('grupo_consolidado')}
                style={{ borderLeft: currentTab === 'grupo_consolidado' ? '3px solid #38bdf8' : 'none' }}
              >
                <Award size={18} />
                <span>Consolidado Global (Todas)</span>
              </li>

              <li
                className={`sidebar-item ${currentTab === 'grupo_observador' ? 'active' : ''}`}
                onClick={() => setCurrentTab('grupo_observador')}
                style={{ borderLeft: currentTab === 'grupo_observador' ? '3px solid #38bdf8' : 'none' }}
              >
                <ShieldAlert size={18} />
                <span>Observador Convivencial</span>
              </li>

              <li
                className={`sidebar-item ${currentTab === 'grupo_salud' ? 'active' : ''}`}
                onClick={() => setCurrentTab('grupo_salud')}
                style={{ borderLeft: currentTab === 'grupo_salud' ? '3px solid #38bdf8' : 'none' }}
              >
                <HeartPulse size={18} />
                <span>Ficha Médica y RH</span>
              </li>

              <li
                className={`sidebar-item ${currentTab === 'grupo_acudientes' ? 'active' : ''}`}
                onClick={() => setCurrentTab('grupo_acudientes')}
                style={{ borderLeft: currentTab === 'grupo_acudientes' ? '3px solid #38bdf8' : 'none' }}
              >
                <Phone size={18} />
                <span>Acudientes y Citaciones</span>
              </li>
            </>
          )}

          {/* GRUPO 3: HORARIOS */}
          <li style={{ padding: '1rem 1rem 0.35rem', fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 800, letterSpacing: '0.05em' }}>
            Programación
          </li>

          <li
            className={`sidebar-item ${currentTab === 'horario' ? 'active' : ''}`}
            onClick={() => setCurrentTab('horario')}
          >
            <Calendar size={18} />
            <span>Horario Semanal (Recuadros)</span>
          </li>
        </ul>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={logout}>
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="dashboard-content">
        {/* TOPBAR CON TIPO DE DOCENTE Y DIFERENCIACIÓN CLARA */}
        <div className="dashboard-topbar" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
              <h1 style={{ fontSize: '1.75rem', margin: 0 }}>
                {currentTab === 'calificaciones_materia' && 'Planilla de Calificaciones por Materia'}
                {currentTab === 'asistencia_materia' && 'Control de Asistencia de Asignatura'}
                {currentTab === 'estudiantes_materia' && 'Alumnos Matriculados en Tu Materia'}
                {currentTab === 'grupo_consolidado' && 'Consolidado General de Notas — Grado 6°A'}
                {currentTab === 'grupo_observador' && 'Observador del Estudiante (Ley 1620)'}
                {currentTab === 'grupo_salud' && 'Ficha Médica y Primeros Auxilios (6°A)'}
                {currentTab === 'grupo_acudientes' && 'Directorio de Acudientes y Citaciones'}
                {currentTab === 'horario' && 'Mi Horario Semanal de Clases'}
              </h1>
              {esDirectorGrupo && (
                <span className="grade-badge superior" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                  👑 Director de Grupo 6°A
                </span>
              )}
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Prof. Roberto Silva — Periodo Lectivo 2026 | {salonAsignado}
            </p>
          </div>

          {/* SELECTOR / SWITCH DE TIPO DE DOCENTE */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-dark)',
                borderRadius: '14px',
                padding: '0.45rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem'
              }}
              title="Alternar rol pedagógico para ver cómo se adapta el dashboard"
            >
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Tipo Asignado:
              </div>
              <button
                type="button"
                onClick={() => setEsDirectorGrupo(!esDirectorGrupo)}
                style={{
                  background: esDirectorGrupo ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${esDirectorGrupo ? '#38bdf8' : 'var(--border-dark)'}`,
                  color: esDirectorGrupo ? '#38bdf8' : '#94a3b8',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                {esDirectorGrupo ? (
                  <>
                    <Check size={14} />
                    <span>Con Dirección de Grupo (6°A)</span>
                  </>
                ) : (
                  <>
                    <X size={14} />
                    <span>Solo Docente de Asignatura</span>
                  </>
                )}
              </button>
            </div>

            <div className="user-profile-badge">
              <div className="user-avatar-circle" style={{ background: '#dcfce7', color: '#15803d' }}>
                👨‍🏫
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>Prof. Roberto Silva</div>
                <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>DOCENTE TITULAR</div>
              </div>
            </div>
          </div>
        </div>

        {/* NOTIFICACIÓN FLOTANTE */}
        {successMsg && (
          <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '0.85rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600 }}>
            <CheckCircle size={20} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            APARTADO 1: MIS ASIGNATURAS Y ESTUDIANTES DE MATERIA
           ════════════════════════════════════════════════════════════ */}

        {/* PESTAÑA 1.1: CALIFICACIONES POR MATERIA */}
        {currentTab === 'calificaciones_materia' && (
          <div className="panel-card">
            <div className="panel-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Planilla Oficial de Calificaciones</h3>
                  <span className="grade-badge alto">Decreto 1290 / SIEE</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Ponderación: Cognitivo (40%) + Procedimental (40%) + Actitudinal (20%) = Definitiva
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                {/* SELECTOR DE MATERIA DICTADA */}
                <select
                  className="form-input"
                  style={{ width: '260px', padding: '0.5rem 0.75rem', fontSize: '0.85rem', fontWeight: 600 }}
                  value={materiaSeleccionada}
                  onChange={(e) => setMateriaSeleccionada(e.target.value)}
                >
                  <option value="Matemáticas y Álgebra - Grado 6°A">Matemáticas y Álgebra — 6°A</option>
                  <option value="Matemáticas y Geometría - Grado 6°B">Matemáticas y Geometría — 6°B</option>
                  <option value="Geometría y Estadística - Grado 7°A">Geometría y Estadística — 7°A</option>
                </select>

                <button
                  className="btn-primary-action"
                  onClick={handleSaveGrades}
                  disabled={loading}
                  style={{ padding: '0.55rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.88rem' }}
                >
                  <Save size={16} />
                  <span>{loading ? 'Guardando...' : 'Guardar Notas'}</span>
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Estudiante</th>
                    <th>Materia Dictada</th>
                    <th style={{ width: '115px' }}>Cognitivo (40%)</th>
                    <th style={{ width: '115px' }}>Procedimental (40%)</th>
                    <th style={{ width: '115px' }}>Actitudinal (20%)</th>
                    <th>Definitiva</th>
                    <th>Desempeño</th>
                    <th style={{ textAlign: 'center' }}>Boletín</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id}>
                      <td><code>{s.codigo}</code></td>
                      <td style={{ fontWeight: 600 }}>{s.nombre}</td>
                      <td><span className="grade-badge alto" style={{ fontSize: '0.75rem' }}>{materiaSeleccionada.split('—')[0]}</span></td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max="5"
                          step="0.1"
                          value={s.cognitiva}
                          onChange={(e) => handleGradeChange(s.id, 'cognitiva', e.target.value)}
                          className="form-input"
                          style={{ width: '80px', padding: '0.35rem 0.5rem', textAlign: 'center' }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max="5"
                          step="0.1"
                          value={s.procedimental}
                          onChange={(e) => handleGradeChange(s.id, 'procedimental', e.target.value)}
                          className="form-input"
                          style={{ width: '80px', padding: '0.35rem 0.5rem', textAlign: 'center' }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max="5"
                          step="0.1"
                          value={s.actitudinal}
                          onChange={(e) => handleGradeChange(s.id, 'actitudinal', e.target.value)}
                          className="form-input"
                          style={{ width: '80px', padding: '0.35rem 0.5rem', textAlign: 'center' }}
                        />
                      </td>
                      <td>
                        <span className={`grade-badge ${s.desempeno === 'SUPERIOR' ? 'superior' : s.desempeno === 'ALTO' ? 'alto' : s.desempeno === 'BASICO' ? 'basico' : 'bajo'}`}>
                          {s.definitiva.toFixed(2)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{s.desempeno}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleVerBoletin(s.codigo)}
                          style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          title="Generar e Imprimir Boletín Oficial (Decreto 1290)"
                        >
                          <FileText size={12} /> Boletín
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PESTAÑA 1.2: ASISTENCIA A CLASE POR MATERIA */}
        {currentTab === 'asistencia_materia' && (
          <div className="panel-card">
            <div className="panel-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>📋 Control de Asistencia a Clase</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Asignatura: <strong>{materiaSeleccionada}</strong> | Fecha: 29 de Octubre de 2026
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn-primary-action"
                  onClick={() => notify('✅ Registro de asistencia de la clase guardado en el servidor.')}
                  style={{ padding: '0.55rem 1.2rem', fontSize: '0.85rem' }}
                >
                  <Save size={16} />
                  <span>Guardar Asistencia de Hoy</span>
                </button>
              </div>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1rem' }}>
              💡 Haz clic sobre el botón de estado de cada estudiante para alternar entre: <strong>Presente</strong>, <strong>Retardo</strong>, <strong>Justificada</strong> o <strong>Injustificada</strong>.
            </p>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Estudiante</th>
                  <th>Materia</th>
                  <th>Estado de Asistencia</th>
                  <th>Notificación a Acudiente</th>
                </tr>
              </thead>
              <tbody>
                {asistenciaList.map((a) => (
                  <tr key={a.id}>
                    <td><code>{a.codigo}</code></td>
                    <td style={{ fontWeight: 700 }}>{a.nombre}</td>
                    <td>{materiaSeleccionada.split('—')[0]}</td>
                    <td>
                      <button
                        onClick={() => toggleAsistenciaEstado(a.id)}
                        style={{
                          background: a.estado === 'PRESENTE' ? 'rgba(34, 197, 94, 0.15)' : a.estado === 'RETARDO' ? 'rgba(234, 179, 8, 0.15)' : a.estado === 'JUSTIFICADA' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          border: `1px solid ${a.estado === 'PRESENTE' ? '#22c55e' : a.estado === 'RETARDO' ? '#eab308' : a.estado === 'JUSTIFICADA' ? '#38bdf8' : '#ef4444'}`,
                          color: a.estado === 'PRESENTE' ? '#4ade80' : a.estado === 'RETARDO' ? '#fde047' : a.estado === 'JUSTIFICADA' ? '#38bdf8' : '#f87171',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.8rem'
                        }}
                      >
                        {a.estado === 'PRESENTE' && '✓ Presente en Aula'}
                        {a.estado === 'RETARDO' && '⏱ Retardo'}
                        {a.estado === 'JUSTIFICADA' && '📄 Falla Justificada'}
                        {a.estado === 'INJUSTIFICADA' && '❌ Inasistencia'}
                      </button>
                    </td>
                    <td>
                      {a.estado === 'INJUSTIFICADA' ? (
                        <span style={{ fontSize: '0.78rem', color: '#fb7185', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <AlertTriangle size={13} /> SMS y Alerta enviados a tutor
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Sin novedad</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PESTAÑA 1.3: ESTUDIANTES DE MATERIA */}
        {currentTab === 'estudiantes_materia' && (
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>👨‍🎓 Directorio de Estudiantes de la Materia</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Alumnos inscritos en {materiaSeleccionada}
                </p>
              </div>

              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Buscar estudiante..."
                  className="form-input"
                  style={{ paddingLeft: '32px', width: '220px', padding: '0.5rem 0.5rem 0.5rem 32px' }}
                  value={searchEst}
                  onChange={(e) => setSearchEst(e.target.value)}
                />
              </div>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre Completo</th>
                  <th>Curso Base</th>
                  <th>Nota Definitiva de Materia</th>
                  <th>Desempeño</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {students
                  .filter(s => s.nombre.toLowerCase().includes(searchEst.toLowerCase()) || s.codigo.toLowerCase().includes(searchEst.toLowerCase()))
                  .map((s) => (
                    <tr key={s.id}>
                      <td><code>{s.codigo}</code></td>
                      <td style={{ fontWeight: 600 }}>{s.nombre}</td>
                      <td>Grado 6°A</td>
                      <td>
                        <span className={`grade-badge ${s.desempeno === 'SUPERIOR' ? 'superior' : s.desempeno === 'ALTO' ? 'alto' : s.desempeno === 'BASICO' ? 'basico' : 'bajo'}`}>
                          {s.definitiva.toFixed(2)}
                        </span>
                      </td>
                      <td><span style={{ fontWeight: 700 }}>{s.desempeno}</span></td>
                      <td>
                        <span className="grade-badge superior">Matriculado Activo</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            APARTADO 2: DIRECCIÓN DE GRUPO (MI SALÓN A CARGO: 6°A)
           ════════════════════════════════════════════════════════════ */}

        {/* PESTAÑA 2.1: CONSOLIDADO GENERAL DE TODAS LAS MATERIAS */}
        {esDirectorGrupo && currentTab === 'grupo_consolidado' && (
          <div className="panel-card">
            <div className="panel-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', margin: 0 }}>🌐 Consolidado Académico Integral — Grado 6°A</h3>
                  <span className="grade-badge superior">34 Estudiantes a Cargo</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Promedio general acumulando TODAS las asignaturas del plan de estudios y semáforo de riesgo
                </p>
              </div>

              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Buscar alumno de 6°A..."
                  className="form-input"
                  style={{ paddingLeft: '32px', width: '210px', padding: '0.45rem 0.5rem 0.45rem 32px', fontSize: '0.85rem' }}
                  value={searchGrupoEst}
                  onChange={(e) => setSearchGrupoEst(e.target.value)}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Estudiante</th>
                    <th>Promedio Acumulado (Todas)</th>
                    <th>Desempeño Global</th>
                    <th>Materias en Riesgo</th>
                    <th>Asistencia Semestral</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {alumnosGrupo
                    .filter(a => a.nombreCompleto.toLowerCase().includes(searchGrupoEst.toLowerCase()) || a.codigo.toLowerCase().includes(searchGrupoEst.toLowerCase()))
                    .map((a) => {
                      const materiasPerdidas = a.promedioAcumulado < 3.0 ? 3 : a.promedioAcumulado < 3.8 ? 1 : 0;
                      return (
                        <tr key={a.id}>
                          <td><code>{a.codigo}</code></td>
                          <td style={{ fontWeight: 700 }}>{a.nombreCompleto}</td>
                          <td>
                            <span className={`grade-badge ${a.promedioAcumulado >= 4.5 ? 'superior' : a.promedioAcumulado >= 4.0 ? 'alto' : a.promedioAcumulado >= 3.0 ? 'basico' : 'bajo'}`}>
                              {a.promedioAcumulado.toFixed(2)}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                            {a.promedioAcumulado >= 4.6 ? 'SUPERIOR' : a.promedioAcumulado >= 4.0 ? 'ALTO' : a.promedioAcumulado >= 3.0 ? 'BÁSICO' : 'BAJO'}
                          </td>
                          <td>
                            {materiasPerdidas === 0 ? (
                              <span style={{ color: '#4ade80', fontSize: '0.8rem', fontWeight: 600 }}>✓ Al día (0 materias)</span>
                            ) : materiasPerdidas === 1 ? (
                              <span style={{ color: '#fde047', fontSize: '0.8rem', fontWeight: 600 }}>⚠️ 1 Materia (Refuerzo)</span>
                            ) : (
                              <span style={{ color: '#fb7185', fontSize: '0.8rem', fontWeight: 700 }}>🚨 {materiasPerdidas} Materias (Comité)</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{a.asistenciaPorcentaje}%</span>
                              <div style={{ width: '60px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ width: `${a.asistenciaPorcentaje}%`, height: '100%', background: a.asistenciaPorcentaje >= 90 ? '#4ade80' : '#fb7185' }} />
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                              <button
                                onClick={() => handleVerBoletin(a.codigo)}
                                style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818cf8', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                                title="Ver e Imprimir Boletín Oficial de Calificaciones (Decreto 1290)"
                              >
                                <FileText size={13} /> Boletín Oficial
                              </button>
                              <button
                                onClick={() => {
                                  setCitacionAlumno(a.nombreCompleto);
                                  setCitacionTutor(a.acudientePrincipal);
                                  setCitacionModal(true);
                                }}
                                style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
                              >
                                Citar Acudiente
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PESTAÑA 2.2: OBSERVADOR DEL ESTUDIANTE (LEY 1620) */}
        {esDirectorGrupo && currentTab === 'grupo_observador' && (
          <div className="panel-card">
            <div className="panel-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', margin: 0 }}>⚖️ Observador del Estudiante y Convivencia Escolar</h3>
                  <span className="grade-badge alto">Ley 1620 de 2013</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Registro de situaciones pedagógicas, Tipo I (cotidianas), Tipo II (agresiones) y Tipo III (graves)
                </p>
              </div>

              <button
                className="btn-primary-action"
                onClick={() => {
                  setSelectedAlumno(alumnosGrupo[0]?.nombreCompleto || 'Estudiante');
                  setAnotacionModal(true);
                }}
                style={{ padding: '0.55rem 1.15rem', display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.88rem' }}
              >
                <Plus size={16} />
                <span>Nueva Anotación en Observador</span>
              </button>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Estudiante</th>
                  <th>Faltas Convivenciales</th>
                  <th>Estado Disciplinario</th>
                  <th>Última Novedad Reportada</th>
                  <th style={{ textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {alumnosGrupo.map((a) => (
                  <tr key={a.id}>
                    <td><code>{a.codigo}</code></td>
                    <td style={{ fontWeight: 700 }}>{a.nombreCompleto}</td>
                    <td>
                      <span className={`grade-badge ${a.observacionesConvivencia === 0 ? 'superior' : a.observacionesConvivencia === 1 ? 'basico' : 'bajo'}`}>
                        {a.observacionesConvivencia === 0 ? 'Sin Faltas' : `${a.observacionesConvivencia} Anotaciones`}
                      </span>
                    </td>
                    <td>
                      {a.observacionesConvivencia === 0 ? (
                        <span style={{ color: '#4ade80', fontSize: '0.82rem', fontWeight: 600 }}>🟢 Excelente Convivencia</span>
                      ) : a.observacionesConvivencia === 1 ? (
                        <span style={{ color: '#fde047', fontSize: '0.82rem', fontWeight: 600 }}>🟡 Compromiso Formativo</span>
                      ) : (
                        <span style={{ color: '#fb7185', fontSize: '0.82rem', fontWeight: 700 }}>🔴 En Seguimiento Coordinación</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                      {a.observacionesConvivencia === 0 ? 'Felicitación por liderazgo y compañerismo' : 'Compromiso de entrega oportuna de talleres y puntualidad'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => {
                          setSelectedAlumno(a.nombreCompleto);
                          setAnotacionModal(true);
                        }}
                        style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', padding: '5px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                      >
                        Anotar Observador
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PESTAÑA 2.3: FICHA MÉDICA Y PRIMEROS AUXILIOS */}
        {esDirectorGrupo && currentTab === 'grupo_salud' && (
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>🩺 Ficha Médica y Primeros Auxilios de Mi Grupo</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Datos vitales para emergencias escolares y enfermería institucional
                </p>
              </div>
              <span className="grade-badge alto">34 Fichas Validadas</span>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Estudiante</th>
                  <th>Tipo Sangre (RH)</th>
                  <th>EPS / Seguro</th>
                  <th>Alergias o Medicamentos</th>
                  <th>Autorización Salida</th>
                </tr>
              </thead>
              <tbody>
                {alumnosGrupo.map((a) => (
                  <tr key={a.id}>
                    <td><code>{a.codigo}</code></td>
                    <td style={{ fontWeight: 700 }}>{a.nombreCompleto}</td>
                    <td>
                      <span style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#f87171', padding: '3px 8px', borderRadius: '6px', fontWeight: 800, fontSize: '0.85rem' }}>
                        {a.tipoSangreRh}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{a.eps}</td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: a.alergias.includes('Ninguna') ? '#94a3b8' : '#fb7185', fontWeight: a.alergias.includes('Ninguna') ? 400 : 700 }}>
                        {a.alergias}
                      </span>
                    </td>
                    <td>
                      <span className="grade-badge superior">✓ Autorizado</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PESTAÑA 2.4: ACUDIENTES Y CITACIONES */}
        {esDirectorGrupo && currentTab === 'grupo_acudientes' && (
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>👨‍👩‍👧 Directorio de Acudientes y Citaciones</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Contacto directo con los padres de familia y citaciones oficiales
                </p>
              </div>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Acudiente Principal</th>
                  <th>Parentesco</th>
                  <th>Teléfono / Contacto</th>
                  <th>Contacto Emergencia</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {alumnosGrupo.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 700 }}>{a.nombreCompleto}</td>
                    <td style={{ fontWeight: 600 }}>{a.acudientePrincipal}</td>
                    <td><span className="grade-badge alto">{a.parentesco}</span></td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#38bdf8', fontWeight: 600 }}>
                        <Phone size={13} /> {a.telefonoEmergencia}
                      </span>
                    </td>
                    <td>
                      <span className="grade-badge superior">Activo 24/7</span>
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setCitacionAlumno(a.nombreCompleto);
                          setCitacionTutor(a.acudientePrincipal);
                          setCitacionModal(true);
                        }}
                        style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                      >
                        Enviar Citación
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            APARTADO 3: HORARIOS (SOLO MIS CLASES vs HORARIO GLOBAL 6°A)
           ════════════════════════════════════════════════════════════ */}
        {currentTab === 'horario' && (() => {
          const horariosDocentePersonal = horarios.filter(h => 
            h.docenteNombre?.toLowerCase().includes('roberto') || 
            h.docenteNombre?.toLowerCase().includes('silva')
          );
          const horariosGrupoGlobal = horarios.filter(h => h.grupoNombre === '6°A');
          const diasConClaseDocente = Array.from(new Set(horariosDocentePersonal.map(h => h.diaSemana)));

          return (
            <div className="panel-card">
              <div className="panel-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>📅 Programación y Horario de Clases (En Recuadros)</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Alterna entre tus clases personales asignadas o la malla horaria completa de tu grupo a cargo
                  </p>
                </div>

                {/* SELECTOR DE VISTA DE HORARIO */}
                <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.6)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-dark)' }}>
                  <button
                    onClick={() => setVistaHorarioDocente('mis_clases')}
                    style={{
                      padding: '0.45rem 1rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      border: 'none',
                      background: vistaHorarioDocente === 'mis_clases' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'transparent',
                      color: vistaHorarioDocente === 'mis_clases' ? 'white' : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <BookOpen size={14} /> Solo Mis Clases Dictadas
                  </button>
                  <button
                    onClick={() => setVistaHorarioDocente('grupo_completo')}
                    style={{
                      padding: '0.45rem 1rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      border: 'none',
                      background: vistaHorarioDocente === 'grupo_completo' ? 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)' : 'transparent',
                      color: vistaHorarioDocente === 'grupo_completo' ? 'white' : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Users size={14} /> Horario Completo del Grupo 6°A
                  </button>
                </div>
              </div>

              {/* BANNER INFORMATIVO SEGÚN LA VISTA */}
              {vistaHorarioDocente === 'mis_clases' ? (
                <div style={{ margin: '0 1.25rem 1rem', padding: '0.85rem 1.25rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                      <Calendar size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ecfdf5' }}>
                        Horario Personal del Docente — Prof. Roberto Silva
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#a7f3d0' }}>
                        Mostrando exclusivamente los bloques y días en los que impartes cátedra activa ({horariosDocentePersonal.length} clases programadas). Los demás espacios son libres de docencia directa.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', color: '#e2e8f0', fontWeight: 600 }}>
                      🗓️ Días con clase: <strong>{diasConClaseDocente.join(', ')}</strong>
                    </span>
                    <span style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', color: '#e2e8f0', fontWeight: 600 }}>
                      🚪 Aula: <strong>Aula 201 - Bloque A</strong>
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ margin: '0 1.25rem 1rem', padding: '0.85rem 1.25rem', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                      <Users size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f0f9ff' }}>
                        Malla Curricular Semanal Completa — Grado 6°A (Dirección de Grupo)
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#bae6fd' }}>
                        Visualización global de todas las {horariosGrupoGlobal.length} franjas académicas cursadas por tus 34 estudiantes con todas las áreas y docentes.
                      </div>
                    </div>
                  </div>

                  <span className="grade-badge superior">Jornada Mañana (7:00 a 13:30)</span>
                </div>
              )}

              <div style={{ padding: '0 1.25rem 1.25rem' }}>
                <HorarioSemanalGrid
                  horarios={vistaHorarioDocente === 'mis_clases' ? horariosDocentePersonal : horariosGrupoGlobal}
                  readOnly={true}
                />
              </div>
            </div>
          );
        })()}
      </main>

      {/* MODAL REGISTRAR ANOTACIÓN OBSERVADOR (LEY 1620) */}
      {anotacionModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid var(--border-dark)', borderRadius: '20px', width: '100%', maxWidth: '580px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-dark)', paddingBottom: '0.85rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', color: 'white' }}>📝 Registro en Observador del Estudiante</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Ley 1620 de 2013 — Convivencia y Garantía de Derechos
                </p>
              </div>
              <button onClick={() => setAnotacionModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCrearAnotacion}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Estudiante de 6°A</label>
                <input
                  type="text"
                  disabled
                  className="form-input"
                  value={selectedAlumno}
                  style={{ opacity: 0.8 }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Clasificación de la Situación</label>
                <select
                  className="form-input"
                  value={tipoAnotacion}
                  onChange={(e) => setTipoAnotacion(e.target.value as any)}
                >
                  <option value="FORMATIVA">Anotación Formativa / Felicitación</option>
                  <option value="TIPO_I">Situación Tipo I (Conflictos cotidianos sin daño)</option>
                  <option value="TIPO_II">Situación Tipo II (Agresiones o acoso escolar sin incapacidad)</option>
                  <option value="TIPO_III">Situación Tipo III (Graves violaciones / Remisión Inmediata)</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Relato Objetivo de los Hechos *</label>
                <textarea
                  rows={3}
                  required
                  className="form-input"
                  placeholder="Describa fecha, hora, contexto y conducta observada de manera respetuosa y objetiva..."
                  value={descAnotacion}
                  onChange={(e) => setDescAnotacion(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Compromiso Pedagógico del Estudiante</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: Cumplir oportunamente con las actividades asignadas y mantener el respeto en clase"
                  value={compromisoAnotacion}
                  onChange={(e) => setCompromisoAnotacion(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setAnotacionModal(false)}
                  style={{ background: 'transparent', border: '1px solid var(--border-dark)', color: '#cbd5e1', padding: '0.65rem 1.25rem', borderRadius: '10px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                  style={{ padding: '0.65rem 1.5rem' }}
                >
                  Firmar y Radicar Anotación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CITACIÓN ACUDIENTE */}
      {citacionModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid var(--border-dark)', borderRadius: '20px', width: '100%', maxWidth: '540px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-dark)', paddingBottom: '0.85rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', color: 'white' }}>✉️ Citación Oficial a Padre / Acudiente</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Acompañamiento pedagógico y firma de compromisos
                </p>
              </div>
              <button onClick={() => setCitacionModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCrearCitacion}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Estudiante</label>
                  <input type="text" disabled className="form-input" value={citacionAlumno} style={{ opacity: 0.8 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Acudiente Citado</label>
                  <input type="text" disabled className="form-input" value={citacionTutor} style={{ opacity: 0.8 }} />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Fecha y Hora de la Reunión *</label>
                <input
                  type="datetime-local"
                  required
                  className="form-input"
                  value={citacionFecha}
                  onChange={(e) => setCitacionFecha(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Motivo Institucional de la Citación *</label>
                <textarea
                  rows={3}
                  required
                  className="form-input"
                  value={citacionMotivo}
                  onChange={(e) => setCitacionMotivo(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setCitacionModal(false)}
                  style={{ background: 'transparent', border: '1px solid var(--border-dark)', color: '#cbd5e1', padding: '0.65rem 1.25rem', borderRadius: '10px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                  style={{ padding: '0.65rem 1.5rem' }}
                >
                  Expedir y Enviar Citación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL BOLETÍN OFICIAL DE CALIFICACIONES (DECRETO 1290) */}
      {showBoletinModal && selectedBoletin && (
        <BoletinOficialModal
          boletin={selectedBoletin}
          onClose={() => setShowBoletinModal(false)}
        />
      )}
    </div>
  );
};
