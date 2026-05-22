import { type ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        background: 'rgba(6,29,9,0.6)',
        border: '1px solid rgba(74,222,128,0.09)',
        borderRadius: '14px',
        padding: '16px',
        cursor: onClick ? 'pointer' : undefined,
        transition: onClick ? 'all 0.15s' : undefined,
      }}
      onMouseEnter={onClick ? e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(74,222,128,0.2)'
        ;(e.currentTarget as HTMLElement).style.background = 'rgba(6,35,10,0.8)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)'
      } : undefined}
      onMouseLeave={onClick ? e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(74,222,128,0.09)'
        ;(e.currentTarget as HTMLElement).style.background = 'rgba(6,29,9,0.6)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
      } : undefined}
    >
      {children}
    </div>
  )
}
