import React, { useState } from 'react';
import { api } from '../services/api';
import {
  X,
  Mail,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Send
} from 'lucide-react';

interface RecuperarClaveModalProps {
  initialEmail?: string;
  onClose: () => void;
  onPasswordResetSuccess: (email: string) => void;
}

export const RecuperarClaveModal: React.FC<RecuperarClaveModalProps> = ({
  initialEmail = '',
  onClose,
  onPasswordResetSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState(initialEmail);
  const [codigo, setCodigo] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [devCodeBanner, setDevCodeBanner] = useState<string | null>(null);
  const [providerUsed, setProviderUsed] = useState<string | null>(null);

  // PASO 1: Solicitar código de recuperación
  const handleSolicitarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !email.includes('@')) {
      setErrorMsg('Por favor ingresa un correo electrónico institucional válido.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.solicitarRecuperacionClave(email);
      setProviderUsed(res.provider);

      if (res.devCode) {
        setDevCodeBanner(res.devCode);
      }

      setSuccessMsg(res.message);
      setStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al solicitar el código de recuperación.');
    } finally {
      setLoading(false);
    }
  };

  // PASO 2: Confirmar código y restablecer contraseña
  const handleRestablecerClave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!codigo || codigo.trim().length !== 6) {
      setErrorMsg('El código de seguridad debe tener exactamente 6 dígitos.');
      return;
    }

    if (nuevaPassword.length < 6) {
      setErrorMsg('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      setErrorMsg('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.restablecerClave(email, codigo, nuevaPassword);
      setSuccessMsg(res.message);
      setStep(3);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al restablecer la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizar = () => {
    onPasswordResetSuccess(email);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 6, 23, 0.85)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        animation: 'fadeIn 0.25s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
          border: '1px solid #334155',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '480px',
          padding: '2rem',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(56, 189, 248, 0.1)',
          position: 'relative',
          color: '#f8fafc'
        }}
      >
        {/* BOTÓN CERRAR */}
        <button
          onClick={onClose}
          type="button"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#94a3b8',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          title="Cerrar ventana"
        >
          <X size={18} />
        </button>

        {/* ==============================================================================
            PASO 1: INGRESO DE CORREO INSTITUCIONAL
           ============================================================================== */}
        {step === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.2) 0%, rgba(3, 105, 161, 0.3) 100%)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}
              >
                <KeyRound size={28} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
                ¿Olvidaste tu contraseña?
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                Ingresa tu correo institucional registrado y te enviaremos un código de seguridad para crear una nueva clave.
              </p>
            </div>

            {errorMsg && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem'
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSolicitarCodigo}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  Correo Electrónico Institucional
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#64748b'
                    }}
                  />
                  <input
                    type="email"
                    className="login-input"
                    placeholder="ejemplo: docente@educonnect.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ paddingLeft: '44px', width: '100%', boxSizing: 'border-box' }}
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-pill-primary"
                disabled={loading}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.85rem',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Enviando código...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Enviar Código de Seguridad</span>
                  </>
                )}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid #334155', paddingTop: '1rem' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                ← Volver al inicio de sesión
              </button>
            </div>
          </div>
        )}

        {/* ==============================================================================
            PASO 2: INGRESO DE CÓDIGO Y NUEVA CONTRASEÑA
           ============================================================================== */}
        {step === 2 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(21, 128, 61, 0.3) 100%)',
                  border: '1px solid rgba(74, 222, 128, 0.4)',
                  color: '#4ade80',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem'
                }}
              >
                <ShieldCheck size={26} />
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.35rem' }}>
                Verifica tu Código
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                Enviamos un código de 6 dígitos a:<br />
                <strong style={{ color: '#38bdf8' }}>{email}</strong>
              </p>
            </div>

            {/* BANNER INFORMATIVO / SANDBOX SI NO HAY API KEY TODAVÍA */}
            {devCodeBanner && (
              <div
                style={{
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1.5px dashed #38bdf8',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  marginBottom: '1.25rem',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  🧪 Código Generado (Sandbox / Pruebas)
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '0.25em', color: '#38bdf8', fontFamily: 'monospace' }}>
                  {devCodeBanner}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '0.35rem' }}>
                  {providerUsed === 'resend' 
                    ? '✅ Despachado por Resend a tu bandeja de entrada.' 
                    : '💡 Puedes usar este código directamente para probar el flujo de inmediato.'}
                </div>
              </div>
            )}

            {errorMsg && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem'
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleRestablecerClave}>
              {/* CÓDIGO DE 6 DÍGITOS */}
              <div style={{ marginBottom: '1.15rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  Código de 6 Dígitos
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Ej: 123456"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                  className="login-input"
                  style={{
                    textAlign: 'center',
                    fontSize: '1.35rem',
                    letterSpacing: '0.3em',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                    boxSizing: 'border-box',
                    width: '100%'
                  }}
                  required
                  autoFocus
                />
              </div>

              {/* NUEVA CONTRASEÑA */}
              <div style={{ marginBottom: '1.15rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  Nueva Contraseña (mínimo 6 caracteres)
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={17}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#64748b'
                    }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
                    className="login-input"
                    style={{ paddingLeft: '44px', paddingRight: '40px', width: '100%', boxSizing: 'border-box' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* CONFIRMAR CONTRASEÑA */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  Confirmar Nueva Contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={17}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#64748b'
                    }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmarPassword}
                    onChange={(e) => setConfirmarPassword(e.target.value)}
                    className="login-input"
                    style={{ paddingLeft: '44px', width: '100%', boxSizing: 'border-box' }}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-pill-primary"
                disabled={loading}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.85rem',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Guardando cambios...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Restablecer y Guardar Contraseña</span>
                  </>
                )}
              </button>
            </form>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', borderTop: '1px solid #334155', paddingTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.82rem', cursor: 'pointer' }}
              >
                ← Cambiar correo
              </button>

              <button
                type="button"
                onClick={handleSolicitarCodigo}
                disabled={loading}
                style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Reenviar código
              </button>
            </div>
          </div>
        )}

        {/* ==============================================================================
            PASO 3: ÉXITO TOTAL Y CONFIRMACIÓN
           ============================================================================== */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.25) 0%, rgba(21, 128, 61, 0.4) 100%)',
                border: '2px solid #22c55e',
                color: '#4ade80',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem'
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#ffffff' }}>
              ¡Contraseña Restablecida!
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              Tu clave ha sido actualizada con éxito en la base de datos institucional. Ya puedes ingresar con tu nueva contraseña.
            </p>

            <button
              type="button"
              className="btn-pill-primary"
              onClick={handleFinalizar}
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '0.85rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
              }}
            >
              <span>Iniciar Sesión Ahora</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
