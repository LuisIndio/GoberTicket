import type { UserResponse } from '../types'
import client from './client'

export const getUsers = () =>
  client.get<UserResponse[]>('/users').then(r => r.data)

export const getTechnicians = () =>
  client.get<UserResponse[]>('/users/technicians').then(r => r.data)

export const toggleUserActive = (id: string) =>
  client.patch<UserResponse>(`/users/${id}/toggle-active`, {}).then(r => r.data)
