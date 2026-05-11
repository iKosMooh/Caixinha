interface AlertCardProps {
  title: string
  count: number
  icon: string
  variant: 'warning' | 'danger' | 'info'
  children?: React.ReactNode
}

const variantClasses: Record<string, string> = {
  warning: 'border-yellow-400 bg-yellow-50',
  danger:  'border-red-400   bg-red-50',
  info:    'border-blue-400  bg-blue-50',
}

const titleClasses: Record<string, string> = {
  warning: 'text-yellow-900',
  danger:  'text-red-900',
  info:    'text-blue-900',
}

export default function AlertCard({ title, count, icon, variant, children }: AlertCardProps) {
  if (count === 0) return null
  return (
    <section
      className={`rounded-2xl border-2 p-4 ${variantClasses[variant]}`}
      aria-label={title}
    >
      <header className="flex items-center gap-2 mb-3">
        <span className="text-2xl" aria-hidden="true">{icon}</span>
        <h2 className={`text-xl font-bold ${titleClasses[variant]}`}>
          {title}{' '}
          <span className="text-base font-normal">({count})</span>
        </h2>
      </header>
      {children}
    </section>
  )
}
