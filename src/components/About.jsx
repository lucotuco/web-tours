"use client";
import React from 'react';
import Image from 'next/image';
import { useLanguage } from '../context/LanguageContext';

export default function About() {
  const { t } = useLanguage();

  return (
    <section className="about animate-on-scroll" id="nosotros">
      <div className="section-header">
        <div className="section-badge">
          <i className="fas fa-info-circle"></i> 
          <span>{t('Sobre Nosotros', 'About Us')}</span>
        </div>
        <h2>{t('Tu Aventura Comienza Aquí', 'Your Adventure Starts Here')}</h2>
        <p>{t('Somos una empresa de turismo líder en Buenos Aires, especializada en crear experiencias auténticas e inolvidables para viajeros de todo el mundo.', 'We are a leading tourism company in Buenos Aires, specialized in creating authentic and unforgettable experiences for travelers from all over the world.')}</p>
      </div>
      
      <div className="about-grid">
        {/* IMAGEN OPTIMIZADA */}
        <div className="about-image" style={{ minHeight: '500px' }}>
          <Image 
            src="https://image.qwenlm.ai/public_source/aabe8858-4661-44d6-b253-4742ce16e8fd/1bc6c3f1b-9737-40ce-8304-46540c7c9143.png" 
            alt="Buenos Aires La Boca" 
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="about-image-badge">{t('Desde 2015', 'Since 2015')}</div>
        </div>
        
        <div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '1rem' }}>
            {t('¿Por qué elegir Premier Sur Tours?', 'Why choose Premier Sur Tours?')}
          </h3>
          <p style={{ color: 'var(--text-light)', lineHeight: '1.8', marginBottom: '1.5rem' }}>
            {t('Nuestros guías locales conocen cada rincón de Buenos Aires. Ofrecemos tours en español e inglés con atención personalizada, seguridad y las mejores experiencias para que vivas la auténtica cultura porteña.', 'Our local guides know every corner of Buenos Aires. We offer tours in Spanish and English with personalized attention, safety and the best experiences so you can live the authentic Porteño culture.')}
          </p>
          
          <div className="about-features">
            <div className="about-feature">
              <div className="about-feature-icon"><i className="fas fa-language"></i></div>
              <div>
                <h4>{t('Bilingüe', 'Bilingual')}</h4>
                <p>{t('Tours en español e inglés', 'Tours in Spanish and English')}</p>
              </div>
            </div>
            <div className="about-feature">
              <div className="about-feature-icon"><i className="fas fa-shield-alt"></i></div>
              <div>
                <h4>{t('Seguro', 'Safe')}</h4>
                <p>{t('Seguro de viaje incluido', 'Travel insurance included')}</p>
              </div>
            </div>
            <div className="about-feature">
              <div className="about-feature-icon"><i className="fas fa-user-tie"></i></div>
              <div>
                <h4>{t('Guías Expertos', 'Expert Guides')}</h4>
                <p>{t('Profesionales certificados', 'Certified professionals')}</p>
              </div>
            </div>
            <div className="about-feature">
              <div className="about-feature-icon"><i className="fas fa-credit-card"></i></div>
              <div>
                <h4>{t('Pago Seguro', 'Secure Payment')}</h4>
                <p>{t('Múltiples métodos de pago', 'Multiple payment methods')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}