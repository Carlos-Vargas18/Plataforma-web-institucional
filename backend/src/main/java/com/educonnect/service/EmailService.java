package com.educonnect.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

import java.nio.charset.StandardCharsets;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    public boolean enviarCodigoRecuperacion(String destinatarioEmail, String nombreUsuario, String codigoOtp) {
        if (mailUsername == null || mailUsername.isBlank() || mailPassword == null || mailPassword.isBlank()) {
            log.info("Servicio SMTP no configurado mediante variables de entorno (MAIL_USERNAME/MAIL_PASSWORD). Solicitud de recuperación registrada en BD para {}", destinatarioEmail);
            return false;
        }
        try {
            String safeNombre = HtmlUtils.htmlEscape(nombreUsuario != null ? nombreUsuario : "Usuario Institucional");
            String safeCodigo = HtmlUtils.htmlEscape(codigoOtp);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(mailUsername, "Seguridad Institucional EduConnect");
            helper.setTo(destinatarioEmail);
            helper.setSubject("Código de Verificación de Seguridad — EduConnect");

            String html = """
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 16px; padding: 32px; border: 1px solid #1e293b;">
                    <h2 style="color: #60a5fa; margin-top: 0;">Recuperación de Acceso Institucional</h2>
                    <p>Hola <strong>%s</strong>,</p>
                    <p>Se ha solicitado restablecer la contraseña de tu cuenta en la Plataforma Académica <strong>EduConnect</strong>.</p>
                    <div style="background: #1e293b; border: 1px solid #3b82f6; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                        <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; display: block; margin-bottom: 8px;">Código de Verificación de Un Solo Uso</span>
                        <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #38bdf8;">%s</span>
                    </div>
                    <p style="font-size: 13px; color: #94a3b8;">Este código es válido únicamente por <strong>15 minutos</strong>. Si no realizaste esta solicitud, ignora este mensaje.</p>
                </div>
                """.formatted(safeNombre, safeCodigo);

            helper.setText(html, true);
            mailSender.send(message);
            log.info("Correo de recuperación OTP enviado exitosamente a {}", destinatarioEmail);
            return true;
        } catch (Exception ex) {
            log.warn("No fue posible despachar correo SMTP a {}: {}", destinatarioEmail, ex.getMessage());
            return false;
        }
    }

    public boolean enviarNotificacionBienvenida(String destinatarioEmail, String nombreUsuario, String rol) {
        if (mailUsername == null || mailUsername.isBlank() || mailPassword == null || mailPassword.isBlank()) {
            log.info("Servicio SMTP no configurado mediante variables de entorno (MAIL_USERNAME/MAIL_PASSWORD). Correo de bienvenida omitido para {}", destinatarioEmail);
            return false;
        }
        try {
            String safeNombre = HtmlUtils.htmlEscape(nombreUsuario != null ? nombreUsuario : "Usuario");
            String safeEmail = HtmlUtils.htmlEscape(destinatarioEmail);
            String safeRol = HtmlUtils.htmlEscape(rol != null ? rol : "INSTITUCIONAL");

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(mailUsername, "Administración Académica EduConnect");
            helper.setTo(destinatarioEmail);
            helper.setSubject("Bienvenido a la Plataforma Institucional EduConnect");

            String html = """
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 16px; padding: 32px; border: 1px solid #1e293b;">
                    <h2 style="color: #34d399; margin-top: 0;">Cuenta Institucional Activada</h2>
                    <p>Estimado(a) <strong>%s</strong>,</p>
                    <p>Tu cuenta institucional ha sido creada exitosamente en <strong>EduConnect</strong>.</p>
                    <ul style="background: #1e293b; border-radius: 12px; padding: 16px 32px; color: #e2e8f0;">
                        <li><strong>Usuario / Correo:</strong> %s</li>
                        <li><strong>Rol asignado:</strong> %s</li>
                    </ul>
                    <p style="font-size: 13px; color: #94a3b8;">Por políticas de seguridad, tu contraseña nunca se envía por correo electrónico. Si necesitas restablecerla, utiliza la opción "¿Olvidaste tu contraseña?" en el portal de ingreso.</p>
                </div>
                """.formatted(safeNombre, safeEmail, safeRol);

            helper.setText(html, true);
            mailSender.send(message);
            log.info("Correo de bienvenida enviado exitosamente a {}", destinatarioEmail);
            return true;
        } catch (Exception ex) {
            log.warn("No fue posible enviar correo de bienvenida a {}: {}", destinatarioEmail, ex.getMessage());
            return false;
        }
    }
}
