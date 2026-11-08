import React from 'react';
import { BoletinEstudiante } from '../types';
import { GraduationCap, Printer, X, Award, CheckCircle, AlertTriangle } from 'lucide-react';

interface BoletinOficialModalProps {
  boletin: BoletinEstudiante;
  onClose: () => void;
}

export const BoletinOficialModal: React.FC<BoletinOficialModalProps> = ({ boletin, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '1.5rem',
      }}
    >
      <div
        className="boletin-container-printable"
        style={{
          backgroundColor: '#0f172a',
          border: '1px solid var(--border-dark)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '920px',
          maxHeight: '94vh',
          overflowY: 'auto',
          padding: '2.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          position: 'relative',
        }}
      >
        {/* BOTONES FLOTANTES DE ACCIÓN (NO SE IMPRIMEN) */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={handlePrint}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
              border: 'none',
              color: 'white',
              padding: '0.6rem 1.4rem',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)',
            }}
          >
            <Printer size={18} />
            <span>Imprimir / Guardar en PDF</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--border-dark)',
              color: '#cbd5e1',
              padding: '0.6rem 1rem',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENIDO DEL BOLETÍN OFICIAL CON MEMBRETE INSTITUCIONAL */}
        <div
          id="area-impresion-boletin"
          style={{
            backgroundColor: '#ffffff',
            color: '#0f172a',
            borderRadius: '14px',
            padding: '2rem 2.25rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          }}
        >
          {/* ENCABEZADO INSTITUCIONAL */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: '#0284c7', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GraduationCap size={36} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
                  Institución Educativa Integral EduConnect
                </h2>
                <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                  Aprobación Oficial MEN Resolución N° 0845 de 2018 | Código DANE: 111001099882 | NIT: 890.123.456-7
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Sistema Institucional de Evaluación de los Estudiantes (SIEE — Decreto 1290 de 2009)
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.4rem 0.8rem', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 800, color: '#475569' }}>Periodo Lectivo</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0284c7' }}>PERIODO {boletin.periodo} — {boletin.añoLectivo}</div>
              </div>
            </div>
          </div>

          {/* FICHA TÉCNICA DEL ESTUDIANTE */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem 1.25rem', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Estudiante</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{boletin.estudianteNombre}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Código: <strong>{boletin.codigoEstudiantil}</strong></div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Grado / Curso</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{boletin.grado}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Jornada: Mañana</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Puesto en Salón</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '6px', fontWeight: 800, fontSize: '0.9rem' }}>
                <Award size={14} /> Puesto {boletin.puestoSalon}° / {boletin.totalEstudiantesSalon}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Promedio General</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: boletin.promedioGeneral >= 4.0 ? '#15803d' : '#b91c1c' }}>
                {boletin.promedioGeneral.toFixed(2)}
              </div>
            </div>
          </div>

          {/* TABLA VALORATIVA OFICIAL */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: '#0f172a', color: 'white', textAlign: 'left' }}>
                <th style={{ padding: '8px 10px', border: '1px solid #334155' }}>Área / Asignatura</th>
                <th style={{ padding: '8px 6px', border: '1px solid #334155', textAlign: 'center', width: '55px' }}>Cog (40%)</th>
                <th style={{ padding: '8px 6px', border: '1px solid #334155', textAlign: 'center', width: '55px' }}>Proc (40%)</th>
                <th style={{ padding: '8px 6px', border: '1px solid #334155', textAlign: 'center', width: '55px' }}>Act (20%)</th>
                <th style={{ padding: '8px 8px', border: '1px solid #334155', textAlign: 'center', width: '65px' }}>Definitiva</th>
                <th style={{ padding: '8px 8px', border: '1px solid #334155', textAlign: 'center', width: '80px' }}>Desempeño</th>
                <th style={{ padding: '8px 6px', border: '1px solid #334155', textAlign: 'center', width: '45px' }}>Fallas</th>
                <th style={{ padding: '8px 10px', border: '1px solid #334155' }}>Juicio Valorativo Pedagógico</th>
              </tr>
            </thead>
            <tbody>
              {boletin.materias.map((m, idx) => (
                <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                  <td style={{ padding: '7px 10px', border: '1px solid #cbd5e1', fontWeight: 700, color: '#0f172a' }}>
                    {m.nombre}
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 400 }}>{m.docente}</div>
                  </td>
                  <td style={{ padding: '7px 6px', border: '1px solid #cbd5e1', textAlign: 'center' }}>{m.notaCognitiva.toFixed(1)}</td>
                  <td style={{ padding: '7px 6px', border: '1px solid #cbd5e1', textAlign: 'center' }}>{m.notaProcedimental.toFixed(1)}</td>
                  <td style={{ padding: '7px 6px', border: '1px solid #cbd5e1', textAlign: 'center' }}>{m.notaActitudinal.toFixed(1)}</td>
                  <td style={{ padding: '7px 8px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 800, color: m.definitiva >= 4.0 ? '#15803d' : m.definitiva >= 3.0 ? '#b45309' : '#b91c1c' }}>
                    {m.definitiva.toFixed(2)}
                  </td>
                  <td style={{ padding: '7px 8px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 700, fontSize: '0.75rem' }}>
                    {m.desempeno}
                  </td>
                  <td style={{ padding: '7px 6px', border: '1px solid #cbd5e1', textAlign: 'center', color: m.fallas > 0 ? '#b91c1c' : '#64748b', fontWeight: m.fallas > 0 ? 700 : 400 }}>
                    {m.fallas}
                  </td>
                  <td style={{ padding: '7px 10px', border: '1px solid #cbd5e1', fontSize: '0.75rem', color: '#334155', lineHeight: 1.35 }}>
                    {m.juicioValorativo}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ESCALA NACIONAL DE VALORACIÓN & OBSERVACIONES */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.75rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Escala de Valoración Nacional (Decreto 1290)
              </div>
              <div style={{ fontSize: '0.72rem', color: '#475569', lineHeight: 1.4 }}>
                • <strong>SUPERIOR</strong> (4.6 a 5.0) — Supera con excelencia los logros.<br />
                • <strong>ALTO</strong> (4.0 a 4.5) — Alcanza ampliamente los objetivos.<br />
                • <strong>BÁSICO</strong> (3.0 a 3.9) — Cumplimiento mínimo aprobatorio.<br />
                • <strong>BAJO</strong> (1.0 a 2.9) — Requiere plan de apoyo y nivelación.
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.75rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Observaciones de la Dirección de Grupo y Comité de Evaluación
              </div>
              <p style={{ fontSize: '0.78rem', color: '#1e293b', fontStyle: 'italic', margin: 0, lineHeight: 1.4 }}>
                "{boletin.observacionesDirector}"
              </p>
            </div>
          </div>

          {/* FIRMAS OFICIALES CON SELLO INSTITUCIONAL */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', paddingTop: '1.5rem', borderTop: '1px dashed #cbd5e1', marginTop: '1rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ height: '35px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'cursive', fontSize: '1.1rem', color: '#1e3a8a' }}>Fernando Restrepo G.</span>
              </div>
              <div style={{ borderTop: '1px solid #0f172a', paddingTop: '4px', marginTop: '6px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a' }}>Dr. Fernando Restrepo Gómez</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Rector Institucional</div>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ height: '35px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'cursive', fontSize: '1.1rem', color: '#1e3a8a' }}>Roberto Silva P.</span>
              </div>
              <div style={{ borderTop: '1px solid #0f172a', paddingTop: '4px', marginTop: '6px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a' }}>Prof. Roberto Silva Pineda</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Director de Grupo (6°A)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
