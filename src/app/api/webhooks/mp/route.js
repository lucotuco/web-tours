import { MercadoPagoConfig, Payment } from 'mercadopago';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

// Inicializamos Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const url = new URL(request.url);
    
    // 1. Leemos primero los datos desde la URL (Formato clásico de Mercado Pago)
    let id = url.searchParams.get("data.id") || url.searchParams.get("id");
    let type = url.searchParams.get("type") || url.searchParams.get("topic");

    // 2. Si no vienen en la URL, intentamos leer el cuerpo de forma segura
    if (!id) {
      try {
        const body = await request.json();
        id = body?.data?.id || id;
        type = body?.type || body?.topic || type;
      } catch (e) {
        console.log("El formato no era JSON, continuamos con los datos de la URL.");
      }
    }

    // 3. Verificamos que sea un evento de pago
    if (type === 'payment' && id) {
      const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
      const payment = new Payment(client);
      const paymentInfo = await payment.get({ id });

      // Si el pago se aprobó
      if (paymentInfo.status === 'approved') {
        const reservaId = paymentInfo.external_reference; 
        
        if (reservaId && reservaId !== "sin-id") {
          // Intentamos actualizar en Supabase
          const { error } = await supabase
            .from('reservas')
            .update({ estado: 'confirmado y pagado (Mercado Pago)' })
            .eq('id', reservaId);
            
          if (!error) {
            console.log(`¡Reserva ${reservaId} actualizada con éxito!`);

            // Buscamos los datos para enviar el mail
            const { data: reserva } = await supabase
              .from('reservas')
              .select('*, tours(titulo_es, titulo_en)')
              .eq('id', reservaId)
              .single();

            if (reserva) {
              const isEn = reserva.idioma === 'en';
              const tourTitulo = isEn ? reserva.tours.titulo_en : reserva.tours.titulo_es;
              
              const subject = isEn ? 'Booking Confirmed! - Premier Sur Tours' : '¡Reserva Confirmada! - Premier Sur Tours';
              const greeting = isEn ? `Hello, ${reserva.nombre_cliente}!` : `¡Hola, ${reserva.nombre_cliente}!`;
              const intro = isEn ? 'Your booking has been successfully processed.' : 'Tu reserva ha sido procesada con éxito.';
              const detailsTitle = isEn ? 'Your tour details:' : 'Detalles de tu tour:';
              const tourLabel = isEn ? 'Tour:' : 'Tour:';
              const dateLabel = isEn ? 'Date:' : 'Fecha:';
              const paxLabel = isEn ? 'Passengers:' : 'Pasajeros:';
              const outro1 = isEn ? 'We will contact you soon.' : 'Nos pondremos en contacto pronto.';
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
            }
          } else {
            console.error("⛔ Supabase bloqueó la actualización (Posible problema de RLS):", error);
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