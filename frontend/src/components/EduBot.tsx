import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { processEduBotQuery, getSuggestionsForRole } from '../services/edubotBrain';
import { Role } from '../types';
import {
  MessageSquare,
  X,
  Send,
  RotateCcw,
  Bot,
  ChevronRight,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  chips?: string[];
}

interface EduBotProps {
  userRole?: Role | string;
  userName?: string;
}

export const EduBot: React.FC<EduBotProps> = ({ userRole, userName }) => {
  const { user } = useAuth();
  const effectiveRole = userRole || user?.rol || 'ESTUDIANTE';
  const effectiveName = userName || user?.nombreCompleto || 'Usuario Institucional';

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const buildWelcomeMessage = (): ChatMessage => ({
    id: 'welcome-auth',
    sender: 'bot',
    text: `¡Hola **${effectiveName}**! Soy **EduBot**, tu asistente institucional conectado al servidor Spring Boot y PostgreSQL.\n\nEstoy configurado para tu rol de **${effectiveRole}**. ¿Qué consulta deseas realizar hoy?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    chips: getSuggestionsForRole(effectiveRole),
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => [buildWelcomeMessage()]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = async (texto?: string) => {
    const textoAEnviar = (texto || inputText).trim();
    if (!textoAEnviar || isTyping) return;

    const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textoAEnviar,
      timestamp: hora,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    const respuesta = await processEduBotQuery(textoAEnviar, effectiveRole);

    const botMsg: ChatMessage = {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: respuesta.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      chips: respuesta.suggestions,
    };

    setIsTyping(false);
    setMessages((prev) => [...prev, botMsg]);
  };

  return (
    <div className="no-print" style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9000 }}>
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Abrir asistente EduBot"
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: '#ffffff',
            border: '2px solid rgba(255,255,255,0.2)',
            boxShadow: '0 12px 30px rgba(37, 99, 235, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <MessageSquare size={26} />
        </button>
      ) : (
        <div
          style={{
            width: '380px',
            maxWidth: 'calc(100vw - 2rem)',
            height: '520px',
            background: '#ffffff',
            border: '1px solid var(--ec-border)',
            borderRadius: '22px',
            boxShadow: 'var(--ec-shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #07142f 0%, #175cff 100%)',
              padding: '1rem 1.2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: '#fff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.94rem' }}>EduBot Institucional</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.88 }}>Asistente por Rol · API Activa</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={() => setMessages([buildWelcomeMessage()])}
                title="Reiniciar conversación"
                style={{ background: 'rgba(255,255,255,0.16)', border: 'none', color: '#fff', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}
              >
                <RotateCcw size={15} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Cerrar asistente"
                style={{ background: 'rgba(255,255,255,0.16)', border: 'none', color: '#fff', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}
              >
                <X size={15} />
              </button>
            </div>
          </div>

          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem', background: 'var(--ec-bg)' }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '88%',
                }}
              >
                <div
                  style={{
                    background: msg.sender === 'user' ? 'var(--ec-primary)' : '#ffffff',
                    color: msg.sender === 'user' ? '#ffffff' : 'var(--ec-text)',
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--ec-border)',
                    padding: '0.72rem 0.95rem',
                    borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    fontSize: '0.84rem',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-line',
                    boxShadow: 'var(--ec-shadow-xs)',
                  }}
                >
                  {msg.text}
                </div>
                {msg.chips && msg.chips.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                    {msg.chips.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleSendMessage(chip)}
                        style={{
                          background: 'var(--ec-primary-soft)',
                          border: '1px solid var(--ec-primary-border)',
                          color: 'var(--ec-primary-dark)',
                          borderRadius: '999px',
                          padding: '0.3rem 0.65rem',
                          fontSize: '0.73rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                          cursor: 'pointer',
                        }}
                      >
                        <ChevronRight size={12} />
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div style={{ fontSize: '0.8rem', color: 'var(--ec-text-muted)', fontStyle: 'italic' }}>
                EduBot está consultando la base de datos...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '0.75rem',
              borderTop: '1px solid var(--ec-border)',
              background: '#ffffff',
              display: 'flex',
              gap: '0.5rem',
            }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe tu consulta institucional..."
              className="form-input"
              style={{ flex: 1 }}
            />
            <button type="submit" disabled={isTyping} className="btn-primary-action" style={{ padding: '0.6rem 0.9rem' }}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default EduBot;
