import { httpClient } from './api/httpClient';
import { Role } from '../types';

export interface EduBotReply {
  text: string;
  suggestions: string[];
}

export async function processEduBotQuery(query: string, userRole?: Role | string): Promise<EduBotReply> {
  const cleanQuery = query.trim();
  const defaultSuggestions = getSuggestionsForRole(userRole);

  if (!cleanQuery) {
    return {
      text: 'Por favor escribe tu consulta académica o administrativa.',
      suggestions: defaultSuggestions,
    };
  }

  try {
    const res = await httpClient.post<{ respuesta: string }>('/edubot/consulta', {
      pregunta: cleanQuery,
    });
    return {
      text: res.respuesta,
      suggestions: defaultSuggestions,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error de conexión con el servidor.';
    return {
      text: `⚠️ No fue posible consultar al servicio central de EduBot en este momento: ${msg}`,
      suggestions: defaultSuggestions,
    };
  }
}

export function getSuggestionsForRole(role?: Role | string): string[] {
  const norm = String(role || 'ESTUDIANTE').toUpperCase();
  switch (norm) {
    case 'ADMIN':
    case 'RECTOR':
      return [
        'Resumen estadístico institucional',
        'Estado de alertas MIPA',
        'Escala de evaluación Decreto 1290',
        'Último comunicado oficial',
      ];
    case 'COORDINADOR':
    case 'DIRECTOR_GRUPO':
    case 'DOCENTE':
      return [
        'Escala de evaluación Decreto 1290',
        'Estado de alertas MIPA',
        'Horarios escolares',
        'Último comunicado oficial',
      ];
    default:
      return [
        'Escala de evaluación Decreto 1290',
        'Horarios escolares',
        'Último comunicado oficial',
      ];
  }
}
