import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { nombre, apellido, email, tour, mensaje } = await request.json();

    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: ['lucasschlez@gmail.com'],
      subject: `📩 Nuevo mensaje de contacto: ${nombre} ${apellido}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
          <h2 style="color: #1a3a5c; border-bottom: 2px solid #1a3a5c; padding-bottom: 10px;">Nuevo Mensaje de la Web</h2>
          <p><strong>Nombre completo:</strong> ${nombre} ${apellido}</p>
          <p><strong>Email de contacto:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Tour de interés:</strong> ${tour}</p>
          <div style="background-color: #f8f6f2; padding: 15px; border-radius: 8px; margin-top: 15px;">
            <p style="margin-top: 0; id: 'msg-title'; color: #1a3a5c; font-weight: bold;">Mensaje:</p>
            <p style="font-style: italic; margin: 0;">"${mensaje}"</p>
          </div>
        </div>
      `
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error en API de contacto:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}