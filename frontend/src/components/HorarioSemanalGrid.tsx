import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Calendar, Clock, MapPin, User, Plus, Trash2, Printer, AlertTriangle } from 'lucide-react';
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
  gruposInfo?: Array<{ codigoGrupo?: string; nombre?: string; salonAula?: string; salon?: string }>;
  cargas?: Array<{
    materia?: string;
    materiaNombre?: string;
    docente?: string;
    docenteNombre?: string;
    grupo?: string;
    grupoCodigo?: string;
  }>;
}

const DIAS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];
const SUBJECT_TONES = ['blue', 'green', 'amber', 'purple', 'rose', 'cyan'];
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
  materiasDisponibles = ['Cálculo y Trigonometría', 'Física Mecánica', 'Química Inorgánica', 'Tecnología e Informática'],
  docentesDisponibles = ['Roberto Arturo Silva Pineda', 'Elena Marcela Gómez Castro'],
  gruposInfo = [],
  cargas = [],
}) => {
  const formId = useId();
  const savingBlock = useRef(false);
  const [filtroGrupo, setFiltroGrupo] = useState<string>('TODOS');
  const [nuevoGrupo, setNuevoGrupo] = useState<string>(gruposDisponibles[0] || '10-A');
  const [nuevoDia, setNuevoDia] = useState<string>('LUNES');
  const [nuevaHora, setNuevaHora] = useState<string>('07:00 - 08:00');
  const [nuevaMateria, setNuevaMateria] = useState<string>(materiasDisponibles[0] || 'Cálculo y Trigonometría');
  const [nuevoDocente, setNuevoDocente] = useState<string>(docentesDisponibles[0] || 'Roberto Arturo Silva Pineda');
  const [nuevaAula, setNuevaAula] = useState<string>('Aula 201');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const docentesPorMateria = useMemo(() => {
    const matNorm = nuevaMateria.trim().toLowerCase();
    const desdeCargas = cargas
      .filter((c) => ((c.materia || c.materiaNombre || '').trim().toLowerCase() === matNorm))
      .map((c) => (c.docente || c.docenteNombre || '').trim())
      .filter(Boolean);
    const desdeBloques = bloques
      .filter((b) => ((b.materia || '').trim().toLowerCase() === matNorm))
      .map((b) => (b.docente || '').trim())
      .filter(Boolean);
    const unicos = Array.from(new Set([...desdeCargas, ...desdeBloques]));
    return unicos.length > 0 ? unicos : docentesDisponibles;
  }, [nuevaMateria, cargas, bloques, docentesDisponibles]);

  useEffect(() => {
    if (docentesPorMateria.length > 0 && !docentesPorMateria.includes(nuevoDocente)) {
      setNuevoDocente(docentesPorMateria[0]);
    }
  }, [docentesPorMateria, nuevoDocente]);

  const resolverSalonGrupo = useMemo(() => {
    const info = gruposInfo.find((g) => (g.codigoGrupo || g.nombre) === nuevoGrupo);
    if (info && (info.salonAula || info.salon)) {
      return info.salonAula || info.salon || 'Aula 101';
    }
    const bloqueGrupo = bloques.find((b) => b.grupo === nuevoGrupo && b.aula);
    return bloqueGrupo?.aula || '';
  }, [gruposInfo, bloques, nuevoGrupo]);

  useEffect(() => {
    if (resolverSalonGrupo) {
      setNuevaAula(resolverSalonGrupo);
    }
  }, [resolverSalonGrupo]);

  const bloquesFiltrados = bloques.filter((b) =>
    filtroGrupo === 'TODOS' ? true : b.grupo === filtroGrupo
  );

  const conflictosEnVivo = useMemo(() => {
    if (!editable) return [] as string[];
    const horaInicioSel = nuevaHora.substring(0, 5);
    const diaSel = nuevoDia.toUpperCase().replace('É', 'E');
    const aulaNorm = nuevaAula.trim().toLowerCase();
    const docenteNorm = nuevoDocente.trim().toLowerCase();

    const enMismaFranja = bloques.filter((b) => {
      const bDia = (b.dia || b.diaSemana || '').toUpperCase().replace('É', 'E');
      const bHora = (b.horaInicio || b.hora || '').substring(0, 5);
      return bDia === diaSel && bHora === horaInicioSel;
    });

    const alertas: string[] = [];
    const choqueDocente = enMismaFranja.find(
      (b) => (b.docente || '').trim().toLowerCase() === docenteNorm
    );
    if (choqueDocente) {
      alertas.push(
        `El docente ${nuevoDocente} ya tiene esa hora ocupada (${nuevaHora} del ${nuevoDia}) en el grupo ${choqueDocente.grupo} — salón ${choqueDocente.aula} (${choqueDocente.materia}).`
      );
    }

    const choqueGrupo = enMismaFranja.find((b) => b.grupo === nuevoGrupo);
    if (choqueGrupo) {
      alertas.push(
        `El grupo ${nuevoGrupo} ya tiene clase de ${choqueGrupo.materia} con ${choqueGrupo.docente} el ${nuevoDia} (${nuevaHora}) en ${choqueGrupo.aula}.`
      );
    }

    if (aulaNorm) {
      const choqueAula = enMismaFranja.find(
        (b) => (b.aula || '').trim().toLowerCase() === aulaNorm && b.grupo !== nuevoGrupo
      );
      if (choqueAula) {
        alertas.push(
          `El salón "${nuevaAula.trim()}" ya está ocupado el ${nuevoDia} (${nuevaHora}) por el grupo ${choqueAula.grupo} con ${choqueAula.docente}.`
        );
      }
    }

    return alertas;
  }, [editable, bloques, nuevoGrupo, nuevoDia, nuevaHora, nuevoDocente, nuevaAula]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddBloque || savingBlock.current) return;
    savingBlock.current = true;
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
      savingBlock.current = false;
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
          {conflictosEnVivo.length > 0 && (
            <div
              role="alert"
              style={{
                background: 'var(--ec-warning-bg)',
                border: '1px solid var(--ec-warning-border)',
                color: 'var(--ec-warning)',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                marginBottom: '1rem',
                fontSize: '0.84rem',
                fontWeight: 600,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800 }}>
                <AlertTriangle size={16} />
                <span>Alerta de Cruce de Horario Detectado</span>
              </div>
              {conflictosEnVivo.map((alerta, i) => (
                <div key={i} style={{ paddingLeft: '1.45rem' }}>
                  • {alerta}
                </div>
              ))}
            </div>
          )}
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
              <label className="form-label" htmlFor={`${formId}-group`}>Grupo</label>
              <select id={`${formId}-group`} value={nuevoGrupo} onChange={(e) => setNuevoGrupo(e.target.value)} className="form-input">
                {gruposDisponibles.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label" htmlFor={`${formId}-day`}>Día</label>
              <select id={`${formId}-day`} value={nuevoDia} onChange={(e) => setNuevoDia(e.target.value)} className="form-input">
                {DIAS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label" htmlFor={`${formId}-time`}>Franja Horaria</label>
              <select id={`${formId}-time`} value={nuevaHora} onChange={(e) => setNuevaHora(e.target.value)} className="form-input">
                {FRANJAS.filter((f) => !f.includes('DESCANSO')).map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label" htmlFor={`${formId}-subject`}>Asignatura</label>
              <select id={`${formId}-subject`} value={nuevaMateria} onChange={(e) => setNuevaMateria(e.target.value)} className="form-input">
                {materiasDisponibles.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label" htmlFor={`${formId}-teacher`}>Docente</label>
              <select id={`${formId}-teacher`} value={nuevoDocente} onChange={(e) => setNuevoDocente(e.target.value)} className="form-input">
                {docentesPorMateria.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label" htmlFor={`${formId}-room`}>Salón / Aula</label>
              <input
                id={`${formId}-room`}
                type="text"
                maxLength={50}
                value={nuevaAula}
                onChange={(e) => setNuevaAula(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <button type="submit" disabled={submitting || conflictosEnVivo.length > 0} className="btn-primary-action" style={{ justifyContent: 'center' }}>
              <Plus size={16} />
              {submitting ? 'Guardando...' : 'Asignar Bloque'}
            </button>
          </div>
        </form>
      )}

      <div className="ec-table-responsive ec-schedule-table" tabIndex={0} role="region" aria-label={titulo}>
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
                              className="ec-schedule-block"
                              data-subject-id={item.materiaId}
                              data-card-tone={SUBJECT_TONES[item.materiaId % SUBJECT_TONES.length]}
                              data-tone-depth={Math.floor((item.materiaId - 1) / SUBJECT_TONES.length) % 4}
                              style={{
                                borderRadius: '10px',
                                padding: '0.55rem 0.7rem',
                                marginBottom: '0.4rem',
                                position: 'relative',
                              }}
                            >
                              <div style={{ fontWeight: 700, fontSize: '0.83rem', paddingRight: editable ? '1.2rem' : 0 }}>
                                {item.materia}
                              </div>
                              <div className="ec-schedule-time">{item.hora}</div>
                              <div style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '2px' }}>
                                Grupo: {item.grupo}
                              </div>
                              <div style={{ fontSize: '0.73rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                <User size={12} /> {item.docente}
                              </div>
                              <div style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                                <MapPin size={12} /> {item.aula}
                              </div>
                              {editable && onDeleteBloque && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`¿Eliminar el bloque de ${item.materia}?`)) {
                                      void onDeleteBloque(item.id);
                                    }
                                  }}
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
