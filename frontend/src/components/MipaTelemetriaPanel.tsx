import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Server,
  ShieldAlert,
  Cpu,
  Database,
  RefreshCw,
  Users,
  Clock,
} from 'lucide-react';
import { api } from '../services/api';
import { AlertaMipaDto } from '../types';
import { StatusBanner } from './ui/DashboardShared';

interface MipaTelemetriaPanelProps {
  modo?: 'telemetria' | 'mipa' | 'ambos';
  userRole?: string;
}

const MipaTelemetriaPanel: React.FC<MipaTelemetriaPanelProps> = ({ modo = 'ambos' }) => {
  const [telemetria, setTelemetria] = useState<{
    estadoGeneral: string;
    motorBaseDatos: string;
    memoriaUsadaMb: number;
    memoriaTotalMb: number;
    usoMemoriaPorcentaje: number;
    tiempoActividadMinutos: number;
    totalEventosRegistrados: number;
    distribucionUsuariosPorRol: Record<string, number>;
    ultimosIngresos: Array<{
      id: number;
      usuario: string;
      email: string;
      rol: string;
      modulo: string;
      ip: string;
      dispositivo: string;
      fechaHora: string;
    }>;
  } | null>(null);

  const [alertasMipa, setAlertasMipa] = useState<AlertaMipaDto[]>([]);
  const [filtroNivel, setFiltroNivel] = useState<string>('TODOS');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [mensajeExito, setMensajeExito] = useState<string>('');

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [telData, mipaData] = await Promise.all([
        modo !== 'mipa' ? api.getTelemetriaResumen() : Promise.resolve(null),
        modo !== 'telemetria' ? api.getAlertasMipa() : Promise.resolve([]),
      ]);
      if (telData) setTelemetria(telData);
      setAlertasMipa(mipaData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No fue posible obtener los datos de Telemetría y Motor MIPA desde el servidor.'
      );
    } finally {
      setLoading(false);
    }
  }, [modo]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleRegistrarIntervencion = async (alerta: AlertaMipaDto) => {
    try {
      await api.registrarIntervencionMipa(
        alerta.id,
        `Intervención psicopedagógica activada para ${alerta.estudiante} (${alerta.grupo}).`
      );
      setMensajeExito(`Intervención MIPA registrada en base de datos para ${alerta.estudiante}.`);
      setTimeout(() => setMensajeExito(''), 4000);
      await cargarDatos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar la intervención MIPA.');
    }
  };

  const alertasFiltradas = alertasMipa.filter((a) =>
    filtroNivel === 'TODOS' ? true : a.nivelAlerta === filtroNivel
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--ec-text)' }}>
            {modo === 'telemetria'
              ? 'Centro de Telemetría y Auditoría de Accesos'
              : modo === 'mipa'
              ? 'Motor Inteligente de Prevención de Abandono (MIPA)'
              : 'Telemetría Institucional y Motor Preventivo MIPA'}
          </h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--ec-text-muted)' }}>
            Conectado en tiempo real con Spring Boot REST API y PostgreSQL
          </span>
        </div>
        <button type="button" onClick={cargarDatos} disabled={loading} className="btn-primary-action">
          <RefreshCw size={16} className={loading ? 'ec-spin' : ''} />
          {loading ? 'Actualizando...' : 'Sincronizar Ahora'}
        </button>
      </div>

      <StatusBanner error={error} success={mensajeExito} onClear={() => { setError(''); setMensajeExito(''); }} />

      {modo !== 'mipa' && telemetria && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon green">
                <Server size={24} />
              </div>
              <div>
                <div className="stat-number">{telemetria.estadoGeneral}</div>
                <div className="stat-label">{telemetria.motorBaseDatos}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon indigo">
                <Cpu size={24} />
              </div>
              <div>
                <div className="stat-number">{telemetria.usoMemoriaPorcentaje}%</div>
                <div className="stat-label">
                  Memoria JVM ({telemetria.memoriaUsadaMb} MB / {telemetria.memoriaTotalMb} MB)
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon purple">
                <Clock size={24} />
              </div>
              <div>
                <div className="stat-number">{telemetria.tiempoActividadMinutos} min</div>
                <div className="stat-label">Tiempo Activo del Servidor</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon amber">
                <Database size={24} />
              </div>
              <div>
                <div className="stat-number">{telemetria.totalEventosRegistrados}</div>
                <div className="stat-label">Eventos Auditados en BD</div>
              </div>
            </div>
          </div>

          <div className="panel-card">
            <div className="panel-header">
              <h3>
                <Activity size={18} style={{ color: 'var(--ec-primary)' }} />
                Bitácora de Ingresos Autenticados (Tabla telemetria_ingresos)
              </h3>
              <span className="grade-badge alto">
                <Users size={14} />
                {telemetria.ultimosIngresos.length} registros recientes
              </span>
            </div>
            <div className="ec-table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fecha y Hora</th>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Módulo</th>
                    <th>Dirección IP</th>
                    <th>Cliente</th>
                  </tr>
                </thead>
                <tbody>
                  {telemetria.ultimosIngresos.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: 'var(--ec-text-muted)', padding: '1.5rem' }}>
                        No se han registrado eventos de telemetría aún.
                      </td>
                    </tr>
                  ) : (
                    telemetria.ultimosIngresos.slice(0, 12).map((ev) => (
                      <tr key={ev.id}>
                        <td>{ev.fechaHora}</td>
                        <td>
                          <strong style={{ color: 'var(--ec-text)' }}>{ev.usuario}</strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--ec-text-muted)' }}>{ev.email}</div>
                        </td>
                        <td>
                          <span className="grade-badge alto">{ev.rol}</span>
                        </td>
                        <td>{ev.modulo}</td>
                        <td>{ev.ip}</td>
                        <td>{ev.dispositivo}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {modo !== 'telemetria' && (
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <h3>
                <ShieldAlert size={18} style={{ color: 'var(--ec-danger)' }} />
                Alertas Tempranas de Permanencia Escolar (Tabla bitacora_mipa)
              </h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: 'var(--ec-text-muted)' }}>
                Cálculo algorítmico real sobre calificaciones Decreto 1290 e inasistencias registradas en PostgreSQL
              </p>
            </div>
            <select
              value={filtroNivel}
              onChange={(e) => setFiltroNivel(e.target.value)}
              className="form-input"
              style={{ width: 'auto', minWidth: '210px' }}
              aria-label="Filtrar por nivel de riesgo MIPA"
            >
              <option value="TODOS">Todos los niveles ({alertasMipa.length})</option>
              <option value="CRITICO">Riesgo Crítico</option>
              <option value="ALTO">Riesgo Alto</option>
              <option value="MODERADO">Riesgo Moderado</option>
              <option value="BAJO">Riesgo Bajo</option>
            </select>
          </div>

          <div className="ec-table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Grupo</th>
                  <th>Promedio Actual</th>
                  <th>Inasistencias</th>
                  <th>Índice MIPA</th>
                  <th>Nivel</th>
                  <th>Factores Detectados y Ruta Sugerida</th>
                  <th>Estado / Acción</th>
                </tr>
              </thead>
              <tbody>
                {alertasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--ec-text-muted)' }}>
                      No hay estudiantes que coincidan con el filtro seleccionado.
                    </td>
                  </tr>
                ) : (
                  alertasFiltradas.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <strong style={{ color: 'var(--ec-text)' }}>{a.estudiante}</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--ec-text-muted)' }}>Doc: {a.documento}</div>
                      </td>
                      <td>{a.grupo}</td>
                      <td>
                        <strong style={{ color: 'var(--ec-text)' }}>{Number(a.promedio).toFixed(2)}</strong>
                      </td>
                      <td>{a.inasistencias}</td>
                      <td>
                        <strong style={{ color: 'var(--ec-text)' }}>{Number(a.indiceRiesgo).toFixed(1)}%</strong>
                      </td>
                      <td>
                        <span
                          className={`grade-badge ${
                            a.nivelAlerta === 'CRITICO' || a.nivelAlerta === 'ALTO'
                              ? 'bajo'
                              : a.nivelAlerta === 'MODERADO'
                              ? 'basico'
                              : 'superior'
                          }`}
                        >
                          {a.nivelAlerta}
                        </span>
                      </td>
                      <td style={{ maxWidth: '340px' }}>
                        <div style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--ec-text)' }}>{a.factoresDetectados}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--ec-text-muted)', marginTop: '0.2rem' }}>
                          {a.recomendacion}
                        </div>
                      </td>
                      <td>
                        {a.atendidoOrientacion ? (
                          <span className="grade-badge superior">Atendido en Orientación</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRegistrarIntervencion(a)}
                            className="btn-primary-action"
                            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                          >
                            Registrar Intervención
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MipaTelemetriaPanel;
