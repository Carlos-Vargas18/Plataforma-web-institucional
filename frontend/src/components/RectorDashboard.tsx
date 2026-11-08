import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ResolucionRectoral } from '../types';
import {
  Landmark,
  TrendingUp,
  Award,
  Users,
  FileText,
  DollarSign,
  ShieldCheck,
  CheckCircle,
  Plus,
  LogOut,
  Calendar,
  Building,
  School,
  FileCheck,
  Download,
  Activity
} from 'lucide-react';
import { ActaComisionEvaluacion, BoletinEstudiante } from '../types';
import { BoletinOficialModal } from './BoletinOficialModal';
import { MipaTelemetriaPanel } from './MipaTelemetriaPanel';

export const RectorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentTab, setCurrentTab] = useState<'kpis' | 'resoluciones' | 'consejo' | 'comisiones' | 'mipa'>('kpis');
  const [resoluciones, setResoluciones] = useState<ResolucionRectoral[]>([]);
  const [comisiones, setComisiones] = useState<ActaComisionEvaluacion[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [nuevaResModal, setNuevaResModal] = useState(false);
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevaDesc, setNuevaDesc] = useState('');
  const [nuevaCat, setNuevaCat] = useState<'ACADEMICA' | 'ADMINISTRATIVA' | 'DISCIPLINARIA' | 'CONTRATACION'>('ACADEMICA');

  // Boletín Oficial Modal (Decreto 1290)
  const [selectedBoletin, setSelectedBoletin] = useState<BoletinEstudiante | null>(null);
  const [showBoletinModal, setShowBoletinModal] = useState(false);

  useEffect(() => {
    api.getRectorStats().then(setStats);
    api.getResolucionesRectorales().then(setResoluciones);
    api.getComisionesEvaluacion().then(setComisiones);
  }, []);

  const handleExportarSIMAT = async () => {
    const ests = await api.getEstudiantesAdmin();
    api.exportarSIMATCSV(ests);
  };

  const handleVerBoletin = async (codigo: string) => {
    const b = await api.getBoletinEstudiante(codigo, 1);
    setSelectedBoletin(b);
    setShowBoletinModal(true);
  };

  const handleFirmarActa = (id: number) => {
    setComisiones(prev => prev.map(c => c.id === id ? { ...c, firmadoPorRector: true, estado: 'CUMPLIDA' } : c));
  };

  const handleCrearResolucion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoTitulo.trim()) return;

    const nueva: ResolucionRectoral = {
      id: Date.now(),
      numeroResolucion: `RES-00${resoluciones.length + 1}-2026`,
      fecha: new Date().toISOString().split('T')[0],
      titulo: nuevoTitulo,
      descripcion: nuevaDesc,
      estado: 'VIGENTE',
      categoria: nuevaCat
    };

    setResoluciones([nueva, ...resoluciones]);
    setNuevoTitulo('');
    setNuevaDesc('');
    setNuevaResModal(false);
  };

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR RECTORÍA */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="brand-wrapper">
            <div className="brand-icon-box" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' }}>
              <Landmark size={22} />
            </div>
            <div>
              <div className="brand-title" style={{ fontSize: '1.2rem' }}>EduConnect</div>
              <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 700 }}>Rectoría & Gobierno</span>
            </div>
          </div>
        </div>

        <ul className="sidebar-menu">
          <li
            className={`sidebar-item ${currentTab === 'kpis' ? 'active' : ''}`}
            onClick={() => setCurrentTab('kpis')}
          >
            <TrendingUp size={20} />
            <span>Métricas Estratégicas</span>
          </li>
          <li
            className={`sidebar-item ${currentTab === 'resoluciones' ? 'active' : ''}`}
            onClick={() => setCurrentTab('resoluciones')}
          >
            <FileText size={20} />
            <span>Resoluciones Rectorales</span>
          </li>
          <li
            className={`sidebar-item ${currentTab === 'consejo' ? 'active' : ''}`}
            onClick={() => setCurrentTab('consejo')}
          >
            <Building size={20} />
            <span>Consejo Directivo & Presupuesto</span>
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
            <span>Auditoría & Agente MIPA</span>
          </li>
        </ul>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={logout}>
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL RECTORÍA */}
      <main className="dashboard-content">
        <div className="dashboard-topbar">
          <div>
            <h1 style={{ fontSize: '1.85rem', marginBottom: '0.2rem' }}>Despacho de Rectoría</h1>
            <p style={{ color: 'var(--text-light-muted)', fontSize: '0.95rem' }}>
              Rector: <strong>{user?.nombreCompleto || 'Dr. Carlos Alberto Vargas'}</strong> — Plan Institucional de Excelencia 2026-2027
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={handleExportarSIMAT}
              style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#4ade80', padding: '0.55rem 1.15rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer' }}
              title="Descargar archivo oficial estandarizado para reporte SIMAT MEN"
            >
              <Download size={16} /> Exportar SIMAT (MEN)
            </button>

            <div className="user-profile-badge">
              <div className="user-avatar-circle" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white' }}>
                🏛️
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{user?.nombreCompleto || 'Rector Titular'}</div>
                <div style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 800 }}>MÁXIMA AUTORIDAD INSTITUCIONAL</div>
              </div>
            </div>
          </div>
        </div>

        {/* TAB 1: MÉTRICAS ESTRATÉGICAS */}
        {currentTab === 'kpis' && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon indigo"><Users size={24} /></div>
                <div>
                  <div className="stat-number">{stats?.matriculaTotal || '1,540'}</div>
                  <div className="stat-label">Matrícula Total Activa</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon green"><ShieldCheck size={24} /></div>
                <div>
                  <div className="stat-number">{stats?.tasaRetencion || '98.4'}%</div>
                  <div className="stat-label">Tasa de Retención Escolar</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon amber"><Award size={24} /></div>
                <div>
                  <div className="stat-number">{stats?.promedioInstitucional || '4.18'}</div>
                  <div className="stat-label">Promedio General (0-5.0)</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon purple"><CheckCircle size={24} /></div>
                <div>
                  <div className="stat-number">{stats?.cumplimientoPlanillas || '96.2'}%</div>
                  <div className="stat-label">Cumplimiento Docente</div>
                </div>
              </div>
            </div>

            {/* BALANCE POR NIVELES ACADÉMICOS */}
            <div className="panel-card">
              <div className="panel-header">
                <h3>📊 Balance General de Rendimiento por Niveles (Año 2026)</h3>
                <span className="grade-badge superior">Acreditación de Calidad ISO 9001</span>
              </div>
              <div style={{ padding: '1.75rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-dark)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, color: 'white' }}>Preescolar & Transición</span>
                    <span style={{ color: '#4ade80', fontWeight: 800 }}>4.82 / 5.0</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>140 estudiantes • 100% seguimiento a motricidad y fonética.</p>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-dark)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, color: 'white' }}>Primaria (1° a 5°)</span>
                    <span style={{ color: '#60a5fa', fontWeight: 800 }}>4.35 / 5.0</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>620 estudiantes • Enfoque en lectoescritura y matemáticas.</p>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-dark)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, color: 'white' }}>Secundaria (6° a 9°)</span>
                    <span style={{ color: '#fbbf24', fontWeight: 800 }}>3.98 / 5.0</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>510 estudiantes • Refuerzo en ciencias naturales y bilingüismo.</p>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-dark)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, color: 'white' }}>Media Vocacional (10° y 11°)</span>
                    <span style={{ color: '#4ade80', fontWeight: 800 }}>4.42 / 5.0</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>270 estudiantes • Énfasis en preparación para Pruebas Saber 11.</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: RESOLUCIONES RECTORALES */}
        {currentTab === 'resoluciones' && (
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h3>📜 Actos Administrativos & Resoluciones Rectorales</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light-muted)' }}>
                  Documentos legales emitidos por el Despacho de Rectoría con vigencia jurídica institucional.
                </p>
              </div>
              <button
                className="btn-primary-action"
                onClick={() => setNuevaResModal(true)}
              >
                <Plus size={16} />
                <span>Emitir Resolución</span>
              </button>
            </div>

            {nuevaResModal && (
              <form onSubmit={handleCrearResolucion} style={{ padding: '1.5rem', background: 'rgba(37, 99, 235, 0.06)', borderBottom: '1px solid var(--border-dark)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ color: '#60a5fa' }}>Emitir Nueva Resolución Rectoral</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <input
                    type="text"
                    placeholder="Título de la resolución (ej: Convocatoria a Elección de Personero)"
                    className="form-input"
                    value={nuevoTitulo}
                    onChange={(e) => setNuevoTitulo(e.target.value)}
                    required
                  />
                  <select
                    className="form-input"
                    value={nuevaCat}
                    onChange={(e: any) => setNuevaCat(e.target.value)}
                  >
                    <option value="ACADEMICA">Académica</option>
                    <option value="ADMINISTRATIVA">Administrativa</option>
                    <option value="DISCIPLINARIA">Disciplinaria</option>
                    <option value="CONTRATACION">Contratación</option>
                  </select>
                </div>
                <textarea
                  placeholder="Considerandos y resuelve de la resolución..."
                  className="form-input"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  value={nuevaDesc}
                  onChange={(e) => setNuevaDesc(e.target.value)}
                  required
                />
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn-logout" style={{ width: 'auto', padding: '0.5rem 1rem' }} onClick={() => setNuevaResModal(false)}>Cancelar</button>
                  <button type="submit" className="btn-primary-action">Promulgar y Firmar</button>
                </div>
              </form>
            )}

            <table className="data-table">
              <thead>
                <tr>
                  <th>Radicado</th>
                  <th>Fecha de Emisión</th>
                  <th>Título de la Resolución</th>
                  <th>Categoría</th>
                  <th>Estado Jurídico</th>
                </tr>
              </thead>
              <tbody>
                {resoluciones.map((res) => (
                  <tr key={res.id}>
                    <td><code>{res.numeroResolucion}</code></td>
                    <td style={{ color: 'var(--text-light-muted)' }}>{res.fecha}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'white' }}>{res.titulo}</div>
                      <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{res.descripcion}</div>
                    </td>
                    <td>
                      <span className="grade-badge alto">{res.categoria}</span>
                    </td>
                    <td>
                      <span className="grade-badge superior">● {res.estado}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: CONSEJO DIRECTIVO Y FINANZAS */}
        {currentTab === 'consejo' && (
          <div className="panel-card">
            <div className="panel-header">
              <h3>🏛️ Consejo Directivo & Fondo de Servicios Educativos</h3>
              <span className="grade-badge superior">Auditoría Vigente 2026</span>
            </div>

            <div style={{ padding: '1.75rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1.5rem', borderRadius: '18px', border: '1px solid var(--border-dark)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fbbf24', fontWeight: 800, marginBottom: '1rem', fontSize: '1.1rem' }}>
                  <DollarSign size={22} />
                  <span>Presupuesto Institucional FSE</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white', marginBottom: '0.35rem' }}>$485,000,000 COP</div>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
                  Ejecución actual: <strong>78.5%</strong> para laboratorios de robótica, material bibliográfico y plataformas cloud.
                </p>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '78.5%', height: '100%', background: 'var(--accent-lime)' }}></div>
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1.5rem', borderRadius: '18px', border: '1px solid var(--border-dark)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#60a5fa', fontWeight: 800, marginBottom: '1rem', fontSize: '1.1rem' }}>
                  <FileCheck size={22} />
                  <span>Composición del Consejo Directivo</span>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem', color: '#cbd5e1' }}>
                  <li>• <strong>Presidente:</strong> Rector Titular (Dr. Carlos Alberto Vargas)</li>
                  <li>• <strong>Representantes Docentes:</strong> Lic. Roberto Silva & Lic. Elena Gómez</li>
                  <li>• <strong>Representante Padres:</strong> Juan Fernando Ramírez (Consejo de Padres)</li>
                  <li>• <strong>Representante Estudiantil:</strong> Personero Estudiantil 2026</li>
                  <li>• <strong>Sector Productivo:</strong> Delegado Cámara de Comercio</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: COMISIONES DE EVALUACIÓN Y PROMOCIÓN (DECRETO 1290) */}
        {currentTab === 'comisiones' && (
          <div className="panel-card">
            <div className="panel-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', margin: 0 }}>⚖️ Comisiones de Evaluación y Promoción</h3>
                  <span className="grade-badge superior">Presidencia de Rectoría</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Decreto 1290 de 2009 - Art. 11: Refrendación de actas institucionales y acuerdos de nivelación
                </p>
              </div>

              <button
                onClick={handleExportarSIMAT}
                style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#4ade80', padding: '0.55rem 1.15rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer' }}
                title="Descargar archivo oficial estandarizado para reporte SIMAT MEN"
              >
                <Download size={16} /> Exportar SIMAT (MEN)
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>No. Acta</th>
                    <th>Grado / Salón</th>
                    <th>Periodo</th>
                    <th>Casos en Riesgo</th>
                    <th>Acuerdos Pedagógicos y Nivelaciones</th>
                    <th>Firma Coordinación</th>
                    <th>Refrendación Rectoral</th>
                    <th style={{ textAlign: 'center' }}>Boletín de Prueba</th>
                  </tr>
                </thead>
                <tbody>
                  {comisiones.map((c) => (
                    <tr key={c.id}>
                      <td><code>{c.numeroActa || `ACT-COM-00${c.id}`}</code></td>
                      <td style={{ fontWeight: 700 }}>{c.grupoNombre || c.grado}</td>
                      <td>Periodo {c.periodo}</td>
                      <td>
                        <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                          {c.estudiantesEnRiesgo || 1} casos reportados
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', maxWidth: '280px' }}>
                        {c.planMejoramiento || c.acuerdosPedagogicos}
                      </td>
                      <td>
                        <span className="grade-badge superior">✓ Coordinador</span>
                      </td>
                      <td>
                        {c.firmadoPorRector ? (
                          <span className="grade-badge superior">✓ Refrendado por Rector</span>
                        ) : (
                          <button
                            onClick={() => handleFirmarActa(c.id)}
                            className="btn-primary-action"
                            style={{ padding: '5px 12px', fontSize: '0.78rem', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
                          >
                            ✍️ Firmar como Rector
                          </button>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => handleVerBoletin('EST-2026-030')}
                          style={{ background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          title="Ver Boletín Oficial de Calificaciones del Periodo"
                        >
                          <FileText size={13} /> Boletín Oficial
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: AUDITORÍA DE ACCESOS Y SEMÁFORO MIPA */}
        {currentTab === 'mipa' && <MipaTelemetriaPanel />}
      </main>

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
