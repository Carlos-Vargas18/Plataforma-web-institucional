import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Mail,
  ShieldCheck,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Eye,
  EyeOff,
  HelpCircle,
} from 'lucide-react';
import { emailService } from '../services/emailService';

interface RecuperarClaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
}

const RecuperarClaveModal: React.FC<RecuperarClaveModalProps> = ({
  isOpen,
  onClose,
  initialEmail = '',
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState(initialEmail);
  const [codigo, setCodigo] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setEmail(initialEmail || '');
      setCodigo('');
      setNuevaPassword('');
      setConfirmarPassword('');
      setError('');
      setInfoMessage('');
      setCountdown(0);
    }
  }, [isOpen, initialEmail]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  if (!isOpen) return null;

  const handleSolicitarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !email.includes('@')) {
      setError('Ingresa un correo electrónico institucional válido.');
      return;
    }
    setLoading(true);
    try {
      const res = await emailService.solicitarCodigoRecuperacion(email.trim());
      setInfoMessage(res.mensaje);
      setCountdown(900);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (codigo.trim().length !== 6) {
      setError('El código de seguridad debe tener exactamente 6 dígitos.');
      return;
    }
    setLoading(true);
    try {
      const valido = await emailService.verificarCodigoRecuperacion(email.trim(), codigo.trim());
      if (valido) {
        setStep(3);
      } else {
        setError('El código ingresado es inválido o ha expirado.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Código incorrecto o expirado.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestablecerPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (nuevaPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas ingresadas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      await emailService.restablecerPassword(email.trim(), codigo.trim(), nuevaPassword);
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-recuperar-titulo"
      className="ec-modal-overlay"
    >
      <div className="ec-modal-card" style={{ maxWidth: '470px', padding: '2rem', position: 'relative' }}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar ventana de recuperación"
          style={{
            position: 'absolute',
            top: '1.15rem',
            right: '1.15rem',
            background: 'var(--ec-surface-low)',
            border: '1px solid var(--ec-border)',
            color: 'var(--ec-text-muted)',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={17} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: step === 4 ? 'var(--ec-success-bg)' : 'var(--ec-primary-soft)',
              color: step === 4 ? 'var(--ec-success)' : 'var(--ec-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem',
            }}
          >
            {step === 4 ? <CheckCircle2 size={28} /> : <KeyRound size={24} />}
          </div>
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--ec-primary)',
              marginBottom: '0.3rem',
            }}
          >
            Credenciales Institucionales · Paso {step} de 4
          </div>
          <h3 id="modal-recuperar-titulo" style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--ec-text)' }}>
            {step === 4 ? '¡Contraseña Restablecida!' : 'Recuperar Contraseña'}
          </h3>
        </div>

        {error && (
          <div
            style={{
              background: 'var(--ec-danger-bg)',
              border: '1px solid var(--ec-danger-border)',
              color: 'var(--ec-danger)',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              fontSize: '0.84rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSolicitarCodigo}>
            <p style={{ fontSize: '0.88rem', color: 'var(--ec-text-muted)', marginBottom: '1.25rem', lineHeight: 1.55, textAlign: 'center' }}>
              Ingresa tu correo electrónico institucional registrado. Enviaremos un código de verificación temporal de un solo uso.
            </p>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Correo institucional registrado</label>
                <span style={{ fontSize: '0.74rem', color: 'var(--ec-text-muted)', fontWeight: 600 }}>Requerido</span>
              </div>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ec-text-subtle)' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@educonnect.com"
                  className="ec-auth-input"
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary-action" style={{ width: '100%', padding: '0.78rem' }}>
              <span>{loading ? 'Procesando en servidor...' : 'Enviar Código de Verificación'}</span>
              <ArrowRight size={16} />
            </button>

            <div
              style={{
                marginTop: '1.25rem',
                background: 'var(--ec-surface-low)',
                border: '1px solid var(--ec-border)',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                display: 'flex',
                gap: '0.7rem',
                alignItems: 'flex-start',
              }}
            >
              <HelpCircle size={18} style={{ color: 'var(--ec-primary)', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.78rem', color: 'var(--ec-text-secondary)', lineHeight: 1.45 }}>
                <strong>¿Necesita asistencia institucional?</strong> Contacte a la Secretaría Académica o Mesa de Ayuda TI de su sede si olvidó su correo oficial.
              </div>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerificarCodigo}>
            <div
              style={{
                background: 'var(--ec-primary-soft)',
                border: '1px solid var(--ec-primary-border)',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                fontSize: '0.83rem',
                color: 'var(--ec-primary-dark)',
                marginBottom: '1.15rem',
              }}
            >
              <div>{infoMessage}</div>
              {countdown > 0 && (
                <div style={{ marginTop: '0.4rem', fontWeight: 700, color: 'var(--ec-primary)' }}>
                  Tiempo restante de validez: {formatTime(countdown)}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Código de 6 dígitos recibido por correo</label>
              <div style={{ position: 'relative' }}>
                <ShieldCheck size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ec-text-subtle)' }} />
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="ec-auth-input"
                  style={{ letterSpacing: '6px', fontWeight: 800, fontSize: '1.08rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-secondary-action"
                style={{ flex: 1 }}
              >
                <RefreshCw size={14} /> Cambiar correo
              </button>
              <button type="submit" disabled={loading} className="btn-primary-action" style={{ flex: 1 }}>
                {loading ? 'Validando...' : 'Verificar Código'}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleRestablecerPassword}>
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Nueva Contraseña Institucional</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ec-text-subtle)' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="ec-auth-input"
                  style={{ paddingRight: '2.6rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    color: 'var(--ec-text-muted)',
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Confirmar Nueva Contraseña</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ec-text-subtle)' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmarPassword}
                  onChange={(e) => setConfirmarPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  className="ec-auth-input"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary-action" style={{ width: '100%', padding: '0.78rem' }}>
              {loading ? 'Actualizando clave...' : 'Guardar Nueva Contraseña'}
            </button>
          </form>
        )}

        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--ec-text-muted)', marginBottom: '1.5rem', lineHeight: 1.55 }}>
              Tu nueva contraseña ha sido cifrada mediante BCrypt y almacenada de forma segura en la base de datos institucional.
            </p>
            <button type="button" onClick={onClose} className="btn-primary-action" style={{ width: '100%', padding: '0.78rem' }}>
              Iniciar Sesión Ahora
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecuperarClaveModal;
