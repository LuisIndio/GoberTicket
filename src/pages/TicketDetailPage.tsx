import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTicket, getComments, createComment,
  getAttachments, uploadAttachment, deleteAttachment, downloadAttachment,
  updateTicketStatus, assignTicket
} from '../api/tickets'
import { getTechnicians } from '../api/users'
import { useAuthStore } from '../store/authStore'

const STATUS_OPTIONS = [
  { value: 2, label: 'Asignado' },
  { value: 3, label: 'Atendido' },
  { value: 4, label: 'Rechazado' },
]

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

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString('es-BO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })
}

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '14px',
  padding: '18px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
}

const sectionLabel: React.CSSProperties = {
  fontSize: '11px', fontWeight: '700', color: '#9ca3af',
  textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px',
}

const selectStyle: React.CSSProperties = {
  width: '100%', background: '#f9fafb',
  border: '1px solid #d1d5db', borderRadius: '10px',
  padding: '9px 12px', fontSize: '13px', color: '#111827',
  outline: 'none', cursor: 'pointer', transition: 'border-color 0.15s',
}

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const ticketId = Number(id)
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const statusFileRef = useRef<HTMLInputElement>(null)
  const [commentText, setCommentText] = useState('')
  const [selectedAgent, setSelectedAgent] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [statusNote, setStatusNote] = useState('')
  const [statusFile, setStatusFile] = useState<File | null>(null)

  const { data: ticket, isLoading } = useQuery({ queryKey: ['ticket', ticketId], queryFn: () => getTicket(ticketId) })
  const { data: comments = [] } = useQuery({ queryKey: ['comments', ticketId], queryFn: () => getComments(ticketId) })
  const { data: attachments = [] } = useQuery({ queryKey: ['attachments', ticketId], queryFn: () => getAttachments(ticketId) })
  const { data: technicians = [] } = useQuery({ queryKey: ['technicians'], queryFn: getTechnicians, enabled: user?.role === 'Admin' })

  useEffect(() => {
    if (!ticket) return
    const statusValue = STATUS_OPTIONS.find(s => s.label === ticket.status)?.value
    if (statusValue) setSelectedStatus(String(statusValue))
    if (ticket.assignedToId) setSelectedAgent(ticket.assignedToId)
  }, [ticket?.id, ticket?.status, ticket?.assignedToId])

  const addComment = useMutation({
    mutationFn: () => createComment(ticketId, commentText),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['comments', ticketId] }); setCommentText('') },
  })

  const uploadFile = useMutation({
    mutationFn: (file: File) => uploadAttachment(ticketId, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attachments', ticketId] }),
  })

  const removeAttachment = useMutation({
    mutationFn: (attachmentId: number) => deleteAttachment(ticketId, attachmentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attachments', ticketId] }),
  })

  const changeStatus = useMutation({
    mutationFn: async () => {
      await createComment(ticketId, statusNote.trim())
      if (statusFile) await uploadAttachment(ticketId, statusFile)
      return updateTicketStatus(ticketId, Number(selectedStatus))
    },
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['ticket', ticketId] })
      qc.invalidateQueries({ queryKey: ['tickets'] })
      qc.invalidateQueries({ queryKey: ['comments', ticketId] })
      qc.invalidateQueries({ queryKey: ['attachments', ticketId] })
      setStatusNote('')
      setStatusFile(null)
      if (updated.status === 'Atendido' || updated.status === 'Rechazado') {
        navigate('/dashboard')
        return
      }
      const statusValue = STATUS_OPTIONS.find(s => s.label === updated.status)?.value
      if (statusValue) setSelectedStatus(String(statusValue))
    },
  })

  const assign = useMutation({
    mutationFn: ({ agentId, priority }: { agentId: string; priority: number }) =>
      assignTicket(ticketId, agentId, priority),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['ticket', ticketId] })
      qc.invalidateQueries({ queryKey: ['tickets'] })
      if (updated.assignedToId) setSelectedAgent(updated.assignedToId)
    },
  })

  const handleDownload = async (attId: number, fileName: string) => {
    const res = await downloadAttachment(ticketId, attId)
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url; a.download = fileName; a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[120, 200, 160].map((h, i) => (
          <div key={i} style={{ height: `${h}px`, borderRadius: '14px', background: '#e2e8f0', animation: 'pulse 2s infinite' }} />
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  )

  if (!ticket) return (
    <div style={{ textAlign: 'center', padding: '60px 24px', color: '#dc2626', fontSize: '14px' }}>
      Ticket no encontrado.
    </div>
  )

  const ticketClosed = ticket?.status === 'Atendido' || ticket?.status === 'Rechazado'
  const canChangeStatus = (user?.role === 'Admin' || user?.role === 'Tecnico') && !ticketClosed
  const isAdmin = user?.role === 'Admin'

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '20px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0, marginTop: '2px',
            background: '#ffffff', border: '1px solid #e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#6b7280', transition: 'all 0.15s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#166634'; (e.currentTarget as HTMLElement).style.color = '#166534' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLElement).style.color = '#6b7280' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#9ca3af', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
              {ticket.ticketNumber}
            </span>
            <span style={{
              fontSize: '11px', fontWeight: '600', padding: '3px 9px', borderRadius: '20px',
              background: statusBg[ticket.status], color: statusColor[ticket.status],
              display: 'inline-flex', alignItems: 'center', gap: '5px',
            }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: statusDot[ticket.status], flexShrink: 0 }} />
              {ticket.status}
            </span>
            <span style={{
              fontSize: '11px', fontWeight: '500', padding: '3px 9px', borderRadius: '20px',
              background: priorityBg[ticket.priority], color: priorityColor[ticket.priority],
            }}>
              {ticket.priority}
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(17px, 4vw, 22px)', fontWeight: '700', color: '#111827', letterSpacing: '-0.4px', lineHeight: 1.3 }}>
            {ticket.title}
          </h1>
          <p style={{ fontSize: '12.5px', color: '#9ca3af', marginTop: '6px' }}>
            Creado por <span style={{ color: '#374151', fontWeight: '500' }}>{ticket.createdByName}</span>
            {' · '}{formatDate(ticket.createdAt)}
            {ticket.assignedToName && (
              <> · Asignado a <span style={{ color: '#374151', fontWeight: '500' }}>{ticket.assignedToName}</span></>
            )}
          </p>
        </div>
      </div>

      {/* 2-column layout */}
      <div className="ticket-layout">
        {/* Left column */}
        <div className="ticket-main" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Description */}
          <div style={cardStyle}>
            <p style={sectionLabel}>Descripción</p>
            <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
              {ticket.description}
            </p>
          </div>

          {/* Comments */}
          <div style={cardStyle}>
            <p style={sectionLabel}>Comentarios ({comments.length})</p>

            {comments.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                Sin comentarios aún.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                {comments.map(c => (
                  <div key={c.id} style={{ display: 'flex', gap: '10px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                      background: '#f0fdf4', border: '1px solid #bbf7d0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: '700', color: '#166534',
                    }}>
                      {c.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div style={{
                      flex: 1, background: '#f8fafc', borderRadius: '12px',
                      padding: '10px 14px', border: '1px solid #e2e8f0',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>{c.authorName}</span>
                        <span style={{ fontSize: '11px', color: '#9ca3af' }}>{formatDateTime(c.createdAt)}</span>
                      </div>
                      <p style={{ fontSize: '13.5px', color: '#374151', lineHeight: '1.6' }}>{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px', display: 'flex', gap: '8px' }}>
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Escribe un comentario..."
                rows={2}
                style={{
                  flex: 1, background: '#f9fafb',
                  border: '1px solid #d1d5db', borderRadius: '10px',
                  padding: '10px 12px', fontSize: '13.5px', color: '#111827',
                  outline: 'none', resize: 'vertical', minHeight: '64px',
                  transition: 'border-color 0.15s',
                } as React.CSSProperties}
                onFocus={e => { (e.target as HTMLTextAreaElement).style.borderColor = '#166534'; (e.target as HTMLTextAreaElement).style.boxShadow = '0 0 0 3px rgba(22,101,52,0.08)' }}
                onBlur={e => { (e.target as HTMLTextAreaElement).style.borderColor = '#d1d5db'; (e.target as HTMLTextAreaElement).style.boxShadow = 'none' }}
                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey && commentText.trim()) addComment.mutate() }}
              />
              <button
                onClick={() => { if (commentText.trim()) addComment.mutate() }}
                disabled={!commentText.trim() || addComment.isPending}
                style={{
                  alignSelf: 'flex-end',
                  width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                  background: commentText.trim() ? '#166534' : '#e2e8f0',
                  border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: commentText.trim() ? 'pointer' : 'not-allowed',
                  color: '#fff', transition: 'all 0.15s',
                }}
              >
                {addComment.isPending ? (
                  <svg style={{ animation: 'spin 1s linear infinite' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                  </svg>
                )}
              </button>
            </div>
            <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>Ctrl+Enter para enviar</p>
          </div>

          {/* Attachments */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <p style={{ ...sectionLabel, marginBottom: 0 }}>Adjuntos ({attachments.length})</p>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploadFile.isPending}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '500',
                  background: '#f0fdf4', border: '1px solid #bbf7d0',
                  color: '#166534', cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#dcfce7'; (e.currentTarget as HTMLElement).style.borderColor = '#86efac' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f0fdf4'; (e.currentTarget as HTMLElement).style.borderColor = '#bbf7d0' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                </svg>
                {uploadFile.isPending ? 'Subiendo...' : 'Adjuntar'}
              </button>
              <input ref={fileRef} type="file" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile.mutate(f); e.target.value = '' }} />
            </div>

            {attachments.length === 0 ? (
              <div style={{
                padding: '24px', textAlign: 'center',
                border: '1px dashed #d1d5db', borderRadius: '10px',
                color: '#9ca3af', fontSize: '13px',
              }}>
                Sin archivos adjuntos.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {attachments.map(a => (
                  <div key={a.id} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    background: '#f8fafc', borderRadius: '10px',
                    padding: '10px 12px', border: '1px solid #e2e8f0',
                  }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                      background: '#f0fdf4', border: '1px solid #bbf7d0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#166534',
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: '500', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.fileName}
                      </p>
                      <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                        {formatSize(a.fileSize)} · {a.uploadedByName}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                      <button
                        onClick={() => handleDownload(a.id, a.fileName)}
                        style={{
                          width: '30px', height: '30px', borderRadius: '7px',
                          background: '#f0fdf4', border: '1px solid #bbf7d0',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: '#166534', transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#dcfce7' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f0fdf4' }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                        </svg>
                      </button>
                      {(isAdmin || a.uploadedByName === user?.fullName) && (
                        <button
                          onClick={() => removeAttachment.mutate(a.id)}
                          style={{
                            width: '30px', height: '30px', borderRadius: '7px',
                            background: '#fef2f2', border: '1px solid #fecaca',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: '#dc2626', transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fee2e2' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fef2f2' }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="ticket-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {ticketClosed && (
            <div style={{
              ...cardStyle,
              borderColor: ticket?.status === 'Atendido' ? '#bbf7d0' : '#fecaca',
              background: ticket?.status === 'Atendido' ? '#f0fdf4' : '#fef2f2',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                  background: ticket?.status === 'Atendido' ? '#dcfce7' : '#fee2e2',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {ticket?.status === 'Atendido' ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: ticket?.status === 'Atendido' ? '#15803d' : '#dc2626' }}>
                    Ticket {ticket?.status}
                  </p>
                  <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                    Este ticket ya no admite cambios de estado
                  </p>
                </div>
              </div>
            </div>
          )}

          {canChangeStatus && (
            <div style={cardStyle}>
              <p style={sectionLabel}>Cambiar Estado</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} style={selectStyle}
                  onFocus={e => { (e.target as HTMLSelectElement).style.borderColor = '#166534'; (e.target as HTMLSelectElement).style.boxShadow = '0 0 0 3px rgba(22,101,52,0.08)' }}
                  onBlur={e => { (e.target as HTMLSelectElement).style.borderColor = '#d1d5db'; (e.target as HTMLSelectElement).style.boxShadow = 'none' }}
                >
                  <option value="">Seleccionar estado...</option>
                  {STATUS_OPTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: '500', color: '#374151', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                    Descripción <span style={{ color: '#dc2626' }}>*</span>
                    <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '400' }}>requerida</span>
                  </label>
                  <textarea
                    value={statusNote}
                    onChange={e => setStatusNote(e.target.value)}
                    placeholder="Describe lo que hiciste o el motivo del cambio..."
                    rows={3}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: '#f9fafb', border: '1px solid #d1d5db',
                      borderRadius: '10px', padding: '9px 11px',
                      fontSize: '13px', color: '#111827',
                      outline: 'none', resize: 'vertical', minHeight: '72px',
                      transition: 'border-color 0.15s',
                    } as React.CSSProperties}
                    onFocus={e => { (e.target as HTMLTextAreaElement).style.borderColor = '#166534'; (e.target as HTMLTextAreaElement).style.boxShadow = '0 0 0 3px rgba(22,101,52,0.08)' }}
                    onBlur={e => { (e.target as HTMLTextAreaElement).style.borderColor = '#d1d5db'; (e.target as HTMLTextAreaElement).style.boxShadow = 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: '500', color: '#374151', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                    Adjunto <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '400' }}>opcional</span>
                  </label>
                  {statusFile ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      background: '#f0fdf4', border: '1px solid #bbf7d0',
                      borderRadius: '8px', padding: '7px 10px',
                    }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                      <span style={{ flex: 1, fontSize: '12px', color: '#166534', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {statusFile.name}
                      </span>
                      <button
                        onClick={() => { setStatusFile(null); if (statusFileRef.current) statusFileRef.current.value = '' }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: '0', display: 'flex', alignItems: 'center' }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => statusFileRef.current?.click()}
                      style={{
                        width: '100%', padding: '8px', borderRadius: '8px', fontSize: '12px',
                        background: '#f9fafb', border: '1px dashed #d1d5db',
                        color: '#9ca3af', cursor: 'pointer', transition: 'all 0.15s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#166534'; (e.currentTarget as HTMLElement).style.color = '#166534' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#d1d5db'; (e.currentTarget as HTMLElement).style.color = '#9ca3af' }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                      </svg>
                      Adjuntar archivo
                    </button>
                  )}
                  <input ref={statusFileRef} type="file" style={{ display: 'none' }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) setStatusFile(f) }} />
                </div>

                <button
                  onClick={() => { if (selectedStatus && statusNote.trim()) changeStatus.mutate() }}
                  disabled={!selectedStatus || !statusNote.trim() || changeStatus.isPending}
                  style={{
                    padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: '600',
                    background: (selectedStatus && statusNote.trim()) ? '#166534' : '#e2e8f0',
                    border: 'none',
                    color: (selectedStatus && statusNote.trim()) ? '#fff' : '#9ca3af',
                    cursor: (selectedStatus && statusNote.trim()) ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    boxShadow: (selectedStatus && statusNote.trim()) ? '0 4px 12px rgba(22,101,52,0.2)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {changeStatus.isPending && (
                    <svg style={{ animation: 'spin 1s linear infinite' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                  )}
                  {changeStatus.isPending ? 'Guardando...' : 'Actualizar Estado'}
                </button>
              </div>
            </div>
          )}

          {isAdmin && (
            <div style={cardStyle}>
              <p style={sectionLabel}>Asignar Técnico</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <select value={selectedAgent} onChange={e => setSelectedAgent(e.target.value)} style={selectStyle}
                  onFocus={e => { (e.target as HTMLSelectElement).style.borderColor = '#166534'; (e.target as HTMLSelectElement).style.boxShadow = '0 0 0 3px rgba(22,101,52,0.08)' }}
                  onBlur={e => { (e.target as HTMLSelectElement).style.borderColor = '#d1d5db'; (e.target as HTMLSelectElement).style.boxShadow = 'none' }}
                >
                  <option value="">Seleccionar técnico...</option>
                  {technicians.map(t => (
                    <option key={t.id} value={t.id}>{t.fullName}</option>
                  ))}
                </select>

                <select value={selectedPriority} onChange={e => setSelectedPriority(e.target.value)} style={selectStyle}
                  onFocus={e => { (e.target as HTMLSelectElement).style.borderColor = '#166534'; (e.target as HTMLSelectElement).style.boxShadow = '0 0 0 3px rgba(22,101,52,0.08)' }}
                  onBlur={e => { (e.target as HTMLSelectElement).style.borderColor = '#d1d5db'; (e.target as HTMLSelectElement).style.boxShadow = 'none' }}
                >
                  <option value="">Seleccionar prioridad...</option>
                  <option value="1">Baja</option>
                  <option value="2">Media</option>
                  <option value="3">Alta</option>
                  <option value="4">Crítica</option>
                </select>

                <button
                  onClick={() => { if (selectedAgent && selectedPriority) assign.mutate({ agentId: selectedAgent, priority: Number(selectedPriority) }) }}
                  disabled={!selectedAgent || !selectedPriority || assign.isPending}
                  style={{
                    padding: '9px', borderRadius: '10px', fontSize: '13px', fontWeight: '600',
                    background: (selectedAgent && selectedPriority) ? '#1d4ed8' : '#e2e8f0',
                    border: 'none',
                    color: (selectedAgent && selectedPriority) ? '#fff' : '#9ca3af',
                    cursor: (selectedAgent && selectedPriority) ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    boxShadow: (selectedAgent && selectedPriority) ? '0 4px 12px rgba(29,78,216,0.2)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {assign.isPending && (
                    <svg style={{ animation: 'spin 1s linear infinite' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                  )}
                  {assign.isPending ? 'Asignando...' : 'Asignar'}
                </button>
              </div>
            </div>
          )}

          {/* Info panel */}
          <div style={cardStyle}>
            <p style={sectionLabel}>Información</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                {
                  label: 'Estado',
                  value: (
                    <span style={{
                      fontSize: '11px', fontWeight: '600', padding: '3px 9px', borderRadius: '20px',
                      background: statusBg[ticket.status], color: statusColor[ticket.status],
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                    }}>
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: statusDot[ticket.status] }} />
                      {ticket.status}
                    </span>
                  ),
                },
                {
                  label: 'Prioridad',
                  value: (
                    <span style={{
                      fontSize: '11px', padding: '3px 9px', borderRadius: '20px',
                      background: priorityBg[ticket.priority], color: priorityColor[ticket.priority],
                    }}>
                      {ticket.priority}
                    </span>
                  ),
                },
{ label: 'Creado por', value: (
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '12px', color: '#374151', display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'flex-end' }}>
                      {ticket.isAnonymous && (
                        <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '20px', background: '#f8fafc', color: '#6b7280', border: '1px solid #e2e8f0' }}>Anónimo</span>
                      )}
                      {ticket.createdByName}
                    </span>
                    {ticket.isAnonymous && ticket.creatorEmail && isAdmin && (
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>{ticket.creatorEmail}</span>
                    )}
                  </div>
                ) },
                { label: 'Ubicación', value: <span style={{ fontSize: '12px', color: ticket.location ? '#374151' : '#d1d5db', textAlign: 'right', display: 'block', maxWidth: '160px' }}>{ticket.location || '—'}</span> },
                { label: 'Asignado a', value: <span style={{ fontSize: '12px', color: ticket.assignedToName ? '#374151' : '#d1d5db' }}>{ticket.assignedToName ?? '—'}</span> },
                { label: 'Comentarios', value: <span style={{ fontSize: '12px', color: '#374151' }}>{comments.length}</span> },
                { label: 'Adjuntos', value: <span style={{ fontSize: '12px', color: '#374151' }}>{attachments.length}</span> },
                { label: 'Creado', value: <span style={{ fontSize: '12px', color: '#6b7280' }}>{formatDate(ticket.createdAt)}</span> },
                { label: 'Actualizado', value: <span style={{ fontSize: '12px', color: '#6b7280' }}>{formatDate(ticket.updatedAt)}</span> },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '11.5px', color: '#9ca3af' }}>{label}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        textarea::placeholder { color: #9ca3af; }

        .ticket-layout {
          display: grid;
          grid-template-columns: minmax(0,1fr) 260px;
          gap: 14px;
          align-items: start;
        }
        @media (max-width: 720px) {
          .ticket-layout { grid-template-columns: 1fr; }
          .ticket-sidebar { order: -1; }
        }
      `}</style>
    </div>
  )
}
