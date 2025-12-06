'use client'

import { useState, useCallback } from 'react'

export type Language = 'en' | 'hi' | 'es' | 'fr' | 'de'

const translations: Record<Language, Record<string, string>> = {
  en: {},
  hi: {},
  es: {},
  fr: {},
  de: {},
}

export function useTranslation() {
  const [language, setLanguage] = useState<Language>('en')

  const changeLanguage = useCallback((newLanguage: Language) => {
    setLanguage(newLanguage)
    localStorage.setItem('language', newLanguage)
  }, [])

  const t = useCallback((key: string): string => {
    return translations[language][key] || key
  }, [language])

  return {
    language,
    changeLanguage,
    t,
  }
}
