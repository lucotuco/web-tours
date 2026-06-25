"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';
import TransferBookingModal from './TransferBookingModal';

export default function TransfersSection() {
  const { lang, t } = useLanguage();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransfer, setSelectedTransfer] = useState(null);

  useEffect(() => {
    async function fetchTransfers() {
      const { data } = await supabase.from('transfers').select('*').eq('activo', true).order('orden', { ascending: true });
      setTransfers(data || []);
      setLoading(false);
    }
    fetchTransfers();
  }, []);

  if (loading || transfers.length === 0) return null; // Si no hay transfers, ocultamos la sección

  return (
    <section className="tours" id="transfers" style={{ background: '#f8f6f2' }}>
      <div className="container">
        <div className="section-header">
          <div className="section-badge">
            <i className="fas fa-car"></i>
            <span>Transfers</span>
          </div>
          <h2>{t('Nuestros Transfers', 'Our Transfers')}</h2>
          <p>{t('Traslados privados exclusivos desde y hacia los aeropuertos.', 'Exclusive private transfers to and from airports.')}</p>
        </div>
        
        <div className="tours-grid">
          {transfers.map(tr => {
            const titulo = lang === 'es' ? tr.titulo_es : tr.titulo_en;
            const descripcion = lang === 'es' ? tr.descripcion_es : tr.descripcion_en;
            
            return (
              <div key={tr.id} className="tour-card">
                <div className="tour-card-image" style={{ height: '220px' }}>
                  <Image 
                    src={tr.imagen_url || 'https://via.placeholder.com/400x200?text=Transfer'} 
                    alt={titulo} 
                    fill 
                    style={{ objectFit: 'cover' }} 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="tour-card-badge">{t('Máx 4 Pax', 'Max 4 Pax')}</div>
                </div>
                
                <div className="tour-card-body">
                  <h3 className="tour-card-title">{titulo}</h3>
                  <p className="tour-card-desc">{descripcion}</p>
                  
                  <div className="tour-card-includes">
                    <span className="tour-tag"><i className="fas fa-check-circle" style={{color: '#c8a45c', marginRight: '4px'}}></i> {t('Vehículo Privado', 'Private Vehicle')}</span>
                    <span className="tour-tag"><i className="fas fa-suitcase" style={{color: '#c8a45c', marginRight: '4px'}}></i> {t('Incluye Equipaje', 'Luggage Included')}</span>
                  </div>
                  
                  <div className="tour-card-footer">
                    <div className="tour-price">
                      <span className="tour-price-amount">
                        USD {tr.precio}
                        <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-light)', marginLeft: '6px' }}>
                          {t('/ vehículo', '/ vehicle')}
                        </span>
                      </span>
                    </div>
                    <button className="btn-book" onClick={() => setSelectedTransfer(tr)}>
                      {t('Reservar', 'Book')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {selectedTransfer && <TransferBookingModal transfer={selectedTransfer} onClose={() => setSelectedTransfer(null)} />}
    </section>
  );
}