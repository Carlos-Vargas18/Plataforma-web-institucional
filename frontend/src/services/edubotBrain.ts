// ==============================================================================
// EDUBOT BRAIN - MOTOR AUTÓNOMO DE INTELIGENCIA Y CONOCIMIENTO INSTITUCIONAL
// Proporciona respuestas contextuales para visitantes, acudientes, docentes,
// estudiantes, rectores y coordinadores.
// ==============================================================================

export interface BotResponse {
  text: string;
  chips?: string[];
  actionLink?: {
    text: string;
    targetTab?: string;
    roleRequired?: string;
  };
}

export interface UserContext {
  nombre?: string;
  rol?: string;
  email?: string;
  isLoggedIn: boolean;
}

// Normalización lingüística para emparejamiento semántico robusto
export const normalizarTexto = (texto: string): string => {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar tildes
    .replace(/[^a-z0-9\s]/g, ' ') // Quitar signos de puntuación
    .replace(/\s+/g, ' ')
    .trim();
};

export const procesarMensajeEduBot = (mensajeUsuario: string, context: UserContext): BotResponse => {
  const q = normalizarTexto(mensajeUsuario);

  // 1. SALUDOS Y PRESENTACIÓN
  if (q.match(/\b(hola|buenos dias|buenas tardes|buenas noches|hey|que tal|saludos|buenas)\b/)) {
    if (context.isLoggedIn) {
      return {
        text: `¡Hola ${context.nombre || ''}! 👋 Soy **EduBot**, tu asistente institucional en EduConnect. ¿En qué te puedo colaborar hoy con tu panel de **${context.rol || 'usuario'}**?`,
        chips: getChipsPorRol(context.rol)
      };
    }
    return {
      text: `¡Hola! Bienvenido(a) a **EduConnect** 🏫. Soy **EduBot**, tu asistente virtual institucional. Puedo darte información sobre matrículas, costos, horarios, modelo pedagógico o cómo usar la plataforma. ¿En qué te puedo orientar hoy?`,
      chips: ['Requisitos de Matrícula', 'Costos y Pensiones', 'Horarios de Clase', '¿Cómo ingresar al portal?']
    };
  }

  // 2. AGRADECIMIENTOS Y DESPEDIDAS
  if (q.match(/\b(gracias|muchas gracias|vale gracias|te lo agradezco|ok gracias|listo gracias)\b/)) {
    return {
      text: `¡Con el mayor de los gustos! 😊 Recuerda que estoy disponible las 24 horas para resolver cualquier duda institucional. ¡Que tengas un excelente día! ✨`,
      chips: ['Hacer otra consulta', 'Ver horarios de atención']
    };
  }

  if (q.match(/\b(chao|adios|hasta luego|nos vemos|bye)\b/)) {
    return {
      text: `¡Hasta pronto! 👋 Que te vaya muy bien en tus actividades académicas. Si necesitas algo más, solo haz clic sobre mí.`,
    };
  }

  // 3. MATRÍCULAS, ADMISIONES Y CUPOS
  if (q.match(/\b(matricul|admision|cupo|inscri|requisito|ingres|nuevo estudiante|aspirante)\b/)) {
    return {
      text: `🎒 **Proceso de Matrícula y Admisiones 2026:**
- **Periodo de Convocatoria:** Abierto para Preescolar, Primaria, Secundaria y Media (Grados 0° a 11°).
- **Documentación Requerida:**
  1. Registro Civil o Tarjeta de Identidad del aspirante.
  2. Fotocopia de cédula de los acudientes/padres.
  3. Certificados de calificaciones de años anteriores debidamente legalizados.
  4. Certificado de afiliación a EPS / SISBÉN vigente.
  5. Paz y salvo de la institución educativa de procedencia.
  6. 3 fotos recientes tamaño 3x4 fondo azul.
- **Paso Siguiente:** Presentar formulario en secretaría académica o agendar entrevista pedagógica.`,
      chips: ['Costos y Pensiones', 'Horarios de Atención', 'Jornada Escolar']
    };
  }

  // 4. COSTOS, PENSIONES Y MENSUALIDADES
  if (q.match(/\b(costo|pension|precio|tarifa|valor|cuanto vale|cuanto cuesta|mensualidad|pago)\b/)) {
    return {
      text: `💳 **Tarifas y Costos Educativos (Año Lectivo 2026):**
Las tarifas están reguladas y autorizadas según resolución de Secretaría de Educación:
- **Matrícula Anual:** Pago único al formalizar el año escolar.
- **Pensión Mensual:** Se cancela durante los primeros 5 días hábiles de cada mes (febrero a noviembre).
- **Medios de Pago Autorizados:** Pagos en línea por PSE/Banco institucional o en la tesorería del colegio en horario de oficina.
*Para consultar la tarifa exacta según el grado del estudiante, comunícate con Tesorería al PBX 601-555-0199.*`,
      chips: ['Requisitos de Matrícula', 'Horarios de Atención', 'Contacto Secretaría']
    };
  }

  // 5. HORARIOS DE CLASE Y JORNADA INSTITUCIONAL
  if (q.match(/\b(horario|jornada|hora de entrada|hora de salida|a que hora|descanso|recreo)\b/)) {
    return {
      text: `⏰ **Jornada Escolar y Horarios Oficiales:**
- **Ingreso de Estudiantes:** 06:45 AM (las clases inician puntualmente a las 07:00 AM).
- **Salida Primaria:** 01:15 PM.
- **Salida Secundaria y Media:** 01:45 PM.
- **Descansos Pedagógicos:**
  - Primer descanso: 09:00 AM - 09:30 AM.
  - Segundo descanso: 11:30 AM - 12:00 PM.
📅 *Nota:* Si tienes sesión iniciada, puedes consultar tu **Horario Semanal interactivo en recuadros** en la pestaña *'Horario de Clases'* de tu dashboard.`,
      chips: ['¿Dónde veo mi horario?', '¿Cómo justificar inasistencia?']
    };
  }

  // 6. EVALUACIÓN, DECRETO 1290 Y PONDERACIÓN DE NOTAS (SIEE)
  if (q.match(/\b(decreto 1290|ponderacion|nota|calificacion|evalua|porcentaje|siee|definitiva|cognitivo|procedimental|actitudinal|recupera)\b/)) {
    return {
      text: `⚖️ **Sistema Institucional de Evaluación de Estudiantes (Decreto 1290):**
En EduConnect las calificaciones se ponderan con la regla institucional oficial:
- 🧠 **Saber Cognitivo (40%):** Evaluaciones escritas, pruebas de periodo y sustentaciones orales.
- 🛠️ **Saber Procedimental (40%):** Talleres prácticos, laboratorios, proyectos de investigación y tareas.
- 🤝 **Saber Actitudinal (20%):** Asistencia, puntualidad, convivencia escolar y participación solidaria.

📊 **Escala Nacional de Desempeño:**
- **SUPERIOR:** 4.60 a 5.00
- **ALTO:** 4.00 a 4.59
- **BÁSICO:** 3.00 a 3.99 *(mínimo aprobatorio)*
- **BAJO:** 1.00 a 2.99 *(reprobado - requiere plan de mejoramiento)*`,
      chips: ['¿Cómo descargar el boletín?', '¿Dónde veo mis notas?']
    };
  }

  // 7. BOLETINES OFICIALES DE CALIFICACIONES
  if (q.match(/\b(boletin|informe|descargar boletin|imprimir boletin|calificaciones del periodo|libreta)\b/)) {
    return {
      text: `📄 **Boletines Oficiales de Calificaciones (Decreto 1290):**
Los boletines incluyen:
- Membrete oficial de la institución con código DANE y aprobación del MEN.
- Desglose por materia: Cognitivo (40%), Procedimental (40%), Actitudinal (20%) y Definitiva.
- Puesto del estudiante en el salón y promedio acumulado.
- Escala de desempeño y firmas digitales de Rectoría y Director de Grupo.

👉 **¿Cómo descargarlo o imprimirlo?**
1. Ingresa a tu panel como **Estudiante** o **Tutor / Acudiente**.
2. Ve a la pestaña **'Boletín de Notas'** o **'Calificaciones'**.
3. Haz clic en el botón azul: **'📄 Ver Boletín Oficial (Decreto 1290)'**.
4. Podrás visualizarlo en pantalla o hacer clic en **'🖨️ Imprimir / Guardar PDF'**.`,
      chips: ['¿Cómo recuperar mi contraseña?', '¿Dónde veo el horario?']
    };
  }

  // 8. JUSTIFICACIÓN DE INASISTENCIAS Y EXCUSAS MÉDICAS
  if (q.match(/\b(inasistencia|excusa|falta|medica|justifica|permiso|ausencia|enfermo|eps)\b/)) {
    return {
      text: `🏥 **Protocolo de Justificación de Inasistencias:**
1. Los padres o acudientes tienen un plazo máximo de **3 días hábiles** tras la ausencia para radicar la excusa.
2. **Desde el Portal de Acudientes (Tutor):**
   - Ingresa a la pestaña **'Excusas / Inasistencias'**.
   - Haz clic en **'Radicar Excusa o Justificación'**.
   - Ingresa la fecha, el motivo y adjunta el soporte (certificado EPS o incapacidad médica).
3. **Coordinación Académica** revisará el soporte y, al aprobarlo, notificará a los docentes titulares para reprogramar talleres y evaluaciones pendientes sin penalización.`,
      chips: ['Ficha Médica y Portería', 'Contacto Coordinación']
    };
  }

  // 9. OBSERVADOR DEL ESTUDIANTE Y CONVIVENCIA (LEY 1620)
  if (q.match(/\b(observador|convivencia|falta disciplinaria|tipo 1|tipo 2|tipo 3|manual de convivencia|comite de convivencia|ley 1620)\b/)) {
    return {
      text: `📋 **Manual de Convivencia y Observador (Ley 1620):**
El observador es una herramienta pedagógica y formativa de seguimiento:
- **Felicitaciones / Reconocimientos:** Destacan méritos académicos, deportivos o solidarios.
- **Faltas Tipo I (Leves):** Conflictos cotidianos resueltos mediante diálogo y compromisos pedagógicos.
- **Faltas Tipo II (Graves):** Daño a bienes, agresión física o acoso escolar (bullying). Requiere citación inmediata del acudiente y remisión a orientación.
- **Faltas Tipo III (Gravísimas):** Delitos o vulneración grave de derechos. Se activa la ruta externa con ICBF y Policía de Infancia y Adolescencia.
*Tanto padres como estudiantes pueden revisar sus anotaciones en la pestaña 'Observador' de su dashboard.*`,
      chips: ['¿Cómo justificar inasistencia?', '¿Cómo ver citaciones?']
    };
  }

  // 10. RECUPERAR CONTRASEÑA / OLVIDÉ MI CLAVE
  if (q.match(/\b(olvide|clave|password|contrasena|recuperar|no puedo entrar|codigo|otp|restablecer)\b/)) {
    return {
      text: `🔐 **Recuperación Autónoma de Contraseña:**
Si olvidaste tu clave institucional, puedes recuperarla en 1 minuto:
1. En la pantalla de inicio de sesión, haz clic en **'¿Olvidaste tu clave?'**.
2. Ingresa tu correo registrado en el colegio.
3. Te llegará un correo con un **código de seguridad de 6 dígitos** (válido por 15 minutos).
4. Escribe el código recibido, define tu nueva contraseña y confirma.
5. ¡Listo! Ya podrás iniciar sesión de inmediato con tu nueva clave.`,
      chips: ['¿Cómo ingresar al portal?', 'Contacto Secretaría']
    };
  }

  // 11. UBICACIÓN, CONTACTO Y CANALES OFICIALES
  if (q.match(/\b(ubicacion|donde queda|direccion|telefono|contacto|correo|email institucional|secretaria|atencion|pbx)\b/)) {
    return {
      text: `📍 **Canales de Atención Institucional EduConnect:**
- **Dirección Principal:** Calle 127 # 45-80, Campus Central.
- **Teléfono / PBX:** +57 (601) 555-0199 / Línea Celular: 310-890-4422.
- **Correo Institucional:** \`antoniaguilarvelandia1@gmail.com\` / \`contacto@educonnect.edu.co\`.
- **Horario de Atención Presencial:** Lunes a Viernes de 07:00 AM a 03:30 PM (Jornada Continua).
- **Rectoría y Coordinación:** Previa cita agendada en secretaría académica.`,
      chips: ['Requisitos de Matrícula', 'Costos y Pensiones', 'Horarios de Clase']
    };
  }

  // 12. SISTEMA SIMAT Y REPORTES OFICIALES (RECTOR / COORDINADOR)
  if (q.match(/\b(simat|ministerio|men|resolucion|acta|promocion|secretaria de educacion)\b/)) {
    return {
      text: `🏛️ **Integración SIMAT y Reportes Oficiales MEN:**
La plataforma cuenta con exportación automatizada según la estructura exigida por el Sistema Integrado de Matrícula (SIMAT) del Ministerio de Educación Nacional:
- Desde el **Panel de Rectoría** o **Coordinación**, haz clic en el botón verde: **'Exportar Base SIMAT (CSV/Excel)'**.
- Incluye códigos DANE, tipología de documento (RC/TI/CC), EPS, estrato, jornada y caracterización de acudientes.`,
      chips: ['Decreto 1290', 'Observador Ley 1620']
    };
  }

  // 13. PREGUNTAS SOBRE EL PROPIO EDUBOT
  if (q.match(/\b(quien eres|que haces|que eres|como te llamas|edubot|creador|ayuda)\b/)) {
    return {
      text: `¡Soy **EduBot**! 🤖 Tu asistente virtual institucional autónomo de **EduConnect**.
Estoy diseñado para resolver todas tus inquietudes sobre:
1. 📚 Matrículas, costos, pensiones y calendario escolar.
2. ⚖️ Sistema de evaluación Decreto 1290 y cálculo de definitivas.
3. 📄 Descarga e impresión de boletines oficiales.
4. 🏥 Protocolo de justificación de inasistencias médicas.
5. 📋 Convivencia escolar y Ley 1620.
6. 🔑 Recuperación de contraseñas y uso de los paneles.
¿En qué te puedo ayudar hoy?`,
      chips: ['Requisitos de Matrícula', 'Costos y Pensiones', 'Descargar Boletín', 'Horarios de Clase']
    };
  }

  // 14. RESPUESTA POR DEFECTO / FALLBACK INTELIGENTE
  return {
    text: `Entiendo tu inquietud. Como **EduBot**, puedo orientarte con precisión sobre temas institucionales de EduConnect:
- **Matrículas y Admisiones 2026**
- **Costos, Pensiones y Pagos**
- **Boletines Oficiales y Calificaciones (Decreto 1290)**
- **Horarios Semanales de Clases**
- **Justificaciones de Inasistencias y Ficha Médica**
- **Manual de Convivencia y Observador (Ley 1620)**

¿Sobre cuál de estos temas deseas información?`,
    chips: [
      'Requisitos de Matrícula',
      '¿Cómo descargar el boletín?',
      'Ponderación de Notas (1290)',
      'Horarios de Clase'
    ]
  };
};

function getChipsPorRol(rol?: string): string[] {
  switch (rol?.toUpperCase()) {
    case 'TUTOR':
      return ['¿Cómo descargar el boletín?', 'Justificar inasistencia médica', 'Ficha médica y portería', 'Ponderación de notas'];
    case 'DOCENTE':
    case 'DIRECTOR_GRUPO':
      return ['Criterios Decreto 1290', 'Anotación observador Ley 1620', 'Mi horario semanal', 'Consolidado de grupo'];
    case 'ESTUDIANTE':
      return ['¿Dónde veo mis notas?', 'Mi horario de clases', 'Mi observador del estudiante'];
    case 'ADMIN':
    case 'RECTOR':
    case 'COORDINADOR':
      return ['Exportar SIMAT', 'Resoluciones rectorales', 'Comisión de Evaluación', 'Manual de Convivencia'];
    default:
      return ['Requisitos de Matrícula', 'Costos y Pensiones', 'Horarios de Clase', 'Descargar Boletín'];
  }
}
