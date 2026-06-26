import { MercadoPagoConfig, Payment } from 'mercadopago';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const url = new URL(request.url);
    let id = url.searchParams.get("data.id") || url.searchParams.get("id");
    let type = url.searchParams.get("type") || url.searchParams.get("topic");

    if (!id) {
      try {
        const body = await request.json();
        id = body?.data?.id || id;
        type = body?.type || body?.topic || type;
      } catch (e) {
        console.log("El formato no era JSON, continuamos con los datos de la URL.");
      }
    }

    if (type === 'payment' && id) {
      const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
      const payment = new Payment(client);
      const paymentInfo = await payment.get({ id });

      if (paymentInfo.status === 'approved') {
        const externalReference = paymentInfo.external_reference;

        if (externalReference && externalReference !== "sin-id") {
          // Extraemos el tipo y el ID real (Ej: "TOUR-15" o "TRANSFER-8")
          const [tipoReserva, reservaId] = externalReference.split('-');

          if (tipoReserva === 'TOUR') {
            // ================= LÓGICA DE TOURS =================
            const { error } = await supabase.from('reservas').update({ estado: 'confirmado y pagado (Mercado Pago)' }).eq('id', reservaId);
            
            if (!error) {
              const { data: reserva } = await supabase.from('reservas').select('*, tours(titulo_es, titulo_en)').eq('id', reservaId).single();
              if (reserva) {
                const isEn = reserva.idioma === 'en';
                const tourTitulo = isEn ? reserva.tours.titulo_en : reserva.tours.titulo_es;
                const subject = isEn ? 'Booking Confirmed! - Premier Sur Tours' : '¡Reserva Confirmada! - Premier Sur Tours';
                
                await resend.emails.send({
                  from: 'onboarding@resend.dev', 
                  to: [reserva.email_cliente],
                  subject: subject,
                  html: `
                    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
                      <h2 style="color: #1a3a5c;">${isEn ? `Hello, ${reserva.nombre_cliente}!` : `¡Hola, ${reserva.nombre_cliente}!`}</h2>
                      <p>${isEn ? 'Your tour booking has been successfully processed.' : 'Tu reserva de tour ha sido procesada con éxito.'}</p>
                      <ul style="list-style: none; padding: 0;">
                        <li>📌 <strong>Tour:</strong> ${tourTitulo}</li>
                        <li>📅 <strong>${isEn ? 'Date:' : 'Fecha:'}</strong> ${reserva.fecha_tour}</li>
                        <li>👥 <strong>${isEn ? 'Passengers:' : 'Pasajeros:'}</strong> ${reserva.pasajeros}</li>
                      </ul>
                    </div>`
                });
              }
            }
          } else if (tipoReserva === 'TRANSFER') {
            // ================= LÓGICA DE TRANSFERS =================
            const { error } = await supabase.from('reservas_transfer').update({ estado: 'confirmado y pagado (Mercado Pago)' }).eq('id', reservaId);
            
            if (!error) {
              const { data: reserva } = await supabase.from('reservas_transfer').select('*, transfers(titulo_es, titulo_en)').eq('id', reservaId).single();
              if (reserva) {
                // Suponemos que el idioma puede venir en el navegador, o forzamos español (o bilingüe) para transfers
                const isEn = false; 
                const transferTitulo = reserva.transfers?.titulo_es || 'Transfer Privado';
                
                await resend.emails.send({
                  from: 'onboarding@resend.dev', 
                  to: [reserva.email_cliente],
                  subject: '¡Reserva de Transfer Confirmada! - Premier Sur Tours',
                  html: `
                    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
                      <h2 style="color: #1a3a5c;">¡Hola, ${reserva.nombre_cliente}!</h2>
                      <p>Tu reserva de traslado ha sido procesada con éxito.</p>
                      <ul style="list-style: none; padding: 0;">
                        <li>🚗 <strong>Servicio:</strong> ${transferTitulo}</li>
                        <li>📅 <strong>Fecha y Hora:</strong> ${reserva.fecha_transfer} a las ${reserva.horario}</li>
                        <li>📍 <strong>Dirección/Vuelo:</strong> ${reserva.direccion}</li>
                        <li>👥 <strong>Pasajeros:</strong> ${reserva.pasajeros}</li>
                      </ul>
                    </div>`
                });
              }
            }
          }
        }
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error("Error en Webhook MP:", error);
    return new NextResponse('Error procesado', { status: 200 });
  }
}