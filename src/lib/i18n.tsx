'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'af' | 'zu' | 'xh' | 've' | 'sn' | 'st' | 'tn';

type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};

const translations: Translations = {
  en: {
    'nav.ticket_intelligence': 'Ticket Intelligence',
    'nav.analytics': 'Data Analytics',
    'nav.settings': 'Settings',
    'nav.signout': 'Sign Out',
    'settings.title': 'System Settings',
    'settings.appearance': 'Appearance',
    'settings.language': 'Language',
    'settings.language_desc': 'Select your preferred language for the interface.',
    'settings.dark_mode': 'Dark Mode',
    'settings.system_info': 'Architecture Overview',
  },
  af: {
    'nav.ticket_intelligence': 'Kaartjie Intelligensie',
    'nav.analytics': 'Data Ontleding',
    'nav.settings': 'Instellings',
    'nav.signout': 'Teken Uit',
    'settings.title': 'Stelselinstellings',
    'settings.appearance': 'Voorkoms',
    'settings.language': 'Taal',
    'settings.language_desc': 'Kies jou voorkeurtaal vir die koppelvlak.',
    'settings.dark_mode': 'Donker Modus',
    'settings.system_info': 'Argitektuur Oorsig',
  },
  zu: {
    'nav.ticket_intelligence': 'Ubuhlakani Bamathikithi',
    'nav.analytics': 'Izibalo Bedatha',
    'nav.settings': 'Izilungiselelo',
    'nav.signout': 'Phuma',
    'settings.title': 'Izilungiselelo Sesistimu',
    'settings.appearance': 'Ukubukeka',
    'settings.language': 'Ulimi',
    'settings.language_desc': 'Khetha ulimi oluthandayo lwalolu hlelo.',
    'settings.dark_mode': 'Imodi emnyama',
    'settings.system_info': 'Ulwazi Lwezakhiwo',
  },
  xh: {
    'nav.ticket_intelligence': 'I-Intelligence ye-Tikiti',
    'nav.analytics': 'Uhlalutyo lwe-Data',
    'nav.settings': 'Iisetingi',
    'nav.signout': 'Phuma',
    'settings.title': 'Iisetingi zeSistim',
    'settings.appearance': 'Inkangeleko',
    'settings.language': 'Ulwimi',
    'settings.language_desc': 'Khetha ulwimi oluthandayo kolu hlelo.',
    'settings.dark_mode': 'I-dark mode',
    'settings.system_info': 'Ushwankathelo loLwakhiwo',
  },
  ve: {
    'nav.ticket_intelligence': 'Ndivho ya Thikithi',
    'nav.analytics': 'Muvhigo wa Mbalo',
    'nav.settings': 'Vhudzulo',
    'nav.signout': 'U bva',
    'settings.title': 'Vhudzulo ha Sisiteme',
    'settings.appearance': 'Mbonalo',
    'settings.language': 'Luambo',
    'settings.language_desc': 'Nangani luambo lune na tama u lu shumisa.',
    'settings.dark_mode': 'Mbonalo ya swiswi',
    'settings.system_info': 'Zwa Sisiteme',
  },
  sn: {
    'nav.ticket_intelligence': 'Ruzivo rweTikiti',
    'nav.analytics': 'Zvidzidzo zveData',
    'nav.settings': 'Zvirongwa',
    'nav.signout': 'Kubuda',
    'settings.title': 'Zvirongwa zveSystem',
    'settings.appearance': 'Maitiro ekuonekwa',
    'settings.language': 'Mutauro',
    'settings.language_desc': 'Sarudza mutauro waunoda pashandisirwo eino.',
    'settings.dark_mode': 'Maitiro erima',
    'settings.system_info': 'Ruzivo rweArchitecture',
  },
  st: {
    'nav.ticket_intelligence': 'Bohlale ba Tekete',
    'nav.analytics': 'Dipalopalo tsa Data',
    'nav.settings': 'Di-setting',
    'nav.signout': 'Tsoa',
    'settings.title': 'Di-setting tsa Tsamaiso',
    'settings.appearance': 'Ponahalo',
    'settings.language': 'Puo',
    'settings.language_desc': 'Khetha puo eo u e ratang bakeng sa lenaneo lena.',
    'settings.dark_mode': 'Mokhoa o lefifi',
    'settings.system_info': 'Kakaretso ea Moralo',
  },
  tn: {
    'nav.ticket_intelligence': 'Botlhale jwa Thikiti',
    'nav.analytics': 'Dipalopalo tsa Data',
    'nav.settings': 'Dipeo',
    'nav.signout': 'Tswela kwa ntle',
    'settings.title': 'Dipeo tsa Thulaganyo',
    'settings.appearance': 'Tebelego',
    'settings.language': 'Puo',
    'settings.language_desc': 'Tlhopha puo e o e ratang go dirisa mo thulaganyong eno.',
    'settings.dark_mode': 'Mokgwa o o lefifi',
    'settings.system_info': 'Tshekatsheko ya Moralo',
  }
};

interface I18nContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextProps | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('ticketintel_lang') as Language;
    if (savedLang && ['en', 'af', 'zu', 'xh', 've', 'sn', 'st', 'tn'].includes(savedLang)) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('ticketintel_lang', lang);
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};
