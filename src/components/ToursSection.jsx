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
      // Traemos los tours directamente desde Supabase
      const { data } = await supabase.from('tours').select('*').order('created_at', { ascending: false });
      setTours(data || []);
      setLoading(false);
    }
    fetchTours();
  }, []);

  if (loading) {
    return (
      <section id="tours" style={{ padding: '4rem 2rem', background: '#fcfbfa', textAlign: 'center' }}>
        <p>{t('Cargando tours...', 'Loading tours...')}</p>
      </section>
    );
  }

  return (
    <section id="tours" style={{ padding: '4rem 2rem', background: '#fcfbfa' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '3rem', color: '#1a3a5c' }}>
          {t('Nuestros Tours', 'Our Tours')}
        </h2>
        
        {tours.length === 0 ? (
          <p style={{ textAlign: 'center' }}>{t('No hay tours disponibles.', 'No tours available at the moment.')}</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* Filtramos para mostrar solo los que el admin marcó como "Activos" */}
            {tours.filter(tour => tour.activo).map(tour => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}