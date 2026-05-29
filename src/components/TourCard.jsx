"use client";
import { useState } from 'react';
import BookingModal from './BookingModal';
import { useLanguage } from '../context/LanguageContext';

export default function TourCard({ tour }) {
  const [showModal, setShowModal] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      <div className="tour-card" style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
        <img 
          src={tour.imagen_url || '/placeholder.jpg'} 
          alt={tour.titulo_es} 
          style={{ width: '100%', height: '200px', objectFit: 'cover' }}
        />
        <div style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.8rem', color: '#c8a45c', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {t(tour.categoria_es, tour.categoria_en)}
          </span>
          <h3 style={{ margin: '10px 0', color: '#1a3a5c' }}>{t(tour.titulo_es, tour.titulo_en)}</h3>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '15px' }}>
            {t(tour.descripcion_es, tour.descripcion_en)}
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', fontWeight: 'bold' }}>
            <span>USD {tour.precio}</span>
            <span style={{ color: '#888' }}>⏱ {tour.duracion}</span>
          </div>
          
          <button 
            onClick={() => setShowModal(true)} 
            style={{ width: '100%', padding: '12px', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {t('Reservar Ahora', 'Book Now')}
          </button>
        </div>
      </div>

      {showModal && <BookingModal tour={tour} onClose={() => setShowModal(false)} />}
    </>
  );
}