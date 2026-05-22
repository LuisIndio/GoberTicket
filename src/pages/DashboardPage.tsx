import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getTickets } from '../api/tickets'
import { useAuthStore } from '../store/authStore'
import type { TicketResponse } from '../types'

const statusDot: Record<string, string> = {
  Creado: '#3b82f6', Asignado: '#f59e0b', Atendido: '#16a34a', Rechazado: '#ef4444'
}
const statusBg: Record<string, string> = {
  Creado: '#eff6ff', Asignado: '#fffbeb', Atendido: '#f0fdf4', Rechazado: '#fef2f2'
}
const statusColor: Record<string, string> = {
  Creado: '#1d4ed8', Asignado: '#b45309', Atendido: '#15803d', Rechazado: '#dc2626'
}
const priorityBg: Record<string, string> = {
  Baja: '#f8fafc', Media: '#f0f9ff', Alta: '#fff7ed', Critica: '#fef2f2'
}
const priorityColor: Record<string, string> = {
  Baja: '#64748b', Media: '#0369a1', Alta: '#c2410c', Critica: '#dc2626'
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })
}

interface StatCardProps {
  label: string
  value: number
  icon: React.ReactNode
  accent: string
  bg: string
}

function StatCard({ label, value, icon, accent, bg }: StatCardProps) {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderTop: `3px solid ${accent}`,
      borderRadius: '14px',
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          {label}
        </span>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: accent,
        }}>
          {icon}
        </div>
      </div>
      <p style={{ fontSize: '34px', fontWeight: '700', color: '#111827', lineHeight: 1 }}>{value}</p>
    </div>
  )
}

function TicketRow({ ticket, onClick }: { ticket: TicketResponse; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        padding: '14px 16px', borderRadius: '12px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        cursor: 'pointer', transition: 'all 0.15s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = '#166534'
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(22,101,52,0.1)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
      }}
    >
      <div style={{
        width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
        background: statusDot[ticket.status] ?? '#94a3b8',
      }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', fontFamily: 'monospace' }}>
            {ticket.ticketNumber}
          </span>
          <span style={{
            fontSize: '10px', fontWeight: '600', padding: '2px 7px', borderRadius: '20px',
            background: statusBg[ticket.status], color: statusColor[ticket.status],
          }}>
            {ticket.status}
          </span>
          <span style={{
            fontSize: '10px', padding: '2px 7px', borderRadius: '20px',
            background: priorityBg[ticket.priority], color: priorityColor[ticket.priority],
          }}>
            {ticket.priority}
          </span>
        </div>
        <p style={{ fontSize: '13.5px', fontWeight: '500', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {ticket.title}
        </p>
        <p style={{ fontSize: '11.5px', color: '#9ca3af', marginTop: '3px' }}>
          {ticket.createdByName}
          {ticket.assignedToName && <> · <span style={{ color: '#6b7280' }}>{ticket.assignedToName}</span></>}
        </p>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ fontSize: '11px', color: '#9ca3af' }}>{formatDate(ticket.createdAt)}</p>
        <p style={{ fontSize: '11px', color: '#d1d5db', marginTop: '3px' }}>
          {ticket.commentCount} comentarios
        </p>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { data: tickets = [], isLoading } = useQuery({ queryKey: ['tickets'], queryFn: getTickets })

  const stats = {
    total: tickets.length,
    creado: tickets.filter(t => t.status === 'Creado').length,
    asignado: tickets.filter(t => t.status === 'Asignado').length,
    atendido: tickets.filter(t => t.status === 'Atendido').length,
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', letterSpacing: '-0.5px' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
          Bienvenido de vuelta,{' '}
          <span style={{ color: '#166534', fontWeight: '600' }}>{user?.fullName}</span>
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '28px' }}>
        <StatCard label="Total" value={stats.total} accent="#166534"
          bg="#f0fdf4"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>}
        />
        <StatCard label="Creados" value={stats.creado} accent="#2563eb"
          bg="#eff6ff"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>}
        />
        <StatCard label="Asignados" value={stats.asignado} accent="#d97706"
          bg="#fffbeb"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
        />
        <StatCard label="Atendidos" value={stats.atendido} accent="#16a34a"
          bg="#f0fdf4"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>}
        />
      </div>

      {/* Recent tickets */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>Tickets Recientes</h2>
            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
              Últimas actualizaciones
            </p>
          </div>
          <button
            onClick={() => navigate('/tickets')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '13px', color: '#166534', fontWeight: '500',
              display: 'flex', alignItems: 'center', gap: '4px',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#14532d'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#166534'}
          >
            Ver todos
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                height: '72px', borderRadius: '12px',
                background: '#e2e8f0',
                animation: 'pulse 2s infinite',
              }} />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div style={{
            padding: '48px 24px', textAlign: 'center',
            background: '#ffffff',
            border: '1px dashed #d1d5db',
            borderRadius: '16px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <div style={{
              width: '52px', height: '52px', margin: '0 auto 16px',
              borderRadius: '14px', background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="1.5">
                <path d="M9 12h6m-3-3v6m-7 4h16a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
              No hay tickets aún
            </p>
            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '6px' }}>
              Los tickets creados aparecerán aquí
            </p>
            {(user?.role === 'Admin' || user?.role === 'Cliente') && (
              <button
                onClick={() => navigate('/tickets/new')}
                style={{
                  marginTop: '20px', padding: '9px 20px', borderRadius: '10px',
                  background: '#166534', border: 'none',
                  color: '#ffffff', fontSize: '13px', fontWeight: '600',
                  cursor: 'pointer', transition: 'all 0.15s',
                  boxShadow: '0 2px 8px rgba(22,101,52,0.25)',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#14532d'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#166534'}
              >
                Crear primer ticket
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {tickets.slice(0, 6).map(t => (
              <TicketRow key={t.id} ticket={t} onClick={() => navigate(`/tickets/${t.id}`)} />
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  )
}
