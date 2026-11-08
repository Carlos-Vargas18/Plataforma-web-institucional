import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { emailService } from '../services/emailService';
import { TelemetriaResumen, AnalisisMipaEstudiante } from '../types';
import {
  Activity,
  Globe,
  Smartphone,
  Calendar,
  AlertTriangle,
  Brain,
  ShieldAlert,
  Send,
  RefreshCw,
  TrendingDown,
  UserCheck,
  CheckCircle,
  Clock,
  Sparkles,
  Server,
  CloudUpload,
  ExternalLink
} from 'lucide-react';

export const MipaTelemetriaPanel: React.FC = () => {
  const [telemetria, setTelemetria] = useState<TelemetriaResumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [analizando, setAnalizando] = useState(false);
  const [selectedStudentAnalisis, setSelectedStudentAnalisis] = useState<AnalisisMipaEstudiante | null>(null);
  const [showAnalisisModal, setShowAnalisisModal] = useState(false);
  const [mensajeEnvio, setMensajeEnvio] = useState<string | null>(null);
  const [alumnosAnalizados, setAlumnosAnalizados] = useState<AnalisisMipaEstudiante[]>([]);

  // Estudiantes simulados de prueba para análisis
  const estudiantesMuestra = [
    {
      codigo: 'EST-2026-904',
      nombre: 'Sofía Herrera Gómez',
      grado: '6°A Secundaria',
      dias_inactivo: 7,
      materias: [
        { nombre: 'Matemáticas y Álgebra', nota: 2.1, entregadas: 1, totales: 4 },
        { nombre: 'Física Clásica', nota: 2.3, entregadas: 2, totales: 4 },
        { nombre: 'Lengua Castellana', nota: 3.4, entregadas: 3, totales: 4 },
        { nombre: 'Inglés Comunicativo', nota: 2.8, entregadas: 2, totales: 4 }
      ]
    },
    {
      codigo: 'EST-2026-112',
      nombre: 'Santiago Martínez Rios',
      grado: '6°A Secundaria',
      dias_inactivo: 2,
      materias: [
        { nombre: 'Matemáticas y Álgebra', nota: 3.2, entregadas: 4, totales: 4 },
        { nombre: 'Ciencias Naturales', nota: 3.8, entregadas: 4, totales: 4 },
        { nombre: 'Lengua Castellana', nota: 2.9, entregadas: 2, totales: 4 }
      ]
    },
    {
      codigo: 'EST-2026-305',
      nombre: 'Valentina Castro Muñoz',
      grado: '6°A Secundaria',
      dias_inactivo: 0,
      materias: [
        { nombre: 'Matemáticas y Álgebra', nota: 4.8, entregadas: 4, totales: 4 },
        { nombre: 'Ciencias Naturales', nota: 4.9, entregadas: 4, totales: 4 },
        { nombre: 'Lengua Castellana', nota: 4.7, entregadas: 4, totales: 4 }
      ]
    }
  ];

  const cargarTelemetria = async () => {
    setLoading(true);
    const data = await api.getTelemetriaResumen();
    setTelemetria(data);
    setLoading(false);
  };

  useEffect(() => {
    cargarTelemetria();
    // Ejecutar un análisis inicial para demostración
    ejecutarAnalisisGrupo();
  }, []);

  const ejecutarAnalisisGrupo = async () => {
    setAnalizando(true);
    const resultados: AnalisisMipaEstudiante[] = [];
    for (const est of estudiantesMuestra) {
      const res = await api.analizarEstudianteMIPA(est);
      resultados.push(res);
    }
    setAlumnosAnalizados(resultados);
    setAnalizando(false);
    cargarTelemetria();
  };

  const handleSimularIngreso = async (plataforma: 'web' | 'app') => {
    await api.registrarIngresoTelemetria(
      plataforma,
      'ESTUDIANTE',
      `usuario.${plataforma}@educonnect.com`,
      `Usuario ${plataforma.toUpperCase()}`
    );
    cargarTelemetria();
  };

  const handleDespacharNotificacionAcudiente = async (analisis: AnalisisMipaEstudiante) => {
    setMensajeEnvio('Enviando notificación por correo institucional...');
    try {
      const res = await emailService.enviarCodigoRecuperacion({
        email: 'antoniaguilarvelandia1@gmail.com', // Correo institucional configurado
        nombre: `Acudiente de ${analisis.nombre_estudiante}`,
        codigo: 'ALERTA-MIPA'
      });
      setMensajeEnvio(`✅ Notificación oficial enviada con éxito al acudiente vía Gmail (${res.provider}).`);
    } catch (e: any) {
      setMensajeEnvio(`Error al enviar: ${e.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* ENCABEZADO CON ESTADO DEL SERVIDOR */}
      <div
        className="panel-card"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          padding: '1.5rem',
          borderRadius: '20px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e' }} />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'white' }}>
                Auditoría de Accesos & Agente MIPA (IA)
              </h2>
              <span className="grade-badge superior" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                Python 3.12 / FastAPI
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
              Monitoreo continuo de ingresos a la <strong>Web</strong> y <strong>App Móvil</strong>, y detección temprana de deserción escolar.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleSimularIngreso('web')}
              style={{
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                borderRadius: '10px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Globe size={15} />
              <span>+1 Ingreso Web</span>
            </button>

            <button
              onClick={() => handleSimularIngreso('app')}
              style={{
                background: 'rgba(168, 85, 247, 0.12)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                color: '#c084fc',
                borderRadius: '10px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Smartphone size={15} />
              <span>+1 Ingreso App</span>
            </button>

            <button
              onClick={cargarTelemetria}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--border-dark)',
                color: 'white',
                borderRadius: '10px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
              title="Actualizar datos"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              <span>Actualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* TARJETAS DE CONTADORES EN TIEMPO REAL */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
        {/* TOTAL INGRESOS GLOBALES */}
        <div className="stat-card" style={{ borderLeft: '4px solid #38bdf8' }}>
          <div className="stat-icon blue"><Activity size={24} /></div>
          <div>
            <div className="stat-number">{telemetria?.total_ingresos || 0}</div>
            <div className="stat-label">Total Ingresos Registrados</div>
          </div>
        </div>

        {/* INGRESOS WEB */}
        <div className="stat-card" style={{ borderLeft: '4px solid #0284c7' }}>
          <div className="stat-icon blue"><Globe size={24} /></div>
          <div>
            <div className="stat-number">{telemetria?.ingresos_web || 0}</div>
            <div className="stat-label">Ingresos Portal Web</div>
          </div>
        </div>

        {/* INGRESOS APP MÓVIL */}
        <div className="stat-card" style={{ borderLeft: '4px solid #a855f7' }}>
          <div className="stat-icon purple"><Smartphone size={24} /></div>
          <div>
            <div className="stat-number">{telemetria?.ingresos_app || 0}</div>
            <div className="stat-label">Ingresos App Móvil</div>
          </div>
        </div>

        {/* INGRESOS HOY */}
        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="stat-icon green"><Calendar size={24} /></div>
          <div>
            <div className="stat-number">{telemetria?.ingresos_hoy || 0}</div>
            <div className="stat-label">Ingresos Durante Hoy</div>
          </div>
        </div>

        {/* CASOS CRÍTICOS DETECTADOS POR MIPA */}
        <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div className="stat-icon rose"><ShieldAlert size={24} /></div>
          <div>
            <div className="stat-number">{alumnosAnalizados.filter(a => a.nivel_prioridad === 'CRITICA' || a.nivel_prioridad === 'ALTA').length}</div>
            <div className="stat-label">Alertas Académicas MIPA</div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: SEMÁFORO DE RIESGO ACADÉMICO MIPA */}
      <div className="panel-card">
        <div className="panel-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Brain size={22} style={{ color: '#38bdf8' }} />
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>
                Semáforo de Riesgo Académico & Deserción (MIPA)
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Cálculo del <strong>IRA</strong> (50% Calificaciones + 30% Cumplimiento Talleres + 20% Inactividad) + Diagnóstico cualitativo
            </p>
          </div>

          <button
            onClick={ejecutarAnalisisGrupo}
            disabled={analizando}
            className="btn-primary-action"
            style={{ padding: '0.55rem 1.15rem', display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}
          >
            <Sparkles size={16} />
            <span>{analizando ? 'Analizando con IA...' : 'Reevaluar Grupo con MIPA'}</span>
          </button>
        </div>

        <div style={{ overflowX: 'auto', padding: '0 0.5rem 0.5rem' }}>
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Estudiante</th>
                <th>Grado</th>
                <th style={{ textAlign: 'center' }}>Promedio</th>
                <th style={{ textAlign: 'center' }}>Cumplimiento</th>
                <th style={{ textAlign: 'center' }}>Inactividad</th>
                <th style={{ textAlign: 'center' }}>IRA Score</th>
                <th style={{ textAlign: 'center' }}>Prioridad</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {alumnosAnalizados.map((a) => (
                <tr key={a.codigo_estudiante}>
                  <td><code>{a.codigo_estudiante}</code></td>
                  <td style={{ fontWeight: 700, color: '#f8fafc' }}>{a.nombre_estudiante}</td>
                  <td>{a.grado}</td>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>
                    <span style={{ color: a.promedio < 3.0 ? '#ef4444' : a.promedio < 3.8 ? '#f59e0b' : '#22c55e' }}>
                      {a.promedio.toFixed(2)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>{a.cumplimiento_porcentaje}%</td>
                  <td style={{ textAlign: 'center' }}>{a.dias_inactivo} días</td>
                  <td style={{ textAlign: 'center', fontWeight: 800 }}>
                    <span style={{ fontFamily: 'monospace', color: a.ira_score >= 0.4 ? '#ef4444' : '#38bdf8' }}>
                      {a.ira_score.toFixed(4)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span
                      className={`grade-badge ${
                        a.nivel_prioridad === 'CRITICA'
                          ? 'bajo'
                          : a.nivel_prioridad === 'ALTA'
                          ? 'bajo'
                          : a.nivel_prioridad === 'MODERADA'
                          ? 'basico'
                          : 'superior'
                      }`}
                    >
                      {a.nivel_prioridad}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStudentAnalisis(a);
                        setShowAnalisisModal(true);
                        setMensajeEnvio(null);
                      }}
                      style={{
                        background: 'rgba(56, 189, 248, 0.15)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        color: '#38bdf8',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        fontWeight: 700
                      }}
                    >
                      Ver Diagnóstico
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECCIÓN 3: BITÁCORA DE ÚLTIMOS INGRESOS AUDITADOS */}
      <div className="panel-card">
        <div className="panel-header">
          <div>
            <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Últimos Accesos Auditados (Web / Móvil)</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Registro cronológico de sesiones autenticadas en tiempo real</p>
          </div>
          <span className="grade-badge superior">Base de Datos: SQLite / Supabase</span>
        </div>

        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {telemetria?.ultimos_ingresos && telemetria.ultimos_ingresos.length > 0 ? (
            telemetria.ultimos_ingresos.map((ing, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-dark)',
                  padding: '0.65rem 1rem',
                  borderRadius: '10px',
                  fontSize: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span
                    style={{
                      background: ing.plataforma === 'app' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                      color: ing.plataforma === 'app' ? '#c084fc' : '#38bdf8',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '6px',
                      fontWeight: 800,
                      fontSize: '0.72rem'
                    }}
                  >
                    {ing.plataforma.toUpperCase()}
                  </span>
                  <span style={{ fontWeight: 600, color: 'white' }}>{ing.nombre || ing.email}</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>({ing.rol})</span>
                </div>
                <div style={{ color: '#64748b', fontSize: '0.78rem' }}>{ing.timestamp}</div>
              </div>
            ))
          ) : (
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center' }}>No hay registros de telemetría recientes.</p>
          )}
        </div>
      </div>

      {/* MODAL DETALLE DE DIAGNÓSTICO MIPA */}
      {showAnalisisModal && selectedStudentAnalisis && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAnalisisModal(false);
          }}
        >
          <div
            style={{
              background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
              border: '1px solid #334155',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '650px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              color: '#f8fafc',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span
                  className={`grade-badge ${
                    selectedStudentAnalisis.nivel_prioridad === 'CRITICA'
                      ? 'bajo'
                      : selectedStudentAnalisis.nivel_prioridad === 'ALTA'
                      ? 'bajo'
                      : 'basico'
                  }`}
                  style={{ marginBottom: '0.5rem', display: 'inline-block' }}
                >
                  PRIORIDAD: {selectedStudentAnalisis.nivel_prioridad} | RIESGO: {selectedStudentAnalisis.clasificacion_riesgo}
                </span>
                <h3 style={{ fontSize: '1.4rem', margin: '0 0 0.25rem' }}>
                  {selectedStudentAnalisis.nombre_estudiante} ({selectedStudentAnalisis.grado})
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>
                  Código: <code>{selectedStudentAnalisis.codigo_estudiante}</code> | IRA Score: <strong>{selectedStudentAnalisis.ira_score.toFixed(4)}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAnalisisModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: 'none',
                  color: '#94a3b8',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {/* DIAGNÓSTICO TÉCNICO */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid #334155', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Diagnóstico Técnico Pedagógico:
              </div>
              <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                {selectedStudentAnalisis.diagnostico_tecnico}
              </p>
            </div>

            {/* PLAN DE INTERVENCIÓN */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', color: '#f8fafc', marginBottom: '0.5rem' }}>Plan de Intervención Recomendado:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '3px solid #ef4444', padding: '0.5rem 0.75rem', borderRadius: '4px' }}>
                  <strong>Acción Inmediata (48h):</strong> {selectedStudentAnalisis.plan_intervencion.accion_inmediata}
                </div>
                <div style={{ background: 'rgba(56, 189, 248, 0.1)', borderLeft: '3px solid #38bdf8', padding: '0.5rem 0.75rem', borderRadius: '4px' }}>
                  <strong>Ruta Pedagógica:</strong> {selectedStudentAnalisis.plan_intervencion.ruta_apoyo}
                </div>
              </div>
            </div>

            {/* BORRADOR DE NOTIFICACIÓN AL ACUDIENTE */}
            <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px dashed #64748b', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Borrador Institucional para el Acudiente:
              </div>
              <p style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.5, margin: 0 }}>
                "{selectedStudentAnalisis.notificacion_acudiente.mensaje}"
              </p>
            </div>

            {mensajeEnvio && (
              <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', color: '#4ade80', padding: '0.65rem 1rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
                {mensajeEnvio}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowAnalisisModal(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-dark)',
                  color: '#cbd5e1',
                  borderRadius: '10px',
                  padding: '0.55rem 1.1rem',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Cerrar
              </button>

              <button
                type="button"
                className="btn-primary-action"
                onClick={() => handleDespacharNotificacionAcudiente(selectedStudentAnalisis)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.85rem',
                  padding: '0.55rem 1.15rem'
                }}
              >
                <Send size={15} />
                <span>Despachar Citación por Gmail</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

