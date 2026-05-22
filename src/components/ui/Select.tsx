import { type SelectHTMLAttributes, forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string | number; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm text-green-300 font-medium">{label}</label>}
      <select
        ref={ref}
        {...props}
        className={`bg-green-950/60 border ${error ? 'border-red-500' : 'border-green-800'} text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors ${className}`}
      >
        {options.map(o => (
          <option key={o.value} value={o.value} className="bg-green-950">
            {o.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
)
Select.displayName = 'Select'
