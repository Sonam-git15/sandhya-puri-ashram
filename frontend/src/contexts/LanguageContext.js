import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import translations from '../i18n/translations';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'ashram_lang';
const SUPPORTED = ['hi', 'en', 'sa'];

export function LanguageProvider({ children }) {
    const initial =
        (typeof window !== 'undefined' && window.localStorage.getItem(STORAGE_KEY)) || 'hi';
    const [lang, setLangState] = useState(SUPPORTED.includes(initial) ? initial : 'hi');

    const setLang = useCallback((next) => {
        if (!SUPPORTED.includes(next)) return;
        setLangState(next);
        try {
            window.localStorage.setItem(STORAGE_KEY, next);
        } catch (_) {
            /* ignore */
        }
    }, []);

    const t = useCallback(
        (key) => {
            const dict = translations[lang] || translations.hi;
            return dict[key] ?? translations.hi[key] ?? key;
        },
        [lang]
    );

    const value = useMemo(
        () => ({ lang, setLang, t, supported: SUPPORTED }),
        [lang, setLang, t]
    );

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLang must be used within LanguageProvider');
    return ctx;
}
