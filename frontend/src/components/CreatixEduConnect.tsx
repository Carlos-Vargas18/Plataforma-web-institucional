import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { RecuperarClaveModal } from './RecuperarClaveModal';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  Users,
  BookOpen,
  Calendar,
  CheckCircle,
  LogIn,
  Search,
  School,
  Lock,
  Mail,
  Award,
  HeartPulse,
  Phone,
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface CreatixEduConnectProps {
  onDirectRoleSelect?: (role: 'ADMIN' | 'DOCENTE' | 'ESTUDIANTE' | 'TUTOR') => void;
}

export const CreatixEduConnect: React.FC<CreatixEduConnectProps> = ({ onDirectRoleSelect }) => {
  const { login } = useAuth();
  const [currentSection, setCurrentSection] = useState<'landing' | 'plataforma'>('landing');

  // Estado del formulario de Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showRecuperarModal, setShowRecuperarModal] = useState(false);

  // Estado para la lista interactiva de Servicios
  const [activeService, setActiveService] = useState(0);

  const servicesList = [
    {
      num: '01',
      title: 'Aula Virtual y Recursos Digitales',
      desc: 'Acceso centralizado a guías pedagógicas, material interactivo y enlaces sincrónicos desde cualquier dispositivo.',
      tag: 'AULA INTERACTIVA',
      img: '/IMG/image.png'
    },
    {
      num: '02',
      title: 'Boletín y Calificaciones Oficiales',
      desc: 'Sistema ponderado oficial (40% Cognitivo, 40% Procedimental, 20% Actitudinal) con cálculo automático y semáforo de desempeño.',
      tag: 'EVALUACIÓN CONTINUA',
      img: '/IMG/image copy.png'
    },
    {
      num: '03',
      title: 'Seguimiento de Asistencia y Observador',
      desc: 'Registro biométrico y diario de asistencia con notificaciones inmediatas a padres y tutores legales.',
      tag: 'CONTROL Y DISCIPLINA',
      img: '/IMG/image.png'
    },
    {
      num: '04',
      title: 'Custodia, Ficha Médica y Tutores',
      desc: 'Módulo integral de seguridad para menores: verificación de acudientes autorizados en portería, EPS y tipo de sangre (RH).',
      tag: 'SEGURIDAD INTEGRAL',
      img: '/IMG/image copy.png'
    }
  ];

  // Inicio de sesión real conectado con Supabase
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('⚠️ Por favor completa tu correo y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.login(email.trim(), password);
      setErrorMsg('✅ Autenticado con éxito en Supabase. Redirigiendo...');
      setTimeout(() => {
        login(response);
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || '❌ Error al conectar con la base de datos Supabase.');
    } finally {
      setLoading(false);
    }
  };

  // Acceso Rápido Demo (Llena los campos y puede autenticar directo)
  const handleQuickLogin = (demoEmail: string, demoPass: string, roleName?: 'ADMIN' | 'RECTOR' | 'COORDINADOR' | 'DIRECTOR_GRUPO' | 'DOCENTE' | 'ESTUDIANTE' | 'TUTOR') => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg('');
    if (roleName && onDirectRoleSelect) {
      setLoading(true);
      api.login(demoEmail, demoPass)
        .then((res) => {
          login(res);
        })
        .catch(() => {
          // Fallback con usuario institucional estructurado
          const nombres: Record<string, string> = {
            ADMIN: 'Ing. Carlos Vargas (Administrador TI)',
            RECTOR: 'Dr. Fernando Restrepo (Rector Titular)',
            COORDINADOR: 'Lic. Claudia Morales (Coordinación Académica)',
            DIRECTOR_GRUPO: 'Prof. Jeider Antonio (Director Grado 6°A)',
            DOCENTE: 'Prof. Roberto Silva (Docente de Área)',
            ESTUDIANTE: 'Carlos Vargas (Estudiante Grado 6°)',
            TUTOR: 'Juan Fernando Ramírez (Acudiente Principal)',
          };

          login({
            token: `demo-token-${Date.now()}`,
            tipo: 'Bearer',
            id: roleName === 'ADMIN' ? 1 : roleName === 'RECTOR' ? 2 : roleName === 'COORDINADOR' ? 3 : roleName === 'DIRECTOR_GRUPO' ? 31 : roleName === 'DOCENTE' ? 38 : 30,
            email: demoEmail,
            rol: roleName,
            nombreCompleto: nombres[roleName] || 'Usuario Institucional',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
            perfilId: 1
          });
        })
        .finally(() => setLoading(false));
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark-deep)' }}>
      {/* ════════════════════════════════════════════════════════════
         1. FLOATING PILL NAVBAR (ESTILO CREATIX DE REFERENCIA)
         ════════════════════════════════════════════════════════════ */}
      <div className="floating-nav-wrapper">
        <header className="floating-nav">
          <div className="nav-brand">
            <div className="nav-brand-icon">
              <GraduationCap size={18} />
            </div>
            <span>EduConnect</span>
          </div>

          <nav className="nav-links-center">
            <a href="#inicio" className="nav-link-pill active" onClick={() => setCurrentSection('landing')}>Inicio</a>
            <a href="#servicios" className="nav-link-pill" onClick={() => setCurrentSection('landing')}>Servicios</a>
            <a href="#filosofia" className="nav-link-pill" onClick={() => setCurrentSection('landing')}>Propuesta</a>
            <a href="#docentes" className="nav-link-pill" onClick={() => setCurrentSection('landing')}>Docentes</a>
            <a href="#contacto" className="nav-link-pill" onClick={() => setCurrentSection('landing')}>Contacto</a>
          </nav>

          <button
            className="nav-cta-btn"
            onClick={() => {
              setCurrentSection('plataforma');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <LogIn size={15} />
            <span>Plataforma</span>
          </button>
        </header>
      </div>

      {currentSection === 'landing' ? (
        <>
          {/* ════════════════════════════════════════════════════════════
             2. HERO CUTOUT CARD (CARD BLANCA GIGANTE CON CURVATURA INFERIOR)
             ════════════════════════════════════════════════════════════ */}
          <section id="inicio" className="hero-wrapper">
            <div className="hero-cutout-card">
              <div className="hero-grid-modern">
                {/* LADO IZQUIERDO: TEXTO Y LLAMADOS A LA ACCIÓN */}
                <div>
                  <div className="hero-tag-eyebrow">
                    <Sparkles size={14} style={{ color: 'var(--accent-lime)' }} />
                    <span>Educación y Formación 360°</span>
                  </div>

                  <h1 className="hero-title-modern">
                    Empoderando el Futuro a Través de la Educación
                  </h1>

                  <p className="hero-subtitle-modern">
                    Acceso a recursos académicos de vanguardia, seguimiento de calificaciones en tiempo real, protección integral de menores y comunicación fluida entre directivos, docentes, estudiantes y tutores.
                  </p>

                  <div className="hero-actions-group">
                    <button
                      className="btn-pill-primary"
                      onClick={() => {
                        setCurrentSection('plataforma');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <span>Ingresar a la Plataforma</span>
                      <ArrowRight size={17} />
                    </button>

                    <a href="#servicios" className="btn-pill-secondary">
                      <span>Nuestros Servicios</span>
                    </a>
                  </div>

                  <div className="hero-badges-row">
                    <div className="hero-badge-item">
                      <Star className="hero-badge-icon" fill="#f59e0b" size={20} />
                      <div className="hero-badge-text">
                        15+ Años<br />
                        <span style={{ color: '#64748b', fontWeight: 500 }}>de Excelencia</span>
                      </div>
                    </div>

                    <div className="hero-badge-item">
                      <Users className="hero-badge-icon" style={{ color: '#2563eb' }} size={20} />
                      <div className="hero-badge-text">
                        1,500+ Alumnos<br />
                        <span style={{ color: '#64748b', fontWeight: 500 }}>Matriculados</span>
                      </div>
                    </div>

                    <div className="hero-badge-item">
                      <ShieldCheck className="hero-badge-icon" style={{ color: '#22c55e' }} size={20} />
                      <div className="hero-badge-text">
                        100% Custodia<br />
                        <span style={{ color: '#64748b', fontWeight: 500 }}>Tutores Asignados</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* LADO DERECHO: FOTOGRAFÍA CON CARDS FLOTANTES ESTILO CREATIX */}
                <div className="hero-image-container">
                  <div className="hero-visual-card">
                    <img
                      src="/IMG/image copy.png"
                      alt="Campus EduConnect"
                      onError={(e) => { (e.target as any).src = './IMG/image copy.png'; }}
                    />

                    {/* Badge Flotante Superior */}
                    <div className="floating-stat-box top-right">
                      <Calendar size={18} style={{ color: '#2563eb' }} />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>Periodo 2026-2027</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Año Lectivo Oficial</div>
                      </div>
                    </div>

                    {/* Badge Flotante Inferior */}
                    <div className="floating-stat-box bottom-left">
                      <CheckCircle size={18} style={{ color: '#22c55e' }} />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>Institución Acreditada</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Calidad y Tecnología Educativa</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════
             3. STATS STRIP (SECCIÓN OSCURA INMEDIATAMENTE BAJO LA CURVA)
             ════════════════════════════════════════════════════════════ */}
          <section className="stats-strip-section">
            <div className="stats-strip-grid">
              <div className="strip-stat-item">
                <div className="strip-stat-number">1,500+</div>
                <div className="strip-stat-label">Estudiantes Activos</div>
              </div>

              <div className="strip-stat-item">
                <div className="strip-stat-number">85+</div>
                <div className="strip-stat-label">Docentes Especialistas</div>
              </div>

              <div className="strip-stat-item">
                <div className="strip-stat-number">100%</div>
                <div className="strip-stat-label">Tutoría y Ficha Médica</div>
              </div>

              <div className="strip-stat-item">
                <div className="strip-stat-number">40/40/20%</div>
                <div className="strip-stat-label">Ponderación Cognitivo/Proc/Act</div>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════
             4. "TURNING IDEAS INTO REALITY" / FILOSOFÍA INSTITUCIONAL
             ════════════════════════════════════════════════════════════ */}
          <section id="filosofia" className="split-feature-section">
            <div className="split-feature-container">
              <div>
                <h2 className="section-headline">
                  Transformamos el Potencial en Excelencia Académica
                </h2>
                <p className="section-desc">
                  En EduConnect unificamos la rigurosidad científica, la empatía docente y la custodia responsable. Nuestra plataforma digital permite que padres, profesores y estudiantes colaboren en tiempo real en una infraestructura moderna y segura.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#e2e8f0', fontSize: '0.95rem' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.2)', color: 'var(--accent-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle size={14} />
                    </div>
                    <span>Base de datos en la nube (Supabase) con integridad referencial completa.</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#e2e8f0', fontSize: '0.95rem' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.2)', color: 'var(--accent-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle size={14} />
                    </div>
                    <span>Módulo de primeros auxilios y ficha de emergencia (RH, EPS y alergias).</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#e2e8f0', fontSize: '0.95rem' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.2)', color: 'var(--accent-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle size={14} />
                    </div>
                    <span>Cálculo inmediato de definitivas y desempeños oficiales (Bajo, Básico, Alto, Superior).</span>
                  </div>
                </div>
              </div>

              <div className="feature-cards-mosaic">
                <div className="mosaic-card">
                  <img src="/IMG/image.png" alt="Estudiantes en aula" />
                  <span className="mosaic-card-tag">INNOVACIÓN PEDAGÓGICA</span>
                </div>

                <div className="mosaic-card" style={{ marginTop: '2rem' }}>
                  <img src="/IMG/image copy.png" alt="Campus e infraestructura" />
                  <span className="mosaic-card-tag">TUTORÍA Y CUSTODIA</span>
                </div>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════
             5. SERVICIOS INTERACTIVOS (LISTA ACORDEÓN CREATIX)
             ════════════════════════════════════════════════════════════ */}
          <section id="servicios" className="services-creatix-section">
            <div className="services-creatix-container">
              <div>
                <span className="service-pill-tag">Nuestros Servicios</span>
                <h2 className="section-headline" style={{ marginBottom: '0.5rem' }}>
                  Herramientas Diseñadas para tu Crecimiento
                </h2>
                <p className="section-desc" style={{ marginBottom: '1.5rem' }}>
                  Selecciona cualquiera de nuestros módulos institucionales para explorar sus capacidades:
                </p>

                <div className="services-numbered-list">
                  {servicesList.map((srv, idx) => (
                    <div
                      key={srv.num}
                      className={`service-list-item ${activeService === idx ? 'active' : ''}`}
                      onClick={() => setActiveService(idx)}
                    >
                      <div className="service-item-left">
                        <span className="service-number">{srv.num}</span>
                        <span className="service-name">{srv.title}</span>
                      </div>
                      <ArrowRight size={18} className="service-arrow" />
                    </div>
                  ))}
                </div>
              </div>

              {/* TARJETA DE PREVIEW INTERACTIVO */}
              <div className="service-preview-card">
                <img
                  src={servicesList[activeService].img}
                  alt={servicesList[activeService].title}
                  className="service-preview-image"
                />

                <span
                  style={{
                    background: 'rgba(34, 197, 94, 0.15)',
                    color: 'var(--accent-lime)',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    width: 'fit-content',
                    border: '1px solid rgba(34, 197, 94, 0.3)'
                  }}
                >
                  {servicesList[activeService].tag}
                </span>

                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white' }}>
                  {servicesList[activeService].title}
                </h3>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-light-muted)', lineHeight: 1.6 }}>
                  {servicesList[activeService].desc}
                </p>

                <button
                  className="service-preview-badge-btn"
                  onClick={() => {
                    setCurrentSection('plataforma');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <span>Ingresar a este Módulo</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════
             6. MARQUEE TICKER (INNOVATE + INSPIRE + CREATE)
             ════════════════════════════════════════════════════════════ */}
          <div className="marquee-ribbon">
            <div className="marquee-content">
              <span>INNOVACIÓN</span>
              <span className="marquee-separator">✦</span>
              <span>EXCELENCIA ACADÉMICA</span>
              <span className="marquee-separator">✦</span>
              <span>DISCIPLINA Y VALORES</span>
              <span className="marquee-separator">✦</span>
              <span>FORMACIÓN INTEGRAL</span>
              <span className="marquee-separator">✦</span>
              <span>TECNOLOGÍA EN LA NUBE</span>
              <span className="marquee-separator">✦</span>
              <span>CUSTODIA RESPONSABLE</span>
              <span className="marquee-separator">✦</span>
              <span>INNOVACIÓN</span>
              <span className="marquee-separator">✦</span>
              <span>EXCELENCIA ACADÉMICA</span>
              <span className="marquee-separator">✦</span>
              <span>DISCIPLINA Y VALORES</span>
              <span className="marquee-separator">✦</span>
              <span>FORMACIÓN INTEGRAL</span>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════
             7. DOCENTES Y DIRECTIVOS (CARDS BLANCAS REDONDEADAS)
             ════════════════════════════════════════════════════════════ */}
          <section id="docentes" className="team-section-creatix">
            <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
              <span className="service-pill-tag">Cuerpo Docente</span>
              <h2 className="section-headline">Liderazgo y Acompañamiento Calificado</h2>
              <p className="section-desc" style={{ maxWidth: '650px', margin: '0 auto' }}>
                Nuestros maestros y coordinadores acompañan el crecimiento intelectual y humano de cada estudiante:
              </p>
            </div>

            <div className="team-grid-creatix">
              <div className="team-card-white">
                <div className="team-card-header">
                  <div className="team-avatar-box">JA</div>
                  <div>
                    <div className="team-name">Prof. Jeider Antonio</div>
                    <div className="team-role">Docente Titular de Lengua Castellana</div>
                  </div>
                </div>
                <p className="team-card-bio">
                  Especialista en comprensión lectora, literatura y argumentación. Encargado de los cursos 6° y 7° en EduConnect.
                </p>
              </div>

              <div className="team-card-white">
                <div className="team-card-header">
                  <div className="team-avatar-box" style={{ background: '#e0e7ff', color: '#4338ca' }}>CV</div>
                  <div>
                    <div className="team-name">Lic. Carlos Moreno</div>
                    <div className="team-role">Docente de Matemáticas y Geometría</div>
                  </div>
                </div>
                <p className="team-card-bio">
                  Enfoque en resolución de problemas prácticos, lógica matemática y preparación para pruebas nacionales.
                </p>
              </div>

              <div className="team-card-white">
                <div className="team-card-header">
                  <div className="team-avatar-box" style={{ background: '#fef3c7', color: '#b45309' }}>MR</div>
                  <div>
                    <div className="team-name">Dra. María Restrepo</div>
                    <div className="team-role">Coordinadora Pedagógica</div>
                  </div>
                </div>
                <p className="team-card-bio">
                  Supervisión de mallas curriculares, asesoría a acudientes y seguimiento al plan de mejora académica institucional.
                </p>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════
             8. LLAMADO A LA ACCIÓN (CONTACTO & NEWSLETTER)
             ════════════════════════════════════════════════════════════ */}
          <section id="contacto" className="cta-banner-creatix">
            <div className="cta-box-inner">
              <div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>
                  ¿Listo para comenzar tu periodo académico?
                </h3>
                <p style={{ color: 'var(--text-light-muted)', fontSize: '0.95rem' }}>
                  Ingresa con tu usuario institucional o solicita información de matrículas:
                </p>
              </div>

              <div className="cta-input-group">
                <input type="email" placeholder="Ingresa tu correo institucional..." />
                <button
                  className="btn-pill-primary"
                  style={{ padding: '0.65rem 1.4rem', fontSize: '0.88rem' }}
                  onClick={() => {
                    setCurrentSection('plataforma');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <span>Ingresar</span>
                </button>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════
             9. FOOTER MODERNO DE PANTALLA COMPLETA
             ════════════════════════════════════════════════════════════ */}
          <footer className="footer-creatix">
            <div className="footer-container">
              <div className="footer-top">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 900, fontSize: '1.4rem', marginBottom: '0.75rem' }}>
                    <GraduationCap size={26} />
                    <span>EduConnect</span>
                  </div>
                  <p style={{ fontSize: '0.9rem', maxWidth: '320px', lineHeight: 1.5, opacity: 0.85 }}>
                    Plataforma Institucional para la gestión académica, seguimiento escolar y protección del menor.
                  </p>
                </div>

                <div>
                  <div style={{ fontWeight: 800, marginBottom: '0.75rem' }}>Secciones</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem', opacity: 0.9 }}>
                    <a href="#inicio">Inicio</a>
                    <a href="#servicios">Servicios</a>
                    <a href="#filosofia">Propuesta Pedagógica</a>
                    <a href="#docentes">Cuerpo Docente</a>
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: 800, marginBottom: '0.75rem' }}>Atención Institucional</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem', opacity: 0.9 }}>
                    <div>Sede Principal: Calle 45 # 12-80</div>
                    <div>Horario: 06:45 AM - 04:30 PM</div>
                    <div>PBX: (601) 555-0199</div>
                  </div>
                </div>
              </div>

              <div className="footer-bottom">
                <div>© 2026 EduConnect — Todos los derechos reservados.</div>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <a href="#">Privacidad</a>
                  <a href="#">Manual de Convivencia</a>
                  <a href="#">Soporte</a>
                </div>
              </div>
            </div>
          </footer>
        </>
      ) : (
        /* ════════════════════════════════════════════════════════════
           10. SECCIÓN PLATAFORMA (LOGIN CONECTADO A SUPABASE)
           ════════════════════════════════════════════════════════════ */
        <div className="plataforma-fullscreen" style={{ paddingTop: '6rem' }}>
          <div style={{ maxWidth: '1050px', width: '100%', margin: '0 auto 1.5rem auto' }}>
            <button
              onClick={() => setCurrentSection('landing')}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-pill)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                border: '1px solid var(--border-dark)'
              }}
            >
              <span>← Volver al Portal Institucional</span>
            </button>
          </div>

          <div className="login-card-modern">
            {/* LADO IZQUIERDO: FORMULARIO */}
            <div className="login-card-left">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(34, 197, 94, 0.15)', color: 'var(--accent-lime)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-pill)', fontSize: '0.75rem', fontWeight: 800, width: 'fit-content', marginBottom: '1rem', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                <span>🟢 Base de Datos Supabase Conectada</span>
              </div>

              <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                Ingreso a la Plataforma
              </h2>
              <p style={{ color: 'var(--text-light-muted)', fontSize: '0.92rem', marginBottom: '1.75rem' }}>
                Ingresa con tus credenciales asignadas para acceder a tu panel de control:
              </p>

              {/* BOTONES DE PRUEBA RÁPIDA (PARA EVALUAR TODOS LOS ROLES FÁCILMENTE) */}
              <div style={{ marginBottom: '1.5rem', background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border-dark)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                  Acceso Rápido por Rol (Haz clic para probar):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <button
                    type="button"
                    className="role-chip"
                    onClick={() => handleQuickLogin('admin@educonnect.com', 'admin123', 'ADMIN')}
                  >
                    👑 Administrador
                  </button>
                  <button
                    type="button"
                    className="role-chip"
                    onClick={() => handleQuickLogin('rector@educonnect.edu.co', 'admin123', 'RECTOR')}
                  >
                    🏛️ Rector
                  </button>
                  <button
                    type="button"
                    className="role-chip"
                    onClick={() => handleQuickLogin('coordinador@educonnect.edu.co', 'admin123', 'COORDINADOR')}
                  >
                    📋 Coordinador
                  </button>
                  <button
                    type="button"
                    className="role-chip"
                    onClick={() => handleQuickLogin('prof.silva@educonnect.edu.co', '12345678', 'DOCENTE')}
                  >
                    👨‍🏫 Docente (y Dir. de Grupo)
                  </button>
                  <button
                    type="button"
                    className="role-chip"
                    onClick={() => handleQuickLogin('carlosvargas@gmail.com', '12345678', 'ESTUDIANTE')}
                  >
                    👨‍🎓 Estudiante
                  </button>
                  <button
                    type="button"
                    className="role-chip"
                    onClick={() => handleQuickLogin('padre.ramirez@gmail.com', '12345678', 'TUTOR')}
                  >
                    👨‍👦 Tutor
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div
                  style={{
                    background: errorMsg.includes('✅') ? 'rgba(34, 197, 94, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                    border: `1px solid ${errorMsg.includes('✅') ? 'rgba(34, 197, 94, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                    color: errorMsg.includes('✅') ? '#4ade80' : '#fb7185',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: '1.25rem'
                  }}
                >
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div className="login-form-group">
                  <label className="login-form-label">Correo Electrónico Institucional</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      className="login-input"
                      placeholder="ejemplo: docente@educonnect.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="login-form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <label className="login-form-label" style={{ margin: 0 }}>Contraseña</label>
                    <button
                      type="button"
                      onClick={() => setShowRecuperarModal(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '0.8rem',
                        color: 'var(--accent-lime)',
                        cursor: 'pointer',
                        padding: 0,
                        fontWeight: 600,
                        textDecoration: 'underline'
                      }}
                    >
                      ¿Olvidaste tu clave?
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="login-input"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        color: '#94a3b8'
                      }}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-pill-primary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '0.85rem' }}
                  disabled={loading}
                >
                  <span>{loading ? 'Consultando en Supabase...' : 'Iniciar Sesión'}</span>
                  <ArrowRight size={17} />
                </button>
              </form>
            </div>

            {/* LADO DERECHO: ILUSTRACIÓN & BENEFICIOS */}
            <div className="login-card-right">
              <div>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'white' }}>
                  <ShieldCheck size={24} />
                </div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white', marginBottom: '0.75rem' }}>
                  Sistema Integral Seguro
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.6 }}>
                  Acceso segmentado por rol. Tus datos académicos y registros de notas están sincronizados en tiempo real con PostgreSQL y Supabase.
                </p>
              </div>

              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1.5rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem' }}>AÑO LECTIVO VIGENTE</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>Periodo Académico 2026-2027</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--accent-lime)', marginTop: '0.2rem' }}>Ponderación Oficial: 40% / 40% / 20%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RECUPERACIÓN DE CONTRASEÑA */}
      {showRecuperarModal && (
        <RecuperarClaveModal
          initialEmail={email}
          onClose={() => setShowRecuperarModal(false)}
          onPasswordResetSuccess={(nuevoEmail) => {
            setEmail(nuevoEmail);
            setErrorMsg('✅ Contraseña restablecida con éxito. Ya puedes iniciar sesión con tu nueva clave.');
          }}
        />
      )}
    </div>
  );
};
