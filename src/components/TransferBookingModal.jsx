"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useLanguage } from '../context/LanguageContext';

export default function TransferBookingModal({ transfer, onClose }) {
  const { lang, t } = useLanguage();
  
  const [formData, setFormData] = useState({ 
    nombre: '', 
    email: '', 
    telefono: '', 
    pasajeros: 1, // Max 4
    horario: '', 
    direccion: '',
    sentido: 'aeropuerto-domicilio',
    notas: '' 
  });

  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [fechasBloqueadas, setFechasBloqueadas] = useState([]);
  const [reservasPorDia, setReservasPorDia] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Generar opciones de horario cada 30 min
  const opcionesHorario = Array.from({ length: 48 }, (_, i) => {
    const hora = Math.floor(i / 2).toString().padStart(2, '0');
    const min = i % 2 === 0 ? '00' : '30';
    return `${hora}:${min}`;
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    async function traerDisponibilidad() {
      const { data: bloqueadas } = await supabase.from('fechas_bloqueadas').select('fecha');
      setFechasBloqueadas(bloqueadas?.map(b => b.fecha) || []);

      const { data: reservas } = await supabase.from('reservas_transfer').select('fecha_transfer');
      const conteo = {};
      reservas?.forEach(r => { conteo[r.fecha_transfer] = (conteo[r.fecha_transfer] || 0) + 1; });
      setReservasPorDia(conteo);
    }
    traerDisponibilidad();
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const esDiaDisponible = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const fechaStr = `${year}-${month}-${day}`;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (date < hoy) return false;
    if (fechasBloqueadas.includes(fechaStr)) return false;
    // REGLA: Límite de 2 transfers por día
    if (reservasPorDia[fechaStr] >= 2) return false; 
    return true;
  };

  // El precio del transfer es por vehículo completo, NO se multiplica por pasajero
  const montoTotal = Number(transfer.precio);
  const montoTotalArs = Number(transfer.precio_ars || 0);

  const guardarReservaEnBaseDeDatos = async (estado) => {
    const year = fechaSeleccionada.getFullYear();
    const month = String(fechaSeleccionada.getMonth() + 1).padStart(2, '0');
    const day = String(fechaSeleccionada.getDate()).padStart(2, '0');
    
    const { data, error } = await supabase.from('reservas_transfer').insert([{
      transfer_id: transfer.id,
      nombre_cliente: formData.nombre,
      email_cliente: formData.email,
      telefono: formData.telefono,
      fecha_transfer: `${year}-${month}-${day}`,
      horario: formData.horario,
      pasajeros: formData.pasajeros,
      sentido: formData.sentido,
      direccion: formData.direccion,
      notas: formData.notas,
      estado: estado
    }]).select().single();

    if (error) {
      alert("Error guardando reserva: " + error.message);
      return null;
    }
    return data.id;
  };

  const pagarConMercadoPago = async () => {
    setIsProcessing(true);
    const reservaId = await guardarReservaEnBaseDeDatos('pendiente (Mercado Pago)');
    if (!reservaId) { setIsProcessing(false); return; }
    
    try {
      const res = await fetch('/api/mercadopago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: `Transfer: ${lang === 'es' ? transfer.titulo_es : transfer.titulo_en}`,
          precio_total: montoTotalArs,
          reserva_id: reservaId // Nota: el Webhook actualizará reservas_transfer si modificás tu API MP, pero por ahora registrará el pago ok.
        })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else { alert(t("Hubo un error al generar el link de pago.", "Error generating payment link.")); setIsProcessing(false); }
    } catch (error) { alert("Error: " + error.message); setIsProcessing(false); }
  };

  const formularioCompleto = formData.nombre && formData.email && formData.telefono && fechaSeleccionada && formData.horario && formData.direccion;

  return (
    <PayPalScriptProvider options={{ "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID, currency: "USD", intent: "capture" }}>
      <div className="modal-overlay active" style={{ display: 'flex', zIndex: 9999 }} onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{t('Reservar:', 'Book:')} {lang === 'es' ? transfer.titulo_es : transfer.titulo_en}</h3>
            <button className="modal-close" onClick={onClose} disabled={isProcessing}>&times;</button>
          </div>
          
          <div className="modal-body">
            <div style={{ opacity: isProcessing ? 0.5 : 1, pointerEvents: isProcessing ? 'none' : 'auto' }}>
              
              <div className="form-group">
                <label>{t('Nombre Completo', 'Full Name')}</label>
                <input type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} placeholder={t("Tu nombre", "Your name")} />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="tu@email.com" />
                </div>
                <div className="form-group">
                  <label>{t('Teléfono', 'Phone Number')}</label>
                  <input type="tel" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} placeholder="+1 234 567 8900" />
                </div>
              </div>

              <div className="form-group">
                <label>{t('Sentido del Viaje', 'Direction of Travel')}</label>
                <select value={formData.sentido} onChange={e => setFormData({...formData, sentido: e.target.value})}>
                  <option value="aeropuerto-domicilio">{t('Aeropuerto ➔ Domicilio (Llegada)', 'Airport ➔ Accommodation (Arrival)')}</option>
                  <option value="domicilio-aeropuerto">{t('Domicilio ➔ Aeropuerto (Salida)', 'Accommodation ➔ Airport (Departure)')}</option>
                </select>
              </div>

              <div className="form-group">
                <label>{t('Dirección en Buenos Aires (Hotel / Airbnb)', 'Address in Buenos Aires (Hotel / Airbnb)')}</label>
                <input type="text" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} placeholder={t("Ej: Av. Alvear 1234, CABA", "Ex: Av. Alvear 1234, CABA")} />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>{t('Fecha del Transfer', 'Transfer Date')}</label>
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
                  <label>{t('Horario Exacto', 'Exact Time')}</label>
                  <select value={formData.horario} onChange={e => setFormData({...formData, horario: e.target.value})}>
                    <option value="">{t('Seleccioná...', 'Select...')}</option>
                    {opcionesHorario.map(hora => (
                      <option key={hora} value={hora}>{hora}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>{t('Pasajeros (Máximo 4)', 'Passengers (Max 4)')}</label>
                <input 
                  type="number" 
                  min="1" 
                  max="4" 
                  value={formData.pasajeros} 
                  onChange={e => setFormData({...formData, pasajeros: Math.min(4, Math.max(1, parseInt(e.target.value) || 1))})} 
                />
                <small style={{display: 'block', marginTop: '4px', color: '#6b7b8d'}}>
                  {t('*Incluye espacio para maletas estándar en el baúl.', '*Includes space for standard luggage in the trunk.')}
                </small>
              </div>

              <div className="form-group">
                <label>{t('Número de Vuelo / Notas', 'Flight Number / Notes')}</label>
                <textarea rows="2" placeholder={t("Ej: Vuelo AA 900. Llevamos una silla de ruedas.", "Ex: Flight AA 900. We carry a wheelchair.")} value={formData.notas} onChange={e => setFormData({...formData, notas: e.target.value})} style={{ width: '100%', padding: '12px', border: '2px solid #e8e8e8', borderRadius: '12px', resize: 'none' }}></textarea>
              </div>

              <div className="booking-summary" style={{ margin: '15px 0', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
                <strong>Total: USD {montoTotal} {montoTotalArs > 0 ? `| ARS ${montoTotalArs}` : ''}</strong>
              </div>
            </div>

            {!formularioCompleto ? (
              <p style={{ color: '#ef6c00', fontSize: '0.9rem', textAlign: 'center', fontWeight: 'bold' }}>
                {t('Completá tus datos, dirección, fecha y horario para pagar.', 'Complete your info, address, date and time to pay.')}
              </p>
            ) : (
              <div style={{ marginTop: '15px', position: 'relative' }}>
                {isProcessing && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.9)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                    <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '4px', marginBottom: '10px' }}></div>
                    <p style={{ color: '#1a3a5c', fontWeight: 'bold', margin: 0 }}>{t('Procesando pago...', 'Processing payment...')}</p>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {montoTotalArs > 0 && (
                    <button type="button" onClick={pagarConMercadoPago} style={{ background: '#009ee3', color: 'white', padding: '12px', width: '100%', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
                      {t('Pagar con Mercado Pago (ARS ', 'Pay with Mercado Pago (ARS ')} {montoTotalArs})
                    </button>
                  )}

                  {montoTotalArs > 0 && <div style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem', margin: '5px 0' }}>{t('o pagar en dólares con', 'or pay in USD with')}</div>}

                  <PayPalButtons 
                    style={{ layout: "vertical", color: "gold", shape: "rect", height: 40 }}
                    createOrder={(data, actions) => actions.order.create({ purchase_units: [{ description: `Transfer: ${lang === 'es' ? transfer.titulo_es : transfer.titulo_en}`, amount: { value: montoTotal.toString() } }] })}
                    onApprove={async (data, actions) => {
                      setIsProcessing(true);
                      try {
                        await actions.order.capture();
                        const guardadoOk = await guardarReservaEnBaseDeDatos('confirmado y pagado (PayPal)');
                        if (guardadoOk) {
                          await fetch('/api/email', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              nombre: formData.nombre, email: formData.email, 
                              tourTitulo: lang === 'es' ? transfer.titulo_es : transfer.titulo_en,
                              fecha: `${fechaSeleccionada.toLocaleDateString('es-AR')} - ${formData.horario}`,
                              pasajeros: formData.pasajeros, idioma: lang
                            })
                          });
                          window.location.href = '/success';
                        }
                      } catch (err) {
                        alert(t("Hubo un problema confirmando el pago.", "There was a problem confirming the payment."));
                      } finally { setIsProcessing(false); }
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}