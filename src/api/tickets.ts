import type { CreateTicketRequest, TicketResponse, CommentResponse, AttachmentResponse } from '../types'
import client from './client'

export const getTickets = () =>
  client.get<TicketResponse[]>('/tickets').then(r => r.data)

export const getTicket = (id: number) =>
  client.get<TicketResponse>(`/tickets/${id}`).then(r => r.data)

export const getTicketByNumber = (num: string) =>
  client.get<TicketResponse>(`/tickets/by-number/${encodeURIComponent(num)}`).then(r => r.data)

export const createTicket = (data: CreateTicketRequest) =>
  client.post<TicketResponse>('/tickets', data).then(r => r.data)

export const updateTicketStatus = (id: number, status: number) =>
  client.patch<TicketResponse>(`/tickets/${id}/status`, { status }).then(r => r.data)

export const assignTicket = (id: number, agentId: string, priority: number) =>
  client.patch<TicketResponse>(`/tickets/${id}/assign`, { agentId, priority }).then(r => r.data)

export const deleteTicket = (id: number) =>
  client.delete(`/tickets/${id}`).then(() => undefined)

export const getComments = (ticketId: number) =>
  client.get<CommentResponse[]>(`/tickets/${ticketId}/comments`).then(r => r.data)

export const createComment = (ticketId: number, text: string) =>
  client.post<CommentResponse>(`/tickets/${ticketId}/comments`, { text }).then(r => r.data)

export const getAttachments = (ticketId: number) =>
  client.get<AttachmentResponse[]>(`/tickets/${ticketId}/attachments`).then(r => r.data)

export const uploadAttachment = (ticketId: number, file: File) => {
  const form = new FormData()
  form.append('file', file)
  return client.post<AttachmentResponse>(`/tickets/${ticketId}/attachments`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)
}

export const deleteAttachment = (ticketId: number, attachmentId: number) =>
  client.delete(`/tickets/${ticketId}/attachments/${attachmentId}`).then(() => undefined)

export const downloadAttachment = async (ticketId: number, attachmentId: number) => {
  const res = await client.get<Blob>(`/tickets/${ticketId}/attachments/${attachmentId}/download`, {
    responseType: 'blob',
  })
  return { data: res.data }
}
