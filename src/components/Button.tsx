import { type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost' | 'success'
  size?: 'lg' | 'md' | 'sm'
}

export default function Button({
  variant = 'primary',
  size = 'lg',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl ' +
    'focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 ' +
    'transition-colors disabled:opacity-50 disabled:pointer-events-none'

  const variants: Record<string, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-400',
    danger:  'bg-red-600  text-white hover:bg-red-700  focus-visible:ring-red-400',
    ghost:   'bg-gray-100 text-gray-800 hover:bg-gray-200 focus-visible:ring-gray-400',
    success: 'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-400',
  }

  const sizes: Record<string, string> = {
    lg: 'min-h-[52px] px-6 py-3 text-lg',
    md: 'min-h-[44px] px-4 py-2 text-base',
    sm: 'min-h-[36px] px-3 py-1 text-sm',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
