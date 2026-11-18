import { httpClient } from './api/httpClient';

export interface RecuperacionResult {
  success: boolean;
  mensaje: string;
}

export const emailService = {
  async solicitarCodigoRecuperacion(email: string): Promise<RecuperacionResult> {
    const res = await httpClient.post<{ success: boolean; mensaje: string }>('/auth/olvide-password', {
      email: email.trim().toLowerCase(),
    });
    return {
      success: Boolean(res.success ?? true),
      mensaje:
        res.mensaje ||
        'Si el correo pertenece a una cuenta institucional activa, se ha enviado un código de verificación con validez de 15 minutos.',
    };
  },

  async verificarCodigoRecuperacion(email: string, codigo: string): Promise<boolean> {
    const res = await httpClient.post<{ valido: boolean }>('/auth/verificar-codigo', {
      email: email.trim().toLowerCase(),
      codigo: codigo.trim(),
    });
    return Boolean(res.valido);
  },

  async restablecerPassword(email: string, codigo: string, nuevaPassword: string): Promise<RecuperacionResult> {
    const res = await httpClient.post<{ success: boolean; mensaje: string }>('/auth/restablecer-password', {
      email: email.trim().toLowerCase(),
      codigo: codigo.trim(),
      nuevaPassword,
    });
    return {
      success: Boolean(res.success ?? true),
      mensaje: res.mensaje || 'Contraseña institucional actualizada correctamente.',
    };
  },
};
