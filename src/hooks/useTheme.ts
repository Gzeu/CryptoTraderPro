import { useState, useEffect } from 'react'

type Theme = 'dark' | 'light'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const stored = localStorage.getItem('ctp-theme') as Theme | null
    const sys: Theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    apply(stored ?? sys)
  }, [])

  function apply(t: Theme) {
    setTheme(t)
    document.documentElement.setAttribute('data-theme', t)
    try { localStorage.setItem('ctp-theme', t) } catch {}
  }

  const toggle = () => apply(theme === 'dark' ? 'light' : 'dark')

  return { theme, toggle }
}
