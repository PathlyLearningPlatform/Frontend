import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'
import pl from '../i18n/pl'
import en from '../i18n/en'

export type Language = 'pl' | 'en'

type TranslationKey = keyof typeof pl

interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  /** Podstawia `{nazwa}` w tekście wartościami z `params`, np. `t('quiz.progress', { current: 1, total: 5 })` */
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
}

const translations: Record<Language, Record<string, string>> = { pl, en }

const LanguageContext = createContext<LanguageContextValue>({
  language: 'pl',
  setLanguage: () => {},
  t: (key: TranslationKey, params?: Record<string, string | number>) => {
    let s = translations.pl[key] ?? key
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        s = s.replaceAll(`{${k}}`, String(v))
      }
    }
    return s
  },
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
    (key: TranslationKey, params?: Record<string, string | number>) => {
      let s = translations[language][key] ?? key
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          s = s.replaceAll(`{${k}}`, String(v))
        }
      }
      return s
    },
    [language],
  )

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
