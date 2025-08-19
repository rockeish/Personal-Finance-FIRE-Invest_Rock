'use client'

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem('theme-dark') === 'true'
    setDark(stored)
    document.documentElement.classList.toggle('dark', stored)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem('theme-dark', String(dark))
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return (
    <button
      className="rounded border px-3 py-2 text-sm"
      onClick={() => setDark((d) => !d)}
    >
      {dark ? 'Light' : 'Dark'}
    </button>
  )
}
