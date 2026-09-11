import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import de from '@/i18n/locales/de.json'
import en from '@/i18n/locales/en.json'

export const defaultNS = 'translation'
export const resources = {
  de: { translation: de },
  en: { translation: en },
} as const

export const supportedLngs = Object.keys(resources) as Array<keyof typeof resources>

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS,
    fallbackLng: 'de',
    supportedLngs,
    interpolation: { escapeValue: false },
    detection: { order: ['querystring', 'localStorage', 'navigator'], caches: ['localStorage'] },
  })

export default i18n
