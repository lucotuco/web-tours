import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { titulo, precio_total, reserva_id } = body;

    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    const preference = new Preference(client);

    const siteUrl = "https://www.google.com"; // <--- CAMBIAMOS ESTO SOLO PARA PROBAR

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
        back_urls: {
          success: `${siteUrl}/success`,
          failure: `${siteUrl}/failure`,
          pending: `${siteUrl}/pending`
        },
        auto_return: "approved",
        external_reference: reserva_id ? reserva_id.toString() : "sin-id"
      }
    });

    return NextResponse.json({ url: response.init_point });
    
  } catch (error) {
    console.error("====== ERROR DETALLADO DE MERCADO PAGO ======");
    console.error(error.cause || error.message || error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}