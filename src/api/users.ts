import { mockGetUsers, mockGetTechnicians, mockToggleUserActive } from './mockStore'

export const getUsers = () => mockGetUsers()
export const getTechnicians = () => mockGetTechnicians()
export const toggleUserActive = (id: string) => mockToggleUserActive(id)
