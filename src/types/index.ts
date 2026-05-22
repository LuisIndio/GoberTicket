export interface AuthResponse {
  token: string
  userId: string
  fullName: string
  email: string
  role: string
  expiresAt: string
}

export interface TicketResponse {
  id: number
  ticketNumber: string
  title: string
  description: string
  status: string
  priority: string
  category: string
  createdById: string | null
  createdByName: string
  creatorEmail: string | null
  isAnonymous: boolean
  assignedToId: string | null
  assignedToName: string | null
  createdAt: string
  updatedAt: string
  commentCount: number
  attachmentCount: number
}

export interface CreateTicketRequest {
  title: string
  description: string
  priority?: number
  category?: number
  creatorName?: string
  creatorEmail?: string
}

export interface CommentResponse {
  id: number
  text: string
  authorId: string
  authorName: string
  createdAt: string
}

export interface AttachmentResponse {
  id: number
  fileName: string
  mimeType: string
  fileSize: number
  uploadedByName: string
  uploadedAt: string
}

export interface UserResponse {
  id: string
  fullName: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
}

export type TicketStatus = 'Creado' | 'Asignado' | 'Atendido' | 'Rechazado'
export type TicketPriority = 'Baja' | 'Media' | 'Alta' | 'Critica'
export type TicketCategory = 'Tecnico' | 'Facturacion' | 'General' | 'Otro'
export type UserRole = 'Admin' | 'Tecnico' | 'Cliente'
