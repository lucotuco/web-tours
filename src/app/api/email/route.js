import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { nombre, email, tourTitulo, fecha, pasajeros, idioma } = await request.json();

    // Verificamos el idioma que nos manda el frontend
    const isEn = idioma === 'en';

    // Generamos los textos dependiendo del idioma
    const subject = isEn ? 'Booking Confirmed! - Premier Sur Tours' : '¡Reserva Confirmada! - Premier Sur Tours';
    const greeting = isEn ? `Hello, ${nombre}!` : `¡Hola, ${nombre}!`;
    const intro = isEn ? 'Your booking has been successfully processed. We are very excited to show you the best of Buenos Aires.' : 'Tu reserva ha sido procesada con éxito. Estamos muy emocionados de mostrarte lo mejor de Buenos Aires.';
    const detailsTitle = isEn ? 'Your tour details:' : 'Detalles de tu tour:';
    const tourLabel = isEn ? 'Tour:' : 'Tour:';
    const dateLabel = isEn ? 'Date:' : 'Fecha:';
    const paxLabel = isEn ? 'Passengers:' : 'Pasajeros:';
    const outro1 = isEn ? 'We will contact you soon to coordinate the meeting point.' : 'Nos pondremos en contacto contigo pronto para coordinar el punto de encuentro.';
    const outro2 = isEn ? 'Thank you for choosing us!' : '¡Gracias por elegirnos!';

    const data = await resend.emails.send({
      from: 'onboarding@resend.dev', 
      to: [email],
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
                <li style="margin-bottom: 10px;">📅 <strong>${dateLabel}</strong> ${fecha}</li>
                <li style="margin-bottom: 10px;">👥 <strong>${paxLabel}</strong> ${pasajeros}</li>
              </ul>
            </div>
            
            <p>${outro1}</p>
            <p>${outro2}</p>
          </div>
        </div>
      `
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error enviando email:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}