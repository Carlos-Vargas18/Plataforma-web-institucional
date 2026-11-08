import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CasoConvivencia, CitacionPadres, HorarioClase, ActaComisionEvaluacion, BoletinEstudiante } from '../types';
import { HorarioSemanalGrid } from './HorarioSemanalGrid';
import { BoletinOficialModal } from './BoletinOficialModal';
import { MipaTelemetriaPanel } from './MipaTelemetriaPanel';
import {
  ClipboardCheck,
  AlertTriangle,
  UserCheck,
  Calendar,
  Plus,
  LogOut,
  Search,
  Bell,
  Clock,
  BookOpen,
  CheckCircle,
  FileSpreadsheet,
  Trash2,
  X,
  Award,
  FileText,
  Download,
  Activity
} from 'lucide-react';

export const CoordinadorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentTab, setCurrentTab] = useState<'convivencia' | 'citaciones' | 'auditoria' | 'horarios' | 'comisiones' | 'mipa'>('convivencia');
  const [casos, setCasos] = useState<CasoConvivencia[]>([]);
  const [citaciones, setCitaciones] = useState<CitacionPadres[]>([]);
  const [horarios, setHorarios] = useState<HorarioClase[]>([]);
  const [comisiones, setComisiones] = useState<ActaComisionEvaluacion[]>([]);
  const [horarioGrupoFilter, setHorarioGrupoFilter] = useState('6°A');
  const [comisionGrupoFilter, setComisionGrupoFilter] = useState('TODOS');
  const [nuevoCasoModal, setNuevoCasoModal] = useState(false);
  const [nuevaCitacionModal, setNuevaCitacionModal] = useState(false);
  const [showNuevoHorarioModal, setShowNuevoHorarioModal] = useState(false);
  const [showNuevaComisionModal, setShowNuevaComisionModal] = useState(false);

  // Boletín Oficial (Decreto 1290)
  const [selectedBoletin, setSelectedBoletin] = useState<BoletinEstudiante | null>(null);
  const [showBoletinModal, setShowBoletinModal] = useState(false);

  // Formulario nueva acta de comisión
  const [nuevaComision, setNuevaComision] = useState<Partial<ActaComisionEvaluacion>>({
    periodo: 1,
    grupoNombre: '6°A',
    estudianteNombre: '',
    materiasReprobadas: ['Matemáticas y Álgebra', 'Lengua Castellana'],
    planMejoramiento: 'Guía de recuperación pedagógica y evaluación de nivelación escrita.',
    compromisoAcudiente: 'Supervisión diaria de tareas y acompañamiento escolar en casa.',
    estado: 'EN_PROCESO'
  });

  // Formulario nuevo horario
  const [nuevoHorario, setNuevoHorario] = useState<Partial<HorarioClase>>({
    diaSemana: 'LUNES',
    horaInicio: '07:00',
    horaFin: '08:30',
    grupoNombre: '6°A',
    materiaNombre: 'Matemáticas y Álgebra',
    docenteNombre: 'Prof. Roberto Silva',
    aula: 'Aula 201 - Bloque A'
  });

  // Formulario nuevo caso
  const [estudianteCaso, setEstudianteCaso] = useState('');
  const [grupoCaso, setGrupoCaso] = useState('6°A');
  const [tipoFalta, setTipoFalta] = useState<'TIPO_I' | 'TIPO_II' | 'TIPO_III'>('TIPO_I');
  const [descCaso, setDescCaso] = useState('');

  // Formulario nueva citación
  const [estudianteCit, setEstudianteCit] = useState('');
  const [tutorCit, setTutorCit] = useState('');
  const [telCit, setTelCit] = useState('');
  const [fechaHoraCit, setFechaHoraCit] = useState('');
  const [motivoCit, setMotivoCit] = useState('');

  useEffect(() => {
    api.getCasosConvivencia().then(setCasos);
    api.getCitacionesPadres().then(setCitaciones);
    api.getHorarios().then(setHorarios);
    api.getComisionesEvaluacion().then(setComisiones);
  }, []);

  const handleVerBoletin = async (codigo: string) => {
    const b = await api.getBoletinEstudiante(codigo, 1);
    setSelectedBoletin(b);
    setShowBoletinModal(true);
  };

  const handleExportarSIMAT = async () => {
    const ests = await api.getEstudiantesAdmin();
    api.exportarSIMATCSV(ests);
  };

  const handleCrearComision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaComision.estudianteNombre?.trim()) {
      alert('Por favor ingrese el nombre del estudiante para el acta de comisión');
      return;
    }

    const acta: ActaComisionEvaluacion = {
      id: Date.now(),
      numeroActa: `ACT-COM-2026-P${nuevaComision.periodo || 1}-0${comisiones.length + 1}`,
      periodo: nuevaComision.periodo || 1,
      fecha: new Date().toISOString().split('T')[0],
      grado: nuevaComision.grupoNombre || '6°A',
      grupoNombre: nuevaComision.grupoNombre || '6°A',
      estudianteNombre: nuevaComision.estudianteNombre,
      materiasReprobadas: typeof nuevaComision.materiasReprobadas === 'string'
        ? (nuevaComision.materiasReprobadas as string).split(',').map((s: string) => s.trim())
        : (nuevaComision.materiasReprobadas || ['Matemáticas y Álgebra', 'Lengua Castellana']),
      estudiantesEnRiesgo: 1,
      motivo: 'Seguimiento pedagógico y acuerdos de nivelación por desempeño bajo (Decreto 1290 Art. 11)',
      acuerdosPedagogicos: nuevaComision.planMejoramiento || 'Talleres pedagógicos de refuerzo y evaluación escrita',
      planMejoramiento: nuevaComision.planMejoramiento || 'Talleres prácticos y sustentación oral',
      compromisoAcudiente: nuevaComision.compromisoAcudiente || 'Acompañamiento pedagógico diario en el hogar',
      coordinadorFirma: user?.nombreCompleto || 'Coordinación Académica',
      firmadoPorRector: false,
      firmadoPorCoordinador: true,
      estado: (nuevaComision.estado as any) || 'EN_PROCESO'
    };

    await api.guardarActaComision(acta);
    setComisiones([acta, ...comisiones]);
    setShowNuevaComisionModal(false);
    setNuevaComision({
      periodo: 1,
      grupoNombre: '6°A',
      estudianteNombre: '',
      materiasReprobadas: ['Matemáticas y Álgebra', 'Lengua Castellana'],
      planMejoramiento: 'Guía de recuperación pedagógica y evaluación de nivelación escrita.',
      compromisoAcudiente: 'Supervisión diaria de tareas y acompañamiento escolar en casa.',
      estado: 'EN_PROCESO'
    });
  };

  const handleCrearHorario = async (e: React.FormEvent) => {
    e.preventDefault();
    const item: HorarioClase = {
      id: Date.now(),
      diaSemana: nuevoHorario.diaSemana as any || 'LUNES',
      horaInicio: nuevoHorario.horaInicio || '07:00',
      horaFin: nuevoHorario.horaFin || '08:30',
      grupoNombre: nuevoHorario.grupoNombre || '6°A',
      materiaNombre: nuevoHorario.materiaNombre || 'Asignatura',
      docenteNombre: nuevoHorario.docenteNombre || 'Docente Titular',
      aula: nuevoHorario.aula || 'Aula 101',
      color: '#0284c7'
    };
    await api.guardarHorario(item);
    setHorarios([...horarios, item]);
    setShowNuevoHorarioModal(false);
  };

  const handleEliminarHorario = async (id: number) => {
    if (window.confirm('¿Remover este bloque de horario escolar?')) {
      await api.eliminarHorario(id);
      setHorarios(horarios.filter(h => h.id !== id));
    }
  };

  const handleAgregarDesdeCuadricula = (dia: string, horaInicio: string, horaFin: string) => {
    setNuevoHorario({
      ...nuevoHorario,
      diaSemana: dia as any,
      horaInicio,
      horaFin,
      grupoNombre: horarioGrupoFilter
    });
    setShowNuevoHorarioModal(true);
  };

  const handleCrearCaso = (e: React.FormEvent) => {
    e.preventDefault();
    if (!estudianteCaso.trim()) return;

    const nuevo: CasoConvivencia = {
      id: Date.now(),
      estudianteNombre: estudianteCaso,
      grupoNombre: grupoCaso,
      fecha: new Date().toISOString().split('T')[0],
      tipoFalta,
      descripcion: descCaso,
      docenteReporta: 'Coordinación de Convivencia',
      estado: 'ABIERTO',
      citacionPadres: tipoFalta !== 'TIPO_I'
    };

    setCasos([nuevo, ...casos]);
    setEstudianteCaso('');
    setDescCaso('');
    setNuevoCasoModal(false);
  };

  const handleCrearCitacion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!estudianteCit.trim() || !tutorCit.trim()) return;

    const nueva: CitacionPadres = {
      id: Date.now(),
      estudianteNombre: estudianteCit,
      tutorNombre: tutorCit,
      telefonoTutor: telCit || '+57 300 0000000',
      fechaHora: fechaHoraCit || '2026-03-05 08:00 AM',
      motivo: motivoCit,
      asistio: false,
      docenteSolicita: 'Coordinación Académica'
    };

    setCitaciones([nueva, ...citaciones]);
    setEstudianteCit('');
    setTutorCit('');
    setTelCit('');
    setMotivoCit('');
    setNuevaCitacionModal(false);
  };

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR COORDINACIÓN */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="brand-wrapper">
            <div className="brand-icon-box" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}>
              <ClipboardCheck size={22} />
            </div>
            <div>
              <div className="brand-title" style={{ fontSize: '1.2rem' }}>EduConnect</div>
              <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>Coordinación General</span>
            </div>
          </div>
        </div>

        <ul className="sidebar-menu">
          <li
            className={`sidebar-item ${currentTab === 'convivencia' ? 'active' : ''}`}
            onClick={() => setCurrentTab('convivencia')}
          >
            <AlertTriangle size={20} />
            <span>Observador & Convivencia</span>
          </li>
          <li
            className={`sidebar-item ${currentTab === 'citaciones' ? 'active' : ''}`}
            onClick={() => setCurrentTab('citaciones')}
          >
            <Calendar size={20} />
            <span>Citaciones a Padres</span>
          </li>
          <li
            className={`sidebar-item ${currentTab === 'auditoria' ? 'active' : ''}`}
            onClick={() => setCurrentTab('auditoria')}
          >
            <FileSpreadsheet size={20} />
            <span>Auditoría de Planillas</span>
          </li>
          <li
            className={`sidebar-item ${currentTab === 'horarios' ? 'active' : ''}`}
            onClick={() => setCurrentTab('horarios')}
          >
            <Clock size={20} />
            <span>Horarios y Aulas</span>
          </li>
          <li
            className={`sidebar-item ${currentTab === 'comisiones' ? 'active' : ''}`}
            onClick={() => setCurrentTab('comisiones')}
          >
            <Award size={20} />
            <span>Comisiones de Evaluación</span>
          </li>
          <li
            className={`sidebar-item ${currentTab === 'mipa' ? 'active' : ''}`}
            onClick={() => setCurrentTab('mipa')}
          >
            <Activity size={20} />
            <span>Alertas MIPA & Telemetría</span>
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
        <div className="dashboard-topbar">
          <div>
            <h1 style={{ fontSize: '1.85rem', marginBottom: '0.2rem' }}>Coordinación Académica & Convivencia</h1>
            <p style={{ color: 'var(--text-light-muted)', fontSize: '0.95rem' }}>
              Bienvenido, <strong>{user?.nombreCompleto || 'Coordinador Pedagógico'}</strong> — Supervisión Escolar 2026
            </p>
          </div>

          <div className="user-profile-badge">
            <div className="user-avatar-circle" style={{ background: '#0284c7', color: 'white' }}>
              📋
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{user?.nombreCompleto || 'Coordinador Titular'}</div>
              <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 800 }}>AUDITORÍA & LEY 1620</div>
            </div>
          </div>
        </div>

        {/* MÉTRICAS DE COORDINACIÓN */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon amber"><AlertTriangle size={24} /></div>
            <div>
              <div className="stat-number">{casos.filter(c => c.estado !== 'CERRADO_CON_COMPROMISO').length}</div>
              <div className="stat-label">Casos Convivencia Activos</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon indigo"><Calendar size={24} /></div>
            <div>
              <div className="stat-number">{citaciones.length}</div>
              <div className="stat-label">Citaciones Programadas</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green"><CheckCircle size={24} /></div>
            <div>
              <div className="stat-number">94.8%</div>
              <div className="stat-label">Planillas Docentes al Día</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon rose"><Clock size={24} /></div>
            <div>
              <div className="stat-number">14</div>
              <div className="stat-label">Alertas Tempranas de Nivelación</div>
            </div>
          </div>
        </div>

        {/* TAB 1: CASOS DE CONVIVENCIA */}
        {currentTab === 'convivencia' && (
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h3>⚖️ Libro de Convivencia Escolar (Ley 1620 de 2013)</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light-muted)' }}>
                  Tipificación oficial de situaciones de convivencia escolar y seguimiento a debido proceso.
                </p>
              </div>
              <button className="btn-primary-action" onClick={() => setNuevoCasoModal(true)}>
                <Plus size={16} />
                <span>Registrar Situación</span>
              </button>
            </div>

            {nuevoCasoModal && (
              <form onSubmit={handleCrearCaso} style={{ padding: '1.5rem', background: 'rgba(2, 132, 199, 0.08)', borderBottom: '1px solid var(--border-dark)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ color: '#38bdf8' }}>Reportar Situación Convivencial</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1rem' }}>
                  <input
                    type="text"
                    placeholder="Nombre completo del estudiante"
                    className="form-input"
                    value={estudianteCaso}
                    onChange={(e) => setEstudianteCaso(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Grupo (ej: 6°A)"
                    className="form-input"
                    value={grupoCaso}
                    onChange={(e) => setGrupoCaso(e.target.value)}
                    required
                  />
                  <select
                    className="form-input"
                    value={tipoFalta}
                    onChange={(e: any) => setTipoFalta(e.target.value)}
                  >
                    <option value="TIPO_I">Tipo I (Falta Leve / Conflictos cotidianos)</option>
                    <option value="TIPO_II">Tipo II (Falta Grave / Acoso sin incapacidad)</option>
                    <option value="TIPO_III">Tipo III (Falta Gravísima / Presunto delito)</option>
                  </select>
                </div>
                <textarea
                  placeholder="Relato de los hechos observados y acuerdos iniciales..."
                  className="form-input"
                  style={{ minHeight: '70px' }}
                  value={descCaso}
                  onChange={(e) => setDescCaso(e.target.value)}
                  required
                />
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn-logout" style={{ width: 'auto', padding: '0.5rem 1rem' }} onClick={() => setNuevoCasoModal(false)}>Cancelar</button>
                  <button type="submit" className="btn-primary-action">Guardar en Observador</button>
                </div>
              </form>
            )}

            <table className="data-table">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Curso</th>
                  <th>Fecha</th>
                  <th>Tipificación</th>
                  <th>Descripción del Hecho</th>
                  <th>Docente / Reporta</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {casos.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 700, color: 'white' }}>{c.estudianteNombre}</td>
                    <td><span className="grade-badge alto">{c.grupoNombre}</span></td>
                    <td style={{ color: 'var(--text-light-muted)' }}>{c.fecha}</td>
                    <td>
                      <span className={`grade-badge ${c.tipoFalta === 'TIPO_I' ? 'basico' : c.tipoFalta === 'TIPO_II' ? 'bajo' : 'rose'}`}>
                        {c.tipoFalta}
                      </span>
                    </td>
                    <td style={{ maxWidth: '320px', fontSize: '0.88rem' }}>{c.descripcion}</td>
                    <td style={{ color: '#94a3b8' }}>{c.docenteReporta}</td>
                    <td>
                      <span className={`grade-badge ${c.estado === 'CERRADO_CON_COMPROMISO' ? 'superior' : 'bajo'}`}>
                        {c.estado.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: CITACIONES A PADRES */}
        {currentTab === 'citaciones' && (
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h3>📅 Agenda Oficial de Citaciones a Acudientes</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light-muted)' }}>
                  Notificaciones formales de comparecencia a padres de familia y acudientes autorizados.
                </p>
              </div>
              <button className="btn-primary-action" onClick={() => setNuevaCitacionModal(true)}>
                <Plus size={16} />
                <span>Nueva Citación</span>
              </button>
            </div>

            {nuevaCitacionModal && (
              <form onSubmit={handleCrearCitacion} style={{ padding: '1.5rem', background: 'rgba(2, 132, 199, 0.08)', borderBottom: '1px solid var(--border-dark)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ color: '#38bdf8' }}>Programar Citación a Padre / Acudiente</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <input
                    type="text"
                    placeholder="Estudiante"
                    className="form-input"
                    value={estudianteCit}
                    onChange={(e) => setEstudianteCit(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Nombre del Acudiente / Tutor"
                    className="form-input"
                    value={tutorCit}
                    onChange={(e) => setTutorCit(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Teléfono (ej: +57 300 1234567)"
                    className="form-input"
                    value={telCit}
                    onChange={(e) => setTelCit(e.target.value)}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                  <input
                    type="text"
                    placeholder="Fecha y Hora (ej: 2026-03-05 08:30 AM)"
                    className="form-input"
                    value={fechaHoraCit}
                    onChange={(e) => setFechaHoraCit(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Motivo de la citación (académico, disciplinario, orientación)..."
                    className="form-input"
                    value={motivoCit}
                    onChange={(e) => setMotivoCit(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn-logout" style={{ width: 'auto', padding: '0.5rem 1rem' }} onClick={() => setNuevaCitacionModal(false)}>Cancelar</button>
                  <button type="submit" className="btn-primary-action">Enviar Citación</button>
                </div>
              </form>
            )}

            <table className="data-table">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Acudiente / Tutor</th>
                  <th>Contacto Teléfono</th>
                  <th>Fecha y Hora</th>
                  <th>Motivo Institucional</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {citaciones.map((cit) => (
                  <tr key={cit.id}>
                    <td style={{ fontWeight: 700, color: 'white' }}>{cit.estudianteNombre}</td>
                    <td>{cit.tutorNombre}</td>
                    <td><code>{cit.telefonoTutor}</code></td>
                    <td style={{ color: '#38bdf8', fontWeight: 600 }}>{cit.fechaHora}</td>
                    <td style={{ fontSize: '0.88rem' }}>{cit.motivo}</td>
                    <td>
                      <span className={`grade-badge ${cit.asistio ? 'superior' : 'basico'}`}>
                        {cit.asistio ? '✓ Compareció' : '⏳ Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: AUDITORÍA DE PLANILLAS DOCENTES */}
        {currentTab === 'auditoria' && (
          <div className="panel-card">
            <div className="panel-header">
              <h3>📋 Auditoría y Cierre de Planillas de Calificaciones (Periodo 1 - 2026)</h3>
              <span className="grade-badge alto">Fecha límite: 10 de Abril 2026</span>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Docente</th>
                  <th>Asignatura</th>
                  <th>Grupos Asignados</th>
                  <th>Porcentaje de Carga</th>
                  <th>Estado de Planilla</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 700, color: 'white' }}>Prof. Jeider Antonio</td>
                  <td>Español y Literatura</td>
                  <td>6°A, 6°B, 7°A</td>
                  <td>100% de notas cargadas</td>
                  <td><span className="grade-badge superior">✓ Planilla al día</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700, color: 'white' }}>Lic. Roberto Silva</td>
                  <td>Matemáticas y Geometría</td>
                  <td>1°A, 2°A, 3°A</td>
                  <td>92% de notas cargadas</td>
                  <td><span className="grade-badge alto">En proceso</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700, color: 'white' }}>Lic. Elena Gómez</td>
                  <td>Ciencias Sociales</td>
                  <td>8°A, 9°B</td>
                  <td>75% de notas cargadas</td>
                  <td><span className="grade-badge basico">Pendiente Actitudinal</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {/* TAB 4: GESTIÓN DE HORARIOS INSTITUCIONALES */}
        {currentTab === 'horarios' && (
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h3>📅 Horario Escolar Semanal (Cuadrícula en Recuadros)</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Programación académica y supervisión visual de cargas horarias docentes
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <select
                  className="form-input"
                  style={{ width: '160px', padding: '0.5rem' }}
                  value={horarioGrupoFilter}
                  onChange={(e) => setHorarioGrupoFilter(e.target.value)}
                >
                  <option value="6°A">Grado 6°A</option>
                  <option value="1°A">Grado 1°A</option>
                  <option value="7°B">Grado 7°B</option>
                  <option value="11°">Grado 11°</option>
                </select>

                <button
                  className="btn-primary-action"
                  onClick={() => setShowNuevoHorarioModal(true)}
                  style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}
                >
                  <Plus size={16} />
                  <span>Asignar Horario</span>
                </button>
              </div>
            </div>

            <div style={{ padding: '1.25rem' }}>
              <HorarioSemanalGrid
                horarios={horarios.filter(h => h.grupoNombre.toLowerCase().includes(horarioGrupoFilter.toLowerCase()))}
                onAgregarBloque={handleAgregarDesdeCuadricula}
                onEliminarBloque={handleEliminarHorario}
              />
            </div>
          </div>
        )}

        {/* PESTAÑA: COMISIONES DE EVALUACIÓN Y PROMOCIÓN (DECRETO 1290) */}
        {currentTab === 'comisiones' && (
          <div className="panel-card">
            <div className="panel-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', margin: 0 }}>⚖️ Comisiones de Evaluación y Promoción</h3>
                  <span className="grade-badge superior">Decreto 1290 / 2009 - Art. 11</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Seguimiento institucional, acuerdos de mejoramiento pedagógico y actas oficiales por periodo
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  className="form-input"
                  style={{ width: '150px', padding: '0.5rem' }}
                  value={comisionGrupoFilter}
                  onChange={(e) => setComisionGrupoFilter(e.target.value)}
                >
                  <option value="TODOS">Todos los Grupos</option>
                  <option value="6°A">Grado 6°A</option>
                  <option value="7°B">Grado 7°B</option>
                  <option value="1°A">Grado 1°A</option>
                  <option value="11°">Grado 11°</option>
                </select>

                <button
                  onClick={handleExportarSIMAT}
                  style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#4ade80', padding: '0.55rem 1.1rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer' }}
                  title="Descargar archivo oficial estandarizado para reporte SIMAT MEN"
                >
                  <Download size={16} /> Exportar SIMAT (MEN)
                </button>

                <button
                  className="btn-primary-action"
                  onClick={() => setShowNuevaComisionModal(true)}
                  style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}
                >
                  <Plus size={16} />
                  <span>Radicar Acta Comisión</span>
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>No. Acta</th>
                    <th>Estudiante</th>
                    <th>Grupo</th>
                    <th>Periodo</th>
                    <th>Materias Reprobadas (Desempeño Bajo)</th>
                    <th>Plan de Nivelación Pedagógica</th>
                    <th>Compromiso Acudiente</th>
                    <th>Estado</th>
                    <th style={{ textAlign: 'center' }}>Boletín</th>
                  </tr>
                </thead>
                <tbody>
                  {comisiones
                    .filter(c => comisionGrupoFilter === 'TODOS' || (c.grupoNombre || c.grado) === comisionGrupoFilter)
                    .map((c) => (
                      <tr key={c.id}>
                        <td><code>{c.numeroActa || `ACT-COM-00${c.id}`}</code></td>
                        <td style={{ fontWeight: 700 }}>{c.estudianteNombre || `Alumnos Grado ${c.grado}`}</td>
                        <td><span className="grade-badge alto">{c.grupoNombre || c.grado}</span></td>
                        <td>Periodo {c.periodo}</td>
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                            {c.materiasReprobadas && c.materiasReprobadas.length > 0 ? (
                              c.materiasReprobadas.map((m, idx) => (
                                <span key={idx} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                                  {m}
                                </span>
                              ))
                            ) : (
                              <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem' }}>
                                {c.estudiantesEnRiesgo} casos en riesgo
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.82rem', maxWidth: '220px' }}>{c.planMejoramiento || c.acuerdosPedagogicos}</td>
                        <td style={{ fontSize: '0.82rem', maxWidth: '200px', color: '#94a3b8' }}>{c.compromisoAcudiente || 'Citación y compromiso formal de acudiente'}</td>
                        <td>
                          <span className={`grade-badge ${c.estado === 'CUMPLIDA' || c.estado === 'SUPERADO' ? 'superior' : c.estado === 'EN_PROCESO' ? 'alto' : 'bajo'}`}>
                            {c.estado === 'EN_PROCESO' ? '⏳ En Nivelación' : (c.estado === 'CUMPLIDA' || c.estado === 'SUPERADO') ? '✓ Cumplida' : '📋 Radicada'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => handleVerBoletin('EST-2026-041')}
                            style={{ background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                            title="Ver e Imprimir Boletín Oficial (Decreto 1290)"
                          >
                            <FileText size={13} /> Ver Boletín
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: ALERTAS PSICO-ACADÉMICAS MIPA & TELEMETRÍA */}
        {currentTab === 'mipa' && <MipaTelemetriaPanel />}
      </main>

      {/* MODAL CREAR HORARIO COORDINACIÓN */}
      {showNuevoHorarioModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid var(--border-dark)', borderRadius: '20px', width: '100%', maxWidth: '550px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-dark)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'white' }}>📅 Asignar Bloque Académico</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Programación de asignaturas y salones</p>
              </div>
              <button onClick={() => setShowNuevoHorarioModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCrearHorario}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Día de la Semana</label>
                  <select
                    className="form-input"
                    value={nuevoHorario.diaSemana}
                    onChange={(e) => setNuevoHorario({ ...nuevoHorario, diaSemana: e.target.value as any })}
                  >
                    <option value="LUNES">Lunes</option>
                    <option value="MARTES">Martes</option>
                    <option value="MIERCOLES">Miércoles</option>
                    <option value="JUEVES">Jueves</option>
                    <option value="VIERNES">Viernes</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Grupo / Curso</label>
                  <select
                    className="form-input"
                    value={nuevoHorario.grupoNombre}
                    onChange={(e) => setNuevoHorario({ ...nuevoHorario, grupoNombre: e.target.value })}
                  >
                    <option value="6°A">Grado 6°A</option>
                    <option value="1°A">Grado 1°A</option>
                    <option value="7°B">Grado 7°B</option>
                    <option value="11°">Grado 11°</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Hora Inicio</label>
                  <input
                    type="time"
                    className="form-input"
                    value={nuevoHorario.horaInicio}
                    onChange={(e) => setNuevoHorario({ ...nuevoHorario, horaInicio: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Hora Fin</label>
                  <input
                    type="time"
                    className="form-input"
                    value={nuevoHorario.horaFin}
                    onChange={(e) => setNuevoHorario({ ...nuevoHorario, horaFin: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Asignatura</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={nuevoHorario.materiaNombre}
                  onChange={(e) => setNuevoHorario({ ...nuevoHorario, materiaNombre: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Docente Titular</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={nuevoHorario.docenteNombre}
                    onChange={(e) => setNuevoHorario({ ...nuevoHorario, docenteNombre: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Aula / Salón</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={nuevoHorario.aula}
                    onChange={(e) => setNuevoHorario({ ...nuevoHorario, aula: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowNuevoHorarioModal(false)}
                  style={{ background: 'transparent', border: '1px solid var(--border-dark)', color: '#cbd5e1', padding: '0.65rem 1.25rem', borderRadius: '10px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                  style={{ padding: '0.65rem 1.5rem', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}
                >
                  Confirmar Asignación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RADICAR ACTA COMISIÓN DE EVALUACIÓN (DECRETO 1290) */}
      {showNuevaComisionModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid var(--border-dark)', borderRadius: '20px', width: '100%', maxWidth: '600px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-dark)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', color: 'white' }}>⚖️ Radicar Acta de Comisión de Evaluación</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Decreto 1290 de 2009 — Art. 11: Casos con 2 o más materias reprobadas
                </p>
              </div>
              <button onClick={() => setShowNuevaComisionModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCrearComision}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Nombre Completo del Estudiante *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Ej: Sofía Isabel Castro"
                    value={nuevaComision.estudianteNombre}
                    onChange={(e) => setNuevaComision({ ...nuevaComision, estudianteNombre: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Grupo / Salón *</label>
                  <select
                    className="form-input"
                    value={nuevaComision.grupoNombre}
                    onChange={(e) => setNuevaComision({ ...nuevaComision, grupoNombre: e.target.value })}
                  >
                    <option value="6°A">Grado 6°A</option>
                    <option value="7°B">Grado 7°B</option>
                    <option value="1°A">Grado 1°A</option>
                    <option value="11°">Grado 11°</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Periodo Académico *</label>
                  <select
                    className="form-input"
                    value={nuevaComision.periodo}
                    onChange={(e) => setNuevaComision({ ...nuevaComision, periodo: parseInt(e.target.value) || 1 })}
                  >
                    <option value="1">Periodo 1 (Corte Trimestral)</option>
                    <option value="2">Periodo 2</option>
                    <option value="3">Periodo 3</option>
                    <option value="4">Periodo 4 (Final de Año)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Estado del Proceso</label>
                  <select
                    className="form-input"
                    value={nuevaComision.estado}
                    onChange={(e) => setNuevaComision({ ...nuevaComision, estado: e.target.value as any })}
                  >
                    <option value="EN_PROCESO">⏳ En Proceso de Nivelación</option>
                    <option value="SUPERADO">✓ Superado / Aprobado</option>
                    <option value="REPROBADO">❌ No Superado</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Asignaturas Reprobadas (separadas por coma) *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Ej: Matemáticas y Álgebra, Lengua Castellana"
                  value={Array.isArray(nuevaComision.materiasReprobadas) ? nuevaComision.materiasReprobadas.join(', ') : (nuevaComision.materiasReprobadas || '')}
                  onChange={(e) => setNuevaComision({ ...nuevaComision, materiasReprobadas: e.target.value as any })}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Plan de Mejoramiento Pedagógico *</label>
                <textarea
                  rows={2}
                  required
                  className="form-input"
                  placeholder="Actividades de refuerzo, guías y sustentación programada..."
                  value={nuevaComision.planMejoramiento}
                  onChange={(e) => setNuevaComision({ ...nuevaComision, planMejoramiento: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Compromiso del Acudiente y Estudiante *</label>
                <textarea
                  rows={2}
                  required
                  className="form-input"
                  placeholder="Acompañamiento en el hogar, control de tareas y asistencia a refuerzos..."
                  value={nuevaComision.compromisoAcudiente}
                  onChange={(e) => setNuevaComision({ ...nuevaComision, compromisoAcudiente: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowNuevaComisionModal(false)}
                  style={{ background: 'transparent', border: '1px solid var(--border-dark)', color: '#cbd5e1', padding: '0.65rem 1.25rem', borderRadius: '10px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                  style={{ padding: '0.65rem 1.5rem', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}
                >
                  Radicar Acta Oficial
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
