import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { titulo, precio_total } = body;

    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: [
          {
            id: 'tour-reserva',
            title: titulo,
            quantity: 1,
            unit_price: Number(precio_total),
            currency_id: 'ARS',
          }
        ],
        // Le agregamos la barra al final (/) que a veces MP exige
        back_urls: {
          success: "http://localhost:3000/",
          failure: "http://localhost:3000/",
          pending: "http://localhost:3000/"
        }
        // BORRAMOS el auto_return para que deje de bloquear el link
      }
    });

    return NextResponse.json({ url: response.init_point });
    
  } catch (error) {
    console.error("Error al crear preferencia MP:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}