"use client";
import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Hero() {
  // Traemos la función de traducción 't' del contexto
  const { t } = useLanguage();

  return (
    <section className="hero" id="inicio">
      <div className="hero-bg"></div>
      <div className="hero-overlay"></div>
      <div className="hero-content">
        {/* Badge superior */}
        <div className="hero-badge">
          <i className="fas fa-star"></i>
          <span>
            {t(
              'La mejor experiencia turística en Buenos Aires', 
              'The best tourist experience in Buenos Aires'
            )}
          </span>
        </div>
        
        {/* Título Principal */}
        <h1>
          {t(
            <>Descubrí <span>Buenos Aires</span> con Nosotros</>, 
            <>Discover <span>Buenos Aires</span> with Us</>
          )}
        </h1>
        
        {/* Descripción corta */}
        <p>
          {t(
            'Explorá la ciudad más vibrante de Sudamérica con tours guiados en español e inglés. Experiencias únicas, guías expertos y momentos inolvidables te esperan.',
            "Explore South America's most vibrant city with guided tours in Spanish and English. Unique experiences, expert guides and unforgettable moments await you."
          )}
        </p>
        
        {/* Botones de acción */}
        <div className="hero-buttons">
          <a href="#tours" className="btn btn-primary">
            <i className="fas fa-map-marked-alt"></i>
            <span>{t('Ver Tours', 'View Tours')}</span>
          </a>
          <a href="#contacto" className="btn btn-outline">
            <i className="fas fa-envelope"></i>
            <span>{t('Contactanos', 'Contact Us')}</span>
          </a>
        </div>
        
        {/* Estadísticas */}
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-number">2,500+</div>
            <div className="hero-stat-label">
              {t('Turistas felices', 'Happy tourists')}
            </div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-number">5</div>
            <div className="hero-stat-label">
              {t('Tours exclusivos', 'Exclusive tours')}
            </div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-number">4.9</div>
            <div className="hero-stat-label">
              {t('Calificación promedio', 'Average rating')}
            </div>
          </div>
        </div>
      </div>
      <div className="scroll-indicator">
        <i className="fas fa-chevron-down"></i>
      </div>
    </section>
  );
}