"use client";
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSwitcher() {
  const { lang, changeLang } = useLanguage();

  return (
    <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1000, display: 'flex', gap: '5px' }}>
      <button 
        onClick={() => changeLang('es')} 
        style={{ padding: '6px 12px', cursor: 'pointer', borderRadius: '4px', border: 'none', background: lang === 'es' ? '#1a3a5c' : '#f0f0f0', color: lang === 'es' ? 'white' : '#333', fontWeight: 'bold' }}
      >
        ES 🇦🇷
      </button>
      <button 
        onClick={() => changeLang('en')} 
        style={{ padding: '6px 12px', cursor: 'pointer', borderRadius: '4px', border: 'none', background: lang === 'en' ? '#1a3a5c' : '#f0f0f0', color: lang === 'en' ? 'white' : '#333', fontWeight: 'bold' }}
      >
        EN 🇺🇸
      </button>
    </div>
  );
}