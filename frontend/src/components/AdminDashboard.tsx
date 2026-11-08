import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DashboardStats, Usuario, Materia, Grupo, EstudianteCompleto, HorarioClase, BoletinEstudiante } from '../types';
import { HorarioSemanalGrid } from './HorarioSemanalGrid';
import { BoletinOficialModal } from './BoletinOficialModal';
import { MipaTelemetriaPanel } from './MipaTelemetriaPanel';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Layers,
  HeartHandshake,
  LogOut,
  Search,
  Plus,
  ShieldCheck,
  GraduationCap,
  Calendar,
  Clock,
  Trash2,
  Edit,
  HeartPulse,
  UserCheck,
  X,
  CheckCircle,
  AlertTriangle,
  UserPlus,
  Lock,
  Mail,
  FileText,
  Download,
  Activity
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();
  const [currentTab, setCurrentTab] = useState<'stats' | 'usuarios' | 'horarios' | 'estudiantes' | 'materias' | 'grupos' | 'mipa'>('stats');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [estudiantes, setEstudiantes] = useState<EstudianteCompleto[]>([]);
  const [horarios, setHorarios] = useState<HorarioClase[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('TODOS');
  const [estudianteSearch, setEstudianteSearch] = useState('');
  const [horarioGrupoFilter, setHorarioGrupoFilter] = useState('6°A');
  const [vistaHorario, setVistaHorario] = useState<'cuadricula' | 'lista'>('cuadricula');
  const [notification, setNotification] = useState<string | null>(null);

  // Modales
  const [showUsuarioModal, setShowUsuarioModal] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password_hash: '',
    rol: 'DOCENTE'
  });

  const [showEstudianteModal, setShowEstudianteModal] = useState(false);
  const [editingEstudiante, setEditingEstudiante] = useState<Partial<EstudianteCompleto> | null>(null);
  const [showHorarioModal, setShowHorarioModal] = useState(false);
  const [showGrupoModal, setShowGrupoModal] = useState(false);
  const [editingGrupo, setEditingGrupo] = useState<Partial<Grupo> | null>(null);
  const [grupoSearch, setGrupoSearch] = useState('');
  const [grupoJornadaFilter, setGrupoJornadaFilter] = useState('TODAS');
  const [showMateriaModal, setShowMateriaModal] = useState(false);
  const [editingMateria, setEditingMateria] = useState<Partial<Materia> | null>(null);
  const [materiaSearch, setMateriaSearch] = useState('');
  const [materiaAreaFilter, setMateriaAreaFilter] = useState('TODAS');

  // Boletín Oficial (Decreto 1290)
  const [selectedBoletin, setSelectedBoletin] = useState<BoletinEstudiante | null>(null);
  const [showBoletinModal, setShowBoletinModal] = useState(false);

  const handleVerBoletin = async (codigo: string) => {
    const b = await api.getBoletinEstudiante(codigo, 1);
    setSelectedBoletin(b);
    setShowBoletinModal(true);
  };

  // Form Horario
  const [nuevoHorario, setNuevoHorario] = useState<Partial<HorarioClase>>({
    diaSemana: 'LUNES',
    horaInicio: '07:00',
    horaFin: '08:30',
    grupoNombre: '6°A',
    materiaNombre: 'Matemáticas y Álgebra',
    docenteNombre: 'Prof. Roberto Silva',
    aula: 'Aula 201 - Bloque A'
  });

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  useEffect(() => {
    api.getDashboardStats().then(setStats);
    api.getUsuarios().then(setUsuarios);
    api.getMaterias().then(setMaterias);
    api.getGrupos().then(setGrupos);
    api.getEstudiantesAdmin().then(setEstudiantes);
    api.getHorarios().then(setHorarios);
  }, []);

  // CRUD Usuarios
  const handleSaveUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoUsuario.nombre.trim() || !nuevoUsuario.email.trim() || !nuevoUsuario.password_hash.trim()) {
      alert('Por favor complete el nombre, correo y contraseña del usuario');
      return;
    }

    const created = await api.crearUsuario(nuevoUsuario);
    setUsuarios([created, ...usuarios]);
    setShowUsuarioModal(false);
    setNuevoUsuario({ nombre: '', apellido: '', email: '', password_hash: '', rol: 'DOCENTE' });
    notify(`🎉 Usuario ${created.nombreCompleto} creado exitosamente con rol ${created.rol}. ✉️ Se envió correo de bienvenida con credenciales a ${created.email}.`);
  };

  const handleDeleteUsuario = async (id: number, nombre: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar al usuario ${nombre}?`)) {
      await api.eliminarUsuario(id);
      setUsuarios(usuarios.filter((u) => u.id !== id));
      notify(`🗑️ Usuario ${nombre} eliminado de la base de datos.`);
    }
  };

  // CRUD Estudiantes
  const handleOpenCrearEstudiante = () => {
    setEditingEstudiante({
      id: 0,
      codigoEstudiantil: `EST-2026-0${Math.floor(Math.random() * 900 + 100)}`,
      nombres: '',
      apellidos: '',
      tipoDocumento: 'TI',
      numeroDocumento: '',
      fechaNacimiento: '2012-05-15',
      genero: 'MASCULINO',
      tipoSangreRh: 'O+',
      epsSeguroMedico: 'Sanitas EPS',
      alergiasCondicionesMedicas: 'Ninguna reportada',
      direccionResidencia: '',
      grupoNombre: '6°A - Secundaria',
      tutorNombre: '',
      tutorTelefono: '+57 300 0000000',
      tutorParentesco: 'PADRE',
      estado: 'ACTIVO'
    });
    setShowEstudianteModal(true);
  };

  const handleOpenEditarEstudiante = (est: EstudianteCompleto) => {
    setEditingEstudiante({ ...est });
    setShowEstudianteModal(true);
  };

  const handleSaveEstudiante = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEstudiante?.nombres || !editingEstudiante?.apellidos) {
      alert('Por favor ingrese nombres y apellidos del estudiante');
      return;
    }

    const saved = await api.guardarEstudianteAdmin(editingEstudiante);
    if (editingEstudiante.id && editingEstudiante.id !== 0) {
      setEstudiantes(estudiantes.map(item => item.id === saved.id ? saved : item));
      notify(`✅ Estudiante ${saved.nombres} ${saved.apellidos} actualizado correctamente.`);
    } else {
      setEstudiantes([saved, ...estudiantes]);
      notify(`🎉 Nuevo estudiante ${saved.nombres} registrado con código ${saved.codigoEstudiantil}.`);
    }
    setShowEstudianteModal(false);
    setEditingEstudiante(null);
  };

  const handleDeleteEstudiante = async (id: number, nombre: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente al estudiante ${nombre}?`)) {
      await api.eliminarEstudianteAdmin(id);
      setEstudiantes(estudiantes.filter(e => e.id !== id));
      notify(`🗑️ Estudiante ${nombre} eliminado del sistema.`);
    }
  };

  // Horarios
  const handleSaveHorario = async (e: React.FormEvent) => {
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
      color: '#3b82f6'
    };
    await api.guardarHorario(item);
    setHorarios([...horarios, item]);
    setShowHorarioModal(false);
    notify('📅 Bloque de horario escolar programado con éxito.');
  };

  const handleDeleteHorario = async (id: number) => {
    if (window.confirm('¿Deseas remover este bloque del horario?')) {
      await api.eliminarHorario(id);
      setHorarios(horarios.filter(h => h.id !== id));
      notify('🗑️ Bloque de horario removido.');
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
    setShowHorarioModal(true);
  };

  // CRUD Grupos y Aulas
  const handleOpenCrearGrupo = () => {
    setEditingGrupo({
      id: 0,
      nombre: '',
      salonAula: '',
      grado: 'Grado 6° - Secundaria',
      jornada: 'MANANA',
      cupoMaximo: 35,
      directorDocenteNombre: 'Prof. Roberto Silva'
    });
    setShowGrupoModal(true);
  };

  const handleOpenEditarGrupo = (g: Grupo) => {
    setEditingGrupo({ ...g });
    setShowGrupoModal(true);
  };

  const handleSaveGrupo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGrupo?.nombre?.trim()) {
      alert('Por favor ingrese el nombre del curso o grupo (ej: 6°A, 10°2)');
      return;
    }

    const saved = await api.guardarGrupo(editingGrupo);
    if (editingGrupo.id && editingGrupo.id !== 0) {
      setGrupos(grupos.map(g => g.id === saved.id ? saved : g));
      notify(`✅ Curso y Aula ${saved.nombre} actualizados con éxito.`);
    } else {
      setGrupos([saved, ...grupos]);
      notify(`🎉 Nuevo Curso ${saved.nombre} registrado con salón ${saved.salonAula || 'general'}.`);
    }
    setShowGrupoModal(false);
    setEditingGrupo(null);
  };

  const handleDeleteGrupo = async (id: number, nombre: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el grupo/curso "${nombre}"? Esta acción liberará el aula física asignada.`)) {
      await api.eliminarGrupo(id);
      setGrupos(grupos.filter(g => g.id !== id));
      notify(`🗑️ Curso ${nombre} eliminado del sistema.`);
    }
  };

  const filteredGrupos = grupos.filter(g => {
    const matchesSearch = g.nombre.toLowerCase().includes(grupoSearch.toLowerCase()) ||
      (g.salonAula && g.salonAula.toLowerCase().includes(grupoSearch.toLowerCase())) ||
      (g.directorDocenteNombre && g.directorDocenteNombre.toLowerCase().includes(grupoSearch.toLowerCase()));
    const matchesJornada = grupoJornadaFilter === 'TODAS' || g.jornada === grupoJornadaFilter;
    return matchesSearch && matchesJornada;
  });

  // CRUD Materias Académicas
  const handleOpenCrearMateria = () => {
    setEditingMateria({
      id: 0,
      codigo: `MAT-${Math.floor(Math.random() * 800 + 100)}`,
      nombre: '',
      areaConocimiento: 'Ciencias Exactas y Matemáticas',
      horasSemanales: 4,
      docenteNombre: 'Prof. Roberto Silva'
    });
    setShowMateriaModal(true);
  };

  const handleOpenEditarMateria = (m: Materia) => {
    setEditingMateria({ ...m });
    setShowMateriaModal(true);
  };

  const handleSaveMateria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMateria?.nombre?.trim()) {
      alert('Por favor ingrese el nombre de la asignatura');
      return;
    }

    const saved = await api.guardarMateria(editingMateria);
    if (editingMateria.id && editingMateria.id !== 0) {
      setMaterias(materias.map(m => m.id === saved.id ? saved : m));
      notify(`✅ Asignatura ${saved.nombre} actualizada correctamente.`);
    } else {
      setMaterias([saved, ...materias]);
      notify(`🎉 Nueva asignatura ${saved.nombre} agregada al plan de estudios.`);
    }
    setShowMateriaModal(false);
    setEditingMateria(null);
  };

  const handleDeleteMateria = async (id: number, nombre: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la asignatura "${nombre}"? Esta acción impactará el plan de estudios.`)) {
      await api.eliminarMateria(id);
      setMaterias(materias.filter(m => m.id !== id));
      notify(`🗑️ Asignatura ${nombre} eliminada del plan curricular.`);
    }
  };

  const filteredMaterias = materias.filter(m => {
    const matchesSearch = m.nombre.toLowerCase().includes(materiaSearch.toLowerCase()) ||
      m.codigo.toLowerCase().includes(materiaSearch.toLowerCase()) ||
      (m.docenteNombre && m.docenteNombre.toLowerCase().includes(materiaSearch.toLowerCase()));
    const matchesArea = materiaAreaFilter === 'TODAS' || m.areaConocimiento === materiaAreaFilter;
    return matchesSearch && matchesArea;
  });

  const filteredEstudiantes = estudiantes.filter(e =>
    `${e.nombres} ${e.apellidos}`.toLowerCase().includes(estudianteSearch.toLowerCase()) ||
    e.numeroDocumento.includes(estudianteSearch) ||
    (e.codigoEstudiantil && e.codigoEstudiantil.toLowerCase().includes(estudianteSearch.toLowerCase())) ||
    e.grupoNombre.toLowerCase().includes(estudianteSearch.toLowerCase())
  );

  const filteredHorarios = horarios.filter(h =>
    h.grupoNombre.toLowerCase().includes(horarioGrupoFilter.toLowerCase())
  );

  const filteredUsers = usuarios.filter((u) => {
    const matchesSearch =
      u.nombreCompleto?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'TODOS' || u.rol === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="brand-wrapper">
            <div className="brand-icon-box">
              <GraduationCap size={22} />
            </div>
            <div>
              <div className="brand-title" style={{ fontSize: '1.2rem' }}>EduConnect</div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Panel Administrativo</span>
            </div>
          </div>
        </div>

        <ul className="sidebar-menu">
          <li
            className={`sidebar-item ${currentTab === 'stats' ? 'active' : ''}`}
            onClick={() => setCurrentTab('stats')}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </li>
          <li
            className={`sidebar-item ${currentTab === 'usuarios' ? 'active' : ''}`}
            onClick={() => setCurrentTab('usuarios')}
          >
            <ShieldCheck size={20} />
            <span>Usuarios y Roles</span>
          </li>
          <li
            className={`sidebar-item ${currentTab === 'horarios' ? 'active' : ''}`}
            onClick={() => setCurrentTab('horarios')}
          >
            <Calendar size={20} />
            <span>Horarios Escolares</span>
          </li>
          <li
            className={`sidebar-item ${currentTab === 'estudiantes' ? 'active' : ''}`}
            onClick={() => setCurrentTab('estudiantes')}
          >
            <Users size={20} />
            <span>Gestión de Estudiantes</span>
          </li>
          <li
            className={`sidebar-item ${currentTab === 'materias' ? 'active' : ''}`}
            onClick={() => setCurrentTab('materias')}
          >
            <BookOpen size={20} />
            <span>Materias Académicas</span>
          </li>
          <li
            className={`sidebar-item ${currentTab === 'grupos' ? 'active' : ''}`}
            onClick={() => setCurrentTab('grupos')}
          >
            <Layers size={20} />
            <span>Grupos y Cursos</span>
          </li>
          <li
            className={`sidebar-item ${currentTab === 'mipa' ? 'active' : ''}`}
            onClick={() => setCurrentTab('mipa')}
          >
            <Activity size={20} />
            <span>Auditoría & MIPA (IA)</span>
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
            <h1 style={{ fontSize: '1.85rem', marginBottom: '0.2rem' }}>Panel de Control Institucional</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Administrador del Sistema — Gestión Integral de la Plataforma Escolar 2026
            </p>
          </div>

          <div className="user-profile-badge">
            <div className="user-avatar-circle" style={{ background: '#e0e7ff', color: '#4338ca' }}>
              👑
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Administrador General</div>
              <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>CONTROL TOTAL (ADMIN)</div>
            </div>
          </div>
        </div>

        {notification && (
          <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '0.9rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600 }}>
            <CheckCircle size={20} />
            <span>{notification}</span>
          </div>
        )}

        {/* VISTA 1: STATS */}
        {currentTab === 'stats' && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon indigo"><Users size={24} /></div>
                <div>
                  <div className="stat-number">{usuarios.length}</div>
                  <div className="stat-label">Usuarios Registrados en BD</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon green"><ShieldCheck size={24} /></div>
                <div>
                  <div className="stat-number">{usuarios.filter(u => u.rol === 'DOCENTE' || u.rol === 'DIRECTOR_GRUPO').length}</div>
                  <div className="stat-label">Docentes Activos</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon amber"><HeartHandshake size={24} /></div>
                <div>
                  <div className="stat-number">{usuarios.filter(u => u.rol === 'TUTOR').length}</div>
                  <div className="stat-label">Tutores / Acudientes</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon purple"><BookOpen size={24} /></div>
                <div>
                  <div className="stat-number">{materias.length || 8}</div>
                  <div className="stat-label">Asignaturas Activas</div>
                </div>
              </div>
            </div>

            <div className="panel-card">
              <div className="panel-header">
                <h3>🚀 Estado de la Plataforma Institucional</h3>
                <span className="grade-badge superior">Conectado a Base de Datos Supabase</span>
              </div>
              <div style={{ padding: '1.75rem' }}>
                <p style={{ marginBottom: '1.25rem', color: 'var(--text-light-muted)', fontSize: '0.95rem' }}>
                  Base de datos en tiempo real vinculada a Supabase. Todos los datos, usuarios y asignaciones se gestionan directamente:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-dark)' }}>
                    <h4 style={{ color: '#60a5fa', marginBottom: '0.4rem', fontSize: '1rem' }}>👥 Creación de Usuarios</h4>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
                      Crea docentes, directores, coordinadores, estudiantes y tutores con contraseñas seguras y roles oficiales.
                    </p>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-dark)' }}>
                    <h4 style={{ color: '#38bdf8', marginBottom: '0.4rem', fontSize: '1rem' }}>📅 Horarios en Recuadros</h4>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
                      Cuadrícula semanal tipo calendario con bloques lectivos interactivos por grado y jornada.
                    </p>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-dark)' }}>
                    <h4 style={{ color: '#fbbf24', marginBottom: '0.4rem', fontSize: '1rem' }}>🩺 Ficha Médica y Custodia</h4>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
                      Control de menores con RH, EPS, teléfono de acudiente y permisos de retiro en portería.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* VISTA 2: GESTIÓN DE USUARIOS Y ROLES (CON BOTÓN CREAR) */}
        {currentTab === 'usuarios' && (
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h3>👥 Gestión de Usuarios y Roles del Sistema</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {usuarios.length} cuentas registradas en la base de datos
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o correo..."
                    className="form-input"
                    style={{ paddingLeft: '32px', width: '220px', padding: '0.5rem 0.5rem 0.5rem 32px' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <select
                  className="form-input"
                  style={{ width: '160px', padding: '0.5rem' }}
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="TODOS">Todos los roles</option>
                  <option value="ADMIN">Administradores</option>
                  <option value="RECTOR">Rectores</option>
                  <option value="COORDINADOR">Coordinadores</option>
                  <option value="DIRECTOR_GRUPO">Directores de Grupo</option>
                  <option value="DOCENTE">Docentes</option>
                  <option value="ESTUDIANTE">Estudiantes</option>
                  <option value="TUTOR">Tutores</option>
                </select>

                <button
                  className="btn-primary-action"
                  onClick={() => setShowUsuarioModal(true)}
                  style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
                >
                  <UserPlus size={16} />
                  <span>Crear Usuario</span>
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nombre Completo</th>
                    <th>Correo Electrónico</th>
                    <th>Rol Institucional</th>
                    <th>Estado</th>
                    <th style={{ width: '90px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>{u.nombreCompleto}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                      <td>
                        <span
                          className="grade-badge"
                          style={{
                            background: u.rol === 'ADMIN' ? '#e0e7ff' : u.rol === 'RECTOR' ? '#fef3c7' : u.rol === 'COORDINADOR' ? '#e0f2fe' : u.rol === 'DOCENTE' || u.rol === 'DIRECTOR_GRUPO' ? '#dcfce7' : u.rol === 'TUTOR' ? '#fef3c7' : '#f1f5f9',
                            color: u.rol === 'ADMIN' ? '#4338ca' : u.rol === 'RECTOR' ? '#b45309' : u.rol === 'COORDINADOR' ? '#0369a1' : u.rol === 'DOCENTE' || u.rol === 'DIRECTOR_GRUPO' ? '#15803d' : u.rol === 'TUTOR' ? '#b45309' : '#334155'
                          }}
                        >
                          {u.rol}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: u.activo ? '#10b981' : '#ef4444', fontWeight: 700, fontSize: '0.85rem' }}>
                          ● {u.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDeleteUsuario(u.id, u.nombreCompleto)}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}
                          title="Eliminar usuario"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VISTA 3: HORARIOS ESCOLARES (EN RECUADROS / CUADRÍCULA SEMANAL) */}
        {currentTab === 'horarios' && (
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h3>📅 Horario Escolar Semanal (Cuadrícula en Recuadros)</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Organización visual de clases por días y franjas horarias
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

                <div style={{ display: 'flex', gap: '0.35rem', background: 'rgba(255, 255, 255, 0.05)', padding: '3px', borderRadius: '8px' }}>
                  <button
                    onClick={() => setVistaHorario('cuadricula')}
                    style={{
                      background: vistaHorario === 'cuadricula' ? 'var(--primary)' : 'transparent',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '5px 10px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    📅 Recuadros
                  </button>
                  <button
                    onClick={() => setVistaHorario('lista')}
                    style={{
                      background: vistaHorario === 'lista' ? 'var(--primary)' : 'transparent',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '5px 10px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    📋 Tabla
                  </button>
                </div>

                <button
                  className="btn-primary-action"
                  onClick={() => setShowHorarioModal(true)}
                  style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Plus size={16} />
                  <span>Programar Bloque</span>
                </button>
              </div>
            </div>

            <div style={{ padding: '1.25rem' }}>
              {vistaHorario === 'cuadricula' ? (
                /* RECUADROS VISUALES (HORARIO EN CUADRÍCULA) */
                <HorarioSemanalGrid
                  horarios={filteredHorarios}
                  onAgregarBloque={handleAgregarDesdeCuadricula}
                  onEliminarBloque={handleDeleteHorario}
                />
              ) : (
                /* VISTA EN TABLA DE RESPALDO */
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Día</th>
                        <th>Franja Horaria</th>
                        <th>Curso</th>
                        <th>Asignatura</th>
                        <th>Docente Titular</th>
                        <th>Aula Asignada</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHorarios.map((h) => (
                        <tr key={h.id}>
                          <td><span className="grade-badge superior">{h.diaSemana}</span></td>
                          <td style={{ fontWeight: 700, color: '#38bdf8' }}>
                            <Clock size={13} style={{ display: 'inline', marginRight: '4px' }} />
                            {h.horaInicio} - {h.horaFin}
                          </td>
                          <td><strong>{h.grupoNombre}</strong></td>
                          <td style={{ fontWeight: 600 }}>{h.materiaNombre}</td>
                          <td style={{ color: 'var(--text-muted)' }}>{h.docenteNombre}</td>
                          <td><code>{h.aula}</code></td>
                          <td>
                            <button
                              onClick={() => handleDeleteHorario(h.id)}
                              style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}
                              title="Eliminar franja"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VISTA 4: GESTIÓN DE ESTUDIANTES (CRUD COMPLETO) */}
        {currentTab === 'estudiantes' && (
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h3>👨‍🎓 Directorio y Control de Estudiantes</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Crear, actualizar datos médicos, modificar y dar de baja estudiantes de la institución
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, código o grupo..."
                    className="form-input"
                    style={{ paddingLeft: '32px', width: '280px', padding: '0.5rem 0.5rem 0.5rem 32px' }}
                    value={estudianteSearch}
                    onChange={(e) => setEstudianteSearch(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    api.exportarSIMATCSV(estudiantes);
                    notify('📥 Archivo oficial SIMAT generado y descargado en formato CSV para el Ministerio de Educación Nacional.');
                  }}
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid #10b981',
                    color: '#34d399',
                    padding: '0.55rem 1.1rem',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    borderRadius: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                  title="Descargar archivo oficial SIMAT para el Ministerio de Educación Nacional"
                >
                  <Download size={16} />
                  <span>Exportar SIMAT (MEN)</span>
                </button>
                <button
                  className="btn-primary-action"
                  onClick={handleOpenCrearEstudiante}
                  style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Plus size={16} />
                  <span>Nuevo Estudiante</span>
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Estudiante</th>
                    <th>Documento</th>
                    <th>Grado / Curso</th>
                    <th>Ficha Médica (RH/EPS)</th>
                    <th>Acudiente / Tutor</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEstudiantes.map((est) => (
                    <tr key={est.id}>
                      <td><code style={{ color: '#38bdf8', fontWeight: 700 }}>{est.codigoEstudiantil}</code></td>
                      <td style={{ fontWeight: 700 }}>{est.nombres} {est.apellidos}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{est.tipoDocumento} {est.numeroDocumento}</td>
                      <td><span className="grade-badge alto">{est.grupoNombre}</span></td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.8rem' }}>
                          <span><strong>RH:</strong> <span style={{ color: '#fb7185' }}>{est.tipoSangreRh}</span></span>
                          <span style={{ color: '#94a3b8' }}>{est.epsSeguroMedico}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.8rem' }}>
                          <span style={{ fontWeight: 600 }}>{est.tutorNombre}</span>
                          <span style={{ color: '#94a3b8' }}>{est.tutorTelefono}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`grade-badge ${est.estado === 'ACTIVO' ? 'superior' : 'bajo'}`}>
                          {est.estado}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => handleVerBoletin(est.codigoEstudiantil)}
                            style={{ background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818cf8', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}
                            title="Generar e Imprimir Boletín Oficial (Decreto 1290)"
                          >
                            <FileText size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenEditarEstudiante(est)}
                            style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}
                            title="Modificar datos del estudiante"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteEstudiante(est.id, `${est.nombres} ${est.apellidos}`)}
                            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}
                            title="Eliminar estudiante"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VISTA 5: MATERIAS Y ASIGNATURAS (CRUD COMPLETO) */}
        {currentTab === 'materias' && (
          <div className="panel-card">
            <div className="panel-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>📚 Materias y Asignaturas Institucionales</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Gestión del plan de estudios, áreas obligatorias (Ley 115), intensidad horaria y docentes asignados
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Buscar materia o código..."
                    className="form-input"
                    style={{ paddingLeft: '32px', width: '200px', padding: '0.45rem 0.5rem 0.45rem 32px', fontSize: '0.85rem' }}
                    value={materiaSearch}
                    onChange={(e) => setMateriaSearch(e.target.value)}
                  />
                </div>

                <select
                  className="form-input"
                  style={{ width: '160px', padding: '0.45rem 0.6rem', fontSize: '0.85rem' }}
                  value={materiaAreaFilter}
                  onChange={(e) => setMateriaAreaFilter(e.target.value)}
                >
                  <option value="TODAS">Áreas (Todas)</option>
                  <option value="Ciencias Exactas y Matemáticas">Matemáticas</option>
                  <option value="Humanidades y Lengua Castellana">Lenguaje</option>
                  <option value="Ciencias Naturales y Ed. Ambiental">Ciencias Naturales</option>
                  <option value="Ciencias Sociales">Ciencias Sociales</option>
                  <option value="Idiomas Extranjeros">Idiomas / Inglés</option>
                  <option value="Tecnología e Informática">Informática</option>
                  <option value="Educación Artística">Artística</option>
                  <option value="Educación Física y Deportes">Educación Física</option>
                  <option value="Ética y Valores">Ética</option>
                  <option value="Filosofía">Filosofía</option>
                </select>

                <button
                  className="btn-primary-action"
                  onClick={handleOpenCrearMateria}
                  style={{ padding: '0.55rem 1.15rem', display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.88rem' }}
                >
                  <Plus size={16} />
                  <span>Agregar Materia</span>
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre de Asignatura</th>
                    <th>Área de Conocimiento</th>
                    <th>Intensidad Semanal</th>
                    <th>Docente Titular Asignado</th>
                    <th style={{ textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMaterias.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        No se encontraron asignaturas registradas con ese criterio.
                      </td>
                    </tr>
                  ) : (
                    filteredMaterias.map((m) => (
                      <tr key={m.id}>
                        <td><code>{m.codigo}</code></td>
                        <td style={{ fontWeight: 700, color: 'white' }}>{m.nombre}</td>
                        <td><span className="grade-badge alto">{m.areaConocimiento}</span></td>
                        <td style={{ fontWeight: 600 }}>{m.horasSemanales} hrs / semana</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <span style={{ fontSize: '0.85rem' }}>👨‍🏫</span>
                            <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.85rem' }}>
                              {m.docenteNombre || 'Prof. Roberto Silva'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleOpenEditarMateria(m)}
                              style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}
                              title="Editar Asignatura"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteMateria(m.id, m.nombre)}
                              style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}
                              title="Eliminar Asignatura"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VISTA 6: GRUPOS Y AULAS */}
        {currentTab === 'grupos' && (
          <div className="panel-card">
            <div className="panel-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>🏫 Cursos, Aulas y Grupos Académicos</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Gestión autónoma de cursos, salones físicos, cupos y asignación de directores de grupo
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Buscar curso o aula..."
                    className="form-input"
                    style={{ paddingLeft: '32px', width: '190px', padding: '0.45rem 0.5rem 0.45rem 32px', fontSize: '0.85rem' }}
                    value={grupoSearch}
                    onChange={(e) => setGrupoSearch(e.target.value)}
                  />
                </div>

                <select
                  className="form-input"
                  style={{ width: '130px', padding: '0.45rem 0.6rem', fontSize: '0.85rem' }}
                  value={grupoJornadaFilter}
                  onChange={(e) => setGrupoJornadaFilter(e.target.value)}
                >
                  <option value="TODAS">Jornadas (Todas)</option>
                  <option value="MANANA">Mañana</option>
                  <option value="TARDE">Tarde</option>
                  <option value="UNICA">Única</option>
                </select>

                <button
                  className="btn-primary-action"
                  onClick={handleOpenCrearGrupo}
                  style={{ padding: '0.55rem 1.15rem', display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.88rem' }}
                >
                  <Plus size={16} />
                  <span>Crear Curso / Aula</span>
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Curso / Grupo</th>
                    <th>Aula Asignada</th>
                    <th>Nivel / Grado</th>
                    <th>Jornada</th>
                    <th>Cupo Máximo</th>
                    <th>Director de Grupo</th>
                    <th style={{ textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGrupos.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        No se encontraron cursos o aulas registradas con ese criterio.
                      </td>
                    </tr>
                  ) : (
                    filteredGrupos.map((g) => (
                      <tr key={g.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
                              {g.nombre.substring(0, 2)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: 'white' }}>{g.nombre}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Año Lectivo 2026</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: '#f1f5f9' }}>
                            📍 {g.salonAula || 'Por definir'}
                          </span>
                        </td>
                        <td>
                          <span className="grade-badge alto" style={{ fontSize: '0.75rem' }}>
                            {g.grado || 'Secundaria'}
                          </span>
                        </td>
                        <td>
                          <span className={`grade-badge ${g.jornada === 'MANANA' ? 'superior' : g.jornada === 'TARDE' ? 'basico' : 'alto'}`}>
                            {g.jornada === 'MANANA' ? 'Mañana' : g.jornada === 'TARDE' ? 'Tarde' : 'Única'}
                          </span>
                        </td>
                        <td>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1' }}>
                              {g.totalEstudiantes || 30} / {g.cupoMaximo || 35} est.
                            </div>
                            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                              <div style={{ width: `${Math.min(100, ((g.totalEstudiantes || 30) / (g.cupoMaximo || 35)) * 100)}%`, height: '100%', background: '#38bdf8' }} />
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                              👨‍🏫
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>
                              {g.directorDocenteNombre || 'Sin Asignar'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleOpenEditarGrupo(g)}
                              style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}
                              title="Editar Aula / Curso"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteGrupo(g.id, g.nombre)}
                              style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}
                              title="Eliminar Curso"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VISTA 7: AUDITORÍA DE TELEMETRÍA Y AGENTE MIPA (IA) */}
        {currentTab === 'mipa' && <MipaTelemetriaPanel />}
      </main>

      {/* MODAL CREAR USUARIO INSTITUCIONAL */}
      {showUsuarioModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid var(--border-dark)', borderRadius: '20px', width: '100%', maxWidth: '520px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-dark)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', color: 'white' }}>➕ Registrar Nuevo Usuario</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Creación oficial de cuenta de acceso institucional
                </p>
              </div>
              <button onClick={() => setShowUsuarioModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveUsuario}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Nombres *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Ej: Alejandro"
                    value={nuevoUsuario.nombre}
                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Apellidos</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: Restrepo"
                    value={nuevoUsuario.apellido}
                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, apellido: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Correo Electrónico *</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="email"
                    required
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                    placeholder="correo@educonnect.com"
                    value={nuevoUsuario.email}
                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Contraseña Inicial *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="password"
                    required
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                    placeholder="Mínimo 6 caracteres"
                    value={nuevoUsuario.password_hash}
                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, password_hash: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Rol Institucional *</label>
                <select
                  className="form-input"
                  value={nuevoUsuario.rol}
                  onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })}
                >
                  <option value="ADMIN">Administrador General</option>
                  <option value="RECTOR">Rector Institucional</option>
                  <option value="COORDINADOR">Coordinador Académico / Convivencia</option>
                  <option value="DIRECTOR_GRUPO">Director de Grupo</option>
                  <option value="DOCENTE">Docente Titular</option>
                  <option value="ESTUDIANTE">Estudiante</option>
                  <option value="TUTOR">Tutor / Acudiente</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowUsuarioModal(false)}
                  style={{ background: 'transparent', border: '1px solid var(--border-dark)', color: '#cbd5e1', padding: '0.65rem 1.25rem', borderRadius: '10px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                  style={{ padding: '0.65rem 1.5rem' }}
                >
                  Guardar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR ESTUDIANTE */}
      {showEstudianteModal && editingEstudiante && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid var(--border-dark)', borderRadius: '20px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-dark)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', color: 'white' }}>
                  {editingEstudiante.id ? '✏️ Modificar Estudiante' : '➕ Registrar Nuevo Estudiante'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Información académica, datos de acudiente y ficha de primeros auxilios
                </p>
              </div>
              <button onClick={() => setShowEstudianteModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSaveEstudiante}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Nombres *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={editingEstudiante.nombres || ''}
                    onChange={(e) => setEditingEstudiante({ ...editingEstudiante, nombres: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Apellidos *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={editingEstudiante.apellidos || ''}
                    onChange={(e) => setEditingEstudiante({ ...editingEstudiante, apellidos: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Tipo Doc.</label>
                  <select
                    className="form-input"
                    value={editingEstudiante.tipoDocumento || 'TI'}
                    onChange={(e) => setEditingEstudiante({ ...editingEstudiante, tipoDocumento: e.target.value })}
                  >
                    <option value="RC">Registro Civil</option>
                    <option value="TI">Tarjeta Identidad</option>
                    <option value="CC">Cédula Ciudadanía</option>
                    <option value="CE">Cédula Extranjería</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Número Doc. *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={editingEstudiante.numeroDocumento || ''}
                    onChange={(e) => setEditingEstudiante({ ...editingEstudiante, numeroDocumento: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Grado / Curso</label>
                  <select
                    className="form-input"
                    value={editingEstudiante.grupoNombre || (grupos[0] ? `${grupos[0].nombre} - ${grupos[0].grado}` : '6°A - Secundaria')}
                    onChange={(e) => setEditingEstudiante({ ...editingEstudiante, grupoNombre: e.target.value })}
                  >
                    {grupos.map((g) => (
                      <option key={g.id} value={`${g.nombre} - ${g.grado}`}>
                        {g.nombre} ({g.grado}) — {g.salonAula || 'Aula General'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-dark)', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#fb7185', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HeartPulse size={16} /> Ficha Médica y Primeros Auxilios
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Tipo Sangre (RH)</label>
                    <select
                      className="form-input"
                      value={editingEstudiante.tipoSangreRh || 'O+'}
                      onChange={(e) => setEditingEstudiante({ ...editingEstudiante, tipoSangreRh: e.target.value })}
                    >
                      <option value="O+">O Positivo (O+)</option>
                      <option value="O-">O Negativo (O-)</option>
                      <option value="A+">A Positivo (A+)</option>
                      <option value="A-">A Negativo (A-)</option>
                      <option value="B+">B Positivo (B+)</option>
                      <option value="AB+">AB Positivo (AB+)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>EPS / Seguro Médico</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editingEstudiante.epsSeguroMedico || ''}
                      onChange={(e) => setEditingEstudiante({ ...editingEstudiante, epsSeguroMedico: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Alergias o Medicamentos</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingEstudiante.alergiasCondicionesMedicas || ''}
                    onChange={(e) => setEditingEstudiante({ ...editingEstudiante, alergiasCondicionesMedicas: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-dark)', marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#f59e0b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserCheck size={16} /> Acudiente / Tutor Vinculado
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Nombre Completo Acudiente</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editingEstudiante.tutorNombre || ''}
                      onChange={(e) => setEditingEstudiante({ ...editingEstudiante, tutorNombre: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Teléfono Celular</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editingEstudiante.tutorTelefono || ''}
                      onChange={(e) => setEditingEstudiante({ ...editingEstudiante, tutorTelefono: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowEstudianteModal(false)}
                  style={{ background: 'transparent', border: '1px solid var(--border-dark)', color: '#cbd5e1', padding: '0.65rem 1.25rem', borderRadius: '10px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                  style={{ padding: '0.65rem 1.5rem' }}
                >
                  Guardar Estudiante
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR HORARIO */}
      {showHorarioModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid var(--border-dark)', borderRadius: '20px', width: '100%', maxWidth: '550px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-dark)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'white' }}>📅 Asignar Bloque al Horario</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Programar franja semanal de clase</p>
              </div>
              <button onClick={() => setShowHorarioModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveHorario}>
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
                  placeholder="Ej: Matemáticas y Álgebra"
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
                    placeholder="Ej: Prof. Roberto Silva"
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
                    placeholder="Ej: Aula 201"
                    value={nuevoHorario.aula}
                    onChange={(e) => setNuevoHorario({ ...nuevoHorario, aula: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowHorarioModal(false)}
                  style={{ background: 'transparent', border: '1px solid var(--border-dark)', color: '#cbd5e1', padding: '0.65rem 1.25rem', borderRadius: '10px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                  style={{ padding: '0.65rem 1.5rem' }}
                >
                  Programar Clase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR CURSO Y AULA */}
      {showGrupoModal && editingGrupo && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid var(--border-dark)', borderRadius: '20px', width: '100%', maxWidth: '580px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-dark)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', color: 'white' }}>
                  {editingGrupo.id ? '✏️ Modificar Curso y Aula' : '➕ Crear Nuevo Curso y Asignar Aula'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Configuración de salón físico, jornada, cupo y dirección de grupo
                </p>
              </div>
              <button onClick={() => setShowGrupoModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveGrupo}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Nombre del Curso *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Ej: 6°B, 10°2, Transición A"
                    value={editingGrupo.nombre || ''}
                    onChange={(e) => setEditingGrupo({ ...editingGrupo, nombre: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Aula Física / Salón *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Ej: Aula 204 - Bloque A"
                    value={editingGrupo.salonAula || ''}
                    onChange={(e) => setEditingGrupo({ ...editingGrupo, salonAula: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Nivel / Grado</label>
                  <select
                    className="form-input"
                    value={editingGrupo.grado || 'Grado 6° - Secundaria'}
                    onChange={(e) => setEditingGrupo({ ...editingGrupo, grado: e.target.value })}
                  >
                    <option value="Transición (Preescolar)">Transición (Preescolar)</option>
                    <option value="Grado 1° - Primaria">Grado 1° - Primaria</option>
                    <option value="Grado 2° - Primaria">Grado 2° - Primaria</option>
                    <option value="Grado 3° - Primaria">Grado 3° - Primaria</option>
                    <option value="Grado 4° - Primaria">Grado 4° - Primaria</option>
                    <option value="Grado 5° - Primaria">Grado 5° - Primaria</option>
                    <option value="Grado 6° - Secundaria">Grado 6° - Secundaria</option>
                    <option value="Grado 7° - Secundaria">Grado 7° - Secundaria</option>
                    <option value="Grado 8° - Secundaria">Grado 8° - Secundaria</option>
                    <option value="Grado 9° - Secundaria">Grado 9° - Secundaria</option>
                    <option value="Grado 10° - Media Técnica">Grado 10° - Media Técnica</option>
                    <option value="Grado 11° - Media / Bachillerato">Grado 11° - Media / Bachillerato</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Jornada *</label>
                  <select
                    className="form-input"
                    value={editingGrupo.jornada || 'MANANA'}
                    onChange={(e) => setEditingGrupo({ ...editingGrupo, jornada: e.target.value })}
                  >
                    <option value="MANANA">Jornada Mañana (07:00 a 13:30)</option>
                    <option value="TARDE">Jornada Tarde (12:30 a 18:30)</option>
                    <option value="UNICA">Jornada Única Completa</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Cupo Máximo</label>
                  <input
                    type="number"
                    min="10"
                    max="50"
                    required
                    className="form-input"
                    value={editingGrupo.cupoMaximo || 35}
                    onChange={(e) => setEditingGrupo({ ...editingGrupo, cupoMaximo: parseInt(e.target.value) || 35 })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Docente Director de Grupo</label>
                  <select
                    className="form-input"
                    value={editingGrupo.directorDocenteNombre || 'Prof. Roberto Silva'}
                    onChange={(e) => setEditingGrupo({ ...editingGrupo, directorDocenteNombre: e.target.value })}
                  >
                    <option value="Prof. Roberto Silva">Prof. Roberto Silva (Matemáticas)</option>
                    <option value="Lic. Elena Gómez">Lic. Elena Gómez (Español)</option>
                    <option value="Lic. Claudia Morales">Lic. Claudia Morales (Ciencias)</option>
                    <option value="Prof. Andrés Peña">Prof. Andrés Peña (Sociales)</option>
                    <option value="Lic. Sandra Vargas">Lic. Sandra Vargas (Inglés)</option>
                    <option value="Ing. Carlos Castro">Ing. Carlos Castro (Informática)</option>
                    <option value="Lic. Fernando Restrepo">Lic. Fernando Restrepo (Filosofía)</option>
                    <option value="Lic. Gloria Estupiñán">Lic. Gloria Estupiñán (Artes)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowGrupoModal(false)}
                  style={{ background: 'transparent', border: '1px solid var(--border-dark)', color: '#cbd5e1', padding: '0.65rem 1.25rem', borderRadius: '10px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                  style={{ padding: '0.65rem 1.5rem' }}
                >
                  Guardar Curso / Aula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR ASIGNATURA */}
      {showMateriaModal && editingMateria && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid var(--border-dark)', borderRadius: '20px', width: '100%', maxWidth: '580px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-dark)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', color: 'white' }}>
                  {editingMateria.id ? '✏️ Modificar Asignatura Académica' : '➕ Registrar Nueva Asignatura'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Estructuración curricular según áreas fundamentales de la Ley 115
                </p>
              </div>
              <button onClick={() => setShowMateriaModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveMateria}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Código *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Ej: MAT-601"
                    value={editingMateria.codigo || ''}
                    onChange={(e) => setEditingMateria({ ...editingMateria, codigo: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Nombre de la Asignatura *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Ej: Matemáticas y Álgebra"
                    value={editingMateria.nombre || ''}
                    onChange={(e) => setEditingMateria({ ...editingMateria, nombre: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Área de Conocimiento (Ley 115) *</label>
                <select
                  className="form-input"
                  value={editingMateria.areaConocimiento || 'Ciencias Exactas y Matemáticas'}
                  onChange={(e) => setEditingMateria({ ...editingMateria, areaConocimiento: e.target.value })}
                >
                  <option value="Ciencias Exactas y Matemáticas">Ciencias Exactas y Matemáticas</option>
                  <option value="Humanidades y Lengua Castellana">Humanidades y Lengua Castellana</option>
                  <option value="Ciencias Naturales y Ed. Ambiental">Ciencias Naturales y Ed. Ambiental</option>
                  <option value="Ciencias Sociales">Ciencias Sociales e Historia</option>
                  <option value="Idiomas Extranjeros">Idiomas Extranjeros / Bilingüismo</option>
                  <option value="Tecnología e Informática">Tecnología e Informática</option>
                  <option value="Educación Artística">Educación Artística y Cultural</option>
                  <option value="Educación Física y Deportes">Educación Física, Recreación y Deportes</option>
                  <option value="Ética y Valores">Ética, Valores y Cátedra de Paz</option>
                  <option value="Filosofía">Filosofía y Pensamiento Crítico</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Horas / Semana *</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    className="form-input"
                    value={editingMateria.horasSemanales || 4}
                    onChange={(e) => setEditingMateria({ ...editingMateria, horasSemanales: parseInt(e.target.value) || 4 })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Docente Titular Asignado</label>
                  <select
                    className="form-input"
                    value={editingMateria.docenteNombre || 'Prof. Roberto Silva'}
                    onChange={(e) => setEditingMateria({ ...editingMateria, docenteNombre: e.target.value })}
                  >
                    <option value="Prof. Roberto Silva">Prof. Roberto Silva (Matemáticas)</option>
                    <option value="Lic. Elena Gómez">Lic. Elena Gómez (Español)</option>
                    <option value="Lic. Claudia Morales">Lic. Claudia Morales (Ciencias)</option>
                    <option value="Prof. Andrés Peña">Prof. Andrés Peña (Sociales)</option>
                    <option value="Lic. Sandra Vargas">Lic. Sandra Vargas (Inglés)</option>
                    <option value="Ing. Carlos Castro">Ing. Carlos Castro (Informática)</option>
                    <option value="Lic. Fernando Restrepo">Lic. Fernando Restrepo (Filosofía)</option>
                    <option value="Lic. Marcos Rivas">Lic. Marcos Rivas (Ed. Física)</option>
                    <option value="Lic. Gloria Estupiñán">Lic. Gloria Estupiñán (Artes)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowMateriaModal(false)}
                  style={{ background: 'transparent', border: '1px solid var(--border-dark)', color: '#cbd5e1', padding: '0.65rem 1.25rem', borderRadius: '10px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                  style={{ padding: '0.65rem 1.5rem' }}
                >
                  Guardar Asignatura
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
