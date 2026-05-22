import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUsers, toggleUserActive } from '../api/users'
import { register } from '../api/auth'
import type { UserResponse } from '../types'

const roleStyle: Record<string, { bg: string; color: string; border: string }> = {
  Admin:   { bg: '#faf5ff', color: '#7c3aed', border: '#e9d5ff' },
  Tecnico: { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  Cliente: { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: '#f9fafb',
  border: '1px solid #d1d5db',
  borderRadius: '10px',
  padding: '11px 13px',
  fontSize: '13.5px', color: '#111827',
  outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
}

function UserCard({ user, onToggle, loading }: { user: UserResponse; onToggle: () => void; loading: boolean }) {
  const rs = roleStyle[user.role] ?? roleStyle.Cliente

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '14px 16px', borderRadius: '12px',
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      transition: 'all 0.15s',
      opacity: user.isActive ? 1 : 0.55,
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
        background: rs.bg,
        border: `1px solid ${rs.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '16px', fontWeight: '700', color: rs.color,
      }}>
        {user.fullName.charAt(0).toUpperCase()}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user.fullName}
          </p>
          {!user.isActive && (
            <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '20px', background: '#f1f5f9', color: '#94a3b8', border: '1px solid #e2e8f0', fontWeight: '500' }}>
              Inactivo
            </span>
          )}
        </div>
        <p style={{ fontSize: '12px', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.email}
        </p>
      </div>

      <span style={{
        fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px',
        background: rs.bg, color: rs.color, border: `1px solid ${rs.border}`,
        textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0,
      }}>
        {user.role}
      </span>

      <span style={{ fontSize: '11px', color: '#9ca3af', flexShrink: 0, minWidth: '80px', textAlign: 'right' }}>
        {new Date(user.createdAt).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })}
      </span>

      <button
        onClick={onToggle}
        disabled={loading}
        style={{
          padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '500',
          cursor: loading ? 'not-allowed' : 'pointer', flexShrink: 0,
          background: user.isActive ? '#fef2f2' : '#f0fdf4',
          border: user.isActive ? '1px solid #fecaca' : '1px solid #bbf7d0',
          color: user.isActive ? '#dc2626' : '#166534',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => {
          if (!loading) {
            const el = e.currentTarget as HTMLElement
            el.style.background = user.isActive ? '#fee2e2' : '#dcfce7'
          }
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.background = user.isActive ? '#fef2f2' : '#f0fdf4'
        }}
      >
        {user.isActive ? 'Desactivar' : 'Activar'}
      </button>
    </div>
  )
}

export function UsersPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Cliente')
  const [error, setError] = useState('')

  const { data: users = [], isLoading } = useQuery({ queryKey: ['users'], queryFn: getUsers })

  const toggle = useMutation({
    mutationFn: toggleUserActive,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })

  const createUser = useMutation({
    mutationFn: () => register({ fullName, email, password, role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      setShowForm(false)
      setFullName(''); setEmail(''); setPassword(''); setRole('Cliente'); setError('')
    },
    onError: () => setError('Error al crear usuario. El email puede estar en uso.'),
  })

  const focusInput = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#166534'
    e.target.style.boxShadow = '0 0 0 3px rgba(22,101,52,0.08)'
    e.target.style.background = '#ffffff'
  }
  const blurInput = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#d1d5db'
    e.target.style.boxShadow = 'none'
    e.target.style.background = '#f9fafb'
  }

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'Admin').length,
    tecnicos: users.filter(u => u.role === 'Tecnico').length,
    clientes: users.filter(u => u.role === 'Cliente').length,
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', letterSpacing: '-0.5px' }}>Usuarios</h1>
          <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>
            {users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '10px 18px', borderRadius: '10px',
            background: showForm ? '#ffffff' : '#166534',
            border: showForm ? '1px solid #e2e8f0' : 'none',
            color: showForm ? '#6b7280' : '#fff',
            fontSize: '13.5px', fontWeight: '600',
            cursor: 'pointer', flexShrink: 0,
            boxShadow: showForm ? '0 1px 3px rgba(0,0,0,0.06)' : '0 4px 12px rgba(22,101,52,0.25)',
            transition: 'all 0.15s',
          }}
        >
          {showForm ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          )}
          {showForm ? 'Cancelar' : 'Nuevo Usuario'}
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '24px' }}>
        {[
          { label: 'Total', value: stats.total, color: '#166534', bg: '#f0fdf4' },
          { label: 'Admins', value: stats.admins, color: '#7c3aed', bg: '#faf5ff' },
          { label: 'Técnicos', value: stats.tecnicos, color: '#b45309', bg: '#fffbeb' },
          { label: 'Clientes', value: stats.clientes, color: '#166534', bg: '#f0fdf4' },
        ].map(s => (
          <div key={s.label} style={{
            padding: '14px 16px', borderRadius: '12px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderTop: `3px solid ${s.color}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>{s.value}</p>
            <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Create user form */}
      {showForm && (
        <div style={{
          marginBottom: '20px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px', padding: '22px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', marginBottom: '18px' }}>
            Crear nuevo usuario
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>Nombre completo</label>
              <input value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder="Juan Pérez" style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>Correo electrónico</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="usuario@email.com" style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres" style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>Rol</label>
              <select value={role} onChange={e => setRole(e.target.value)}
                style={{ ...inputStyle, appearance: 'none' } as React.CSSProperties}
                onFocus={focusInput} onBlur={blurInput}>
                <option value="Cliente">Cliente</option>
                <option value="Tecnico">Técnico</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          {error && (
            <div style={{
              marginTop: '14px',
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: '10px', padding: '11px 14px',
              fontSize: '13px', color: '#dc2626',
            }}>
              {error}
            </div>
          )}

          <div style={{ marginTop: '18px', display: 'flex', gap: '10px' }}>
            <button
              onClick={() => { setError(''); createUser.mutate() }}
              disabled={createUser.isPending || !fullName || !email || !password}
              style={{
                padding: '10px 22px', borderRadius: '10px',
                background: '#166534',
                border: 'none',
                color: '#fff', fontSize: '13.5px', fontWeight: '600',
                cursor: createUser.isPending ? 'not-allowed' : 'pointer',
                opacity: (!fullName || !email || !password) ? 0.5 : 1,
                display: 'flex', alignItems: 'center', gap: '7px',
                boxShadow: '0 4px 12px rgba(22,101,52,0.25)',
              }}
            >
              {createUser.isPending && (
                <svg style={{ animation: 'spin 1s linear infinite' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
              )}
              {createUser.isPending ? 'Creando...' : 'Crear Usuario'}
            </button>
            <button onClick={() => { setShowForm(false); setError('') }}
              style={{
                padding: '10px 18px', borderRadius: '10px',
                background: '#ffffff', border: '1px solid #e2e8f0',
                color: '#6b7280', fontSize: '13.5px',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Users list */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              height: '74px', borderRadius: '12px',
              background: '#e2e8f0',
              animation: 'pulse 2s infinite',
            }} />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div style={{
          padding: '56px 24px', textAlign: 'center',
          background: '#ffffff',
          border: '1px dashed #d1d5db',
          borderRadius: '16px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>No hay usuarios registrados.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {users.map(u => (
            <UserCard
              key={u.id}
              user={u}
              onToggle={() => toggle.mutate(u.id)}
              loading={toggle.isPending}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        input::placeholder { color: #9ca3af; }
      `}</style>
    </div>
  )
}
