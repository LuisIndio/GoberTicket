import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { login } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import logoGreen from '../assets/LOGO GOBERNACION2.png'

export function LoginPage() {
  const navigate = useNavigate()
  const authLogin = useAuthStore(s => s.login)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: () => login(username, password),
    onSuccess: (data) => {
      authLogin(data)
      navigate('/dashboard')
    },
    onError: () => setError('Credenciales inválidas. Verifique su usuario y contraseña.'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    mutation.mutate()
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f1f5f9',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      {/* Institutional banner */}
      <div style={{
        background: '#155c2a',
        padding: '7px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      }}>
        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#8dc63f' }} />
        <span style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.6px', fontWeight: '500' }}>
          GOBIERNO AUTÓNOMO DEPARTAMENTAL · SANTA CRUZ · BOLIVIA
        </span>
        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#8dc63f' }} />
      </div>

      {/* Hero header */}
      <div style={{
        background: 'linear-gradient(135deg, #155c2a 0%, #1a7040 60%, #1d7a44 100%)',
        padding: '28px 24px 36px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
      }}>
        <img
          src={logoGreen}
          alt="Gobierno Autónomo Departamental Santa Cruz"
          style={{ width: '220px', height: 'auto', display: 'block' }}
        />
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', letterSpacing: '0.3px' }}>
            Sistema de Gestión de Tickets
          </p>
        </div>
      </div>

      {/* Center the card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '0 24px 40px', marginTop: '-20px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
        }}>
          <h2 style={{
            fontSize: '17px', fontWeight: '600', color: '#111827',
            margin: '0 0 24px', letterSpacing: '-0.2px',
          }}>Iniciar Sesión</h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Usuario */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>
                Usuario
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)',
                  color: '#9ca3af',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="juan.perez"
                  required
                  autoComplete="username"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: '#f9fafb',
                    border: '1px solid #d1d5db',
                    borderRadius: '10px',
                    padding: '11px 13px 11px 40px',
                    fontSize: '14px', color: '#111827',
                    outline: 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#166534'
                    e.target.style.boxShadow = '0 0 0 3px rgba(22,101,52,0.08)'
                    e.target.style.background = '#ffffff'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = '#d1d5db'
                    e.target.style.boxShadow = 'none'
                    e.target.style.background = '#f9fafb'
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)',
                  color: '#9ca3af',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: '#f9fafb',
                    border: '1px solid #d1d5db',
                    borderRadius: '10px',
                    padding: '11px 42px 11px 40px',
                    fontSize: '14px', color: '#111827',
                    outline: 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#166534'
                    e.target.style.boxShadow = '0 0 0 3px rgba(22,101,52,0.08)'
                    e.target.style.background = '#ffffff'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = '#d1d5db'
                    e.target.style.boxShadow = 'none'
                    e.target.style.background = '#f9fafb'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#9ca3af', padding: '0',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px', padding: '11px 14px',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span style={{ fontSize: '13px', color: '#dc2626' }}>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={mutation.isPending}
              style={{
                width: '100%', padding: '13px',
                background: mutation.isPending ? '#d1d5db' : '#166534',
                border: 'none',
                borderRadius: '10px',
                color: '#ffffff', fontSize: '14px', fontWeight: '600',
                cursor: mutation.isPending ? 'not-allowed' : 'pointer',
                letterSpacing: '0.2px',
                boxShadow: mutation.isPending ? 'none' : '0 4px 14px rgba(22,101,52,0.3)',
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
              onMouseEnter={e => {
                if (!mutation.isPending) {
                  (e.target as HTMLButtonElement).style.background = '#14532d'
                  ;(e.target as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(22,101,52,0.35)'
                }
              }}
              onMouseLeave={e => {
                if (!mutation.isPending) {
                  (e.target as HTMLButtonElement).style.background = '#166534'
                  ;(e.target as HTMLButtonElement).style.boxShadow = '0 4px 14px rgba(22,101,52,0.3)'
                }
              }}
            >
              {mutation.isPending ? (
                <>
                  <svg style={{ animation: 'spin 1s linear infinite' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Verificando...
                </>
              ) : 'Ingresar al Sistema'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center', marginTop: '20px',
          fontSize: '12px', color: '#9ca3af',
        }}>
          © {new Date().getFullYear()} Gobierno Autónomo Departamental de Santa Cruz
        </p>
      </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #9ca3af; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 30px #f9fafb inset !important;
          -webkit-text-fill-color: #111827 !important;
        }
      `}</style>
    </div>
  )
}
