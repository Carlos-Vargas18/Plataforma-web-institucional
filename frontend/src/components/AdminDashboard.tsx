import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, UsuarioCreatePayload } from '../services/api';
import {
  CargaAcademicaDto,
  ComunicadoDto,
  DashboardStats,
  GrupoDto,
  HorarioBloqueDto,
  MateriaDto,
  UsuarioDto,
} from '../types';
import HorarioSemanalGrid from './HorarioSemanalGrid';
import BoletinOficialModal from './BoletinOficialModal';
import MipaTelemetriaPanel from './MipaTelemetriaPanel';
import {
  DashboardShell,
  EmptyOrLoadingState,
  KpiCard,
  PaginationBar,
  SearchFilterBar,
  SidebarNavGroup,
  StatusBanner,
} from './ui/DashboardShared';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Layers,
  HeartHandshake,
  Plus,
  ShieldCheck,
  Calendar,
  Trash2,
  Edit,
  X,
  UserPlus,
  Lock,
  Mail,
  FileText,
  Activity,
  Megaphone,
  Briefcase,
  Building2,
  Zap,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentTab, setCurrentTab] = useState<
    'stats' | 'usuarios' | 'horarios' | 'materias' | 'grupos' | 'cargas' | 'comunicados' | 'mipa'
  >('stats');

  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioDto[]>([]);
  const [materias, setMaterias] = useState<MateriaDto[]>([]);
  const [grupos, setGrupos] = useState<GrupoDto[]>([]);
  const [cargas, setCargas] = useState<CargaAcademicaDto[]>([]);
  const [horarios, setHorarios] = useState<HorarioBloqueDto[]>([]);
  const [comunicados, setComunicados] = useState<ComunicadoDto[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('TODOS');
  const [userPage, setUserPage] = useState(1);
  const [horarioGrupoFilter, setHorarioGrupoFilter] = useState('10-A');

  // Modal Usuario (Crear / Editar)
  const [showUsuarioModal, setShowUsuarioModal] = useState(false);
  const [editingUsuarioId, setEditingUsuarioId] = useState<number | null>(null);
  const [formUsuario, setFormUsuario] = useState<UsuarioCreatePayload>({
    tipoDocumento: 'CC',
    documento: '',
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'DOCENTE',
    telefono: '',
    grupoCodigo: '10-A',
  });

  // Modal Grupo
  const [showGrupoModal, setShowGrupoModal] = useState(false);
  const [editingGrupoId, setEditingGrupoId] = useState<number | null>(null);
  const [formGrupo, setFormGrupo] = useState({
    nombre: '',
    grado: 'Décimo',
    salon: 'Aula 201',
    jornada: 'MANANA',
    cupoMaximo: 35,
  });

  // Modal Materia
  const [showMateriaModal, setShowMateriaModal] = useState(false);
  const [editingMateriaId, setEditingMateriaId] = useState<number | null>(null);
  const [formMateria, setFormMateria] = useState({
    codigo: '',
    nombre: '',
    area: 'Matemáticas y Ciencias Exactas',
    intensidadHoraria: 4,
    descripcion: '',
  });

  // Modal Carga Académica
  const [showCargaModal, setShowCargaModal] = useState(false);
  const [formCarga, setFormCarga] = useState({
    grupoId: 0,
    materiaId: 0,
    docenteUsuarioId: 0,
    intensidadHoraria: 4,
  });

  // Modal Comunicado
  const [showComModal, setShowComModal] = useState(false);
  const [formCom, setFormCom] = useState({
    titulo: '',
    contenido: '',
    destinatarioRol: 'TODOS',
    prioridad: 'ALTA',
  });

  // Boletín Oficial Modal
  const [boletinStudent, setBoletinStudent] = useState<UsuarioDto | null>(null);

  const cargarTodo = useCallback(async () => {
    setLoading(true);
    try {
      const [st, usrs, mats, grps, crgs, hors, coms] = await Promise.all([
        api.getAdminStats(),
        api.getUsuarios(),
        api.getMateriasAdmin(),
        api.getGruposAdmin(),
        api.getCargasAcademicas(),
        api.getHorarios(),
        api.getComunicados(),
      ]);
      setStats(st);
      setUsuarios(usrs);
      setMaterias(mats);
      setGrupos(grps);
      setCargas(crgs);
      setHorarios(hors);
      setComunicados(coms);

      if (grps.length > 0) {
        setHorarioGrupoFilter(grps[0].codigoGrupo || grps[0].nombre);
        setFormCarga((prev) => ({
          ...prev,
          grupoId: grps[0].id,
          materiaId: mats[0]?.id || 0,
          docenteUsuarioId: usrs.find((u) => u.rol === 'DOCENTE' || u.rol === 'DIRECTOR_GRUPO')?.id || 0,
        }));
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error al sincronizar el panel administrativo con el backend.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarTodo();
  }, [cargarTodo]);

  // CRUD Usuarios
  const handleOpenCrearUsuario = () => {
    setEditingUsuarioId(null);
    setFormUsuario({
      tipoDocumento: 'CC',
      documento: '',
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      rol: 'DOCENTE',
      telefono: '',
      grupoCodigo: grupos[0]?.codigoGrupo || '10-A',
    });
    setShowUsuarioModal(true);
  };

  const handleOpenEditarUsuario = (u: UsuarioDto) => {
    setEditingUsuarioId(u.id);
    setFormUsuario({
      tipoDocumento: u.tipoDocumento || 'CC',
      documento: u.documento || '',
      nombre: u.primerNombre || u.nombre || '',
      apellido: u.primerApellido || u.apellido || '',
      email: u.email,
      password: '',
      rol: u.rol,
      telefono: u.telefono || '',
      grupoCodigo: u.grupo || grupos[0]?.codigoGrupo || '10-A',
    });
    setShowUsuarioModal(true);
  };

  const handleSaveUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUsuarioId) {
        const updated = await api.actualizarUsuarioAdmin(editingUsuarioId, formUsuario);
        setUsuarios((prev) => prev.map((u) => (u.id === editingUsuarioId ? updated : u)));
        setStatusMessage({ type: 'success', text: `Usuario ${updated.nombreCompleto} actualizado en PostgreSQL.` });
      } else {
        const created = await api.crearUsuarioAdmin(formUsuario);
        setUsuarios((prev) => [created, ...prev]);
        setStatusMessage({
          type: 'success',
          text: `Usuario ${created.nombreCompleto} (${created.rol}) creado con hash BCrypt seguro.`,
        });
      }
      setShowUsuarioModal(false);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error al guardar usuario.',
      });
    }
  };

  const handleToggleEstadoUsuario = async (u: UsuarioDto) => {
    try {
      await api.eliminarUsuarioAdmin(u.id);
      const refreshed = await api.getUsuarios();
      setUsuarios(refreshed);
      setStatusMessage({
        type: 'info',
        text: `Estado de la cuenta ${u.email} actualizado.`,
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error al cambiar estado del usuario.',
      });
    }
  };

  // CRUD Grupos
  const handleSaveGrupo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGrupoId) {
        const updated = await api.actualizarGrupo(editingGrupoId, formGrupo);
        setGrupos((prev) => prev.map((g) => (g.id === editingGrupoId ? updated : g)));
        setStatusMessage({ type: 'success', text: `Grupo ${updated.codigoGrupo} actualizado.` });
      } else {
        const created = await api.crearGrupo(formGrupo);
        setGrupos((prev) => [...prev, created]);
        setStatusMessage({ type: 'success', text: `Grupo ${created.codigoGrupo} registrado exitosamente.` });
      }
      setShowGrupoModal(false);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error al guardar el grupo.',
      });
    }
  };

  const handleDeleteGrupo = async (id: number) => {
    try {
      await api.eliminarGrupo(id);
      setGrupos((prev) => prev.filter((g) => g.id !== id));
      setStatusMessage({ type: 'info', text: 'Grupo eliminado del sistema.' });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'No es posible eliminar un grupo con matrículas o cargas activas.',
      });
    }
  };

  // CRUD Materias
  const handleSaveMateria = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMateriaId) {
        const updated = await api.actualizarMateria(editingMateriaId, formMateria);
        setMaterias((prev) => prev.map((m) => (m.id === editingMateriaId ? updated : m)));
        setStatusMessage({ type: 'success', text: `Asignatura ${updated.nombre} actualizada.` });
      } else {
        const created = await api.crearMateria(formMateria);
        setMaterias((prev) => [...prev, created]);
        setStatusMessage({ type: 'success', text: `Asignatura ${created.nombre} registrada en el plan de estudios.` });
      }
      setShowMateriaModal(false);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error al guardar asignatura.',
      });
    }
  };

  // CRUD Cargas Académicas
  const handleSaveCarga = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.crearCargaAcademica(formCarga);
      setCargas((prev) => [...prev, created]);
      setShowCargaModal(false);
      setStatusMessage({
        type: 'success',
        text: `Carga académica asignada: ${created.materia} (${created.grupo}) -> ${created.docente}.`,
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error al asignar carga académica.',
      });
    }
  };

  const handleDeleteCarga = async (id: number) => {
    try {
      await api.eliminarCargaAcademica(id);
      setCargas((prev) => prev.filter((c) => c.id !== id));
      setStatusMessage({ type: 'info', text: 'Asignación académica eliminada.' });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error al eliminar carga académica.',
      });
    }
  };

  // Horarios
  const handleAddBloqueHorario = async (nuevo: {
    grupo: string;
    dia: string;
    hora: string;
    materia: string;
    docente: string;
    aula: string;
  }) => {
    try {
      const [horaInicio, horaFin] = nuevo.hora.split('-').map((s) => s.trim());
      const created = await api.crearBloqueHorario({
        grupo: nuevo.grupo,
        dia: nuevo.dia,
        horaInicio: horaInicio || '07:00',
        horaFin: horaFin || '08:00',
        materia: nuevo.materia,
        docente: nuevo.docente,
        aula: nuevo.aula,
      });
      setHorarios((prev) => [...prev, created]);
      setStatusMessage({ type: 'success', text: 'Bloque de horario programado sin colisiones.' });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Colisión de horario detectada por el servidor.',
      });
    }
  };

  const handleDeleteHorario = async (id: number) => {
    try {
      await api.eliminarBloqueHorario(id);
      setHorarios((prev) => prev.filter((h) => h.id !== id));
      setStatusMessage({ type: 'info', text: 'Bloque de horario eliminado.' });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error al eliminar bloque de horario.',
      });
    }
  };

  // Comunicados
  const handleSaveComunicado = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.crearComunicado(formCom);
      setComunicados((prev) => [created, ...prev]);
      setShowComModal(false);
      setFormCom({ titulo: '', contenido: '', destinatarioRol: 'TODOS', prioridad: 'ALTA' });
      setStatusMessage({ type: 'success', text: 'Comunicado institucional publicado.' });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error al publicar comunicado.',
      });
    }
  };

  const handleDeleteComunicado = async (id: number) => {
    try {
      await api.eliminarComunicado(id);
      setComunicados((prev) => prev.filter((c) => c.id !== id));
      setStatusMessage({ type: 'info', text: 'Comunicado desactivado.' });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error al eliminar comunicado.',
      });
    }
  };

  const filteredUsers = usuarios.filter((u) => {
    const matchesSearch =
      u.nombreCompleto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.documento && u.documento.includes(searchQuery));
    const matchesRole = roleFilter === 'TODOS' || u.rol === roleFilter;
    return matchesSearch && matchesRole;
  });

  const USERS_PER_PAGE = 10;
  const totalUserPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const safeUserPage = Math.min(userPage, totalUserPages);
  const paginatedUsers = filteredUsers.slice(
    (safeUserPage - 1) * USERS_PER_PAGE,
    safeUserPage * USERS_PER_PAGE
  );

  const docentesDisponibles = usuarios.filter((u) => u.rol === 'DOCENTE' || u.rol === 'DIRECTOR_GRUPO');

  const navGroups: SidebarNavGroup[] = [
    {
      category: 'GENERAL',
      items: [{ id: 'stats', label: 'Dashboard General', icon: <LayoutDashboard size={18} /> }],
    },
    {
      category: 'GESTIÓN ACADÉMICA',
      items: [
        { id: 'usuarios', label: 'Usuarios y Roles', icon: <ShieldCheck size={18} />, badge: usuarios.length },
        { id: 'grupos', label: 'Grupos y Cursos', icon: <Layers size={18} />, badge: grupos.length },
        { id: 'materias', label: 'Plan de Estudios', icon: <BookOpen size={18} />, badge: materias.length },
        { id: 'cargas', label: 'Asignación Docente', icon: <Briefcase size={18} /> },
        { id: 'horarios', label: 'Horarios Escolares', icon: <Calendar size={18} /> },
      ],
    },
    {
      category: 'COMUNICACIÓN & SISTEMA',
      items: [
        { id: 'comunicados', label: 'Comunicados', icon: <Megaphone size={18} />, badge: comunicados.length },
        {
          id: 'mipa',
          label: 'Telemetría & MIPA',
          icon: <Activity size={18} />,
          badge: stats?.alertasRiesgo || undefined,
          badgeTone: (stats?.alertasRiesgo || 0) > 0 ? 'danger' : 'default',
        },
      ],
    },
  ];

  return (
    <DashboardShell
      portalTitle="Administración General"
      portalSubtitle="Consola de Adm."
      navGroups={navGroups}
      activeTab={currentTab}
      onSelectTab={(id) => setCurrentTab(id as typeof currentTab)}
      userName={user?.nombreCompleto || 'Administrador'}
      userRoleLabel={user?.rol || 'ADMIN'}
      onLogout={logout}
      headerActions={
        <button
          type="button"
          className="btn-primary-action"
          onClick={handleOpenCrearUsuario}
          style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
        >
          <Plus size={15} />
          <span>Nuevo Usuario</span>
        </button>
      }
    >
      <div className="dashboard-topbar">
        <div>
          <h1 className="dashboard-page-title">Panel de Control del Administrador</h1>
          <p className="dashboard-page-subtitle">
            Bienvenido, <strong>{user?.nombreCompleto}</strong>. Gestión integral de usuarios, estructura académica y telemetría institucional.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button type="button" className="btn-secondary-action" onClick={() => setCurrentTab('horarios')}>
            <Calendar size={15} /> Horarios
          </button>
          <button type="button" className="btn-primary-action" onClick={() => setCurrentTab('mipa')}>
            <Activity size={15} /> Ver MIPA & Telemetría
          </button>
        </div>
      </div>

      {statusMessage && (
        <StatusBanner
          type={statusMessage.type}
          message={statusMessage.text}
          onClose={() => setStatusMessage(null)}
        />
      )}

      {loading ? (
        <EmptyOrLoadingState loading={true} message="Cargando infraestructura institucional desde Spring Boot..." />
      ) : (
        <>
          {/* VISTA 1: STATS */}
          {currentTab === 'stats' && (
            <>
              <div className="stats-grid">
                <KpiCard
                  icon={<Users size={21} />}
                  tone="blue"
                  badge="RBAC Activo"
                  badgeTone="primary"
                  value={stats?.totalUsuarios ?? usuarios.length}
                  label="Usuarios en Base de Datos"
                  footer={`${docentesDisponibles.length} docentes · ${stats?.totalTutores ?? 0} tutores`}
                  onClick={() => setCurrentTab('usuarios')}
                />
                <KpiCard
                  icon={<ShieldCheck size={21} />}
                  tone="emerald"
                  badge="Planta"
                  badgeTone="success"
                  value={stats?.totalDocentes ?? docentesDisponibles.length}
                  label="Docentes Activos"
                  footer={`${cargas.length} asignaciones académicas`}
                  onClick={() => setCurrentTab('cargas')}
                />
                <KpiCard
                  icon={<HeartHandshake size={21} />}
                  tone="amber"
                  badge={`${grupos.length} grupos`}
                  value={stats?.totalEstudiantes ?? 0}
                  label="Estudiantes Matriculados"
                  footer="Matrícula vigente registrada"
                  onClick={() => setCurrentTab('grupos')}
                />
                <KpiCard
                  icon={<BookOpen size={21} />}
                  tone="purple"
                  badge="Ley 115"
                  value={stats?.totalMaterias ?? materias.length}
                  label="Asignaturas Oficiales"
                  footer="Plan de estudios vigente"
                  onClick={() => setCurrentTab('materias')}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div className="panel-card" style={{ marginBottom: 0 }}>
                  <div className="panel-header">
                    <h3>Rendimiento Académico y Asistencia Global</h3>
                    <span className="grade-badge superior">SIEE Activo</span>
                  </div>
                  <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.86rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--ec-text-secondary)' }}>Promedio Institucional SIEE</span>
                        <strong style={{ color: 'var(--ec-primary-dark)' }}>
                          {(stats?.promedioInstitucional ?? 0).toFixed(2)} / 5.0
                        </strong>
                      </div>
                      <div style={{ height: '9px', background: 'var(--ec-surface-low)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${Math.min(100, ((stats?.promedioInstitucional ?? 0) / 5) * 100)}%`,
                            height: '100%',
                            background: 'var(--ec-primary-gradient)',
                            borderRadius: '999px',
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.86rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--ec-text-secondary)' }}>Tasa de Asistencia Global</span>
                        <strong style={{ color: 'var(--ec-success)' }}>
                          {(stats?.porcentajeAsistencia ?? 100).toFixed(1)}%
                        </strong>
                      </div>
                      <div style={{ height: '9px', background: 'var(--ec-surface-low)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${Math.min(100, stats?.porcentajeAsistencia ?? 100)}%`,
                            height: '100%',
                            background: '#10b981',
                            borderRadius: '999px',
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', paddingTop: '0.5rem' }}>
                      <div style={{ background: 'var(--ec-surface-low)', borderRadius: '12px', padding: '0.85rem' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--ec-text-muted)', fontWeight: 600 }}>Alertas MIPA</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--ec-danger)', marginTop: '0.2rem' }}>
                          {stats?.alertasRiesgo ?? 0} casos
                        </div>
                      </div>
                      <div style={{ background: 'var(--ec-surface-low)', borderRadius: '12px', padding: '0.85rem' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--ec-text-muted)', fontWeight: 600 }}>Solicitudes Pendientes</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--ec-warning)', marginTop: '0.2rem' }}>
                          {stats?.solicitudesPendientes ?? 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="panel-card" style={{ marginBottom: 0 }}>
                  <div className="panel-header">
                    <h3>
                      <Zap size={17} style={{ color: 'var(--ec-primary)' }} />
                      Accesos Rápidos de Administración
                    </h3>
                  </div>
                  <div className="panel-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
                    <button type="button" className="btn-secondary-action" style={{ justifyContent: 'flex-start', padding: '0.9rem' }} onClick={handleOpenCrearUsuario}>
                      <UserPlus size={17} style={{ color: 'var(--ec-primary)' }} />
                      <span>Registrar Usuario</span>
                    </button>
                    <button type="button" className="btn-secondary-action" style={{ justifyContent: 'flex-start', padding: '0.9rem' }} onClick={() => setCurrentTab('grupos')}>
                      <Building2 size={17} style={{ color: 'var(--ec-success)' }} />
                      <span>Gestionar Grupos</span>
                    </button>
                    <button type="button" className="btn-secondary-action" style={{ justifyContent: 'flex-start', padding: '0.9rem' }} onClick={() => setCurrentTab('cargas')}>
                      <Briefcase size={17} style={{ color: '#7c3aed' }} />
                      <span>Cargas Docentes</span>
                    </button>
                    <button type="button" className="btn-secondary-action" style={{ justifyContent: 'flex-start', padding: '0.9rem' }} onClick={() => setCurrentTab('comunicados')}>
                      <Megaphone size={17} style={{ color: 'var(--ec-warning)' }} />
                      <span>Publicar Circular</span>
                    </button>
                  </div>
                </div>
              </div>

              {grupos.length > 0 && (
                <div className="panel-card">
                  <div className="panel-header">
                    <h3>Distribución de Grupos y Capacidad Instalada</h3>
                    <span className="grade-badge alto">{grupos.length} cursos configurados</span>
                  </div>
                  <div className="panel-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
                    {grupos.slice(0, 6).map((g) => {
                      const pct = g.cupoMaximo > 0 ? Math.min(100, Math.round((g.totalEstudiantes / g.cupoMaximo) * 100)) : 0;
                      return (
                        <div key={g.id} style={{ background: 'var(--ec-surface-low)', border: '1px solid var(--ec-border)', borderRadius: '14px', padding: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                            <strong style={{ color: 'var(--ec-text)' }}>Grupo {g.codigoGrupo || g.nombre}</strong>
                            <span className="grade-badge alto">{pct}% aforo</span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--ec-text-muted)', marginBottom: '0.5rem' }}>
                            {g.grado} · {g.salon || g.salonAula} · {g.jornada}
                          </div>
                          <div style={{ height: '7px', background: '#dbeafe', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.45rem' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: 'var(--ec-primary)', borderRadius: '999px' }} />
                          </div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--ec-text-secondary)', fontWeight: 600 }}>
                            {g.totalEstudiantes} / {g.cupoMaximo} estudiantes
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* VISTA 2: USUARIOS Y ROLES */}
          {currentTab === 'usuarios' && (
            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <h3>Gestión de Usuarios, Estudiantes, Docentes y Roles</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--ec-text-muted)', marginTop: '0.2rem' }}>
                    {usuarios.length} cuentas registradas con autenticación BCrypt y control RBAC
                  </p>
                </div>

                <button type="button" className="btn-primary-action" onClick={handleOpenCrearUsuario}>
                  <UserPlus size={16} />
                  <span>Nuevo Usuario</span>
                </button>
              </div>

              <div className="panel-body" style={{ paddingBottom: '0.5rem' }}>
                <SearchFilterBar
                  search={searchQuery}
                  onSearchChange={(val) => {
                    setSearchQuery(val);
                    setUserPage(1);
                  }}
                  placeholder="Buscar por nombre, documento o correo..."
                >
                  <select
                    className="form-input"
                    style={{ width: 'auto', minWidth: '190px' }}
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(e.target.value);
                      setUserPage(1);
                    }}
                  >
                    <option value="TODOS">Todos los roles ({usuarios.length})</option>
                    <option value="ADMIN">Administradores</option>
                    <option value="RECTOR">Rectores</option>
                    <option value="COORDINADOR">Coordinadores</option>
                    <option value="DIRECTOR_GRUPO">Directores de Grupo</option>
                    <option value="DOCENTE">Docentes</option>
                    <option value="ESTUDIANTE">Estudiantes</option>
                    <option value="TUTOR">Tutores</option>
                  </select>
                </SearchFilterBar>
              </div>

              <div className="ec-table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Documento</th>
                      <th>Nombre Completo</th>
                      <th>Correo Institucional</th>
                      <th>Rol</th>
                      <th>Grupo / Especialidad</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--ec-text-muted)' }}>
                          No se encontraron usuarios con los criterios seleccionados.
                        </td>
                      </tr>
                    ) : (
                      paginatedUsers.map((u) => (
                        <tr key={u.id}>
                          <td>
                            <code style={{ background: 'var(--ec-surface-low)', padding: '0.2rem 0.45rem', borderRadius: '6px', fontSize: '0.78rem' }}>
                              {u.tipoDocumento} {u.documento}
                            </code>
                          </td>
                          <td style={{ fontWeight: 700, color: 'var(--ec-text)' }}>{u.nombreCompleto}</td>
                          <td style={{ color: 'var(--ec-text-muted)' }}>{u.email}</td>
                          <td><span className="grade-badge alto">{u.rol}</span></td>
                          <td>{u.grupo || u.especialidad || 'Institucional'}</td>
                          <td>
                            <span className={`grade-badge ${u.estado ? 'superior' : 'bajo'}`}>
                              {u.estado ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              {u.rol === 'ESTUDIANTE' && (
                                <button
                                  type="button"
                                  className="btn-secondary-action"
                                  onClick={() => setBoletinStudent(u)}
                                  style={{ padding: '0.35rem 0.55rem' }}
                                  title="Ver Boletín Oficial"
                                >
                                  <FileText size={14} />
                                </button>
                              )}
                              <button
                                type="button"
                                className="btn-secondary-action"
                                onClick={() => handleOpenEditarUsuario(u)}
                                style={{ padding: '0.35rem 0.55rem', color: 'var(--ec-primary)' }}
                                title="Editar usuario"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                type="button"
                                className="btn-danger-action"
                                onClick={() => void handleToggleEstadoUsuario(u)}
                                style={{ padding: '0.35rem 0.55rem' }}
                                title="Desactivar / Activar usuario"
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

              <PaginationBar
                page={safeUserPage}
                totalPages={totalUserPages}
                totalItems={filteredUsers.length}
                onPageChange={setUserPage}
              />
            </div>
          )}

          {/* VISTA 3: GRUPOS Y CURSOS */}
          {currentTab === 'grupos' && (
            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <h3>Cursos, Aulas y Grupos Académicos</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--ec-text-muted)', marginTop: '0.2rem' }}>
                    Configuración de salones físicos, jornada y cupos por grado
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-primary-action"
                  onClick={() => {
                    setEditingGrupoId(null);
                    setFormGrupo({ nombre: '', grado: 'Décimo', salon: 'Aula 204', jornada: 'MANANA', cupoMaximo: 35 });
                    setShowGrupoModal(true);
                  }}
                >
                  <Plus size={16} />
                  <span>Crear Grupo</span>
                </button>
              </div>

              <div className="ec-table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Código Curso</th>
                      <th>Grado / Nivel</th>
                      <th>Aula Asignada</th>
                      <th>Jornada</th>
                      <th>Matriculados / Cupo</th>
                      <th>Director de Grupo</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grupos.map((g) => (
                      <tr key={g.id}>
                        <td style={{ fontWeight: 700, color: 'var(--ec-text)' }}>{g.codigoGrupo || g.nombre}</td>
                        <td><span className="grade-badge alto">{g.grado}</span></td>
                        <td>{g.salon || g.salonAula}</td>
                        <td>{g.jornada}</td>
                        <td>{g.totalEstudiantes} / {g.cupoMaximo}</td>
                        <td>{g.directorNombre || g.director}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button
                              type="button"
                              className="btn-secondary-action"
                              style={{ padding: '0.35rem 0.55rem', color: 'var(--ec-primary)' }}
                              onClick={() => {
                                setEditingGrupoId(g.id);
                                setFormGrupo({
                                  nombre: g.codigoGrupo || g.nombre,
                                  grado: g.grado,
                                  salon: g.salon || g.salonAula,
                                  jornada: g.jornada,
                                  cupoMaximo: g.cupoMaximo,
                                });
                                setShowGrupoModal(true);
                              }}
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              type="button"
                              className="btn-danger-action"
                              style={{ padding: '0.35rem 0.55rem' }}
                              onClick={() => void handleDeleteGrupo(g.id)}
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

          {/* VISTA 4: MATERIAS ACADÉMICAS */}
          {currentTab === 'materias' && (
            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <h3>Plan de Estudios y Asignaturas (Ley 115)</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--ec-text-muted)', marginTop: '0.2rem' }}>
                    Áreas fundamentales, intensidad horaria semanal y docentes asignados
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-primary-action"
                  onClick={() => {
                    setEditingMateriaId(null);
                    setFormMateria({ codigo: '', nombre: '', area: 'Matemáticas y Ciencias Exactas', intensidadHoraria: 4, descripcion: '' });
                    setShowMateriaModal(true);
                  }}
                >
                  <Plus size={16} />
                  <span>Agregar Materia</span>
                </button>
              </div>

              <div className="ec-table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Código Oficial</th>
                      <th>Asignatura</th>
                      <th>Área de Conocimiento</th>
                      <th>Intensidad Semanal</th>
                      <th>Docentes / Grupos</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materias.map((m) => (
                      <tr key={m.id}>
                        <td>
                          <code style={{ background: 'var(--ec-surface-low)', padding: '0.2rem 0.45rem', borderRadius: '6px', fontSize: '0.78rem' }}>
                            {m.codigoOficial || m.codigo}
                          </code>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--ec-text)' }}>{m.nombre}</td>
                        <td><span className="grade-badge alto">{m.areaConocimiento || m.area}</span></td>
                        <td>{m.intensidadHoraria || m.horasSemanales} hrs/sem</td>
                        <td>{m.docente} ({m.grupos})</td>
                        <td>
                          <button
                            type="button"
                            className="btn-secondary-action"
                            style={{ padding: '0.35rem 0.55rem', color: 'var(--ec-primary)' }}
                            onClick={() => {
                              setEditingMateriaId(m.id);
                              setFormMateria({
                                codigo: m.codigoOficial || m.codigo,
                                nombre: m.nombre,
                                area: m.areaConocimiento || m.area,
                                intensidadHoraria: m.intensidadHoraria || m.horasSemanales,
                                descripcion: m.descripcion || '',
                              });
                              setShowMateriaModal(true);
                            }}
                          >
                            <Edit size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VISTA 5: CARGAS ACADÉMICAS */}
          {currentTab === 'cargas' && (
            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <h3>Asignación de Carga Académica Docente</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--ec-text-muted)', marginTop: '0.2rem' }}>
                    Vinculación oficial entre Docente, Asignatura y Grupo para habilitar planillas de notas.
                  </p>
                </div>
                <button type="button" className="btn-primary-action" onClick={() => setShowCargaModal(true)}>
                  <Plus size={16} />
                  <span>Asignar Carga</span>
                </button>
              </div>

              <div className="ec-table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Grupo</th>
                      <th>Asignatura</th>
                      <th>Área</th>
                      <th>Docente Titular</th>
                      <th>Intensidad</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cargas.map((c) => (
                      <tr key={c.id}>
                        <td><span className="grade-badge alto">{c.grupo}</span></td>
                        <td style={{ fontWeight: 700, color: 'var(--ec-text)' }}>{c.materia}</td>
                        <td>{c.area}</td>
                        <td>{c.docente}</td>
                        <td>{c.intensidadHoraria} hrs</td>
                        <td>
                          <button
                            type="button"
                            className="btn-danger-action"
                            style={{ padding: '0.35rem 0.55rem' }}
                            onClick={() => void handleDeleteCarga(c.id)}
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

          {/* VISTA 6: HORARIOS ESCOLARES */}
          {currentTab === 'horarios' && (
            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <h3>Horario Escolar Semanal</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--ec-text-muted)', marginTop: '0.2rem' }}>
                    Validación automática contra cruce de docentes y salones en el mismo bloque
                  </p>
                </div>

                <select
                  className="form-input"
                  style={{ width: 'auto', minWidth: '185px' }}
                  value={horarioGrupoFilter}
                  onChange={(e) => setHorarioGrupoFilter(e.target.value)}
                >
                  <option value="TODOS">Todos los Grupos</option>
                  {grupos.map((g) => (
                    <option key={g.id} value={g.codigoGrupo || g.nombre}>
                      Grupo {g.codigoGrupo || g.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="panel-body">
                <HorarioSemanalGrid
                  bloques={
                    horarioGrupoFilter === 'TODOS'
                      ? horarios
                      : horarios.filter((h) => h.grupo.toLowerCase().includes(horarioGrupoFilter.toLowerCase()))
                  }
                  editable={true}
                  onAddBloque={handleAddBloqueHorario}
                  onDeleteBloque={handleDeleteHorario}
                  gruposDisponibles={grupos.map((g) => g.codigoGrupo || g.nombre)}
                  materiasDisponibles={materias.map((m) => m.nombre)}
                  docentesDisponibles={docentesDisponibles.map((d) => d.nombreCompleto)}
                />
              </div>
            </div>
          )}

          {/* VISTA 7: COMUNICADOS */}
          {currentTab === 'comunicados' && (
            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <h3>Comunicados y Circulares Oficiales</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--ec-text-muted)', marginTop: '0.2rem' }}>
                    Publicación institucional segmentada por rol
                  </p>
                </div>
                <button type="button" className="btn-primary-action" onClick={() => setShowComModal(true)}>
                  <Plus size={16} />
                  <span>Nuevo Comunicado</span>
                </button>
              </div>

              <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {comunicados.length === 0 ? (
                  <EmptyOrLoadingState emptyMessage="No hay comunicados publicados actualmente." />
                ) : (
                  comunicados.map((com) => (
                    <div
                      key={com.id}
                      style={{
                        background: 'var(--ec-surface-low)',
                        border: '1px solid var(--ec-border)',
                        borderRadius: '14px',
                        padding: '1.1rem 1.25rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1rem',
                      }}
                    >
                      <div>
                        <strong style={{ color: 'var(--ec-text)', fontSize: '0.98rem' }}>{com.titulo}</strong>
                        <p style={{ color: 'var(--ec-text-secondary)', fontSize: '0.88rem', margin: '0.35rem 0', lineHeight: 1.5 }}>
                          {com.contenido}
                        </p>
                        <span style={{ fontSize: '0.76rem', color: 'var(--ec-text-muted)', fontWeight: 600 }}>
                          Destinatarios: {com.destinatarios} · Fecha: {com.fecha}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn-danger-action"
                        onClick={() => void handleDeleteComunicado(com.id)}
                        style={{ padding: '0.45rem 0.65rem', flexShrink: 0 }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* VISTA 8: MIPA & TELEMETRÍA */}
          {currentTab === 'mipa' && <MipaTelemetriaPanel userRole={user?.rol} />}
        </>
      )}

      {/* MODAL USUARIO */}
      {showUsuarioModal && (
        <div className="ec-modal-overlay">
          <div className="ec-modal-card" style={{ maxWidth: '540px' }}>
            <div className="ec-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                {editingUsuarioId ? 'Actualizar Usuario Institucional' : 'Registrar Usuario Institucional'}
              </h3>
              <button type="button" onClick={() => setShowUsuarioModal(false)} className="btn-secondary-action" style={{ padding: '0.35rem' }}>
                <X size={18} />
              </button>
            </div>
            <div className="ec-modal-body">
              <form onSubmit={handleSaveUsuario} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">Tipo Doc.</label>
                    <select
                      className="form-input"
                      value={formUsuario.tipoDocumento}
                      onChange={(e) => setFormUsuario({ ...formUsuario, tipoDocumento: e.target.value })}
                    >
                      <option value="CC">CC</option>
                      <option value="TI">TI</option>
                      <option value="CE">CE</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Número de Documento *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: 1001234567"
                      className="form-input"
                      value={formUsuario.documento}
                      onChange={(e) => setFormUsuario({ ...formUsuario, documento: e.target.value })}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">Nombres *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nombres"
                      className="form-input"
                      value={formUsuario.nombre}
                      onChange={(e) => setFormUsuario({ ...formUsuario, nombre: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Apellidos *</label>
                    <input
                      type="text"
                      required
                      placeholder="Apellidos"
                      className="form-input"
                      value={formUsuario.apellido}
                      onChange={(e) => setFormUsuario({ ...formUsuario, apellido: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Correo Institucional *</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ec-text-subtle)' }} />
                    <input
                      type="email"
                      required
                      placeholder="correo@educonnect.edu.co"
                      className="form-input"
                      style={{ paddingLeft: '36px' }}
                      value={formUsuario.email}
                      onChange={(e) => setFormUsuario({ ...formUsuario, email: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">{editingUsuarioId ? 'Nueva contraseña (opcional)' : 'Contraseña inicial *'}</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ec-text-subtle)' }} />
                    <input
                      type="password"
                      required={!editingUsuarioId}
                      placeholder={editingUsuarioId ? 'Dejar vacío para conservar la actual' : 'Contraseña inicial'}
                      className="form-input"
                      style={{ paddingLeft: '36px' }}
                      value={formUsuario.password}
                      onChange={(e) => setFormUsuario({ ...formUsuario, password: e.target.value })}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">Rol Institucional</label>
                    <select
                      className="form-input"
                      value={formUsuario.rol}
                      onChange={(e) => setFormUsuario({ ...formUsuario, rol: e.target.value })}
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="RECTOR">RECTOR</option>
                      <option value="COORDINADOR">COORDINADOR</option>
                      <option value="DIRECTOR_GRUPO">DIRECTOR_GRUPO</option>
                      <option value="DOCENTE">DOCENTE</option>
                      <option value="ESTUDIANTE">ESTUDIANTE</option>
                      <option value="TUTOR">TUTOR</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Grupo Asignado</label>
                    <select
                      className="form-input"
                      value={formUsuario.grupoCodigo}
                      onChange={(e) => setFormUsuario({ ...formUsuario, grupoCodigo: e.target.value })}
                    >
                      {grupos.map((g) => (
                        <option key={g.id} value={g.codigoGrupo || g.nombre}>
                          Grupo {g.codigoGrupo || g.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="button" className="btn-secondary-action" onClick={() => setShowUsuarioModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary-action">
                    Guardar Usuario
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GRUPO */}
      {showGrupoModal && (
        <div className="ec-modal-overlay">
          <div className="ec-modal-card" style={{ maxWidth: '480px' }}>
            <div className="ec-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                {editingGrupoId ? 'Editar Grupo' : 'Nuevo Grupo Académico'}
              </h3>
              <button type="button" onClick={() => setShowGrupoModal(false)} className="btn-secondary-action" style={{ padding: '0.35rem' }}>
                <X size={18} />
              </button>
            </div>
            <div className="ec-modal-body">
              <form onSubmit={handleSaveGrupo} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div>
                  <label className="form-label">Código del Grupo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 10-A, 11-B"
                    className="form-input"
                    value={formGrupo.nombre}
                    onChange={(e) => setFormGrupo({ ...formGrupo, nombre: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Aula / Salón físico</label>
                  <input
                    type="text"
                    required
                    placeholder="Aula 204"
                    className="form-input"
                    value={formGrupo.salon}
                    onChange={(e) => setFormGrupo({ ...formGrupo, salon: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Jornada</label>
                  <select
                    className="form-input"
                    value={formGrupo.jornada}
                    onChange={(e) => setFormGrupo({ ...formGrupo, jornada: e.target.value })}
                  >
                    <option value="MANANA">Mañana</option>
                    <option value="TARDE">Tarde</option>
                    <option value="UNICA">Única</option>
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" className="btn-secondary-action" onClick={() => setShowGrupoModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary-action">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MATERIA */}
      {showMateriaModal && (
        <div className="ec-modal-overlay">
          <div className="ec-modal-card" style={{ maxWidth: '480px' }}>
            <div className="ec-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                {editingMateriaId ? 'Editar Asignatura' : 'Nueva Asignatura'}
              </h3>
              <button type="button" onClick={() => setShowMateriaModal(false)} className="btn-secondary-action" style={{ padding: '0.35rem' }}>
                <X size={18} />
              </button>
            </div>
            <div className="ec-modal-body">
              <form onSubmit={handleSaveMateria} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div>
                  <label className="form-label">Código Oficial</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: MAT-10"
                    className="form-input"
                    value={formMateria.codigo}
                    onChange={(e) => setFormMateria({ ...formMateria, codigo: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Nombre de la Asignatura</label>
                  <input
                    type="text"
                    required
                    placeholder="Nombre"
                    className="form-input"
                    value={formMateria.nombre}
                    onChange={(e) => setFormMateria({ ...formMateria, nombre: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Área de Conocimiento</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formMateria.area}
                    onChange={(e) => setFormMateria({ ...formMateria, area: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Intensidad Horaria Semanal</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    className="form-input"
                    value={formMateria.intensidadHoraria}
                    onChange={(e) => setFormMateria({ ...formMateria, intensidadHoraria: Number(e.target.value) })}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" className="btn-secondary-action" onClick={() => setShowMateriaModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary-action">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CARGA ACADÉMICA */}
      {showCargaModal && (
        <div className="ec-modal-overlay">
          <div className="ec-modal-card" style={{ maxWidth: '480px' }}>
            <div className="ec-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Asignar Carga Académica</h3>
              <button type="button" onClick={() => setShowCargaModal(false)} className="btn-secondary-action" style={{ padding: '0.35rem' }}>
                <X size={18} />
              </button>
            </div>
            <div className="ec-modal-body">
              <form onSubmit={handleSaveCarga} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div>
                  <label className="form-label">Grupo</label>
                  <select
                    className="form-input"
                    value={formCarga.grupoId}
                    onChange={(e) => setFormCarga({ ...formCarga, grupoId: Number(e.target.value) })}
                  >
                    {grupos.map((g) => (
                      <option key={g.id} value={g.id}>Grupo {g.codigoGrupo || g.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Asignatura</label>
                  <select
                    className="form-input"
                    value={formCarga.materiaId}
                    onChange={(e) => setFormCarga({ ...formCarga, materiaId: Number(e.target.value) })}
                  >
                    {materias.map((m) => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Docente Titular</label>
                  <select
                    className="form-input"
                    value={formCarga.docenteUsuarioId}
                    onChange={(e) => setFormCarga({ ...formCarga, docenteUsuarioId: Number(e.target.value) })}
                  >
                    {docentesDisponibles.map((d) => (
                      <option key={d.id} value={d.id}>{d.nombreCompleto}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" className="btn-secondary-action" onClick={() => setShowCargaModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary-action">Asignar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL COMUNICADO */}
      {showComModal && (
        <div className="ec-modal-overlay">
          <div className="ec-modal-card" style={{ maxWidth: '480px' }}>
            <div className="ec-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Publicar Comunicado Oficial</h3>
              <button type="button" onClick={() => setShowComModal(false)} className="btn-secondary-action" style={{ padding: '0.35rem' }}>
                <X size={18} />
              </button>
            </div>
            <div className="ec-modal-body">
              <form onSubmit={handleSaveComunicado} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div>
                  <label className="form-label">Título del comunicado</label>
                  <input
                    type="text"
                    required
                    placeholder="Título"
                    className="form-input"
                    value={formCom.titulo}
                    onChange={(e) => setFormCom({ ...formCom, titulo: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Contenido del comunicado</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Escribe el mensaje institucional..."
                    className="form-input"
                    value={formCom.contenido}
                    onChange={(e) => setFormCom({ ...formCom, contenido: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" className="btn-secondary-action" onClick={() => setShowComModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary-action">Publicar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BOLETÍN OFICIAL */}
      {boletinStudent && (
        <BoletinOficialModal
          isOpen={true}
          onClose={() => setBoletinStudent(null)}
          estudianteNombre={boletinStudent.nombreCompleto}
          estudianteDocumento={boletinStudent.documento}
          grupo={boletinStudent.grupo || '10-A'}
          periodo="Primer Periodo 2026"
          calificaciones={[]}
        />
      )}
    </DashboardShell>
  );
};

export default AdminDashboard;
