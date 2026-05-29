"use client";
import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <a href="#" className="nav-logo" style={{ marginBottom: '0.5rem' }}>
            <div className="nav-logo-icon">PST</div>
            <div className="nav-logo-text">Premier <span>Sur</span> Tours</div>
          </a>
          <p>
            {t(
              'Tu puerta de entrada a las experiencias más auténticas de Buenos Aires. Desde 2015 creando recuerdos inolvidables para viajeros de todo el mundo.',
              'Your gateway to the most authentic experiences in Buenos Aires. Since 2015 creating unforgettable memories for travelers from all over the world.'
            )}
          </p>
        </div>
        
        <div>
          <h4>{t('Tours', 'Tours')}</h4>
          <ul className="footer-links">
            <li><a href="#tours">City Tour</a></li>
            <li><a href="#tours">{t('City Tour Privado', 'Private City Tour')}</a></li>
            <li><a href="#tours">{t('City Tour Nocturno', 'Night City Tour')}</a></li>
            <li><a href="#tours">{t('La Pampa Argentina y el Gaucho', 'The Argentine Pampa & the Gaucho')}</a></li>
            <li><a href="#tours">{t('Delta del Río de la Plata', 'Rio de la Plata Delta')}</a></li>
          </ul>
        </div>
        
        <div>
          <h4>{t('Empresa', 'Company')}</h4>
          <ul className="footer-links">
            <li><a href="#nosotros">{t('Sobre Nosotros', 'About Us')}</a></li>
            <li><a href="#testimonios">{t('Testimonios', 'Testimonials')}</a></li>
            <li><a href="#contacto">{t('Contacto', 'Contact')}</a></li>
            <li><a href="#">{t('Blog', 'Blog')}</a></li>
            <li><a href="#">{t('FAQ', 'FAQ')}</a></li>
          </ul>
        </div>
        
        <div>
          <h4>{t('Legal', 'Legal')}</h4>
          <ul className="footer-links">
            <li><a href="#">{t('Términos y Condiciones', 'Terms & Conditions')}</a></li>
            <li><a href="#">{t('Política de Privacidad', 'Privacy Policy')}</a></li>
            <li><a href="#">{t('Política de Cancelación', 'Cancellation Policy')}</a></li>
            <li><a href="#">{t('Reembolsos', 'Refunds')}</a></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <span>© 2026 Premier Sur Tours. {t('Todos los derechos reservados.', 'All rights reserved.')}</span>
        <span>{t('Hecho con ❤️ en Buenos Aires', 'Made with ❤️ in Buenos Aires')}</span>
      </div>
    </footer>
  );
}