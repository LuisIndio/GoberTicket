import type { CreateTicketRequest } from '../types'
import {
  mockGetTickets, mockGetTicket, mockGetTicketByNumber, mockCreateTicket,
  mockUpdateTicketStatus, mockAssignTicket,
  mockGetComments, mockCreateComment,
  mockGetAttachments, mockUploadAttachment,
  mockDeleteAttachment, mockDownloadAttachment,
} from './mockStore'

export const getTickets = () => mockGetTickets()
export const getTicket = (id: number) => mockGetTicket(id)
export const getTicketByNumber = (num: string) => mockGetTicketByNumber(num)
export const createTicket = (data: CreateTicketRequest) => mockCreateTicket(data)
export const updateTicketStatus = (id: number, status: number) => mockUpdateTicketStatus(id, status)
export const assignTicket = (id: number, agentId: string, priority: number) => mockAssignTicket(id, agentId, priority)
export const deleteTicket = (_id: number) => Promise.resolve()

export const getComments = (ticketId: number) => mockGetComments(ticketId)
export const createComment = (ticketId: number, text: string) => mockCreateComment(ticketId, text)

export const getAttachments = (ticketId: number) => mockGetAttachments(ticketId)
export const uploadAttachment = (ticketId: number, file: File) => mockUploadAttachment(ticketId, file)
export const deleteAttachment = (ticketId: number, attachmentId: number) => mockDeleteAttachment(ticketId, attachmentId)
export const downloadAttachment = (ticketId: number, attachmentId: number) => mockDownloadAttachment(ticketId, attachmentId)
