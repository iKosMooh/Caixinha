// Colorblind-safe expiry semaphore: uses color + icon + text
interface SemaphoreBadgeProps {
  expiryDate: string | null
}

type Status = 'ok' | 'expiring' | 'expired' | 'none'

function getStatus(expiryDate: string | null): Status {
  if (!expiryDate) return 'none'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  const diffDays = Math.floor((expiry.getTime() - today.getTime()) / 86_400_000)
  if (diffDays < 0)  return 'expired'
  if (diffDays <= 7) return 'expiring'
  return 'ok'
}

const config: Record<Status, { label: string; icon: string; classes: string }> = {
  ok:       { label: 'Válido',          icon: '✓',  classes: 'bg-green-100  text-green-800  border-green-300' },
  expiring: { label: 'Vencendo em breve', icon: '⏰', classes: 'bg-yellow-100 text-yellow-900 border-yellow-400' },
  expired:  { label: 'Vencido',         icon: '⚠',  classes: 'bg-red-100    text-red-800    border-red-400' },
  none:     { label: 'Sem validade',    icon: '—',  classes: 'bg-gray-100   text-gray-600   border-gray-200' },
}

export default function SemaphoreBadge({ expiryDate }: SemaphoreBadgeProps) {
  const status = getStatus(expiryDate)
  const { label, icon, classes } = config[status]

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-sm font-medium ${classes}`}
      role="status"
      aria-label={label}
    >
      <span aria-hidden="true">{icon}</span>
      {expiryDate ? (
        <time dateTime={expiryDate}>
          {new Date(expiryDate).toLocaleDateString('pt-BR')}
        </time>
      ) : (
        label
      )}
    </span>
  )
}
