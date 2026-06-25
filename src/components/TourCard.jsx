"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '../context/LanguageContext';
import BookingModal from './BookingModal';

export default function TourCard({ tour }) {
  const { lang, t } = useLanguage();
  const [showModal, setShowModal] = useState(false);

  const titulo = lang === 'es' ? tour.titulo_es : tour.titulo_en;
  const descripcion = lang === 'es' ? tour.descripcion_es : tour.descripcion_en;
  const categoria = lang === 'es' ? tour.categoria_es : tour.categoria_en;

  const amenities = lang === 'es'
    ? ["Transporte", "Guía bilingüe"]
    : ["Transport", "Bilingual Guide"];

  return (
    <>
      <div className="tour-card">
        {/* IMAGEN OPTIMIZADA CON NEXT/IMAGE */}
        <div className="tour-card-image">
          <Image
            src={tour.imagen_url || 'https://via.placeholder.com/400x300?text=Tour+PremierSur'}
            alt={titulo}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="tour-card-badge">{categoria}</div>
          <div className="tour-card-duration">
            <i className="far fa-clock"></i> {tour.duracion}
          </div>
        </div>

        <div className="tour-card-body">
          <h3 className="tour-card-title">{titulo}</h3>
          <p className="tour-card-desc">{descripcion}</p>

          <div className="tour-card-includes">
            {amenities.map((amenity, index) => (
              <span key={index} className="tour-tag">
                <i className="fas fa-check-circle" style={{ color: '#c8a45c', marginRight: '4px' }}></i>
                {amenity}
              </span>
            ))}
          </div>

          <div className="tour-card-footer">
            <div className="tour-price">
              <span className="tour-price-label">{t('Desde', 'From')}</span>
              <span className="tour-price-amount">
                USD {tour.precio}
                <span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-light)', marginLeft: '6px' }}>
                  {t('/ pax', '/ pax')}
                </span>
              </span>
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