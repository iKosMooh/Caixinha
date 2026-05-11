import { type InputHTMLAttributes } from 'react'

interface NumericInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
}

export default function NumericInput({ label, id, className = '', ...props }: NumericInputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-base font-semibold text-gray-700">
        {label}
      </label>
      <input
        id={inputId}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        className={`min-h-[52px] rounded-xl border-2 border-gray-300 px-4 py-2 text-xl
          focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 ${className}`}
        {...props}
      />
    </div>
  )
}
