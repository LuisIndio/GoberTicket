import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getTickets } from '../api/tickets'
import { useAuthStore } from '../store/authStore'
import type { TicketResponse } from '../types'

const STATUS_OPTIONS = ['Todos', 'Creado', 'Asignado', 'Atendido', 'Rechazado']

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

function TicketCard({ ticket, onClick }: { ticket: TicketResponse; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '14px 16px', borderRadius: '12px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        cursor: 'pointer', transition: 'all 0.15s',
        display: 'flex', alignItems: 'center', gap: '14px',
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
      {/* Status bar */}
      <div style={{
        width: '3px', height: '48px', borderRadius: '99px', flexShrink: 0,
        background: statusDot[ticket.status] ?? '#94a3b8',
      }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
            {ticket.ticketNumber}
          </span>
          <span style={{
            fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px',
            background: statusBg[ticket.status], color: statusColor[ticket.status],
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: statusDot[ticket.status], flexShrink: 0 }} />
            {ticket.status}
          </span>
          <span style={{
            fontSize: '10px', padding: '2px 8px', borderRadius: '20px',
            background: priorityBg[ticket.priority], color: priorityColor[ticket.priority],
          }}>
            {ticket.priority}
          </span>
        </div>

        <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {ticket.title}
        </p>

        <p style={{ fontSize: '11.5px', color: '#9ca3af', marginTop: '4px' }}>
          {ticket.createdByName}
          {ticket.assignedToName && (
            <> · Asignado a <span style={{ color: '#6b7280' }}>{ticket.assignedToName}</span></>
          )}
          {' · '}{new Date(ticket.updatedAt).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })}
        </p>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#9ca3af', fontSize: '11px' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          {ticket.commentCount}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#9ca3af', fontSize: '11px' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          {ticket.attachmentCount}
        </div>
      </div>

      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" style={{ flexShrink: 0 }}>
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </div>
  )
}

export function TicketsPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('Todos')
  const [search, setSearch] = useState('')

  const { data: tickets = [], isLoading } = useQuery({ queryKey: ['tickets'], queryFn: getTickets })

  const filtered = tickets.filter(t => {
    const matchStatus = filter === 'Todos' || t.status === filter
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.ticketNumber.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', letterSpacing: '-0.5px' }}>Tickets</h1>
          <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        {(user?.role === 'Admin' || user?.role === 'Cliente') && (
          <button
            onClick={() => navigate('/tickets/new')}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '10px 18px', borderRadius: '10px',
              background: '#166534',
              border: 'none',
              color: '#fff', fontSize: '13.5px', fontWeight: '600',
              cursor: 'pointer', flexShrink: 0,
              boxShadow: '0 4px 12px rgba(22,101,52,0.25)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = '#14532d'
              ;(e.currentTarget as HTMLElement).style.boxShadow = '0 6px 18px rgba(22,101,52,0.35)'
              ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = '#166534'
              ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(22,101,52,0.25)'
              ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            Nuevo Ticket
          </button>
        )}
      </div>

      {/* Search + filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
        <div style={{ position: 'relative' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"
            style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }}>
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por título o número de ticket..."
            style={{
              width: '100%', boxSizing: 'border-box',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '11px 14px 11px 40px',
              fontSize: '13.5px', color: '#111827',
              outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
            onFocus={e => {
              (e.target as HTMLInputElement).style.borderColor = '#166534'
              ;(e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(22,101,52,0.08)'
            }}
            onBlur={e => {
              (e.target as HTMLInputElement).style.borderColor = '#e2e8f0'
              ;(e.target as HTMLInputElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '500',
                cursor: 'pointer', transition: 'all 0.15s',
                background: filter === s ? '#166534' : '#ffffff',
                border: filter === s ? '1px solid #166534' : '1px solid #e2e8f0',
                color: filter === s ? '#ffffff' : '#6b7280',
                boxShadow: filter === s ? '0 2px 8px rgba(22,101,52,0.2)' : '0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{
              height: '80px', borderRadius: '12px',
              background: '#e2e8f0',
              animation: 'pulse 2s infinite',
            }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          padding: '56px 24px', textAlign: 'center',
          background: '#ffffff',
          border: '1px dashed #d1d5db',
          borderRadius: '16px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5"
            style={{ margin: '0 auto 16px', display: 'block' }}>
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
            {search ? 'Sin resultados para tu búsqueda' : 'No hay tickets en esta categoría'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {filtered.map(t => (
            <TicketCard key={t.id} ticket={t} onClick={() => navigate(`/tickets/${t.id}`)} />
          ))}
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        input::placeholder { color: #9ca3af; }
      `}</style>
    </div>
  )
}
