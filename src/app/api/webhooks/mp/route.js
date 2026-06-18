import { MercadoPagoConfig, Payment } from 'mercadopago';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

// Inicializamos Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    // 1. Extraemos el cuerpo (body) en formato JSON que nos envía Mercado Pago
    const body = await request.json();
    const url = new URL(request.url);

    // 2. Buscamos el ID y el Tipo de evento. 
    // Buscamos primero en el body (Webhook) y luego en la URL (por si es IPN antiguo)
    const id = body?.data?.id || url.searchParams.get("data.id") || url.searchParams.get("id");
    const type = body?.type || body?.topic || url.searchParams.get("type") || url.searchParams.get("topic");

    // 3. Verificamos que sea un evento de pago y que tengamos un ID válido
    if (type === 'payment' && id) {
      const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
      const payment = new Payment(client);
      const paymentInfo = await payment.get({ id });

      // Si el pago se aprobó
      if (paymentInfo.status === 'approved') {
        const reservaId = paymentInfo.external_reference; 
        
        if (reservaId && reservaId !== "sin-id") {
          // Actualizamos la reserva a "confirmado" en Supabase
          const { error } = await supabase
            .from('reservas')
            .update({ estado: 'confirmado y pagado (Mercado Pago)' })
            .eq('id', reservaId);
            
          if (!error) {
            console.log(`¡Reserva ${reservaId} actualizada en DB!`);

            // Traemos todos los datos de esa reserva para poder enviar el email
            const { data: reserva } = await supabase
              .from('reservas')
              .select('*, tours(titulo_es, titulo_en)')
              .eq('id', reservaId)
              .single();

            if (reserva) {
              // Preparamos el correo en el idioma que eligió el cliente
              const isEn = reserva.idioma === 'en';
              const tourTitulo = isEn ? reserva.tours.titulo_en : reserva.tours.titulo_es;
              
              const subject = isEn ? 'Booking Confirmed! - Premier Sur Tours' : '¡Reserva Confirmada! - Premier Sur Tours';
              const greeting = isEn ? `Hello, ${reserva.nombre_cliente}!` : `¡Hola, ${reserva.nombre_cliente}!`;
              const intro = isEn ? 'Your booking has been successfully processed. We are very excited to show you the best of Buenos Aires.' : 'Tu reserva ha sido procesada con éxito. Estamos muy emocionados de mostrarte lo mejor de Buenos Aires.';
              const detailsTitle = isEn ? 'Your tour details:' : 'Detalles de tu tour:';
              const tourLabel = isEn ? 'Tour:' : 'Tour:';
              const dateLabel = isEn ? 'Date:' : 'Fecha:';
              const paxLabel = isEn ? 'Passengers:' : 'Pasajeros:';
              const outro1 = isEn ? 'We will contact you soon to coordinate the meeting point.' : 'Nos pondremos en contacto contigo pronto para coordinar el punto de encuentro.';
              const outro2 = isEn ? 'Thank you for choosing us!' : '¡Gracias por elegirnos!';

              // Disparamos el email
              await resend.emails.send({
                from: 'onboarding@resend.dev', 
                to: [reserva.email_cliente],
                subject: subject,
                html: `
                  <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
                    <div style="background-color: #1a3a5c; padding: 20px; text-align: center;">
                      <h1 style="color: #c8a45c; margin: 0;">Premier Sur Tours</h1>
                    </div>
                    <div style="padding: 30px;">
                      <h2 style="color: #1a3a5c;">${greeting}</h2>
                      <p>${intro}</p>
                      <div style="background-color: #f8f6f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #1a3a5c;">${detailsTitle}</h3>
                        <ul style="list-style: none; padding: 0; margin: 0;">
                          <li style="margin-bottom: 10px;">📌 <strong>${tourLabel}</strong> ${tourTitulo}</li>
                          <li style="margin-bottom: 10px;">📅 <strong>${dateLabel}</strong> ${reserva.fecha_tour}</li>
                          <li style="margin-bottom: 10px;">👥 <strong>${paxLabel}</strong> ${reserva.pasajeros}</li>
                        </ul>
                      </div>
                      <p>${outro1}</p>
                      <p>${outro2}</p>
                    </div>
                  </div>
                `
              });
              console.log("Email de Mercado Pago enviado a:", reserva.email_cliente);
            }
          } else {
            console.error("Error al actualizar la base de datos:", error);
          }
        }
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error("Error en Webhook MP:", error);
    // Mercado Pago requiere que devolvamos un 200 OK incluso si falla internamente, 
    // para que no siga reintentando enviar la misma notificación infinitamente.
    return new NextResponse('Error procesado', { status: 200 });
  }
}