"use client";
import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function HowItWorks() {
  const { t } = useLanguage();

  return (
    <section className="how-it-works animate-on-scroll" id="como-funciona">
      <div className="section-header">
        <div className="section-badge">
          <i className="fas fa-lightbulb"></i> 
          <span>{t('Cómo Funciona', 'How It Works')}</span>
        </div>
        <h2>{t('Reservá en 4 Simples Pasos', 'Book in 4 Simple Steps')}</h2>
        <p>{t('Reservar tu experiencia es fácil y rápido. Seguí estos simples pasos y preparate para vivir una aventura inolvidable.', 'Booking your experience is easy and fast. Follow these simple steps and get ready to live an unforgettable adventure.')}</p>
      </div>
      
      <div className="steps-grid">
        <div className="step">
          <div className="step-icon"><i className="fas fa-search"></i></div>
          <h3>{t('1. Elegí tu Tour', '1. Choose your Tour')}</h3>
          <p>{t('Explorá nuestra selección de tours y elegí el que más te guste.', 'Explore our tour selection and choose the one you like most.')}</p>
        </div>
        <div className="step">
          <div className="step-icon"><i className="fas fa-calendar-alt"></i></div>
          <h3>{t('2. Seleccioná Fecha', '2. Select Date')}</h3>
          <p>{t('Elegí la fecha y hora que más te convenga para tu experiencia.', 'Choose the date and time that works best for your experience.')}</p>
        </div>
        <div className="step">
          <div className="step-icon"><i className="fas fa-user-edit"></i></div>
          <h3>{t('3. Completá tus Datos', '3. Complete your Info')}</h3>
          <p>{t('Ingresá tus datos personales y la cantidad de participantes.', 'Enter your personal details and the number of participants.')}</p>
        </div>
        <div className="step">
          <div className="step-icon"><i className="fas fa-credit-card"></i></div>
          <h3>{t('4. Pagá Online', '4. Pay Online')}</h3>
          <p>{t('Realizá el pago seguro con tarjeta de crédito, PayPal o transferencia.', 'Make a secure payment with credit card, PayPal or bank transfer.')}</p>
        </div>
      </div>
    </section>
  );
}