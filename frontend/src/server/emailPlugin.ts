import type { Plugin } from 'vite';
import nodemailer from 'nodemailer';

// Configuración SMTP de Gmail proporcionada
const GMAIL_USER = 'antoniaguilarvelandia1@gmail.com';
const GMAIL_PASS = 'werpadktwvupckpo'; // Contraseña de aplicación de Google sin espacios

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS,
  },
});

export function emailPlugin(): Plugin {
  return {
    name: 'educonnect-email-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // 1. ENDPOINT: Enviar código de recuperación de contraseña
        if (req.url === '/api-mail/send-recuperacion' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const { email, nombre = 'Usuario Institucional', codigo } = JSON.parse(body);

              const mailOptions = {
                from: `"EduConnect Plataforma Institucional" <${GMAIL_USER}>`,
                to: email,
                subject: `🔐 ${codigo} es tu código de recuperación de contraseña — EduConnect`,
                html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Recuperación de Contraseña — EduConnect</title>
</head>
<body style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 30px 15px; color: #f8fafc;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
    <tr>
      <td style="padding: 28px 30px; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.02em;">EduConnect</h1>
        <p style="color: #e0f2fe; margin: 6px 0 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Plataforma Educativa Institucional</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 35px 30px; text-align: left;">
        <h2 style="color: #ffffff; font-size: 18px; margin-top: 0; margin-bottom: 14px;">Hola, ${nombre} 👋</h2>
        <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          Hemos recibido una solicitud para restablecer la contraseña de acceso a tu cuenta en <strong>EduConnect</strong>.
        </p>

        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0f172a; border-radius: 12px; border: 1.5px dashed #38bdf8; margin-bottom: 25px;">
          <tr>
            <td style="padding: 22px; text-align: center;">
              <span style="display: block; font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">Tu Código de Verificación es:</span>
              <span style="font-size: 34px; font-weight: 900; letter-spacing: 0.25em; color: #38bdf8; font-family: monospace;">${codigo}</span>
            </td>
          </tr>
        </table>

        <div style="background-color: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 6px; margin-bottom: 24px;">
          <p style="color: #fbbf24; font-size: 13px; margin: 0; line-height: 1.5;">
            ⏱️ <strong>Importante:</strong> Este código de un solo uso expirará en <strong>15 minutos</strong>.
          </p>
        </div>

        <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0;">
          Si tú no solicitaste este cambio, puedes ignorar este mensaje con total seguridad.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 30px; background-color: #090d16; text-align: center; border-top: 1px solid #334155;">
        <p style="color: #64748b; font-size: 12px; margin: 0;">
          © 2026 EduConnect Institucional. Todos los derechos reservados.<br/>
          Enviado automáticamente desde antoniaguilarvelandia1@gmail.com
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
                `,
              };

              await transporter.sendMail(mailOptions);

              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                message: `Correo de recuperación enviado exitosamente a ${email}`,
                provider: 'gmail-smtp',
              }));
            } catch (err: any) {
              console.error('Error enviando correo de recuperación vía Gmail:', err);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({
                success: false,
                message: 'Error despachando correo por Gmail: ' + err.message,
              }));
            }
          });
          return;
        }

        // 2. ENDPOINT: Enviar correo de bienvenida al crear nuevo usuario
        if (req.url === '/api-mail/send-bienvenida' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const { email, nombre = 'Usuario', rol = 'ESTUDIANTE', password = '' } = JSON.parse(body);

              const rolTexto = rol.toUpperCase();

              const mailOptions = {
                from: `"EduConnect Plataforma Institucional" <${GMAIL_USER}>`,
                to: email,
                subject: `🎓 ¡Bienvenido a EduConnect! Tus credenciales de acceso institucional`,
                html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Bienvenido a EduConnect</title>
</head>
<body style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 30px 15px; color: #f8fafc;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
    <tr>
      <td style="padding: 28px 30px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em;">EduConnect</h1>
        <p style="color: #d1fae5; margin: 6px 0 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Plataforma Educativa Institucional</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 35px 30px; text-align: left;">
        <h2 style="color: #ffffff; font-size: 20px; margin-top: 0; margin-bottom: 12px;">¡Bienvenido(a), ${nombre}! 🎉</h2>
        <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          Se ha creado exitosamente tu cuenta institucional en <strong>EduConnect</strong>. A través de este portal podrás gestionar calificaciones, asistencia, horarios y seguimiento académico.
        </p>

        <!-- CREDENCIALES DE ACCESO -->
        <div style="background-color: #0f172a; border-radius: 12px; border: 1px solid #334155; padding: 20px; margin-bottom: 25px;">
          <h3 style="color: #38bdf8; font-size: 14px; text-transform: uppercase; margin: 0 0 14px; letter-spacing: 0.05em;">Tus Datos de Acceso:</h3>
          
          <table border="0" cellpadding="4" cellspacing="0" width="100%" style="color: #cbd5e1; font-size: 14px;">
            <tr>
              <td width="35%" style="color: #94a3b8; font-weight: 600;">Rol Asignado:</td>
              <td><span style="background: rgba(16, 185, 129, 0.2); color: #34d399; padding: 3px 8px; border-radius: 6px; font-weight: 700; font-size: 12px;">${rolTexto}</span></td>
            </tr>
            <tr>
              <td style="color: #94a3b8; font-weight: 600;">Usuario / Correo:</td>
              <td style="color: #ffffff; font-weight: 700;">${email}</td>
            </tr>
            <tr>
              <td style="color: #94a3b8; font-weight: 600;">Contraseña Temporal:</td>
              <td style="color: #fbbf24; font-family: monospace; font-size: 15px; font-weight: 700;">${password || '••••••••'}</td>
            </tr>
            <tr>
              <td style="color: #94a3b8; font-weight: 600;">Año Lectivo:</td>
              <td style="color: #ffffff;">2026 Vigente</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin-bottom: 25px;">
          <a href="http://localhost:5173/" style="display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 12px 28px; border-radius: 10px; box-shadow: 0 4px 15px rgba(2, 132, 199, 0.4);">
            Ingresar a la Plataforma EduConnect →
          </a>
        </div>

        <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0;">
          💡 <strong>Recomendación de seguridad:</strong> Te recomendamos cambiar tu contraseña temporal tras tu primer inicio de sesión o utilizando la opción "¿Olvidaste tu clave?".
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 30px; background-color: #090d16; text-align: center; border-top: 1px solid #334155;">
        <p style="color: #64748b; font-size: 12px; margin: 0;">
          © 2026 EduConnect Institucional. Todos los derechos reservados.<br/>
          Enviado automáticamente desde antoniaguilarvelandia1@gmail.com
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
                `,
              };

              await transporter.sendMail(mailOptions);

              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                message: `Correo de bienvenida enviado exitosamente a ${email}`,
                provider: 'gmail-smtp',
              }));
            } catch (err: any) {
              console.error('Error enviando correo de bienvenida vía Gmail:', err);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({
                success: false,
                message: 'Error despachando bienvenida: ' + err.message,
              }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}
