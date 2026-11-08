import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { procesarMensajeEduBot, BotResponse } from '../services/edubotBrain';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  RotateCcw,
  Minus,
  Maximize2,
  Bot,
  User,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  chips?: string[];
}

export const EduBot: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Inicializar mensajes según el contexto del usuario
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const horaActual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isAuthenticated && user) {
      return [
        {
          id: 'welcome-auth',
          sender: 'bot',
          text: `¡Hola **${user.nombreCompleto}**! 👋 Soy **EduBot**, tu asistente escolar autónomo.\n\nEstoy aquí para guiarte en tu panel de **${user.rol}**. ¿Qué consulta deseas realizar hoy?`,
          timestamp: horaActual,
          chips: user.rol === 'TUTOR'
            ? ['¿Cómo descargar el boletín?', 'Justificar inasistencia médica', 'Ponderación de notas (1290)']
            : user.rol === 'DOCENTE'
            ? ['Criterios Decreto 1290', 'Anotación observador Ley 1620', 'Mi horario semanal']
            : ['¿Dónde veo mis notas?', 'Mi horario de clases', 'Requisitos de Matrícula']
        }
      ];
    }

    return [
      {
        id: 'welcome-public',
        sender: 'bot',
        text: `¡Hola! Bienvenido(a) a **EduConnect** 🏫✨ Soy **EduBot**, el asistente institucional virtual.\n\nPuedo orientarte sobre admisiones, costos, calendario escolar, jornadas y uso de la plataforma. ¿En qué te ayudo?`,
        timestamp: horaActual,
        chips: [
          'Requisitos de Matrícula',
          'Costos y Pensiones',
          'Horarios de Clase',
          '¿Cómo ingresar al portal?'
        ]
      }
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final del chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  // Actualizar mensaje inicial si el usuario inicia o cierra sesión
  useEffect(() => {
    if (isOpen && messages.length === 1 && messages[0].id.startsWith('welcome')) {
      // Re-evaluar mensaje
    }
  }, [user, isAuthenticated]);

  const handleSendMessage = (texto?: string) => {
    const textoAEnviar = (texto || inputText).trim();
    if (!textoAEnviar) return;

    setShowTooltip(false);

    const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textoAEnviar,
      timestamp: hora
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulación de razonamiento natural (400ms)
    setTimeout(() => {
      const respuesta: BotResponse = procesarMensajeEduBot(textoAEnviar, {
        nombre: user?.nombreCompleto,
        rol: user?.rol,
        email: user?.email,
        isLoggedIn: isAuthenticated
      });

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: respuesta.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        chips: respuesta.chips
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, botMsg]);
    }, 450);
  };

  const handleResetChat = () => {
    const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages([
      {
        id: `reset-${Date.now()}`,
        sender: 'bot',
        text: `Conversación reiniciada 🔄. ¿Qué otra duda o consulta institucional tienes?`,
        timestamp: hora,
        chips: [
          'Requisitos de Matrícula',
          'Costos y Pensiones',
          'Ponderación Decreto 1290',
          'Horarios de Atención'
        ]
      }
    ]);
  };

  // Función simple para formatear negritas y listas en el texto del bot
  const formatBotText = (txt: string) => {
    return txt.split('\n').map((line, idx) => {
      // Formato para listas
      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('• ');
      const cleanLine = isBullet ? line.trim().substring(2) : line;

      // Reemplazo básico de **negrita**
      const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} style={{ color: '#ffffff' }}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={pIdx} style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 5px', borderRadius: '4px', color: '#38bdf8' }}>{part.slice(1, -1)}</code>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', marginTop: '3px' }}>
            <span style={{ color: '#38bdf8' }}>•</span>
            <div>{renderedParts}</div>
          </div>
        );
      }

      return <div key={idx} style={{ minHeight: line.trim() === '' ? '8px' : 'auto' }}>{renderedParts}</div>;
    });
  };

  return (
    <>
      {/* ==============================================================================
          WIDGET FLOTANTE / BOTÓN DEL ASISTENTE (ESQUINA INFERIOR DERECHA)
         ============================================================================== */}
      <div
        className="no-print"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9990,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          fontFamily: "'Segoe UI', Roboto, sans-serif"
        }}
      >
        {/* TOOLTIP / BURBUJA INFORMATIVA PROACTIVA (CUANDO ESTÁ CERRADO) */}
        {!isOpen && showTooltip && (
          <div
            style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              border: '1px solid #38bdf8',
              borderRadius: '16px',
              padding: '0.75rem 1rem',
              color: '#ffffff',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(56, 189, 248, 0.2)',
              marginBottom: '12px',
              maxWidth: '240px',
              fontSize: '0.85rem',
              lineHeight: 1.4,
              position: 'relative',
              animation: 'bounce 2.5s infinite',
              cursor: 'pointer'
            }}
            onClick={() => {
              setIsOpen(true);
              setShowTooltip(false);
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontWeight: 800, color: '#38bdf8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={13} /> EduBot Activo
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(false);
                }}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
              >
                <X size={13} />
              </button>
            </div>
            <span>¿Tienes dudas sobre matrículas, notas o el colegio? ¡Pregúntame!</span>
          </div>
        )}

        {/* BOTÓN CIRCULAR PRINCIPAL CON EL AVATAR DE EDUBOT */}
        {!isOpen && (
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setShowTooltip(false);
            }}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              border: '2.5px solid #38bdf8',
              boxShadow: '0 8px 30px rgba(2, 132, 199, 0.5), 0 0 20px rgba(56, 189, 248, 0.3)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              padding: 0,
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
            title="Abrir Asistente Institucional EduBot"
          >
            <img
              src="/edubot-avatar.jpg"
              alt="EduBot"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                // Fallback si por alguna razón falla la carga de imagen
                e.currentTarget.style.display = 'none';
              }}
            />
            {/* INDICADOR VERDE "ONLINE" */}
            <span
              style={{
                position: 'absolute',
                bottom: '2px',
                right: '4px',
                width: '14px',
                height: '14px',
                backgroundColor: '#22c55e',
                borderRadius: '50%',
                border: '2px solid #0f172a'
              }}
            />
          </button>
        )}

        {/* ==============================================================================
            VENTANA DE CHAT DE EDUBOT (ESTADO ABIERTO)
           ============================================================================== */}
        {isOpen && (
          <div
            style={{
              width: '380px',
              maxWidth: 'calc(100vw - 32px)',
              height: '540px',
              maxHeight: 'calc(100vh - 100px)',
              background: 'linear-gradient(160deg, rgba(15, 23, 42, 0.96) 0%, rgba(10, 15, 30, 0.98) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '24px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 35px rgba(56, 189, 248, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'fadeIn 0.25s ease-out'
            }}
          >
            {/* ENCABEZADO DEL CHAT */}
            <div
              style={{
                padding: '1rem 1.25rem',
                background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'white'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '2px solid white',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                    flexShrink: 0
                  }}
                >
                  <img
                    src="/edubot-avatar.jpg"
                    alt="EduBot"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>EduBot</h3>
                    <span
                      style={{
                        background: '#dcfce7',
                        color: '#15803d',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '6px',
                        textTransform: 'uppercase'
                      }}
                    >
                      Autónomo
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#e0f2fe' }}>
                    Asistente Institucional Inteligente
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <button
                  type="button"
                  onClick={handleResetChat}
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: 'none',
                    color: 'white',
                    borderRadius: '8px',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title="Reiniciar chat"
                >
                  <RotateCcw size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: 'none',
                    color: 'white',
                    borderRadius: '8px',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title="Cerrar ventana"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* CUERPO DEL CHAT (MENSAJES) */}
            <div
              style={{
                flex: 1,
                padding: '1rem',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                fontSize: '0.88rem'
              }}
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '0.75rem 1rem',
                      borderRadius: m.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background:
                        m.sender === 'user'
                          ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                          : 'rgba(30, 41, 59, 0.85)',
                      border: m.sender === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                      color: m.sender === 'user' ? '#ffffff' : '#cbd5e1',
                      lineHeight: 1.5,
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                      wordBreak: 'break-word'
                    }}
                  >
                    {m.sender === 'bot' ? formatBotText(m.text) : m.text}
                  </div>

                  <span style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '3px', padding: '0 4px' }}>
                    {m.timestamp}
                  </span>

                  {/* CHIPS DE SUGERENCIA RÁPIDA (SI EL MENSAJE LOS TIENE) */}
                  {m.chips && m.chips.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.4rem',
                        marginTop: '0.6rem',
                        maxWidth: '95%'
                      }}
                    >
                      {m.chips.map((chip, cIdx) => (
                        <button
                          key={cIdx}
                          type="button"
                          onClick={() => handleSendMessage(chip)}
                          style={{
                            background: 'rgba(56, 189, 248, 0.1)',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                            color: '#38bdf8',
                            borderRadius: '12px',
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(56, 189, 248, 0.2)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)')}
                        >
                          <span>{chip}</span>
                          <ChevronRight size={12} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* INDICADOR DE ESCRITURA (PENSANDO...) */}
              {isTyping && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}
                  >
                    <img src="/edubot-avatar.jpg" alt="EduBot" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div
                    style={{
                      background: 'rgba(30, 41, 59, 0.85)',
                      padding: '0.5rem 0.85rem',
                      borderRadius: '14px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>EduBot está escribiendo...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* PIE DEL CHAT / ENTRADA DE TEXTO */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              style={{
                padding: '0.75rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(15, 23, 42, 0.9)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <input
                type="text"
                placeholder="Escribe tu consulta a EduBot..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '0.65rem 0.85rem',
                  color: 'white',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: inputText.trim() ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'rgba(255,255,255,0.08)',
                  border: 'none',
                  color: inputText.trim() ? '#ffffff' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: inputText.trim() ? 'pointer' : 'default',
                  transition: 'all 0.2s'
                }}
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
};
