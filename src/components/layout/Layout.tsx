import { type ReactNode, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import {
  TicketIcon, HomeIcon, UsersIcon, LogOutIcon, MenuIcon, PlusIcon, ChevronRightIcon
} from 'lucide-react'
import logoGreen from '../../assets/LOGO GOBERNACION2.png'

interface NavItem {
  label: string
  path: string
  icon: ReactNode
  roles: string[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <HomeIcon size={17} />, roles: ['Admin', 'Tecnico', 'Cliente'] },
  { label: 'Tickets', path: '/tickets', icon: <TicketIcon size={17} />, roles: ['Admin', 'Tecnico', 'Cliente'] },
  { label: 'Usuarios', path: '/users', icon: <UsersIcon size={17} />, roles: ['Admin'] },
]

const roleColors: Record<string, { bg: string; color: string }> = {
  Admin:   { bg: '#faf5ff', color: '#7c3aed' },
  Tecnico: { bg: '#fffbeb', color: '#b45309' },
  Cliente: { bg: '#f0fdf4', color: '#166534' },
}

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }
  const filteredNav = navItems.filter(i => i.roles.includes(user?.role ?? ''))
  const canCreateTicket = user?.role === 'Admin' || user?.role === 'Cliente'
  const rc = roleColors[user?.role ?? ''] ?? roleColors.Cliente

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f1f5f9', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(2px)', zIndex: 20,
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, height: '100%', width: '240px',
        background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex', flexDirection: 'column', zIndex: 30,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.2s ease',
        boxShadow: '2px 0 12px rgba(0,0,0,0.06)',
      }}
        className="lg-sidebar"
      >
        {/* Brand */}
        <div style={{
          background: 'linear-gradient(160deg, #155c2a 0%, #1a7040 100%)',
          padding: '16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            marginBottom: '8px',
          }}>
            <img
              src={logoGreen}
              alt="Gobierno Autónomo Departamental Santa Cruz"
              style={{ width: '160px', height: 'auto', display: 'block' }}
            />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', lineHeight: '1.2', letterSpacing: '0.4px' }}>Sistema de Tickets</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginTop: '4px' }}>
              <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#8dc63f' }} />
              <p style={{ fontSize: '10px', color: '#8dc63f', fontWeight: '700', letterSpacing: '0.8px', textTransform: 'uppercase' }}>TicketGober</p>
              <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#8dc63f' }} />
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {filteredNav.map(item => {
            const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
            return (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 12px', borderRadius: '10px', textDecoration: 'none',
                  fontSize: '13.5px', fontWeight: active ? '600' : '400',
                  color: active ? '#166534' : '#4b5563',
                  background: active ? '#f0fdf4' : 'transparent',
                  borderLeft: active ? '3px solid #166534' : '3px solid transparent',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = '#f8fafc'
                    ;(e.currentTarget as HTMLElement).style.color = '#166534'
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent'
                    ;(e.currentTarget as HTMLElement).style.color = '#4b5563'
                  }
                }}
              >
                {item.icon}
                <span style={{ flex: 1 }}>{item.label}</span>
                {active && <ChevronRightIcon size={13} />}
              </Link>
            )
          })}

          {canCreateTicket && (
            <Link to="/tickets/new" onClick={() => setSidebarOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', borderRadius: '10px', textDecoration: 'none',
                fontSize: '13.5px', fontWeight: '600',
                color: '#166534',
                background: '#f0fdf4',
                border: '1px dashed #86efac',
                marginTop: '8px', transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = '#dcfce7'
                ;(e.currentTarget as HTMLElement).style.borderColor = '#4ade80'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = '#f0fdf4'
                ;(e.currentTarget as HTMLElement).style.borderColor = '#86efac'
              }}
            >
              <PlusIcon size={17} />
              Nuevo Ticket
            </Link>
          )}
        </nav>

        {/* User */}
        <div style={{ padding: '10px', borderTop: '1px solid #e2e8f0' }}>
          <div style={{
            padding: '12px', borderRadius: '12px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            marginBottom: '6px',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
              background: rc.bg,
              border: `2px solid ${rc.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: '700', color: rc.color,
            }}>
              {user?.fullName?.charAt(0) ?? 'U'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.fullName}
              </p>
              <span style={{
                fontSize: '10px', fontWeight: '700',
                color: rc.color,
                background: rc.bg,
                padding: '1px 6px', borderRadius: '20px',
                textTransform: 'uppercase', letterSpacing: '0.5px',
                display: 'inline-block', marginTop: '2px',
              }}>
                {user?.role}
              </span>
            </div>
          </div>

          <button onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              background: 'transparent', fontSize: '13px',
              color: '#9ca3af', transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = '#fef2f2'
              ;(e.currentTarget as HTMLElement).style.color = '#dc2626'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLElement).style.color = '#9ca3af'
            }}
          >
            <LogOutIcon size={15} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Desktop spacer */}
      <div style={{ width: '240px', flexShrink: 0, display: 'none' }} className="lg-spacer" />

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile topbar */}
        <header style={{
          display: 'flex', alignItems: 'center', gap: '14px',
          padding: '10px 16px',
          background: '#155c2a',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          position: 'sticky', top: 0, zIndex: 10,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
          className="mobile-header"
        >
          <button onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', padding: '4px' }}>
            <MenuIcon size={21} />
          </button>
          <img
            src={logoGreen}
            alt="Gobierno Autónomo Departamental Santa Cruz"
            style={{ height: '32px', width: 'auto', display: 'block' }}
          />
          <span style={{ fontSize: '11px', color: '#8dc63f', fontWeight: '700', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
            TicketGober
          </span>
        </header>

        <main style={{ flex: 1, padding: '24px', overflowX: 'hidden' }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .lg-sidebar { transform: translateX(0) !important; position: sticky !important; top: 0 !important; height: 100vh !important; }
          .lg-spacer { display: none !important; }
          .mobile-header { display: none !important; }
        }
      `}</style>
    </div>
  )
}
