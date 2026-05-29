"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useLanguage } from '../context/LanguageContext';

export default function BookingModal({ tour, onClose }) {
  const { lang, t } = useLanguage();

  const [formData, setFormData] = useState({ 
    nombre: '', 
    email: '', 
    telefono: '', 
    pasajeros: 1, 
    horario: 'morning', 
    idioma: 'es', 
    notas: '' 
  });
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  
  const [fechasBloqueadas, setFechasBloqueadas] = useState([]);
  const [reservasPorDia, setReservasPorDia] = useState({});
  const [todasLasReservas, setTodasLasReservas] = useState([]); 
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function traerDisponibilidad() {
      const { data: bloqueadas } = await supabase.from('fechas_bloqueadas').select('fecha');
      setFechasBloqueadas(bloqueadas?.map(b => b.fecha) || []);

      const { data: reservas } = await supabase.from('reservas').select('fecha_tour, horario');
      setTodasLasReservas(reservas || []);

      const conteo = {};
      reservas?.forEach(r => { conteo[r.fecha_tour] = (conteo[r.fecha_tour] || 0) + 1; });
      setReservasPorDia(conteo);
    }
    traerDisponibilidad();
  }, []);

  const obtenerHorariosOcupados = () => {
    if (!fechaSeleccionada) return [];
    const year = fechaSeleccionada.getFullYear();
    const month = String(fechaSeleccionada.getMonth() + 1).padStart(2, '0');
    const day = String(fechaSeleccionada.getDate()).padStart(2, '0');
    const fechaStr = `${year}-${month}-${day}`;
    
    return todasLasReservas
      .filter(r => r.fecha_tour === fechaStr)
      .map(r => r.horario);
  };

  const horariosOcupados = obtenerHorariosOcupados();

  useEffect(() => {
    if (fechaSeleccionada && todasLasReservas.length > 0) {
      const year = fechaSeleccionada.getFullYear();
      const month = String(fechaSeleccionada.getMonth() + 1).padStart(2, '0');
      const day = String(fechaSeleccionada.getDate()).padStart(2, '0');
      const fechaStr = `${year}-${month}-${day}`;
      
      const ocupados = todasLasReservas
        .filter(r => r.fecha_tour === fechaStr)
        .map(r => r.horario);
        
      const opciones = ['morning', 'afternoon', 'evening'];
      const primeroLibre = opciones.find(opt => !ocupados.includes(opt));
      
      if (primeroLibre && ocupados.includes(formData.horario)) {
        setFormData(prev => ({ ...prev, horario: primeroLibre }));
      }
    }
  }, [fechaSeleccionada, todasLasReservas, formData.horario]);

  const esDiaDisponible = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const fechaStr = `${year}-${month}-${day}`;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (date < hoy) return false;
    if (fechasBloqueadas.includes(fechaStr)) return false;
    if (reservasPorDia[fechaStr] >= 3) return false; 
    return true;
  };

  const montoTotal = tour.precio * formData.pasajeros;
  const montoTotalArs = (tour.precio_ars || 0) * formData.pasajeros;

  const guardarReservaEnBaseDeDatos = async (estado) => {
    const year = fechaSeleccionada.getFullYear();
    const month = String(fechaSeleccionada.getMonth() + 1).padStart(2, '0');
    const day = String(fechaSeleccionada.getDate()).padStart(2, '0');
    const fechaFormateada = `${year}-${month}-${day}`;

    const { error } = await supabase.from('reservas').insert([{
      tour_id: tour.id,
      nombre_cliente: formData.nombre,
      email_cliente: formData.email,
      telefono: formData.telefono,
      fecha_tour: fechaFormateada,
      pasajeros: formData.pasajeros,
      horario: formData.horario,
      idioma: formData.idioma,
      notas: formData.notas,
      estado: estado
    }]);

    if (error) {
      alert("Error guardando reserva: " + error.message);
      return false;
    }
    return true;
  };

  const pagarConMercadoPago = async () => {
    await guardarReservaEnBaseDeDatos('pendiente (Mercado Pago)'); 
    try {
      const res = await fetch('/api/mercadopago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: `Reserva: ${lang === 'es' ? tour.titulo_es : tour.titulo_en}`,
          precio_total: montoTotalArs
        })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; 
      } else {
        alert(t("Hubo un error al generar el link de pago.", "There was an error generating the payment link."));
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const formularioCompleto = formData.nombre !== '' && formData.email !== '' && formData.telefono !== '' && fechaSeleccionada !== null;

  return (
    <PayPalScriptProvider options={{ "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID, currency: "USD" }}>
      <div className="modal-overlay active" style={{ display: 'flex', zIndex: 9999 }}>
        {/* Quitamos el overflow: 'visible' para que haga scroll interno si no entra en pantalla */}
        <div className="modal">
          <div className="modal-header">
            <h3>{t('Reservar:', 'Book:')} {lang === 'es' ? tour.titulo_es : tour.titulo_en}</h3>
            <button className="modal-close" onClick={onClose}>&times;</button>
          </div>
          
          <div className="modal-body">
            {success ? (
              <div className="success-content">
                {/* Ícono verde animado del diseño original */}
                <div className="success-icon"><i className="fas fa-check"></i></div>
                <h3>{t('¡Reserva Confirmada!', 'Booking Confirmed!')}</h3>
                <p>{t('Tu reserva ha sido procesada exitosamente. Recibirás un email de confirmación con todos los detalles.', 'Your booking has been processed successfully. You will receive a confirmation email with all the details.')}</p>
                
                {/* Desglose estético con los datos reales de la compra */}
                <div className="success-details" style={{ textAlign: 'left', background: 'var(--bg-light)', borderRadius: '12px', padding: '1.25rem', margin: '1.5rem 0' }}>
                  <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.9rem' }}>
                    <span>{t('N° de Reserva', 'Booking #')}</span>
                    <span style={{ fontWeight: '700', color: '#1a3a5c' }}>
                      PST-{fechaSeleccionada ? fechaSeleccionada.getTime().toString(36).toUpperCase() : 'OK'}
                    </span>
                  </div>
                  <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.9rem' }}>
                    <span>{t('Tour', 'Tour')}</span>
                    <span>{lang === 'es' ? tour.titulo_es : tour.titulo_en}</span>
                  </div>
                  <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.9rem' }}>
                    <span>{t('Fecha', 'Date')}</span>
                    <span>{fechaSeleccionada ? fechaSeleccionada.toLocaleDateString('es-AR') : ''}</span>
                  </div>
                  <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.9rem' }}>
                    <span>{t('Personas', 'People')}</span>
                    <span>× {formData.pasajeros}</span>
                  </div>
                  <div className="summary-row total" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)', borderTop: '2px solid var(--primary)', marginTop: '8px', paddingTop: '12px' }}>
                    <span>{t('Total Pagado', 'Total Paid')}</span>
                    <span>USD {montoTotal}</span>
                  </div>
                </div>
                
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                  {t('Te contactaremos antes del tour para confirmar los detalles del encuentro.', 'We will contact you before the tour to confirm the meeting details.')}
                </p>
                
                <button className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center' }} onClick={onClose}>
                  <i className="fas fa-thumbs-up"></i>
                  <span>{t('¡Perfecto!', 'Perfect!')}</span>
                </button>
              </div>
            ) : (
              <div>
                <div className="form-group">
                  <label>{t('Nombre Completo', 'Full Name')}</label>
                  <input type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} placeholder={t("Tu nombre y apellido", "Your full name")} />
                </div>
                
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="tu@email.com" />
                </div>

                <div className="form-group">
                  <label>{t('Teléfono', 'Phone Number')}</label>
                  {/* Se quitó className="date-picker-input" para no pisar el padding original */}
                  <input type="tel" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} placeholder="+1 234 567 8900" />
                </div>
                
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label>{t('Fecha del Tour', 'Tour Date')}</label>
                    {/* El date picker sí mantiene la clase por compatibilidad con la librería */}
                    <DatePicker 
                      selected={fechaSeleccionada} 
                      onChange={date => setFechaSeleccionada(date)} 
                      filterDate={esDiaDisponible}
                      placeholderText={t("Elegí un día", "Choose a day")}
                      className="date-picker-input"
                      dateFormat="dd/MM/yyyy"
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('Pasajeros', 'Passengers')}</label>
                    <input type="number" min="1" value={formData.pasajeros} onChange={e => setFormData({...formData, pasajeros: e.target.value})} />
                  </div>
                </div>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label>{t('Horario Preferido', 'Preferred Time')}</label>
                    <select value={formData.horario} onChange={e => setFormData({...formData, horario: e.target.value})}>
                      <option value="morning" disabled={horariosOcupados.includes('morning')}>{t('Mañana (9:00)', 'Morning (9:00)')}</option>
                      <option value="afternoon" disabled={horariosOcupados.includes('afternoon')}>{t('Tarde (14:00)', 'Afternoon (14:00)')}</option>
                      <option value="evening" disabled={horariosOcupados.includes('evening')}>{t('Noche (19:00)', 'Evening (19:00)')}</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t('Idioma del Guía', 'Guide Language')}</label>
                    <select value={formData.idioma} onChange={e => setFormData({...formData, idioma: e.target.value})}>
                      <option value="es">{t('Español', 'Spanish')}</option>
                      <option value="en">{t('Inglés', 'English')}</option>
                      <option value="both">{t('Ambos (Español/Inglés)', 'Both (Spanish/English)')}</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('Notas Adicionales', 'Additional Notes')}</label>
                  <textarea rows="3" placeholder={t("Requisitos especiales, observaciones, etc.", "Special requirements, observations, etc.")} value={formData.notas} onChange={e => setFormData({...formData, notas: e.target.value})} style={{ width: '100%', padding: '12px 16px', border: '2px solid #e8e8e8', borderRadius: '12px', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif', background: 'var(--bg-light)' }}></textarea>
                </div>
                
                <div className="booking-summary" style={{ margin: '15px 0', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
                  <strong>Total: USD {montoTotal} {tour.precio_ars > 0 ? `| ARS ${montoTotalArs}` : ''}</strong>
                </div>

                {!formularioCompleto ? (
                  <p style={{ color: '#ef6c00', fontSize: '0.9rem', textAlign: 'center', fontWeight: 'bold' }}>
                    {t('Completá tu nombre, email, teléfono y fecha para habilitar el pago.', 'Complete your name, email, phone, and date to enable payment.')}
                  </p>
                ) : (
                  <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {tour.precio_ars > 0 && (
                      <button 
                        type="button" 
                        onClick={pagarConMercadoPago} 
                        style={{ background: '#009ee3', color: 'white', padding: '12px', width: '100%', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
                      >
                        {t('Pagar con Mercado Pago (ARS ', 'Pay with Mercado Pago (ARS ')} {montoTotalArs})
                      </button>
                    )}

                    {tour.precio_ars > 0 && (
                      <div style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem', margin: '5px 0' }}>
                        {t('o pagar en dólares con', 'or pay in USD with')}
                      </div>
                    )}

                    <PayPalButtons 
                      style={{ layout: "vertical", color: "gold", shape: "rect", height: 40 }}
                      createOrder={(data, actions) => {
                        return actions.order.create({
                          purchase_units: [{
                            description: `Reserva: ${lang === 'es' ? tour.titulo_es : tour.titulo_en}`,
                            amount: { value: montoTotal.toString() }
                          }]
                        });
                      }}
                      onApprove={async (data, actions) => {
                        await actions.order.capture();
                        const guardadoOk = await guardarReservaEnBaseDeDatos('confirmado y pagado (PayPal)');
                        if (guardadoOk) {
                          setSuccess(true);
                        }
                      }}
                      onError={(err) => {
                        alert(t("Hubo un problema con el pago. Intentá nuevamente.", "There was a problem with the payment. Please try again."));
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}