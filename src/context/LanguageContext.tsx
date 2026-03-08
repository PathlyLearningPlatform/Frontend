import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'
import pl from '../i18n/pl'
import en from '../i18n/en'

export type Language = 'pl' | 'en'

type TranslationKey = keyof typeof pl

interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
}

const translations: Record<Language, Record<string, string>> = { pl, en }

const LanguageContext = createContext<LanguageContextValue>({
  language: 'pl',
  setLanguage: () => {},
  t: (key: string) => key,
})

export function useLanguage() {
  return useContext(LanguageContext)
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('pathly-language')
    return (stored === 'en' ? 'en' : 'pl')
  })

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('pathly-language', lang)
  }, [])

  const t = useCallback(
    (key: TranslationKey) => {
      return translations[language][key] ?? key
    },
    [language],
  )

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
