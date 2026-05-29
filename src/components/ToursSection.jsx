"use client";
import { useEffect, useState } from 'react';
import TourCard from './TourCard';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';

export default function ToursSection() {
  const { t } = useLanguage();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTours() {
      const { data } = await supabase.from('tours').select('*').order('created_at', { ascending: false });
      setTours(data || []);
      setLoading(false);
    }
    fetchTours();
  }, []);

  if (loading) {
    return (
      <section className="tours" id="tours" style={{ textAlign: 'center', padding: '6rem 2rem' }}>
        <p>{t('Cargando tours...', 'Loading tours...')}</p>
      </section>
    );
  }

  return (
    <section className="tours" id="tours">
      <div className="container">
        {/* ENCABEZADO DE SECCIÓN LINDO */}
        <div className="section-header">
          <div className="section-badge">
            <i className="fas fa-map-marker-alt"></i>
            <span>{t('Explorá', 'Explore')}</span>
          </div>
          <h2>{t('Nuestros Tours', 'Our Tours')}</h2>
          <p>{t('Descubrí Buenos Aires con nuestros recorridos más populares y experiencias únicas.', 'Discover Buenos Aires with our most popular tours and unique experiences.')}</p>
        </div>
        
        {tours.length === 0 ? (
          <p style={{ textAlign: 'center' }}>{t('No hay tours disponibles.', 'No tours available at the moment.')}</p>
        ) : (
          <div className="tours-grid">
            {tours.filter(tour => tour.activo).map(tour => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}