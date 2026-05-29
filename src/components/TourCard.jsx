"use client";
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import BookingModal from './BookingModal';

export default function TourCard({ tour }) {
  const { lang, t } = useLanguage();
  const [showModal, setShowModal] = useState(false);

  // Elegimos el texto según el idioma
  const titulo = lang === 'es' ? tour.titulo_es : tour.titulo_en;
  const descripcion = lang === 'es' ? tour.descripcion_es : tour.descripcion_en;
  const categoria = lang === 'es' ? tour.categoria_es : tour.categoria_en;

  // Amenidades (Las hardcodeamos por ahora para mantener el diseño original)
  const amenities = lang === 'es' 
    ? ["Transporte", "Guía bilingüe"] 
    : ["Transport", "Bilingual Guide"];

  return (
    <>
      <div className="tour-card">
        {/* IMAGEN Y BADGES */}
        <div className="tour-card-image">
          <img 
            src={tour.imagen_url || 'https://via.placeholder.com/400x300?text=Tour+PremierSur'} 
            alt={titulo} 
          />
          <div className="tour-card-badge">{categoria}</div>
          <div className="tour-card-duration">
            <i className="far fa-clock"></i> {tour.duracion}
          </div>
        </div>
        
        {/* CUERPO DE LA TARJETA */}
        <div className="tour-card-body">
          <h3 className="tour-card-title">{titulo}</h3>
          <p className="tour-card-desc">{descripcion}</p>
          
          <div className="tour-card-includes">
            {amenities.map((amenity, index) => (
              <span key={index} className="tour-tag">
                <i className="fas fa-check-circle" style={{color: '#c8a45c', marginRight: '4px'}}></i> 
                {amenity}
              </span>
            ))}
          </div>
          
          {/* PRECIO Y BOTÓN */}
          <div className="tour-card-footer">
            <div className="tour-price">
              <span className="tour-price-label">{t('Desde', 'From')}</span>
              <span className="tour-price-amount">USD {tour.precio}</span>
            </div>
            <button className="btn-book" onClick={() => setShowModal(true)}>
              {t('Reservar', 'Book')}
            </button>
          </div>
        </div>
      </div>

      {showModal && <BookingModal tour={tour} onClose={() => setShowModal(false)} />}
    </>
  );
}