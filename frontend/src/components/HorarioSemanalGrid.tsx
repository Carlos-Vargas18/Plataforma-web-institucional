import React from 'react';
import { HorarioClase } from '../types';
import { Clock, Plus, Trash2, MapPin, User } from 'lucide-react';

interface HorarioSemanalGridProps {
  horarios: HorarioClase[];
  onAgregarBloque?: (dia: string, horaInicio: string, horaFin: string) => void;
  onEliminarBloque?: (id: number) => void;
  readOnly?: boolean;
}

const DIAS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'] as const;

interface Franja {
  inicio: string;
  fin: string;
  label: string;
  esDescanso?: boolean;
}

const FRANJAS: Franja[] = [
  { inicio: '07:00', fin: '08:30', label: '07:00 - 08:30' },
  { inicio: '08:30', fin: '10:00', label: '08:30 - 10:00' },
  { inicio: '10:00', fin: '10:30', label: '10:00 - 10:30', esDescanso: true },
  { inicio: '10:30', fin: '12:00', label: '10:30 - 12:00' },
  { inicio: '12:00', fin: '13:30', label: '12:00 - 13:30' },
];

// Asignar colores consistentes por materia
const getColorForMateria = (materia: string) => {
  const m = materia.toLowerCase();
  if (m.includes('matemática') || m.includes('álgebra') || m.includes('geometría')) return { bg: 'rgba(37, 99, 235, 0.15)', border: 'rgba(59, 130, 246, 0.4)', text: '#60a5fa' };
  if (m.includes('lengua') || m.includes('español') || m.includes('literatura')) return { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', text: '#34d399' };
  if (m.includes('ciencia') || m.includes('natural') || m.includes('biología') || m.includes('química')) return { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', text: '#fbbf24' };
  if (m.includes('social') || m.includes('historia')) return { bg: 'rgba(236, 72, 153, 0.15)', border: 'rgba(236, 72, 153, 0.4)', text: '#f472b6' };
  if (m.includes('inglés') || m.includes('idioma')) return { bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.4)', text: '#22d3ee' };
  if (m.includes('física') || m.includes('deporte')) return { bg: 'rgba(139, 92, 246, 0.15)', border: 'rgba(139, 92, 246, 0.4)', text: '#a78bfa' };
  if (m.includes('tecnología') || m.includes('informática')) return { bg: 'rgba(20, 184, 166, 0.15)', border: 'rgba(20, 184, 166, 0.4)', text: '#2dd4bf' };
  if (m.includes('arte') || m.includes('artística')) return { bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.4)', text: '#fb923c' };
  if (m.includes('dirección') || m.includes('ética')) return { bg: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.4)', text: '#818cf8' };
  return { bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.35)', text: '#38bdf8' };
};

export const HorarioSemanalGrid: React.FC<HorarioSemanalGridProps> = ({
  horarios,
  onAgregarBloque,
  onEliminarBloque,
  readOnly = false,
}) => {
  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <div style={{ minWidth: '850px', background: '#0b1322', borderRadius: '16px', border: '1px solid var(--border-dark)', overflow: 'hidden' }}>
        {/* ENCABEZADO DE DÍAS (COLUMNAS) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '130px repeat(5, 1fr)',
            background: '#060B14',
            borderBottom: '1px solid var(--border-dark)',
            textAlign: 'center',
            fontWeight: 700,
            fontSize: '0.88rem',
            color: '#cbd5e1',
          }}
        >
          <div style={{ padding: '1rem', borderRight: '1px solid var(--border-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#94a3b8' }}>
            <Clock size={16} />
            <span>HORARIO</span>
          </div>
          {DIAS.map((dia) => (
            <div
              key={dia}
              style={{
                padding: '1rem',
                borderRight: '1px solid var(--border-dark)',
                color: dia === 'LUNES' ? '#60a5fa' : dia === 'VIERNES' ? '#38bdf8' : '#e2e8f0',
                letterSpacing: '0.04em',
              }}
            >
              {dia}
            </div>
          ))}
        </div>

        {/* FILAS DE HORAS Y RECUADROS */}
        {FRANJAS.map((franja, idx) => {
          if (franja.esDescanso) {
            return (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '130px 1fr',
                  background: 'rgba(245, 158, 11, 0.05)',
                  borderBottom: '1px solid var(--border-dark)',
                  padding: '0.65rem 0',
                }}
              >
                <div style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', borderRight: '1px solid var(--border-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {franja.label}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.06em' }}>
                  ☕ RECESO ESCOLAR Y DESCANSO PEDAGÓGICO (30 MIN)
                </div>
              </div>
            );
          }

          return (
            <div
              key={idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '130px repeat(5, 1fr)',
                borderBottom: idx < FRANJAS.length - 1 ? '1px solid var(--border-dark)' : 'none',
                minHeight: '115px',
              }}
            >
              {/* COLUMNA HORA */}
              <div
                style={{
                  padding: '0.75rem',
                  borderRight: '1px solid var(--border-dark)',
                  background: 'rgba(255, 255, 255, 0.01)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.2rem',
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8' }}>{franja.inicio}</span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>a</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#94a3b8' }}>{franja.fin}</span>
              </div>

              {/* CELDAS POR CADA DÍA (RECUADROS) */}
              {DIAS.map((dia) => {
                const clase = horarios.find(
                  (h) => h.diaSemana === dia && h.horaInicio === franja.inicio
                );

                const colors = clase ? getColorForMateria(clase.materiaNombre) : null;

                return (
                  <div
                    key={dia}
                    style={{
                      padding: '0.5rem',
                      borderRight: '1px solid var(--border-dark)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      background: clase ? 'rgba(255, 255, 255, 0.01)' : 'transparent',
                    }}
                  >
                    {clase ? (
                      /* RECUADRO DE CLASE CON ESTILO INSTITUCIONAL */
                      <div
                        style={{
                          background: colors?.bg,
                          border: `1px solid ${colors?.border}`,
                          borderRadius: '12px',
                          padding: '0.65rem 0.75rem',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          position: 'relative',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          transition: 'transform 0.2s',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span
                              style={{
                                fontSize: '0.85rem',
                                fontWeight: 800,
                                color: colors?.text,
                                lineHeight: 1.25,
                                marginBottom: '0.25rem',
                              }}
                            >
                              {clase.materiaNombre}
                            </span>
                            {!readOnly && onEliminarBloque && (
                              <button
                                onClick={() => onEliminarBloque(clase.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  padding: '2px',
                                  marginLeft: '4px',
                                  opacity: 0.7,
                                  transition: 'opacity 0.2s',
                                }}
                                title="Eliminar clase"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>

                          <div style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                            <User size={11} style={{ color: '#94a3b8' }} />
                            <span>{clase.docenteNombre}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem', paddingTop: '0.35rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <MapPin size={11} /> {clase.aula}
                          </span>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              background: 'rgba(255, 255, 255, 0.1)',
                              color: 'white',
                              padding: '1px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            {clase.grupoNombre}
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* ESPACIO VACÍO / LIBRE */
                      <div
                        style={{
                          height: '100%',
                          minHeight: '80px',
                          border: '1px dashed rgba(255, 255, 255, 0.08)',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#475569',
                          fontSize: '0.75rem',
                        }}
                      >
                        {!readOnly && onAgregarBloque ? (
                          <button
                            onClick={() => onAgregarBloque(dia, franja.inicio, franja.fin)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#64748b',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.75rem',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#38bdf8';
                              e.currentTarget.style.background = 'rgba(56, 189, 248, 0.08)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = '#64748b';
                              e.currentTarget.style.background = 'none';
                            }}
                          >
                            <Plus size={13} />
                            <span>Asignar</span>
                          </button>
                        ) : (
                          <span>Libre</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
