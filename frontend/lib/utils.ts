import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateDisplay(input: string | Date | null | undefined) {
  if (!input) return ''

  const date = typeof input === 'string'
    ? new Date(input.length === 10 ? `${input}T00:00:00` : input)
    : input

  if (Number.isNaN(date.getTime())) return ''

  const day = String(date.getDate()).padStart(2, '0')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = months[date.getMonth()]
  const year = date.getFullYear()

  return `${day} ${month}, ${year}`
}

export function formatDateTimeDisplay(input: string | Date | null | undefined) {
  if (!input) return ''

  const date = typeof input === 'string'
    ? new Date(input.length === 10 ? `${input}T00:00:00` : input)
    : input

  if (Number.isNaN(date.getTime())) return ''

  const base = formatDateDisplay(date)
  const hours24 = date.getHours()
  const hours12 = hours24 % 12 || 12
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const ampm = hours24 >= 12 ? 'PM' : 'AM'

  return `${base} ${String(hours12).padStart(2, '0')}:${minutes} ${ampm}`
}
