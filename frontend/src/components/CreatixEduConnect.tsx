import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, getHomeRouteForRole } from '../context/AuthContext';
import { api } from '../services/api';
import RecuperarClaveModal from './RecuperarClaveModal';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Users,
  BookOpen,
  Calendar,
  CheckCircle,
  LogIn,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Menu,
  X,
  BarChart3,
  Clock,
  HeartPulse,
  Brain,
  FileCheck2,
  Building2,
  ArrowLeft,
} from 'lucide-react';

interface CreatixEduConnectProps {
  initialView?: 'landing' | 'plataforma';
}

export const CreatixEduConnect: React.FC<CreatixEduConnectProps> = ({ initialView = 'landing' }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState<'landing' | 'plataforma'>(initialView);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [ctaEmail, setCtaEmail] = useState('');

  useEffect(() => {
    setCurrentSection(initialView);
  }, [initialView]);

  // Estado del formulario de Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showRecuperarModal, setShowRecuperarModal] = useState(false);

  // Estado interactivo para Servicios y Preview de Paneles
  const [activeService, setActiveService] = useState(0);
  const [activeRoleTab, setActiveRoleTab] = useState<'rector' | 'docente' | 'estudiante' | 'tutor'>('rector');

  const servicesList = [
    {
      num: '01',
      title: 'Gestión Académica y Matrículas',
      desc: 'Control unificado de grados, grupos, materias, cargas docentes y periodos lectivos con trazabilidad completa en PostgreSQL.',
      tag: 'GESTIÓN CENTRAL',
      icon: <BookOpen size={20} />,
      img: '/IMG/image.png',
    },
    {
      num: '02',
      title: 'Calificaciones y Boletines Oficiales',
      desc: 'Sistema ponderado oficial Decreto 1290 (40% Cognitivo, 40% Procedimental, 20% Actitudinal) con cálculo automático y boletín imprimible.',
      tag: 'DECRETO 1290',
      icon: <FileCheck2 size={20} />,
      img: '/IMG/image copy.png',
    },
    {
      num: '03',
      title: 'Horarios Escolares Inteligentes',
      desc: 'Matriz semanal de bloques por grupo y docente sin cruces horarios, con consulta inmediata desde web o dispositivo móvil.',
      tag: 'PLANIFICACIÓN',
      icon: <Clock size={20} />,
      img: '/IMG/image.png',
    },
    {
      num: '04',
      title: 'Asistencia y Justificaciones',
      desc: 'Registro rápido en aula, envío de excusas médicas o familiares por acudientes y validación coordinada en tiempo real.',
      tag: 'CONTROL DIARIO',
      icon: <Calendar size={20} />,
      img: '/IMG/image copy.png',
    },
    {
      num: '05',
      title: 'Convivencia Escolar y Observador',
      desc: 'Bitácora disciplinaria bajo lineamientos de Ley 1620, citaciones a padres y firma digital del observador estudiantil.',
      tag: 'LEY 1620',
      icon: <ShieldCheck size={20} />,
      img: '/IMG/image.png',
    },
    {
      num: '06',
      title: 'Custodia, Ficha Médica y Motor MIPA',
      desc: 'Seguridad de menores con verificación de acudientes, RH/EPS/alergias y alertas tempranas de riesgo académico mediante MIPA y EduBot.',
      tag: 'BIENESTAR & IA',
      icon: <HeartPulse size={20} />,
      img: '/IMG/image copy.png',
    },
  ];

  const rolePreviewInfo = {
    rector: {
      badge: 'Gobierno Institucional',
      title: 'Panel Estratégico de Rectoría',
      desc: 'Supervisa el rendimiento global, aprueba solicitudes extemporáneas de notas, gestiona apertura/cierre de periodos y emite resoluciones rectorales.',
      bullets: [
        'Auditoría de modificaciones de calificaciones',
        'Apertura y cierre de periodos académicos',
        'Proyección de promoción y alertas tempranas MIPA',
      ],
    },
    docente: {
      badge: 'Operación en Aula',
      title: 'Portal Docente y Director de Grupo',
      desc: 'Planilla ponderada 40/40/20%, toma de asistencia por sesión, horario de clases y funciones exclusivas de dirección de curso.',
      bullets: [
        'Registro de notas Cognitivo / Procedimental / Actitudinal',
        'Control diario de asistencia y solicitudes de corrección',
        'Consolidado, observador y citaciones para directores de grupo',
      ],
    },
    estudiante: {
      badge: 'Seguimiento Personal',
      title: 'Campus Digital del Estudiante',
      desc: 'Consulta en tiempo real tus calificaciones por periodo, descarga tu boletín oficial, revisa tu horario semanal y lee comunicados.',
      bullets: [
        'Desglose de notas y escala de desempeño MEN',
        'Boletín oficial imprimible en formato institucional',
        'Horario semanal, observador y asistente EduBot',
      ],
    },
    tutor: {
      badge: 'Familia y Custodia',
      title: 'Portal de Tutores y Acudientes',
      desc: 'Acompaña a tus acudidos desde un solo lugar: rendimiento académico, ficha médica, citaciones, firma del observador y justificación de faltas.',
      bullets: [
        'Selector unificado por cada estudiante a cargo',
        'Radicación de justificaciones de inasistencia',
        'Consulta de custodia, EPS, RH y citaciones',
      ],
    },
  };

  const handleOpenPlatform = (prefillEmail?: string) => {
    if (prefillEmail) {
      setEmail(prefillEmail);
    }
    setMobileNavOpen(false);
    setCurrentSection('plataforma');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Inicio de sesión real conectado con Backend Spring Boot + JWT
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Por favor completa tu correo y contraseña institucional.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.login(email.trim(), password);
      setErrorMsg('Autenticado con éxito. Redirigiendo a tu portal...');
      login(response);
      navigate(getHomeRouteForRole(response.rol), { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Credenciales inválidas o servidor no disponible.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  // Selector de cuenta institucional (completa únicamente el correo; exige autenticación real en backend)
  const handleSelectInstitutionalAccount = (institutionalEmail: string) => {
    setEmail(institutionalEmail);
    setErrorMsg('');
  };

  if (currentSection === 'plataforma') {
    return (
      <div className="ec-auth-shell">
        <div style={{ maxWidth: '1060px', width: '100%', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setCurrentSection('landing')}
            className="btn-secondary-action"
            style={{ borderRadius: '999px' }}
          >
            <ArrowLeft size={16} />
            <span>Volver al Portal Institucional</span>
          </button>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--ec-primary-dark)', background: '#ffffff', padding: '0.4rem 0.85rem', borderRadius: '999px', border: '1px solid var(--ec-border)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--ec-success)' }} />
            <span>Autenticación JWT + BCrypt Activa</span>
          </div>
        </div>

        <div className="ec-auth-card">
          {/* LADO IZQUIERDO: FORMULARIO STITCH */}
          <div className="ec-auth-left">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '1.4rem' }}>
              <div className="brand-icon-box" style={{ width: '40px', height: '40px' }}>
                <GraduationCap size={21} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--ec-text)', fontFamily: 'var(--font-display)' }}>
                  EduConnect <span style={{ fontSize: '0.7rem', background: 'var(--ec-surface-low)', padding: '0.15rem 0.5rem', borderRadius: '999px', color: 'var(--ec-primary-dark)', marginLeft: '0.35rem' }}>Campus OS</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ec-text-muted)', fontWeight: 500 }}>Plataforma Web Institucional</div>
              </div>
            </div>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'var(--ec-primary-soft)',
                color: 'var(--ec-primary-dark)',
                padding: '0.28rem 0.75rem',
                borderRadius: '999px',
                fontSize: '0.74rem',
                fontWeight: 700,
                width: 'fit-content',
                marginBottom: '0.85rem',
              }}
            >
              <ShieldCheck size={14} /> Autenticación Institucional Segura
            </span>

            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--ec-text)', marginBottom: '0.45rem' }}>
              Bienvenido nuevamente
            </h1>
            <p style={{ color: 'var(--ec-text-muted)', fontSize: '0.9rem', marginBottom: '1.4rem', lineHeight: 1.5 }}>
              Ingrese sus credenciales institucionales para acceder a su portal de gestión académica y directiva.
            </p>

            {/* CUENTAS INSTITUCIONALES REGISTRADAS EN BASE DE DATOS */}
            <div style={{ marginBottom: '1.25rem', background: 'var(--ec-surface-low)', padding: '0.9rem', borderRadius: '14px', border: '1px solid var(--ec-border)' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--ec-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.55rem' }}>
                Accesos rápidos por correo institucional:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {[
                  { label: 'Administrador', mail: 'admin@educonnect.com' },
                  { label: 'Rector', mail: 'rector@educonnect.com' },
                  { label: 'Coordinador', mail: 'coordinador@educonnect.com' },
                  { label: 'Docente / Dir. Grupo', mail: 'prof.silva@educonnect.com' },
                  { label: 'Estudiante', mail: 'carlosvargas@educonnect.com' },
                  { label: 'Tutor', mail: 'juan.ramirez@gmail.com' },
                ].map((acc) => (
                  <button
                    key={acc.mail}
                    type="button"
                    className={`ec-role-chip ${email === acc.mail ? 'active' : ''}`}
                    onClick={() => handleSelectInstitutionalAccount(acc.mail)}
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
            </div>

            {errorMsg && (
              <div
                style={{
                  background: errorMsg.includes('éxito') ? 'var(--ec-success-bg)' : 'var(--ec-danger-bg)',
                  border: `1px solid ${errorMsg.includes('éxito') ? 'var(--ec-success-border)' : 'var(--ec-danger-border)'}`,
                  color: errorMsg.includes('éxito') ? 'var(--ec-success)' : 'var(--ec-danger)',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  marginBottom: '1.1rem',
                }}
              >
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Correo electrónico institucional</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ec-text-subtle)' }} />
                  <input
                    type="email"
                    className="ec-auth-input"
                    placeholder="docente@educonnect.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Contraseña institucional</label>
                  <button
                    type="button"
                    onClick={() => setShowRecuperarModal(true)}
                    style={{
                      background: 'none',
                      fontSize: '0.78rem',
                      color: 'var(--ec-primary)',
                      fontWeight: 700,
                    }}
                  >
                    ¿Olvidó su contraseña?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ec-text-subtle)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="ec-auth-input"
                    style={{ paddingRight: '2.7rem' }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Mostrar u ocultar contraseña"
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      color: 'var(--ec-text-muted)',
                    }}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary-action"
                style={{ width: '100%', padding: '0.85rem 1.25rem', fontSize: '0.92rem', borderRadius: '12px' }}
                disabled={loading}
              >
                <span>{loading ? 'Validando credenciales...' : 'Iniciar sesión'}</span>
                <ArrowRight size={17} />
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--ec-border)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.74rem', color: 'var(--ec-text-muted)' }}>
              <span>Cifrado TLS · Control RBAC</span>
              <span>Decreto 1290 · Ley 1620</span>
            </div>
          </div>

          {/* LADO DERECHO: PANEL OSCURO INSTITUCIONAL STITCH */}
          <div className="ec-auth-right">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', padding: '0.32rem 0.8rem', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 700, color: '#93c5fd', marginBottom: '1.5rem' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#34d399' }} />
                Ecosistema EduConnect · Activo
              </div>

              <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.09em', color: '#60a5fa', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                VISIÓN DE EXCELENCIA
              </div>

              <h2 style={{ fontSize: '1.55rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.28, marginBottom: '1rem' }}>
                “Transformando la gestión escolar en una experiencia conectada, inteligente y sin fricciones.”
              </h2>

              <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Acceso segmentado por rol institucional con trazabilidad completa en calificaciones, asistencia, convivencia escolar y custodia de menores.
              </p>

              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '0.9rem 1rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#60a5fa', marginBottom: '0.2rem' }}>EVALUACIÓN OFICIAL</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>Ponderación 40% / 40% / 20%</div>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Cognitivo, Procedimental y Actitudinal</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '0.85rem' }}>
                    <div style={{ fontSize: '0.7rem', color: '#93c5fd', fontWeight: 700 }}>SEGURIDAD</div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#fff', marginTop: '0.2rem' }}>8 Roles RBAC</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '0.85rem' }}>
                    <div style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 700 }}>ANALÍTICA</div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#fff', marginTop: '0.2rem' }}>MIPA & EduBot</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '1.1rem', marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#94a3b8' }}>
              <span>Plataforma Institucional EduConnect</span>
              <span style={{ color: '#60a5fa', fontWeight: 700 }}>Periodo Lectivo Vigente</span>
            </div>
          </div>
        </div>

        <RecuperarClaveModal
          isOpen={showRecuperarModal}
          initialEmail={email}
          onClose={() => setShowRecuperarModal(false)}
        />
      </div>
    );
  }

  const currentRolePreview = rolePreviewInfo[activeRoleTab];

  return (
    <div className="ec-landing-root">
      {/* 1. HEADER STICKY GLASSMORPHIC STITCH */}
      <header className="ec-landing-header">
        <div className="ec-landing-header-inner">
          <a href="#inicio" style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <div className="brand-icon-box" style={{ width: '38px', height: '38px' }}>
              <GraduationCap size={20} />
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#ffffff', fontFamily: 'var(--font-display)' }}>
                EduConnect
              </span>
              <span style={{ marginLeft: '0.45rem', fontSize: '0.68rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '999px', background: 'rgba(23, 92, 255, 0.25)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.35)' }}>
                v2.0
              </span>
            </div>
          </a>

          <nav className="ec-landing-nav">
            <a href="#inicio" style={{ fontSize: '0.88rem', color: '#e2e8f0', fontWeight: 600 }}>Inicio</a>
            <a href="#servicios" style={{ fontSize: '0.88rem', color: '#94a3b8', fontWeight: 500 }}>Servicios</a>
            <a href="#plataformas" style={{ fontSize: '0.88rem', color: '#94a3b8', fontWeight: 500 }}>Plataforma</a>
            <a href="#filosofia" style={{ fontSize: '0.88rem', color: '#94a3b8', fontWeight: 500 }}>Propuesta</a>
            <a href="#docentes" style={{ fontSize: '0.88rem', color: '#94a3b8', fontWeight: 500 }}>Docentes</a>
            <a href="#contacto" style={{ fontSize: '0.88rem', color: '#94a3b8', fontWeight: 500 }}>Contacto</a>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              type="button"
              className="btn-primary-action"
              onClick={() => handleOpenPlatform()}
              style={{ borderRadius: '999px', padding: '0.58rem 1.15rem' }}
            >
              <LogIn size={15} />
              <span>Ingresar a la plataforma</span>
            </button>
            <button
              type="button"
              className="ec-mobile-menu-btn"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              aria-label="Menú de navegación"
              style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.16)', color: '#ffffff' }}
            >
              {mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {mobileNavOpen && (
          <div style={{ background: '#07142f', borderTop: '1px solid rgba(59,130,246,0.2)', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <a href="#inicio" onClick={() => setMobileNavOpen(false)} style={{ color: '#e2e8f0', fontWeight: 600 }}>Inicio</a>
            <a href="#servicios" onClick={() => setMobileNavOpen(false)} style={{ color: '#cbd5e1' }}>Servicios</a>
            <a href="#plataformas" onClick={() => setMobileNavOpen(false)} style={{ color: '#cbd5e1' }}>Paneles por Rol</a>
            <a href="#filosofia" onClick={() => setMobileNavOpen(false)} style={{ color: '#cbd5e1' }}>Propuesta Pedagógica</a>
            <a href="#docentes" onClick={() => setMobileNavOpen(false)} style={{ color: '#cbd5e1' }}>Cuerpo Docente</a>
            <a href="#contacto" onClick={() => setMobileNavOpen(false)} style={{ color: '#cbd5e1' }}>Contacto</a>
          </div>
        )}
      </header>

      {/* 2. HERO PRINCIPAL STITCH */}
      <section id="inicio" className="ec-landing-container">
        <div className="ec-landing-hero-grid">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(23, 92, 255, 0.16)', border: '1px solid rgba(59, 130, 246, 0.32)', color: '#93c5fd', padding: '0.38rem 0.9rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              <Sparkles size={14} />
              <span>Ecosistema Educativo Institucional</span>
            </div>

            <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.55rem)', fontWeight: 800, lineHeight: 1.08, color: '#ffffff', marginBottom: '1.25rem' }}>
              Educación conectada. <span style={{ color: '#60a5fa' }}>Gestión inteligente.</span> Futuro sin límites.
            </h1>

            <p style={{ fontSize: '1.03rem', color: '#cbd5e1', lineHeight: 1.68, marginBottom: '1.85rem', maxWidth: '580px' }}>
              Centraliza la gestión académica, administrativa, disciplinaria y estudiantil en una sola plataforma institucional de alta confiabilidad, alineada con Decreto 1290 y Ley 1620.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', marginBottom: '2rem' }}>
              <button
                type="button"
                className="btn-primary-action"
                onClick={() => handleOpenPlatform()}
                style={{ padding: '0.82rem 1.5rem', borderRadius: '12px', fontSize: '0.94rem' }}
              >
                <span>Explorar plataforma</span>
                <ArrowRight size={17} />
              </button>

              <a
                href="#servicios"
                className="btn-secondary-action"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.16)', padding: '0.82rem 1.4rem', borderRadius: '12px', fontSize: '0.94rem' }}
              >
                Conocer servicios
              </a>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={15} style={{ color: '#34d399' }} /> Escala Oficial MEN (Decreto 1290)
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={15} style={{ color: '#60a5fa' }} /> Control RBAC por Rol
              </span>
            </div>
          </div>

          {/* PREVIEW CONSOLA INSTITUCIONAL EN HERO */}
          <div className="ec-glass-card" style={{ padding: '1.4rem', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--ec-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>
                  EC
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>Consola Institucional EduConnect</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Arquitectura Integrada · Tiempo Real</div>
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '999px', background: 'rgba(16, 185, 129, 0.16)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
                En Línea
              </span>
            </div>

            <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', marginBottom: '1rem', height: '215px', position: 'relative' }}>
              <img
                src="/IMG/image copy.png"
                alt="Campus EduConnect"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/IMG/image.png'; }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,13,33,0.1) 0%, rgba(5,13,33,0.82) 100%)', display: 'flex', alignItems: 'flex-end', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#93c5fd', fontWeight: 700 }}>SISTEMA DE GESTIÓN ESCOLAR</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>8 Roles · 6 Portales Especializados</div>
                  </div>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, background: 'rgba(23, 92, 255, 0.85)', color: '#fff', padding: '0.3rem 0.7rem', borderRadius: '999px' }}>
                    PostgreSQL + JWT
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Evaluación</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', marginTop: '0.15rem' }}>40/40/20%</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Convivencia</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#60a5fa', marginTop: '0.15rem' }}>Ley 1620</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Prevención</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#34d399', marginTop: '0.15rem' }}>Motor MIPA</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. BANDA DE CAPACIDADES CLAVE */}
        <div className="ec-landing-stats-grid" style={{ padding: '1.5rem 0 3.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="ec-glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>8 Roles</div>
            <div style={{ fontSize: '0.82rem', color: '#93c5fd', fontWeight: 600, marginTop: '0.2rem' }}>Control RBAC Granular</div>
            <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '0.35rem' }}>Admin, Rectoría, Coordinación, Dirección, Docente, Estudiante y Tutor.</div>
          </div>
          <div className="ec-glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>40 / 40 / 20%</div>
            <div style={{ fontSize: '0.82rem', color: '#34d399', fontWeight: 600, marginTop: '0.2rem' }}>Ponderación Decreto 1290</div>
            <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '0.35rem' }}>Cálculo automático de definitivas y boletines oficiales imprimibles.</div>
          </div>
          <div className="ec-glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>100% Custodia</div>
            <div style={{ fontSize: '0.82rem', color: '#93c5fd', fontWeight: 600, marginTop: '0.2rem' }}>Ficha Médica y Tutores</div>
            <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '0.35rem' }}>Verificación de acudientes, EPS, tipo de sangre (RH) y citaciones.</div>
          </div>
          <div className="ec-glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>MIPA + EduBot</div>
            <div style={{ fontSize: '0.82rem', color: '#fbbf24', fontWeight: 600, marginTop: '0.2rem' }}>Alertas e Inteligencia</div>
            <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '0.35rem' }}>Detección temprana de riesgo académico y asistente por rol.</div>
          </div>
        </div>
      </section>

      {/* 4. SERVICIOS E INFRAESTRUCTURA */}
      <section id="servicios" className="ec-landing-container" style={{ paddingTop: '4.5rem', paddingBottom: '3.5rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 2.5rem' }}>
          <span style={{ display: 'inline-block', padding: '0.32rem 0.85rem', borderRadius: '999px', background: 'rgba(23,92,255,0.16)', border: '1px solid rgba(59,130,246,0.3)', color: '#93c5fd', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.85rem' }}>
            Servicios Institucionales Especializados
          </span>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.4rem)', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
            Infraestructura integral para instituciones de excelencia
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Selecciona cualquiera de los módulos para explorar su alcance operativo dentro de la plataforma.
          </p>
        </div>

        <div className="ec-landing-services-grid" style={{ marginBottom: '2rem' }}>
          {servicesList.map((srv, idx) => {
            const isSelected = activeService === idx;
            return (
              <div
                key={srv.num}
                className="ec-glass-card"
                onClick={() => setActiveService(idx)}
                style={{
                  padding: '1.4rem',
                  cursor: 'pointer',
                  borderColor: isSelected ? '#3b82f6' : undefined,
                  boxShadow: isSelected ? '0 0 0 1px rgba(59,130,246,0.5), 0 16px 35px -12px rgba(23,92,255,0.4)' : undefined,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: 'rgba(23,92,255,0.2)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {srv.icon}
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.22rem 0.6rem', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', color: '#93c5fd' }}>
                    {srv.tag}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                  {srv.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.55, marginBottom: '1rem' }}>
                  {srv.desc}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#60a5fa' }}>
                  <span>Módulo {srv.num}</span>
                  <ArrowRight size={15} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Highlight activo del servicio */}
        <div className="ec-glass-card" style={{ padding: '1.5rem 1.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div style={{ maxWidth: '720px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#60a5fa', letterSpacing: '0.07em', marginBottom: '0.3rem' }}>
              MÓDULO SELECCIONADO · {servicesList[activeService].tag}
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.35rem' }}>
              {servicesList[activeService].title}
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.55 }}>
              {servicesList[activeService].desc}
            </p>
          </div>
          <button type="button" className="btn-primary-action" onClick={() => handleOpenPlatform()}>
            <span>Ingresar al módulo</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* 5. PANELES CONCEBIDOS PARA CADA ACTOR */}
      <section id="plataformas" className="ec-landing-container" style={{ paddingTop: '3rem', paddingBottom: '3.5rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 2rem' }}>
          <h2 style={{ fontSize: 'clamp(1.7rem, 3vw, 2.3rem)', fontWeight: 800, color: '#ffffff', marginBottom: '0.65rem' }}>
            Paneles concebidos para cada actor institucional
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.94rem' }}>
            Experiencias adaptadas con permisos granulares basados en roles reales del backend.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1.75rem' }}>
          {[
            { id: 'rector', label: 'Panel Rectoría & Admin', icon: <Building2 size={15} /> },
            { id: 'docente', label: 'Portal Docente & Director', icon: <Users size={15} /> },
            { id: 'estudiante', label: 'Campus del Estudiante', icon: <GraduationCap size={15} /> },
            { id: 'tutor', label: 'Portal Acudientes', icon: <HeartPulse size={15} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveRoleTab(tab.id as typeof activeRoleTab)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.6rem 1.05rem',
                borderRadius: '11px',
                fontSize: '0.84rem',
                fontWeight: 600,
                background: activeRoleTab === tab.id ? 'var(--ec-primary)' : 'rgba(255,255,255,0.06)',
                color: activeRoleTab === tab.id ? '#ffffff' : '#cbd5e1',
                border: `1px solid ${activeRoleTab === tab.id ? 'var(--ec-primary)' : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="ec-glass-card" style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
          <div>
            <span style={{ display: 'inline-block', fontSize: '0.72rem', fontWeight: 700, color: '#60a5fa', background: 'rgba(23,92,255,0.18)', padding: '0.25rem 0.65rem', borderRadius: '999px', marginBottom: '0.75rem' }}>
              {currentRolePreview.badge}
            </span>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.65rem' }}>
              {currentRolePreview.title}
            </h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              {currentRolePreview.desc}
            </p>
            <div style={{ display: 'grid', gap: '0.6rem', marginBottom: '1.4rem' }}>
              {currentRolePreview.bullets.map((b) => (
                <div key={b} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.86rem', color: '#e2e8f0' }}>
                  <CheckCircle size={15} style={{ color: '#34d399', flexShrink: 0 }} />
                  <span>{b}</span>
                </div>
              ))}
            </div>
            <button type="button" className="btn-primary-action" onClick={() => handleOpenPlatform()}>
              <span>Acceder con mi cuenta</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: '#050d21' }}>
            <img
              src={activeRoleTab === 'docente' || activeRoleTab === 'tutor' ? '/IMG/image.png' : '/IMG/image copy.png'}
              alt={currentRolePreview.title}
              style={{ width: '100%', height: '250px', objectFit: 'cover', opacity: 0.9 }}
            />
          </div>
        </div>
      </section>

      {/* 6. PROPUESTA PEDAGÓGICA & CUERPO DOCENTE */}
      <section id="filosofia" className="ec-landing-container" style={{ paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>
        <div className="ec-landing-services-grid">
          <div className="ec-glass-card" style={{ padding: '1.5rem' }}>
            <BarChart3 size={22} style={{ color: '#60a5fa', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '0.45rem' }}>
              Integridad Académica en PostgreSQL
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.55 }}>
              Toda matrícula, carga, asistencia y nota queda respaldada con trazabilidad y validaciones en servidor.
            </p>
          </div>
          <div className="ec-glass-card" style={{ padding: '1.5rem' }}>
            <Brain size={22} style={{ color: '#34d399', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '0.45rem' }}>
              Asistente EduBot & Alertas MIPA
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.55 }}>
              Orientación contextualizada según rol e identificación temprana de estudiantes que requieren intervención.
            </p>
          </div>
          <div className="ec-glass-card" style={{ padding: '1.5rem' }}>
            <ShieldCheck size={22} style={{ color: '#fbbf24', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '0.45rem' }}>
              Boletines Oficiales Imprimibles
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.55 }}>
              Generación inmediata del boletín académico por periodo con promedio ponderado y escala nacional de desempeño.
            </p>
          </div>
        </div>
      </section>

      <section id="docentes" className="ec-landing-container" style={{ paddingTop: '1.5rem', paddingBottom: '3.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
            Liderazgo y Acompañamiento Calificado
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>
            Directivos y docentes comprometidos con la formación integral y el seguimiento cercano.
          </p>
        </div>

        <div className="ec-landing-services-grid">
          {[
            { init: 'JA', name: 'Prof. Jeider Antonio', role: 'Docente de Lengua Castellana', bio: 'Especialista en comprensión lectora, literatura y argumentación para educación básica y media.' },
            { init: 'CM', name: 'Lic. Carlos Moreno', role: 'Docente de Matemáticas y Geometría', bio: 'Enfoque en resolución de problemas, pensamiento lógico y preparación académica.' },
            { init: 'MR', name: 'Dra. María Restrepo', role: 'Coordinadora Pedagógica', bio: 'Supervisión curricular, asesoría a acudientes y seguimiento al plan de mejora institucional.' },
          ].map((doc) => (
            <div key={doc.name} style={{ background: '#ffffff', color: 'var(--ec-text)', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 12px 30px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.85rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--ec-primary-soft)', color: 'var(--ec-primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                  {doc.init}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem' }}>{doc.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--ec-text-muted)', fontWeight: 600 }}>{doc.role}</div>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--ec-text-secondary)', lineHeight: 1.55 }}>{doc.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. CTA FINAL */}
      <section id="contacto" className="ec-landing-container" style={{ paddingTop: '1rem' }}>
        <div className="ec-glass-card" style={{ padding: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ maxWidth: '540px' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#60a5fa', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>
              ACCESO INSTITUCIONAL
            </div>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.45rem' }}>
              ¿Listo para comenzar tu periodo académico?
            </h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.92rem' }}>
              Ingresa con tu correo institucional para acceder a tu portal correspondiente.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', width: '100%', maxWidth: '430px' }}>
            <input
              type="email"
              value={ctaEmail}
              onChange={(e) => setCtaEmail(e.target.value)}
              placeholder="correo@educonnect.com"
              style={{
                flex: '1 1 220px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: '12px',
                padding: '0.75rem 1rem',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
            <button
              type="button"
              className="btn-primary-action"
              onClick={() => handleOpenPlatform(ctaEmail.trim())}
              style={{ borderRadius: '12px', padding: '0.75rem 1.35rem' }}
            >
              <span>Ingresar</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* 8. FOOTER STITCH */}
      <footer className="ec-landing-footer">
        <div className="ec-landing-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', paddingBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 800, fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.7rem' }}>
                <GraduationCap size={24} style={{ color: '#60a5fa' }} />
                <span>EduConnect</span>
              </div>
              <p style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.6 }}>
                Plataforma institucional para la gestión académica, seguimiento escolar, convivencia y custodia del menor.
              </p>
            </div>

            <div>
              <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Plataforma</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.84rem', color: '#94a3b8' }}>
                <a href="#inicio">Inicio</a>
                <a href="#servicios">Servicios</a>
                <a href="#plataformas">Paneles por Rol</a>
                <a href="#filosofia">Propuesta Pedagógica</a>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Institucional</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.84rem', color: '#94a3b8' }}>
                <a href="#docentes">Cuerpo Docente</a>
                <button type="button" onClick={() => handleOpenPlatform()} style={{ background: 'none', color: '#94a3b8', textAlign: 'left', padding: 0 }}>
                  Portal de Acceso
                </button>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Atención Institucional</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.84rem', color: '#94a3b8' }}>
                <span>Sede Principal: Calle 45 # 12-80</span>
                <span>Horario: 06:45 AM - 04:30 PM</span>
                <span>PBX: (601) 555-0199</span>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
            <span>© 2026 EduConnect — Todos los derechos reservados.</span>
            <span>Decreto 1290 · Ley 1620 · Control RBAC</span>
          </div>
        </div>
      </footer>

      <RecuperarClaveModal
        isOpen={showRecuperarModal}
        initialEmail={email}
        onClose={() => setShowRecuperarModal(false)}
      />
    </div>
  );
};

export default CreatixEduConnect;
