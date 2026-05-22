import { mockLogin, mockRegister } from './mockStore'

export const login = (username: string, password: string) => mockLogin(username, password)

export const register = (data: { fullName: string; email: string; password: string; role: string }) =>
  mockRegister(data)
