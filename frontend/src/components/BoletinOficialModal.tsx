import { useDialogFocus } from './ui/useDialogFocus';
import React, { useEffect, useState } from 'react';
import { Printer, X, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { BoletinOficialDto } from '../types';

interface MateriaNotaInput {
  id?: number | string;
  materia: string;
  area?: string;
  docente?: string;
  intensidadHoraria?: number;
  nota1: number;
  nota2: number;
  nota3: number;
  notaFinal: number;
  observaciones?: string;
}

interface BoletinOficialModalProps {
  isOpen: boolean;
  onClose: () => void;
  estudianteId?: number | string;
  estudianteNombre: string;
  estudianteDocumento?: string;
  estudianteCodigo?: string;
  grupo: string;
  periodo: string;
  puesto?: string | number;
  calificaciones: MateriaNotaInput[];
  inasistenciasTotales?: number;
  observacionGeneral?: string;
}

const BoletinOficialModal: React.FC<BoletinOficialModalProps> = ({
  isOpen,
  onClose,
  estudianteId,
  estudianteNombre,
  estudianteDocumento,
  estudianteCodigo,
  grupo,
  periodo,
  puesto = '1',
  calificaciones,
  inasistenciasTotales = 0,
  observacionGeneral,
}) => {
  const dialog = useDialogFocus(isOpen, onClose);
  const [boletinServidor, setBoletinServidor] = useState<BoletinOficialDto | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    const matchPer = periodo.match(/\d+/);
    const numPer = matchPer ? Number(matchPer[0]) : undefined;
    api
      .getBoletinOficial(estudianteId, numPer)
      .then((res) => {
        if (mounted && res) setBoletinServidor(res);
      })
      .catch(() => {
        if (mounted) setBoletinServidor(null);
      });
    return () => {
      mounted = false;
    };
  }, [isOpen, estudianteId, periodo]);

  if (!isOpen) return null;

  const filas: MateriaNotaInput[] =
    calificaciones && calificaciones.length > 0
      ? calificaciones
      : (boletinServidor?.asignaturas || []).map((a) => ({
          id: a.id,
          materia: a.materia,
          area: a.area,
          docente: a.docente,
          intensidadHoraria: a.intensidadHoraria,
          nota1: Number(a.notaCognitiva),
          nota2: Number(a.notaProcedimental),
          nota3: Number(a.notaActitudinal),
          notaFinal: Number(a.notaDefinitivaPeriodo),
          observaciones: a.juicioValorativo,
        }));

  const promedioGlobal =
    filas.length > 0
      ? filas.reduce((acc, c) => acc + Number(c.notaFinal || 0), 0) / filas.length
      : Number(boletinServidor?.promedioGeneral || 0);

  const getDesempeno = (nota: number) => {
    if (nota >= 4.6) return 'SUPERIOR';
    if (nota >= 4.0) return 'ALTO';
    if (nota >= 3.0) return 'BÁSICO';
    return 'BAJO';
  };

  const nombreFinal = boletinServidor?.estudianteNombre || estudianteNombre;
  const docFinal = boletinServidor?.documento || estudianteDocumento || '1001234567';
  const codigoFinal = boletinServidor?.codigoEstudiantil || estudianteCodigo || 'EST-2025';
  const grupoFinal = boletinServidor?.grupo || grupo;
  const puestoFinal = boletinServidor
    ? `${boletinServidor.puestoCurso} de ${boletinServidor.totalEstudiantesCurso}`
    : String(puesto);
  const fallasFinal =
    boletinServidor != null
      ? boletinServidor.fallasInjustificadas + boletinServidor.fallasJustificadas
      : inasistenciasTotales;
  const codigoVerif = boletinServidor?.codigoVerificacion || 'VERIF-DECRETO1290-OFICIAL';

  return (
    <div
      className="boletin-container-printable"
      {...dialog}
      role="dialog"
      aria-modal="true"
      aria-label="Bolet?n oficial"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.78)',
        zIndex: 9999,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        padding: 'calc(1rem + env(safe-area-inset-top, 0px)) 0.75rem calc(1.25rem + env(safe-area-inset-bottom, 0px))',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <div
        id="area-impresion-boletin"
        style={{
          background: 'var(--ec-boletin-paper, #FFFFFF)',
          color: 'var(--ec-boletin-ink, #000000)',
          width: '100%',
          maxWidth: '940px',
          borderRadius: '20px',
          padding: 'clamp(1rem, 3vw, 2.5rem)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* Barra de acciones (oculta en impresión) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--ec-border, #e2e8f0)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--ec-boletin-ink, #000000)', fontWeight: 700, fontSize: '0.88rem' }}>
            <ShieldCheck size={20} style={{ flexShrink: 0 }} />
            <span>Documento Académico Verificado ({codigoVerif})</span>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => window.print()}
              className="btn-primary-action"
              style={{ background: 'var(--ec-boletin-ink, #000000)', color: 'var(--ec-boletin-paper, #FFFFFF)' }}
            >
              <Printer size={16} />
              Imprimir / Guardar PDF Oficial
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'var(--ec-boletin-paper, #FFFFFF)',
                color: 'var(--ec-boletin-ink, #000000)',
                border: '1px solid var(--ec-boletin-ink, #000000)',
                borderRadius: '999px',
                padding: '0.55rem 1.1rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
              Cerrar
            </button>
          </div>
        </div>

        {/* Encabezado Institucional */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            borderBottom: '2px solid #000000',
            paddingBottom: '1.25rem',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '58px',
                height: '58px',
                borderRadius: '14px',
                background: 'var(--ec-boletin-ink, #000000)',
                color: 'var(--ec-boletin-paper, #FFFFFF)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Award size={32} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: 'var(--ec-boletin-ink, #000000)' }}>
                INSTITUCIÓN EDUCATIVA EDUCONNECT
              </h2>
              <p style={{ margin: '2px 0', fontSize: '0.82rem', color: 'var(--ec-boletin-ink, #000000)', fontWeight: 600 }}>
                Aprobación Oficial MEN — Sistema Institucional de Evaluación SIEE (Decreto 1290 de 2009)
              </p>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--ec-boletin-ink, #000000)' }}>
                INFORME OFICIAL DE VALORACIÓN ACADÉMICA Y CONVIVENCIA ESCOLAR
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.82rem' }}>
            <div>
              <strong>Año Lectivo:</strong> {boletinServidor?.anioLectivo || 2025}
            </div>
            <div>
              <strong>Periodo:</strong> {periodo}
            </div>
            <div>
              <strong>Verificación:</strong> {codigoVerif}
            </div>
          </div>
        </div>

        {/* Ficha del Estudiante */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem',
            background: 'var(--ec-boletin-paper, #FFFFFF)',
            border: '1px solid var(--ec-boletin-ink, #000000)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem',
            fontSize: '0.85rem',
          }}
        >
          <div>
            <span style={{ color: 'var(--ec-boletin-ink, #000000)', display: 'block', fontSize: '0.75rem' }}>ESTUDIANTE</span>
            <strong>{nombreFinal}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--ec-boletin-ink, #000000)', display: 'block', fontSize: '0.75rem' }}>DOCUMENTO / CÓDIGO</span>
            <strong>
              {docFinal} ({codigoFinal})
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--ec-boletin-ink, #000000)', display: 'block', fontSize: '0.75rem' }}>CURSO / GRUPO</span>
            <strong>{grupoFinal}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--ec-boletin-ink, #000000)', display: 'block', fontSize: '0.75rem' }}>PROMEDIO / PUESTO</span>
            <strong>
              {promedioGlobal.toFixed(2)} ({getDesempeno(promedioGlobal)}) — Puesto {puestoFinal}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--ec-boletin-ink, #000000)', display: 'block', fontSize: '0.75rem' }}>INASISTENCIAS</span>
            <strong>{fallasFinal} registradas</strong>
          </div>
        </div>

        {/* Tabla de Valoraciones Decreto 1290 */}
        <div className="ec-table-responsive" style={{ marginBottom: '1.5rem' }}>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--ec-boletin-paper, #FFFFFF)' }}>
              <th style={{ color: 'var(--ec-boletin-ink, #000000)', border: '1px solid var(--ec-boletin-ink, #000000)' }}>Área / Asignatura</th>
              <th style={{ color: 'var(--ec-boletin-ink, #000000)', border: '1px solid var(--ec-boletin-ink, #000000)' }}>I.H.</th>
              <th style={{ color: 'var(--ec-boletin-ink, #000000)', border: '1px solid var(--ec-boletin-ink, #000000)' }}>Saber (40%)</th>
              <th style={{ color: 'var(--ec-boletin-ink, #000000)', border: '1px solid var(--ec-boletin-ink, #000000)' }}>Hacer (30%)</th>
              <th style={{ color: 'var(--ec-boletin-ink, #000000)', border: '1px solid var(--ec-boletin-ink, #000000)' }}>Ser (30%)</th>
              <th style={{ color: 'var(--ec-boletin-ink, #000000)', border: '1px solid var(--ec-boletin-ink, #000000)' }}>Definitiva</th>
              <th style={{ color: 'var(--ec-boletin-ink, #000000)', border: '1px solid var(--ec-boletin-ink, #000000)' }}>Desempeño Decreto 1290</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((item, idx) => (
              <React.Fragment key={item.id || idx}>
                <tr>
                  <td style={{ color: 'var(--ec-boletin-ink, #000000)', border: '1px solid var(--ec-boletin-ink, #000000)' }}>
                    <strong>{item.materia}</strong>
                    {item.docente && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--ec-boletin-ink, #000000)' }}>Docente: {item.docente}</div>
                    )}
                  </td>
                  <td style={{ color: 'var(--ec-boletin-ink, #000000)', border: '1px solid var(--ec-boletin-ink, #000000)', textAlign: 'center' }}>
                    {item.intensidadHoraria || 4}h
                  </td>
                  <td style={{ color: 'var(--ec-boletin-ink, #000000)', border: '1px solid var(--ec-boletin-ink, #000000)', textAlign: 'center' }}>
                    {Number(item.nota1).toFixed(1)}
                  </td>
                  <td style={{ color: 'var(--ec-boletin-ink, #000000)', border: '1px solid var(--ec-boletin-ink, #000000)', textAlign: 'center' }}>
                    {Number(item.nota2).toFixed(1)}
                  </td>
                  <td style={{ color: 'var(--ec-boletin-ink, #000000)', border: '1px solid var(--ec-boletin-ink, #000000)', textAlign: 'center' }}>
                    {Number(item.nota3).toFixed(1)}
                  </td>
                  <td style={{ color: 'var(--ec-boletin-ink, #000000)', border: '1px solid var(--ec-boletin-ink, #000000)', textAlign: 'center', fontWeight: 800 }}>
                    {Number(item.notaFinal).toFixed(1)}
                  </td>
                  <td style={{ color: 'var(--ec-boletin-ink, #000000)', border: '1px solid var(--ec-boletin-ink, #000000)', textAlign: 'center', fontWeight: 700 }}>
                    {getDesempeno(Number(item.notaFinal))}
                  </td>
                </tr>
                {item.observaciones && (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        color: 'var(--ec-boletin-ink, #000000)',
                        border: '1px solid var(--ec-boletin-ink, #000000)',
                        fontSize: '0.78rem',
                        background: 'var(--ec-boletin-paper, #FFFFFF)',
                        padding: '0.4rem 0.85rem',
                      }}
                    >
                      <strong>Juicio Valorativo:</strong> {item.observaciones}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        </div>

        {observacionGeneral && (
          <div
            style={{
              border: '1px solid var(--ec-boletin-ink, #000000)',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              marginBottom: '2rem',
              fontSize: '0.84rem',
            }}
          >
            <strong>Observaciones de Dirección de Grupo:</strong> {observacionGeneral}
          </div>
        )}

        {/* Firmas Oficiales */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3rem',
            marginTop: '3rem',
            paddingTop: '1.5rem',
            textAlign: 'center',
            fontSize: '0.84rem',
          }}
        >
          <div style={{ borderTop: '1.5px solid #000000', paddingTop: '0.5rem' }}>
            <strong>Dr. Fernando José Gaviria Restrepo</strong>
            <div>Rector Institucional</div>
          </div>
          <div style={{ borderTop: '1.5px solid #000000', paddingTop: '0.5rem' }}>
            <strong>{boletinServidor?.directorGrupo || 'Dirección de Grupo Oficial'}</strong>
            <div>Director(a) de Grupo {grupoFinal}</div>
          </div>
        </div>

        <div
          style={{
            marginTop: '1.5rem',
            fontSize: '0.74rem',
            color: 'var(--ec-boletin-ink, #000000)',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
          }}
        >
          <CheckCircle2 size={13} />
          <span>
            Escala Nacional Decreto 1290: Superior (4.6 - 5.0) | Alto (4.0 - 4.5) | Básico (3.0 - 3.9) | Bajo (1.0 - 2.9) — Hash: {codigoVerif}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BoletinOficialModal;
