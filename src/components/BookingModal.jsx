"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function BookingModal({ tour, onClose }) {
  const [formData, setFormData] = useState({ nombre: '', email: '', pasajeros: 1 });
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  
  const [fechasBloqueadas, setFechasBloqueadas] = useState([]);
  const [reservasPorDia, setReservasPorDia] = useState({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function traerDisponibilidad() {
      // Traer fechas bloqueadas
      const { data: bloqueadas } = await supabase.from('fechas_bloqueadas').select('fecha');
      setFechasBloqueadas(bloqueadas?.map(b => b.fecha) || []);

      // Traer reservas existentes para contar lugares
      const { data: reservas } = await supabase.from('reservas').select('fecha_tour');
      const conteo = {};
      reservas?.forEach(r => { conteo[r.fecha_tour] = (conteo[r.fecha_tour] || 0) + 1; });
      setReservasPorDia(conteo);
    }
    traerDisponibilidad();
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
    if (reservasPorDia[fechaStr] >= 2) return false;
    return true;
  };

  const montoTotal = tour.precio * formData.pasajeros;
  const montoTotalArs = (tour.precio_ars || 0) * formData.pasajeros;

  // Función general para guardar la reserva en Supabase
  const guardarReservaEnBaseDeDatos = async (estado) => {
    const year = fechaSeleccionada.getFullYear();
    const month = String(fechaSeleccionada.getMonth() + 1).padStart(2, '0');
    const day = String(fechaSeleccionada.getDate()).padStart(2, '0');
    const fechaFormateada = `${year}-${month}-${day}`;

    const { error } = await supabase.from('reservas').insert([{
      tour_id: tour.id,
      nombre_cliente: formData.nombre,
      email_cliente: formData.email,
      fecha_tour: fechaFormateada,
      pasajeros: formData.pasajeros,
      estado: estado
    }]);

    if (error) {
      alert("Error guardando reserva: " + error.message);
      return false;
    }
    return true;
  };

  // Flujo de Mercado Pago
  const pagarConMercadoPago = async () => {
    // 1. Guardamos como pendiente antes de salir de la página
    await guardarReservaEnBaseDeDatos('pendiente (Mercado Pago)'); 
    
    // 2. Pedimos el link de pago al backend
    try {
      const res = await fetch('/api/mercadopago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: `Reserva: ${tour.titulo_es}`,
          precio_total: montoTotalArs
        })
      });
      const data = await res.json();
      
      // 3. Redirigimos al turista a pagar
      if (data.url) {
        window.location.href = data.url; 
      } else {
        alert("Hubo un error al generar el link de pago.");
      }
    } catch (error) {
      alert("Error de conexión: " + error.message);
    }
  };

  const formularioCompleto = formData.nombre !== '' && formData.email !== '' && fechaSeleccionada !== null;

  return (
    <PayPalScriptProvider options={{ "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID, currency: "USD" }}>
      <div className="modal-overlay active" style={{ display: 'flex', zIndex: 9999 }}>
        <div className="modal" style={{ overflow: 'visible' }}>
          <div className="modal-header">
            <h3>Reservar: {tour.titulo_es}</h3>
            <button className="modal-close" onClick={onClose}>&times;</button>
          </div>
          
          <div className="modal-body">
            {success ? (
              <div className="success-content">
                <h3>¡Pago Exitoso! 🥳</h3>
                <p>Tu reserva está confirmada. Te enviamos los detalles a <strong>{formData.email}</strong>.</p>
              </div>
            ) : (
              <div>
                <div className="form-group">
                  <label>Nombre Completo</label>
                  <input type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                </div>
                
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label>Fecha del Tour</label>
                    <DatePicker 
                      selected={fechaSeleccionada} 
                      onChange={date => setFechaSeleccionada(date)} 
                      filterDate={esDiaDisponible}
                      placeholderText="Elegí un día"
                      className="date-picker-input"
                      dateFormat="dd/MM/yyyy"
                    />
                  </div>
                  <div className="form-group">
                    <label>Pasajeros</label>
                    <input type="number" min="1" value={formData.pasajeros} onChange={e => setFormData({...formData, pasajeros: e.target.value})} className="date-picker-input" />
                  </div>
                </div>
                
                <div className="booking-summary" style={{ margin: '15px 0', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
                  <strong>Total: USD {montoTotal} {tour.precio_ars > 0 ? `| ARS ${montoTotalArs}` : ''}</strong>
                </div>

                {!formularioCompleto ? (
                  <p style={{ color: '#ef6c00', fontSize: '0.9rem', textAlign: 'center', fontWeight: 'bold' }}>
                    Completá tu nombre, email y fecha para habilitar el pago.
                  </p>
                ) : (
                  <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    
                    {/* BOTÓN MERCADO PAGO */}
                    {tour.precio_ars > 0 && (
                      <button 
                        type="button" 
                        onClick={pagarConMercadoPago} 
                        style={{ background: '#009ee3', color: 'white', padding: '12px', width: '100%', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
                      >
                        Pagar con Mercado Pago (ARS {montoTotalArs})
                      </button>
                    )}

                    {tour.precio_ars > 0 && (
                      <div style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem', margin: '5px 0' }}>o pagar en dólares con</div>
                    )}

                    {/* BOTONES PAYPAL */}
                    <PayPalButtons 
                      style={{ layout: "vertical", color: "gold", shape: "rect", height: 40 }}
                      createOrder={(data, actions) => {
                        return actions.order.create({
                          purchase_units: [{
                            description: `Reserva: ${tour.titulo_es}`,
                            amount: { value: montoTotal.toString() }
                          }]
                        });
                      }}
                      onApprove={async (data, actions) => {
                        // Capturamos el pago
                        const order = await actions.order.capture();
                        console.log("Pago completado con PayPal:", order);
                        
                        // Guardamos como pagado
                        const guardadoOk = await guardarReservaEnBaseDeDatos('confirmado y pagado (PayPal)');
                        if (guardadoOk) {
                          setSuccess(true);
                          setTimeout(() => onClose(), 4000);
                        }
                      }}
                      onError={(err) => {
                        console.error("Error en PayPal:", err);
                        alert("Hubo un problema con el pago. Intentá nuevamente.");
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