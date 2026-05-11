import type { Location } from '@/lib/types'

interface LocationPickerProps {
  locations: Location[]
  selected: number | null
  onSelect: (id: number) => void
  name?: string
}

const kindIcon: Record<string, string> = {
  armario:    '🗄',
  geladeira:  '🧊',
  congelador: '❄',
  despensa:   '📦',
  outro:      '📍',
}

export default function LocationPicker({ locations, selected, onSelect, name = 'location_id' }: LocationPickerProps) {
  return (
    <div className="flex flex-wrap gap-3" role="group" aria-label="Local de armazenamento">
      {locations.map((loc) => (
        <button
          key={loc.id}
          type="button"
          onClick={() => onSelect(loc.id)}
          className={`min-h-[52px] min-w-[80px] flex flex-col items-center justify-center gap-1
            rounded-xl border-2 px-3 py-2 text-sm font-semibold transition-colors
            focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none
            ${
              selected === loc.id
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400'
            }`}
          aria-pressed={selected === loc.id}
        >
          <span className="text-xl" aria-hidden="true">{kindIcon[loc.kind]}</span>
          {loc.name}
        </button>
      ))}
      {/* Hidden input for form submission */}
      {selected !== null && (
        <input type="hidden" name={name} value={selected} />
      )}
    </div>
  )
}
