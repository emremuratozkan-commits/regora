import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import trTranslations from './src/locales/tr/common.json';
import enTranslations from './src/locales/en/common.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            tr: { translation: trTranslations },
            en: { translation: enTranslations }
        },
        fallbackLng: 'tr',
        supportedLngs: ['tr', 'en'],
        debug: false,
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage', 'cookie', 'htmlTag', 'path', 'subdomain'],
            caches: ['localStorage'],
        },
    });

export default i18n;
