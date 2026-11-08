// ==============================================================================
// SERVICIO DE ENVÍO DE CORREOS INSTITUCIONALES - EDUCONNECT
// Despacho real con Gmail SMTP (antoniaguilarvelandia1@gmail.com)
// ==============================================================================

export interface EnviarCodigoParams {
  email: string;
  nombre?: string;
  codigo: string;
}

export interface EnviarBienvenidaParams {
  email: string;
  nombre?: string;
  rol: string;
  password?: string;
}

export interface EmailResult {
  success: boolean;
  message: string;
  provider: 'gmail-smtp' | 'resend' | 'backend' | 'sandbox';
  devCode?: string;
}

export const emailService = {
  /**
   * Envía el código de recuperación de contraseña a través del servicio SMTP de Gmail.
   */
  async enviarCodigoRecuperacion(params: EnviarCodigoParams): Promise<EmailResult> {
    const { email, nombre = 'Usuario Institucional', codigo } = params;

    // 1. MÉTODO PRIMARIO: GMAIL SMTP VÍA API INTERNA
    try {
      const response = await fetch('/api-mail/send-recuperacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nombre, codigo }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          provider: 'gmail-smtp',
          message: data.message || `Correo con código de seguridad enviado a ${email}.`,
          devCode: codigo,
        };
      } else {
        const err = await response.json();
        console.warn('Fallo en endpoint Gmail SMTP:', err);
      }
    } catch (err: any) {
      console.warn('Error llamando /api-mail/send-recuperacion:', err.message);
    }

    // 2. RESPALDO SECUNDARIO: BACKEND SPRING BOOT (Si estuviera en ejecución)
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8080';
      const resp = await fetch(`${backendUrl}/api/v1/auth/olvide-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo, nombre }),
      });
      if (resp.ok) {
        return {
          success: true,
          provider: 'backend',
          message: `Correo de recuperación enviado desde servidor central a ${email}.`,
          devCode: codigo,
        };
      }
    } catch {
      // Ignorar fallback
    }

    // 3. MODO SANDBOX (Permite continuar sin bloqueo)
    return {
      success: true,
      provider: 'sandbox',
      devCode: codigo,
      message: `Código generado para ${email}.`,
    };
  },

  /**
   * Envía correo de bienvenida cuando se registra o crea un nuevo usuario.
   */
  async enviarCorreoBienvenida(params: EnviarBienvenidaParams): Promise<EmailResult> {
    const { email, nombre = 'Usuario', rol, password = '' } = params;

    try {
      const response = await fetch('/api-mail/send-bienvenida', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nombre, rol, password }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          provider: 'gmail-smtp',
          message: data.message || `Correo de bienvenida enviado exitosamente a ${email}.`,
        };
      }
    } catch (err: any) {
      console.warn('Error llamando /api-mail/send-bienvenida:', err.message);
    }

    return {
      success: false,
      provider: 'sandbox',
      message: 'No se pudo enviar el correo de bienvenida.',
    };
  },
};
