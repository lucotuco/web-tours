"use client";
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  
  // Traemos el idioma actual (lang), la función para cambiarlo (changeLang) y el traductor (t)
  const { lang, changeLang, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
      <div className="nav-container">
        <a href="#" className="nav-logo">
          <div className="nav-logo-icon">PST</div>
          <div className="nav-logo-text">Premier <span>Sur</span> Tours</div>
        </a>
        <ul className="nav-links">
          <li><a href="#inicio">{t('Inicio', 'Home')}</a></li>
          <li><a href="#nosotros">{t('Nosotros', 'About Us')}</a></li>
          <li><a href="#tours">{t('Tours', 'Tours')}</a></li>
          <li><a href="#como-funciona">{t('Cómo Funciona', 'How it Works')}</a></li>
          <li><a href="#testimonios">{t('Testimonios', 'Testimonials')}</a></li>
          <li><a href="#contacto">{t('Contacto', 'Contact')}</a></li>
          <li>
            {/* BOTONES DE IDIOMA CONECTADOS */}
            <div className="lang-toggle">
              <button 
                className={`lang-btn ${lang === 'es' ? 'active' : ''}`}
                onClick={() => changeLang('es')}
              >
                ES
              </button>
              <button 
                className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
                onClick={() => changeLang('en')}
              >
                EN
              </button>
            </div>
          </li>
        </ul>
        <button className="mobile-menu-btn">
          <i className="fas fa-bars"></i>
        </button>
      </div>
    </nav>
  );
}