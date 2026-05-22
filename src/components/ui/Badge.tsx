interface BadgeProps {
  label: string
  variant?: 'status' | 'priority'
}

const statusStyles: Record<string, { bg: string; color: string; dot: string }> = {
  Creado:    { bg: 'rgba(37,99,235,0.15)',  color: '#93c5fd', dot: '#3b82f6' },
  Asignado:  { bg: 'rgba(217,119,6,0.15)',  color: '#fcd34d', dot: '#f59e0b' },
  Atendido:  { bg: 'rgba(22,163,74,0.15)',  color: '#86efac', dot: '#22c55e' },
  Rechazado: { bg: 'rgba(220,38,38,0.15)',  color: '#fca5a5', dot: '#ef4444' },
}

const priorityStyles: Record<string, { bg: string; color: string }> = {
  Baja:    { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' },
  Media:   { bg: 'rgba(37,99,235,0.12)',   color: '#7dd3fc' },
  Alta:    { bg: 'rgba(234,88,12,0.15)',   color: '#fdba74' },
  Critica: { bg: 'rgba(220,38,38,0.18)',   color: '#f87171' },
}

export function Badge({ label, variant = 'status' }: BadgeProps) {
  if (variant === 'status') {
    const s = statusStyles[label] ?? { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8', dot: '#64748b' }
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '3px 8px', borderRadius: '20px',
        background: s.bg, color: s.color,
        fontSize: '11px', fontWeight: '600', letterSpacing: '0.2px',
      }}>
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
        {label}
      </span>
    )
  }

  const p = priorityStyles[label] ?? { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 8px', borderRadius: '20px',
      background: p.bg, color: p.color,
      fontSize: '11px', fontWeight: '500',
    }}>
      {label}
    </span>
  )
}
