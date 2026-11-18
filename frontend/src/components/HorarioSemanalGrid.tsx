import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User, Plus, Trash2, Printer } from 'lucide-react';
import { HorarioBloqueDto } from '../types';

interface HorarioSemanalGridProps {
  bloques: HorarioBloqueDto[];
  titulo?: string;
  subtitulo?: string;
  editable?: boolean;
  onAddBloque?: (nuevo: {
    grupo: string;
    dia: string;
    hora: string;
    materia: string;
    docente: string;
    aula: string;
  }) => Promise<void> | void;
  onDeleteBloque?: (id: number) => Promise<void> | void;
  gruposDisponibles?: string[];
  materiasDisponibles?: string[];
  docentesDisponibles?: string[];
}

const DIAS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];
const FRANJAS = [
  '07:00 - 08:00',
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 10:30 (DESCANSO)',
  '10:30 - 11:30',
  '11:30 - 12:30',
  '12:30 - 13:30',
];

const HorarioSemanalGrid: React.FC<HorarioSemanalGridProps> = ({
  bloques,
  titulo = 'Horario Semanal Oficial',
  subtitulo = 'Programación académica validada sin colisiones en PostgreSQL',
  editable = false,
  onAddBloque,
  onDeleteBloque,
  gruposDisponibles = ['10-A', '10-B', '11-A'],
  materiasDisponibles = ['Cálculo y Trigonometría', 'Física Mecánica', 'Química Inorgánica', 'Ingeniería de Software y Algoritmos'],
  docentesDisponibles = ['Roberto Arturo Silva Pineda', 'Elena Marcela Gómez Castro'],
}) => {
  const [filtroGrupo, setFiltroGrupo] = useState<string>('TODOS');
  const [nuevoGrupo, setNuevoGrupo] = useState<string>(gruposDisponibles[0] || '10-A');
  const [nuevoDia, setNuevoDia] = useState<string>('LUNES');
  const [nuevaHora, setNuevaHora] = useState<string>('07:00 - 08:00');
  const [nuevaMateria, setNuevaMateria] = useState<string>(materiasDisponibles[0] || 'Cálculo y Trigonometría');
  const [nuevoDocente, setNuevoDocente] = useState<string>(docentesDisponibles[0] || 'Roberto Arturo Silva Pineda');
  const [nuevaAula, setNuevaAula] = useState<string>('Aula 201');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const bloquesFiltrados = bloques.filter((b) =>
    filtroGrupo === 'TODOS' ? true : b.grupo === filtroGrupo
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddBloque) return;
    setErrorMsg('');
    setSubmitting(true);
    try {
      await onAddBloque({
        grupo: nuevoGrupo,
        dia: nuevoDia,
        hora: nuevaHora,
        materia: nuevaMateria,
        docente: nuevoDocente,
        aula: nuevaAula,
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al asignar el bloque horario.');
    } finally {
      setSubmitting(false);
    }
  };

  const encontrarBloquesEnCelda = (dia: string, franja: string) => {
    const horaInicioFranja = franja.substring(0, 5);
    return bloquesFiltrados.filter((b) => {
      const diaNorm = (b.dia || b.diaSemana || '').toUpperCase().replace('É', 'E');
      const hIni = (b.horaInicio || b.hora || '').substring(0, 5);
      return diaNorm === dia && hIni === horaInicioFranja;
    });
  };

  return (
    <div className="panel-card">
      <div className="panel-header">
        <div>
          <h3>
            <Calendar size={18} style={{ color: 'var(--ec-primary)' }} />
            {titulo}
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: 'var(--ec-text-muted)' }}>{subtitulo}</p>
        </div>
        <div className="no-print" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={filtroGrupo}
            onChange={(e) => setFiltroGrupo(e.target.value)}
            className="form-input"
            style={{ width: 'auto', minWidth: '170px' }}
            aria-label="Filtrar horario por grupo"
          >
            <option value="TODOS">Todos los Grupos</option>
            {gruposDisponibles.map((g) => (
              <option key={g} value={g}>
                Grupo {g}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => window.print()} className="btn-primary-action">
            <Printer size={15} />
            Imprimir Horario
          </button>
        </div>
      </div>

      {editable && onAddBloque && (
        <form
          onSubmit={handleSubmit}
          className="no-print"
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--ec-border)',
            background: 'var(--ec-surface-low)',
          }}
        >
          {errorMsg && (
            <div
              style={{
                background: 'var(--ec-danger-bg)',
                border: '1px solid var(--ec-danger-border)',
                color: 'var(--ec-danger)',
                padding: '0.65rem 1rem',
                borderRadius: '10px',
                marginBottom: '1rem',
                fontSize: '0.84rem',
                fontWeight: 600,
              }}
            >
              {errorMsg}
            </div>
          )}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '0.75rem',
              alignItems: 'end',
            }}
          >
            <div>
              <label className="form-label">Grupo</label>
              <select value={nuevoGrupo} onChange={(e) => setNuevoGrupo(e.target.value)} className="form-input">
                {gruposDisponibles.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Día</label>
              <select value={nuevoDia} onChange={(e) => setNuevoDia(e.target.value)} className="form-input">
                {DIAS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Franja Horaria</label>
              <select value={nuevaHora} onChange={(e) => setNuevaHora(e.target.value)} className="form-input">
                {FRANJAS.filter((f) => !f.includes('DESCANSO')).map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Asignatura</label>
              <select value={nuevaMateria} onChange={(e) => setNuevaMateria(e.target.value)} className="form-input">
                {materiasDisponibles.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Docente</label>
              <select value={nuevoDocente} onChange={(e) => setNuevoDocente(e.target.value)} className="form-input">
                {docentesDisponibles.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Salón / Aula</label>
              <input
                type="text"
                value={nuevaAula}
                onChange={(e) => setNuevaAula(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary-action" style={{ justifyContent: 'center' }}>
              <Plus size={16} />
              {submitting ? 'Guardando...' : 'Asignar Bloque'}
            </button>
          </div>
        </form>
      )}

      <div className="ec-table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '140px' }}>
                <Clock size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                Hora
              </th>
              {DIAS.map((dia) => (
                <th key={dia}>{dia}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FRANJAS.map((franja) => {
              if (franja.includes('DESCANSO')) {
                return (
                  <tr key={franja}>
                    <td style={{ fontWeight: 700, color: 'var(--ec-warning)', background: 'var(--ec-warning-bg)' }}>10:00 - 10:30</td>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: 'center',
                        background: 'var(--ec-warning-bg)',
                        color: 'var(--ec-warning)',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        fontSize: '0.78rem',
                      }}
                    >
                      RECESO ACADÉMICO INSTITUCIONAL
                    </td>
                  </tr>
                );
              }
              return (
                <tr key={franja}>
                  <td style={{ fontWeight: 700, color: 'var(--ec-text-muted)', whiteSpace: 'nowrap', background: 'var(--ec-surface-low)' }}>{franja}</td>
                  {DIAS.map((dia) => {
                    const items = encontrarBloquesEnCelda(dia, franja);
                    return (
                      <td key={dia} style={{ verticalAlign: 'top', minWidth: '175px' }}>
                        {items.length === 0 ? (
                          <span style={{ color: 'var(--ec-text-subtle)', fontSize: '0.78rem' }}>—</span>
                        ) : (
                          items.map((item) => (
                            <div
                              key={item.id}
                              style={{
                                background: 'var(--ec-primary-soft)',
                                border: '1px solid var(--ec-primary-border)',
                                borderRadius: '10px',
                                padding: '0.55rem 0.7rem',
                                marginBottom: '0.4rem',
                                position: 'relative',
                              }}
                            >
                              <div style={{ fontWeight: 700, fontSize: '0.83rem', color: 'var(--ec-text)', paddingRight: editable ? '1.2rem' : 0 }}>
                                {item.materia}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--ec-primary-dark)', fontWeight: 700, marginTop: '2px' }}>
                                Grupo: {item.grupo}
                              </div>
                              <div style={{ fontSize: '0.73rem', color: 'var(--ec-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                <User size={12} /> {item.docente}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--ec-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                                <MapPin size={12} /> {item.aula}
                              </div>
                              {editable && onDeleteBloque && (
                                <button
                                  type="button"
                                  onClick={() => onDeleteBloque(item.id)}
                                  className="no-print"
                                  aria-label="Eliminar bloque horario"
                                  style={{
                                    position: 'absolute',
                                    top: '6px',
                                    right: '6px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--ec-danger)',
                                    cursor: 'pointer',
                                  }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HorarioSemanalGrid;
