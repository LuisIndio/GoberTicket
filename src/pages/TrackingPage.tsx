import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getTicketByNumber, getComments } from '../api/tickets'
import type { TicketResponse, CommentResponse } from '../types'
import logoGreen from '../assets/LOGO GOBERNACION2.png'

const statusDot: Record<string, string> = {
  Creado: '#3b82f6', Asignado: '#f59e0b', Atendido: '#16a34a', Rechazado: '#ef4444',
}
const statusBg: Record<string, string> = {
  Creado: '#eff6ff', Asignado: '#fffbeb', Atendido: '#f0fdf4', Rechazado: '#fef2f2',
}
const statusColor: Record<string, string> = {
  Creado: '#1d4ed8', Asignado: '#b45309', Atendido: '#15803d', Rechazado: '#dc2626',
}
const priorityBg: Record<string, string> = {
  Baja: '#f8fafc', Media: '#f0f9ff', Alta: '#fff7ed', Critica: '#fef2f2',
}
const priorityColor: Record<string, string> = {
  Baja: '#64748b', Media: '#0369a1', Alta: '#c2410c', Critica: '#dc2626',
}

function formatDate(d: string) {
  return new Date(d).toLocaleString('es-BO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function TrackingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [input, setInput] = useState(searchParams.get('ticket') ?? '')
  const [ticket, setTicket] = useState<TicketResponse | null>(null)
  const [comments, setComments] = useState<CommentResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    const t = searchParams.get('ticket')
    if (t) { setInput(t); handleSearch(t) }
  }, [])

  async function handleSearch(num?: string) {
    const query = (num ?? input).trim().toUpperCase()
    if (!query) return
    setLoading(true); setError(''); setSearched(true); setTicket(null); setComments([])
    try {
      const t = await getTicketByNumber(query)
      const c = await getComments(t.id)
      setTicket(t); setComments(c)
    } catch {
      setError('No se encontró ningún ticket con ese número. Verificá que esté escrito correctamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', flexDirection: 'column', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* Banner institucional */}
      <div style={{ background: '#155c2a', padding: '7px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#8dc63f' }} />
        <span style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.6px', fontWeight: '500' }}>
          GOBIERNO AUTÓNOMO DEPARTAMENTAL · SANTA CRUZ · BOLIVIA
        </span>
        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#8dc63f' }} />
      </div>

      {/* Header */}
      <header style={{
        background: '#ffffff', borderBottom: '1px solid #e2e8f0',
        padding: '0 32px', height: '64px',
        display: 'flex', alignItems: 'center', gap: '16px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}>
        <img src={logoGreen} alt="Gobernación SCZ" style={{ height: '36px', width: 'auto', cursor: 'pointer' }} onClick={() => navigate('/')} />
        <div style={{ flex: 1 }} />
        <button onClick={() => navigate('/')}
          style={{ padding: '7px 16px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '500', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', cursor: 'pointer' }}>
          Crear ticket
        </button>
        <button onClick={() => navigate('/login')}
          style={{ padding: '7px 16px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '600', background: '#1a7040', border: 'none', color: '#ffffff', cursor: 'pointer', boxShadow: '0 2px 8px rgba(26,112,64,0.25)' }}>
          Iniciar sesión
        </button>
      </header>

      <div style={{ flex: 1, padding: '32px 24px 48px', maxWidth: '680px', margin: '0 auto', width: '100%' }}>

        {/* Title */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#111827', letterSpacing: '-0.5px', margin: '0 0 6px' }}>
            Seguimiento de ticket
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            Ingresá el número de ticket que recibiste al crear tu solicitud.
          </p>
        </div>

        {/* Search box */}
        <div style={{
          background: '#ffffff', border: '1px solid #e2e8f0',
          borderRadius: '16px', padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          marginBottom: '24px',
        }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>
            Número de ticket
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Ej: TKT-00004"
              style={{
                flex: 1, background: '#f9fafb', border: '1px solid #d1d5db',
                borderRadius: '10px', padding: '11px 14px',
                fontSize: '14px', fontFamily: 'monospace', color: '#111827',
                outline: 'none', letterSpacing: '1px',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={e => { e.target.style.borderColor = '#1a7040'; e.target.style.boxShadow = '0 0 0 3px rgba(26,112,64,0.1)'; e.target.style.background = '#ffffff' }}
              onBlur={e => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f9fafb' }}
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading || !input.trim()}
              style={{
                padding: '11px 22px', borderRadius: '10px', fontSize: '13.5px', fontWeight: '600',
                background: input.trim() ? '#1a7040' : '#e2e8f0',
                border: 'none',
                color: input.trim() ? '#ffffff' : '#9ca3af',
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                boxShadow: input.trim() ? '0 4px 12px rgba(26,112,64,0.3)' : 'none',
                display: 'flex', alignItems: 'center', gap: '7px',
                transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}
            >
              {loading ? (
                <svg style={{ animation: 'spin 1s linear infinite' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
              )}
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && searched && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: '12px', padding: '16px 20px',
            display: 'flex', alignItems: 'flex-start', gap: '12px',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}>
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <p style={{ fontSize: '13.5px', color: '#dc2626', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Ticket result */}
        {ticket && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Header card */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '22px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#9ca3af', fontFamily: 'monospace', letterSpacing: '1px' }}>
                  {ticket.ticketNumber}
                </span>
                <span style={{
                  fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px',
                  background: statusBg[ticket.status], color: statusColor[ticket.status],
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: statusDot[ticket.status] }} />
                  {ticket.status}
                </span>
                {ticket.priority !== 'Media' && (
                  <span style={{
                    fontSize: '11px', padding: '3px 10px', borderRadius: '20px',
                    background: priorityBg[ticket.priority], color: priorityColor[ticket.priority],
                  }}>
                    {ticket.priority}
                  </span>
                )}
              </div>

              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 10px', lineHeight: 1.3 }}>
                {ticket.title}
              </h2>

              <p style={{ fontSize: '13.5px', color: '#6b7280', lineHeight: '1.65', margin: '0 0 16px', whiteSpace: 'pre-wrap' }}>
                {ticket.description}
              </p>

              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '3px' }}>Creado</p>
                  <p style={{ fontSize: '12px', color: '#374151' }}>{formatDate(ticket.createdAt)}</p>
                </div>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '3px' }}>Última actualización</p>
                  <p style={{ fontSize: '12px', color: '#374151' }}>{formatDate(ticket.updatedAt)}</p>
                </div>
                {ticket.assignedToName && (
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '3px' }}>Técnico asignado</p>
                    <p style={{ fontSize: '12px', color: '#374151' }}>{ticket.assignedToName}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Estado visual */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '22px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                Progreso
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                {(['Creado', 'Asignado', 'Atendido'] as const).map((step, i) => {
                  const steps = ['Creado', 'Asignado', 'Atendido']
                  const currentIdx = ticket.status === 'Rechazado' ? 1 : steps.indexOf(ticket.status)
                  const stepIdx = steps.indexOf(step)
                  const done = stepIdx <= currentIdx
                  const active = stepIdx === currentIdx && ticket.status !== 'Rechazado'
                  return (
                    <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : undefined }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                          background: done ? statusDot[step] ?? '#16a34a' : '#e2e8f0',
                          border: active ? `3px solid ${statusDot[step]}` : '3px solid transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s',
                          boxShadow: active ? `0 0 0 4px ${statusBg[step]}` : 'none',
                        }}>
                          {done && (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: done ? '600' : '400', color: done ? '#374151' : '#9ca3af', whiteSpace: 'nowrap' }}>
                          {step}
                        </span>
                      </div>
                      {i < 2 && (
                        <div style={{ flex: 1, height: '3px', background: stepIdx < currentIdx ? '#16a34a' : '#e2e8f0', margin: '0 4px', marginBottom: '18px', borderRadius: '2px', transition: 'background 0.2s' }} />
                      )}
                    </div>
                  )
                })}
              </div>
              {ticket.status === 'Rechazado' && (
                <div style={{ marginTop: '14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  <span style={{ fontSize: '12.5px', color: '#dc2626', fontWeight: '500' }}>Este ticket fue rechazado.</span>
                </div>
              )}
            </div>

            {/* Comentarios */}
            {comments.length > 0 && (
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '22px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                  Actualizaciones ({comments.length})
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {comments.map(c => (
                    <div key={c.id} style={{ display: 'flex', gap: '10px' }}>
                      <div style={{
                        width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                        background: '#f0fdf4', border: '1px solid #bbf7d0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', fontWeight: '700', color: '#166534',
                      }}>
                        {c.authorName.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, background: '#f8fafc', borderRadius: '12px', padding: '10px 14px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>{c.authorName}</span>
                          <span style={{ fontSize: '11px', color: '#9ca3af' }}>{formatDate(c.createdAt)}</span>
                        </div>
                        <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.6', margin: 0 }}>{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Empty state si no se buscó nada */}
        {!searched && (
          <div style={{
            textAlign: 'center', padding: '40px 24px',
            background: '#ffffff', border: '1px dashed #d1d5db',
            borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <div style={{
              width: '52px', height: '52px', margin: '0 auto 16px',
              borderRadius: '14px', background: '#f0fdf4', border: '1px solid #bbf7d0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
            </div>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '0 0 4px' }}>
              Ingresá tu número de ticket
            </p>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
              Lo encontrás en el correo o en la pantalla de confirmación al crear el ticket.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #9ca3af; }
      `}</style>
    </div>
  )
}
