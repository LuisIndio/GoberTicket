import type { AuthResponse, TicketResponse, CommentResponse, AttachmentResponse, UserResponse } from '../types'

const STORE_KEY = 'tg_demo'

const PRIORITY_MAP: Record<number, string> = { 1: 'Baja', 2: 'Media', 3: 'Alta', 4: 'Critica' }
const STATUS_MAP: Record<number, string> = { 1: 'Creado', 2: 'Asignado', 3: 'Atendido', 4: 'Rechazado' }

interface DemoUser {
  id: string; fullName: string; email: string; password: string
  role: string; isActive: boolean; createdAt: string
}
interface DemoTicket {
  id: number; ticketNumber: string; title: string; description: string
  location: string; status: string; priority: string; createdById: string | null
  createdByName: string; creatorEmail: string | null; isAnonymous: boolean
  assignedToId: string | null; createdAt: string; updatedAt: string
}
interface DemoComment {
  id: number; ticketId: number; text: string
  authorId: string; authorName: string; createdAt: string
}
interface DemoAttachment {
  id: number; ticketId: number; fileName: string
  mimeType: string; fileSize: number; uploadedByName: string; uploadedAt: string
}
interface DemoStore {
  users: DemoUser[]; tickets: DemoTicket[]
  comments: DemoComment[]; attachments: DemoAttachment[]
  ticketCounter: number; commentCounter: number; attachmentCounter: number
}

function daysAgo(n: number) {
  const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString()
}
function hoursAgo(n: number) {
  return new Date(Date.now() - n * 3600000).toISOString()
}

function getInitialStore(): DemoStore {
  return {
    ticketCounter: 6, commentCounter: 5, attachmentCounter: 0,
    users: [
      { id: 'u1', fullName: 'Lic. María González', email: 'admin@gobernacion.gob.bo', password: 'Admin123', role: 'Admin', isActive: true, createdAt: daysAgo(60) },
      { id: 'u2', fullName: 'Carlos Mendoza',      email: 'tecnico1@gobernacion.gob.bo', password: 'Tecnico123', role: 'Tecnico', isActive: true, createdAt: daysAgo(45) },
      { id: 'u3', fullName: 'Ana Flores',           email: 'tecnico2@gobernacion.gob.bo', password: 'Tecnico123', role: 'Tecnico', isActive: true, createdAt: daysAgo(30) },
      { id: 'u4', fullName: 'Roberto Peña',         email: 'cliente@gobernacion.gob.bo',  password: 'Cliente123', role: 'Cliente', isActive: true, createdAt: daysAgo(20) },
    ],
    tickets: [
      { id: 1, ticketNumber: 'TKT-00001', title: 'Error en sistema de facturación al imprimir boletas', description: 'Al intentar imprimir las boletas de pago del mes de mayo, el sistema arroja un error "Timeout connection" y no genera el PDF. Esto está afectando a todo el departamento de finanzas.', location: 'Dirección de Finanzas — Piso 2', status: 'Atendido', priority: 'Alta', createdById: 'u4', createdByName: 'Roberto Peña', creatorEmail: null, isAnonymous: false, assignedToId: 'u2', createdAt: daysAgo(10), updatedAt: daysAgo(7) },
      { id: 2, ticketNumber: 'TKT-00002', title: 'Impresora del área de RRHH no responde', description: 'La impresora HP LaserJet del área de Recursos Humanos dejó de funcionar. Muestra el error "Offline" aunque está encendida y conectada a la red local.', location: 'Dirección de RRHH — Piso 3', status: 'Asignado', priority: 'Media', createdById: 'u4', createdByName: 'Roberto Peña', creatorEmail: null, isAnonymous: false, assignedToId: 'u3', createdAt: daysAgo(5), updatedAt: daysAgo(4) },
      { id: 3, ticketNumber: 'TKT-00003', title: 'Solicitud de actualización de Office 365', description: 'Necesitamos actualizar el paquete Microsoft Office en las 5 computadoras del área de Planificación. La versión actual es Office 2016 y necesitamos Office 365.', location: 'Dirección de Planificación — Piso 1', status: 'Creado', priority: 'Media', createdById: 'u4', createdByName: 'Roberto Peña', creatorEmail: null, isAnonymous: false, assignedToId: null, createdAt: daysAgo(3), updatedAt: daysAgo(3) },
      { id: 4, ticketNumber: 'TKT-00004', title: 'No puedo acceder al correo institucional', description: 'Desde ayer no puedo ingresar al correo institucional. El sistema muestra "contraseña incorrecta" aunque estoy seguro de que es la correcta. Posiblemente expiró.', location: 'Secretaría General — Piso 1', status: 'Creado', priority: 'Media', createdById: null, createdByName: 'Juan Carlos Ríos', creatorEmail: 'jrios@gmail.com', isAnonymous: true, assignedToId: null, createdAt: daysAgo(2), updatedAt: daysAgo(2) },
      { id: 5, ticketNumber: 'TKT-00005', title: 'Sin internet en sala de reuniones piso 3', description: 'La sala de reuniones del piso 3 no tiene conexión a internet. Hay una reunión con autoridades mañana y se necesita conexión urgente para la presentación.', location: 'Sala de Reuniones — Piso 3', status: 'Rechazado', priority: 'Critica', createdById: 'u4', createdByName: 'Roberto Peña', creatorEmail: null, isAnonymous: false, assignedToId: 'u2', createdAt: daysAgo(8), updatedAt: daysAgo(6) },
      { id: 6, ticketNumber: 'TKT-00006', title: 'Formateo y reinstalación de equipo — Contabilidad', description: 'La computadora del Lic. Torrez del área de Contabilidad tiene virus y está muy lenta. Se solicita formateo completo y reinstalación de Windows 10.', location: 'Dirección de Contabilidad — Piso 2', status: 'Asignado', priority: 'Baja', createdById: null, createdByName: 'Secretaría Contabilidad', creatorEmail: 'contabilidad@gob.bo', isAnonymous: true, assignedToId: 'u2', createdAt: daysAgo(6), updatedAt: daysAgo(5) },
    ],
    comments: [
      { id: 1, ticketId: 1, text: 'Revisé el servidor de base de datos. El problema era una consulta sin índice que bloqueaba la conexión. Se aplicó el parche y ya funciona correctamente.', authorId: 'u2', authorName: 'Carlos Mendoza', createdAt: daysAgo(8) },
      { id: 2, ticketId: 1, text: 'Confirmado, las boletas ya se imprimen sin problemas. Ticket resuelto.', authorId: 'u1', authorName: 'Lic. María González', createdAt: daysAgo(7) },
      { id: 3, ticketId: 2, text: 'Me acerqué al área. La impresora estaba configurada como offline manualmente. La puse en línea y reinicié el servicio de impresión. Verificando si persiste el problema.', authorId: 'u3', authorName: 'Ana Flores', createdAt: daysAgo(3) },
      { id: 4, ticketId: 5, text: 'Se verificó que el cable de red del switch está dañado. Se solicitó repuesto al proveedor pero el plazo de entrega es de 5 días hábiles.', authorId: 'u2', authorName: 'Carlos Mendoza', createdAt: hoursAgo(52) },
      { id: 5, ticketId: 5, text: 'Se rechaza el ticket por no poder atenderse en el tiempo requerido. Se recomienda usar datos móviles para la presentación.', authorId: 'u1', authorName: 'Lic. María González', createdAt: daysAgo(6) },
    ],
    attachments: [],
  }
}

function load(): DemoStore {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) return JSON.parse(raw) as DemoStore
  } catch { /* ignore */ }
  const initial = getInitialStore()
  localStorage.setItem(STORE_KEY, JSON.stringify(initial))
  return initial
}

function save(s: DemoStore) {
  localStorage.setItem(STORE_KEY, JSON.stringify(s))
}

function wait(ms = 120): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

function getCurrentUser(): AuthResponse | null {
  try { return JSON.parse(localStorage.getItem('user') ?? 'null') } catch { return null }
}

function mapTicket(t: DemoTicket, s: DemoStore): TicketResponse {
  const assignedUser = s.users.find(u => u.id === t.assignedToId) ?? null
  return {
    id: t.id, ticketNumber: t.ticketNumber, title: t.title,
    description: t.description, location: t.location,
    status: t.status, priority: t.priority,
    category: 'General',
    createdById: t.createdById, createdByName: t.createdByName,
    creatorEmail: t.creatorEmail, isAnonymous: t.isAnonymous,
    assignedToId: t.assignedToId,
    assignedToName: assignedUser?.fullName ?? null,
    createdAt: t.createdAt, updatedAt: t.updatedAt,
    commentCount: s.comments.filter(c => c.ticketId === t.id).length,
    attachmentCount: s.attachments.filter(a => a.ticketId === t.id).length,
  }
}

// ── AUTH ──────────────────────────────────────────────────────────────────────

export async function mockLogin(username: string, password: string): Promise<AuthResponse> {
  await wait()
  const s = load()
  const user = s.users.find(u => u.email.toLowerCase() === username.toLowerCase() && u.password === password && u.isActive)
  if (!user) throw new Error('Credenciales inválidas.')
  return { token: `demo-${user.id}`, userId: user.id, fullName: user.fullName, email: user.email, role: user.role, expiresAt: new Date(Date.now() + 8 * 3600000).toISOString() }
}

export async function mockRegister(data: { fullName: string; email: string; password: string; role: string }): Promise<AuthResponse> {
  await wait()
  const s = load()
  if (s.users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) throw new Error('El email ya está registrado.')
  const newUser: DemoUser = { id: `u${Date.now()}`, fullName: data.fullName, email: data.email, password: data.password, role: data.role, isActive: true, createdAt: new Date().toISOString() }
  s.users.push(newUser); save(s)
  return { token: `demo-${newUser.id}`, userId: newUser.id, fullName: newUser.fullName, email: newUser.email, role: newUser.role, expiresAt: new Date(Date.now() + 8 * 3600000).toISOString() }
}

// ── TICKETS ───────────────────────────────────────────────────────────────────

export async function mockGetTickets(): Promise<TicketResponse[]> {
  await wait()
  const s = load()
  const me = getCurrentUser()
  let tickets = s.tickets
  if (me?.role === 'Cliente') tickets = tickets.filter(t => t.createdById === me.userId)
  if (me?.role === 'Tecnico') tickets = tickets.filter(t => t.assignedToId === me.userId)
  return [...tickets].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(t => mapTicket(t, s))
}

export async function mockGetTicket(id: number): Promise<TicketResponse> {
  await wait()
  const s = load()
  const t = s.tickets.find(t => t.id === id)
  if (!t) throw new Error('Ticket no encontrado.')
  return mapTicket(t, s)
}

export async function mockGetTicketByNumber(ticketNumber: string): Promise<TicketResponse> {
  await wait()
  const s = load()
  const t = s.tickets.find(t => t.ticketNumber.toLowerCase() === ticketNumber.trim().toLowerCase())
  if (!t) throw new Error('Ticket no encontrado.')
  return mapTicket(t, s)
}

export async function mockCreateTicket(data: { title: string; description: string; location: string; priority?: number; category?: number; creatorName?: string; creatorEmail?: string }): Promise<TicketResponse> {
  await wait()
  const s = load()
  const me = getCurrentUser()
  s.ticketCounter++
  const ticket: DemoTicket = {
    id: s.ticketCounter,
    ticketNumber: `TKT-${String(s.ticketCounter).padStart(5, '0')}`,
    title: data.title, description: data.description, location: data.location ?? '',
    status: 'Creado', priority: 'Media',
    createdById: me?.userId ?? null,
    createdByName: me?.fullName ?? data.creatorName ?? 'Anónimo',
    creatorEmail: me ? null : (data.creatorEmail ?? null),
    isAnonymous: !me,
    assignedToId: null,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }
  s.tickets.push(ticket); save(s)
  return mapTicket(ticket, s)
}

export async function mockUpdateTicketStatus(id: number, status: number): Promise<TicketResponse> {
  await wait()
  const s = load()
  const t = s.tickets.find(t => t.id === id)
  if (!t) throw new Error('Ticket no encontrado.')
  t.status = STATUS_MAP[status] ?? t.status
  t.updatedAt = new Date().toISOString()
  save(s)
  return mapTicket(t, s)
}

export async function mockAssignTicket(id: number, agentId: string, priority: number): Promise<TicketResponse> {
  await wait()
  const s = load()
  const t = s.tickets.find(t => t.id === id)
  if (!t) throw new Error('Ticket no encontrado.')
  t.assignedToId = agentId
  t.priority = PRIORITY_MAP[priority] ?? 'Media'
  t.status = 'Asignado'
  t.updatedAt = new Date().toISOString()
  save(s)
  return mapTicket(t, s)
}

// ── COMMENTS ──────────────────────────────────────────────────────────────────

export async function mockGetComments(ticketId: number): Promise<CommentResponse[]> {
  await wait()
  const s = load()
  return s.comments.filter(c => c.ticketId === ticketId).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map(c => ({ id: c.id, text: c.text, authorId: c.authorId, authorName: c.authorName, createdAt: c.createdAt }))
}

export async function mockCreateComment(ticketId: number, text: string): Promise<CommentResponse> {
  await wait()
  if (!text.trim()) throw new Error('El comentario no puede estar vacío.')
  const s = load()
  const me = getCurrentUser()
  s.commentCounter++
  const c: DemoComment = { id: s.commentCounter, ticketId, text: text.trim(), authorId: me?.userId ?? 'anon', authorName: me?.fullName ?? 'Anónimo', createdAt: new Date().toISOString() }
  s.comments.push(c); save(s)
  return { id: c.id, text: c.text, authorId: c.authorId, authorName: c.authorName, createdAt: c.createdAt }
}

// ── ATTACHMENTS ───────────────────────────────────────────────────────────────

export async function mockGetAttachments(ticketId: number): Promise<AttachmentResponse[]> {
  await wait()
  const s = load()
  return s.attachments.filter(a => a.ticketId === ticketId)
    .map(a => ({ id: a.id, fileName: a.fileName, mimeType: a.mimeType, fileSize: a.fileSize, uploadedByName: a.uploadedByName, uploadedAt: a.uploadedAt }))
}

export async function mockUploadAttachment(ticketId: number, file: File): Promise<AttachmentResponse> {
  await wait(400)
  const s = load()
  const me = getCurrentUser()
  s.attachmentCounter++
  const a: DemoAttachment = { id: s.attachmentCounter, ticketId, fileName: file.name, mimeType: file.type || 'application/octet-stream', fileSize: file.size, uploadedByName: me?.fullName ?? 'Anónimo', uploadedAt: new Date().toISOString() }
  s.attachments.push(a); save(s)
  return { id: a.id, fileName: a.fileName, mimeType: a.mimeType, fileSize: a.fileSize, uploadedByName: a.uploadedByName, uploadedAt: a.uploadedAt }
}

export async function mockDeleteAttachment(ticketId: number, attachmentId: number): Promise<void> {
  await wait()
  const s = load()
  s.attachments = s.attachments.filter(a => !(a.ticketId === ticketId && a.id === attachmentId))
  save(s)
}

export async function mockDownloadAttachment(_ticketId: number, attachmentId: number): Promise<{ data: Blob }> {
  await wait(200)
  const s = load()
  const a = s.attachments.find(a => a.id === attachmentId)
  const content = `Archivo demo: ${a?.fileName ?? 'archivo'}\nEste es un archivo de demostración.`
  return { data: new Blob([content], { type: 'text/plain' }) }
}

// ── USERS ─────────────────────────────────────────────────────────────────────

export async function mockGetUsers(): Promise<UserResponse[]> {
  await wait()
  const s = load()
  return s.users.map(u => ({ id: u.id, fullName: u.fullName, email: u.email, role: u.role, isActive: u.isActive, createdAt: u.createdAt }))
}

export async function mockGetTechnicians(): Promise<UserResponse[]> {
  await wait()
  const s = load()
  return s.users.filter(u => u.role === 'Tecnico' && u.isActive)
    .map(u => ({ id: u.id, fullName: u.fullName, email: u.email, role: u.role, isActive: u.isActive, createdAt: u.createdAt }))
}

export async function mockToggleUserActive(id: string): Promise<UserResponse> {
  await wait()
  const s = load()
  const u = s.users.find(u => u.id === id)
  if (!u) throw new Error('Usuario no encontrado.')
  u.isActive = !u.isActive; save(s)
  return { id: u.id, fullName: u.fullName, email: u.email, role: u.role, isActive: u.isActive, createdAt: u.createdAt }
}
