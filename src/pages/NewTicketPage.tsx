import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTicket } from '../api/tickets'
import { useAuthStore } from '../store/authStore'
import logoLight from '../assets/LOGO GOBERNACION1.png'

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: '#f9fafb',
  border: '1px solid #d1d5db',
  borderRadius: '10px',
  padding: '11px 13px',
  fontSize: '13.5px', color: '#111827',
  outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
}

export function NewTicketPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { isAuthenticated } = useAuthStore()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [creatorName, setCreatorName] = useState('')
  const [creatorEmail, setCreatorEmail] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState<{ ticketNumber: string; id: number } | null>(null)

  const mutation = useMutation({
    mutationFn: () => createTicket({
      title, description,
      ...(!isAuthenticated && { creatorName, creatorEmail }),
    }),
    onSuccess: (ticket) => {
      qc.invalidateQueries({ queryKey: ['tickets'] })
      if (isAuthenticated) {
        navigate(`/tickets/${ticket.id}`)
      } else {
        setSubmitted({ ticketNumber: ticket.ticketNumber, id: ticket.id })
      }
    },
    onError: () => setError('Error al crear el ticket. Intente de nuevo.'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!title.trim() || !description.trim()) { setError('El título y la descripción son obligatorios.'); return }
    if (!isAuthenticated && !creatorName.trim()) { setError('El nombre es obligatorio.'); return }
    mutation.mutate()
  }

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#1a7040'
    e.target.style.boxShadow = '0 0 0 3px rgba(26,112,64,0.1)'
    e.target.style.background = '#ffffff'
  }
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#d1d5db'
    e.target.style.boxShadow = 'none'
    e.target.style.background = '#f9fafb'
  }

  // ── Pantalla de confirmación ──
  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', flexDirection: 'column' }}>
        {/* Banner */}
        <div style={{ background: '#155c2a', padding: '7px 24px', textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.3px' }}>
          Gobierno Autónomo Departamental · Santa Cruz
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{
            maxWidth: '480px', width: '100%',
            background: '#ffffff', border: '1px solid #e2e8f0',
            borderRadius: '20px', padding: '40px 32px', textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 20px',
              background: '#f0fdf4', border: '2px solid #86efac',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '10px' }}>Ticket enviado</h2>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px', lineHeight: '1.6' }}>
              Tu ticket fue recibido correctamente. Un técnico lo atenderá a la brevedad.
            </p>
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: '12px', padding: '14px 20px', marginBottom: '28px', display: 'inline-block',
            }}>
              <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Número de ticket</p>
              <p style={{ fontSize: '22px', fontWeight: '700', color: '#1a7040', fontFamily: 'monospace', letterSpacing: '1px' }}>
                {submitted.ticketNumber}
              </p>
            </div>
            <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '24px' }}>
              Guardá este número para hacer seguimiento de tu solicitud.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => { setSubmitted(null); setTitle(''); setDescription(''); setCreatorName(''); setCreatorEmail('') }}
                style={{
                  padding: '11px 22px', borderRadius: '10px', fontSize: '13.5px', fontWeight: '600',
                  background: '#1a7040', border: 'none', color: '#fff', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(26,112,64,0.3)',
                }}
              >
                Enviar otro ticket
              </button>
              <button onClick={() => navigate('/login')}
                style={{
                  padding: '11px 22px', borderRadius: '10px', fontSize: '13.5px',
                  background: '#ffffff', border: '1px solid #d1d5db', color: '#6b7280', cursor: 'pointer',
                }}>
                Iniciar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Vista pública ──
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', flexDirection: 'column', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

        {/* Banner institucional */}
        <div style={{ background: '#155c2a', padding: '7px 32px', fontSize: '12px', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.3px', textAlign: 'center' }}>
          Gobierno Autónomo Departamental · Santa Cruz
        </div>

        {/* Header */}
        <header style={{
          background: '#ffffff', borderBottom: '1px solid #e2e8f0',
          padding: '0 32px', height: '64px',
          display: 'flex', alignItems: 'center', gap: '16px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          <img src={logoLight} alt="Gobernación SCZ" style={{ height: '36px', width: 'auto' }} />
          <div style={{ flex: 1 }} />
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '8px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
              background: '#1a7040', border: 'none', color: '#ffffff', cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(26,112,64,0.25)',
            }}
          >
            Iniciar sesión
          </button>
        </header>

        {/* Hero */}
        <div style={{ padding: '32px 24px 0', maxWidth: '760px', margin: '0 auto', width: '100%' }}>
          <div style={{
            background: 'linear-gradient(135deg, #155c2a 0%, #1a7040 55%, #1d7a44 100%)',
            borderRadius: '24px',
            padding: '44px 48px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Decorative circle */}
            <div style={{
              position: 'absolute', top: '-60px', right: '-60px',
              width: '220px', height: '220px', borderRadius: '50%',
              background: 'rgba(141,198,63,0.12)',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', bottom: '-40px', left: '-40px',
              width: '160px', height: '160px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)',
              pointerEvents: 'none',
            }} />

            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
              borderRadius: '20px', padding: '6px 14px', marginBottom: '20px',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8dc63f' }} />
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>Sistema de Soporte Técnico</span>
            </div>

            <h1 style={{ fontSize: 'clamp(26px,5vw,38px)', fontWeight: '800', color: '#ffffff', lineHeight: 1.15, margin: '0 0 6px', letterSpacing: '-0.5px' }}>
              Reportá tu problema,
            </h1>
            <h1 style={{ fontSize: 'clamp(26px,5vw,38px)', fontWeight: '800', color: '#8dc63f', lineHeight: 1.15, margin: '0 0 16px', letterSpacing: '-0.5px' }}>
              te atendemos rápido.
            </h1>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.75)', lineHeight: '1.6', margin: '0 0 28px', maxWidth: '480px' }}>
              Completá el formulario con tu consulta o problema técnico y un agente de la Gobernación lo atenderá a la brevedad.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a href="#form" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '13px 24px', borderRadius: '12px',
                background: '#ffffff', border: 'none',
                color: '#155c2a', fontSize: '14px', fontWeight: '700',
                textDecoration: 'none', cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                transition: 'all 0.15s',
              }}>
                Enviar ticket →
              </a>
            </div>
          </div>
        </div>

        {/* Form */}
        <div id="form" style={{ padding: '24px 24px 48px', maxWidth: '760px', margin: '0 auto', width: '100%' }}>
          <form onSubmit={handleSubmit}>
            <div style={{
              background: '#ffffff', border: '1px solid #e2e8f0',
              borderRadius: '18px', padding: '28px',
              display: 'flex', flexDirection: 'column', gap: '20px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            }}>
              {/* Datos de contacto */}
              <div style={{ paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <div style={{ width: '4px', height: '18px', background: '#8dc63f', borderRadius: '2px' }} />
                  <p style={{ fontSize: '12px', fontWeight: '700', color: '#155c2a', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Tus datos de contacto
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>
                      Nombre completo <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input value={creatorName} onChange={e => setCreatorName(e.target.value)}
                      placeholder="Juan Pérez" required style={inputStyle}
                      onFocus={focusStyle} onBlur={blurStyle} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>
                      Correo <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '400' }}>opcional</span>
                    </label>
                    <input type="email" value={creatorEmail} onChange={e => setCreatorEmail(e.target.value)}
                      placeholder="juan@ejemplo.com" style={inputStyle}
                      onFocus={focusStyle} onBlur={blurStyle} />
                  </div>
                </div>
              </div>

              {/* Detalles del ticket */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ width: '4px', height: '18px', background: '#8dc63f', borderRadius: '2px' }} />
                <p style={{ fontSize: '12px', fontWeight: '700', color: '#155c2a', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Detalles del ticket
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>
                  Título <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="Resumen breve del problema o solicitud"
                  maxLength={200} required style={inputStyle}
                  onFocus={focusStyle} onBlur={blurStyle} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>
                  Descripción <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Describí el problema con detalle: qué pasó, cuándo, cómo reproducirlo..."
                  rows={5} required
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' } as React.CSSProperties}
                  onFocus={focusStyle as unknown as React.FocusEventHandler<HTMLTextAreaElement>}
                  onBlur={blurStyle as unknown as React.FocusEventHandler<HTMLTextAreaElement>}
                />
              </div>

              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '11px 14px', fontSize: '13px', color: '#dc2626' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={mutation.isPending}
                style={{
                  padding: '14px 24px', borderRadius: '12px',
                  background: mutation.isPending ? '#d1d5db' : 'linear-gradient(135deg, #1a7040, #155c2a)',
                  border: 'none', color: '#fff', fontSize: '15px', fontWeight: '700',
                  cursor: mutation.isPending ? 'not-allowed' : 'pointer',
                  boxShadow: mutation.isPending ? 'none' : '0 4px 16px rgba(26,112,64,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'all 0.15s', letterSpacing: '0.2px',
                }}
              >
                {mutation.isPending ? (
                  <svg style={{ animation: 'spin 1s linear infinite' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                )}
                {mutation.isPending ? 'Enviando...' : 'Enviar Ticket'}
              </button>
            </div>
          </form>
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          textarea::placeholder, input::placeholder { color: #9ca3af; }
        `}</style>
      </div>
    )
  }

  // ── Vista autenticada ──
  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
        <button onClick={() => navigate(-1)}
          style={{
            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
            background: '#ffffff', border: '1px solid #e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#6b7280', transition: 'all 0.15s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1a7040'; (e.currentTarget as HTMLElement).style.color = '#1a7040' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLElement).style.color = '#6b7280' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', letterSpacing: '-0.4px' }}>Nuevo Ticket</h1>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>Describe el problema o solicitud</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{
          background: '#ffffff', border: '1px solid #e2e8f0',
          borderRadius: '16px', padding: '24px',
          display: 'flex', flexDirection: 'column', gap: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>
              Título <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Resumen breve del problema o solicitud"
              maxLength={200} required style={inputStyle}
              onFocus={focusStyle} onBlur={blurStyle} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>
              Descripción <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Describí el problema con detalle..."
              rows={5} required
              style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' } as React.CSSProperties}
              onFocus={focusStyle as unknown as React.FocusEventHandler<HTMLTextAreaElement>}
              onBlur={blurStyle as unknown as React.FocusEventHandler<HTMLTextAreaElement>}
            />
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '11px 14px', fontSize: '13px', color: '#dc2626' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={mutation.isPending}
              style={{
                padding: '12px 24px', borderRadius: '10px',
                background: mutation.isPending ? '#d1d5db' : '#1a7040',
                border: 'none', color: '#fff', fontSize: '14px', fontWeight: '600',
                cursor: mutation.isPending ? 'not-allowed' : 'pointer',
                boxShadow: mutation.isPending ? 'none' : '0 4px 12px rgba(26,112,64,0.3)',
                display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s',
              }}>
              {mutation.isPending && <svg style={{ animation: 'spin 1s linear infinite' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>}
              {mutation.isPending ? 'Creando...' : 'Crear Ticket'}
            </button>
            <button type="button" onClick={() => navigate(-1)}
              style={{
                padding: '12px 20px', borderRadius: '10px',
                background: '#ffffff', border: '1px solid #e2e8f0',
                color: '#6b7280', fontSize: '14px', cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#9ca3af' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      </form>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } textarea::placeholder, input::placeholder { color: #9ca3af; }`}</style>
    </div>
  )
}
