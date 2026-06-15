"use client";
import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8f6f2', textAlign: 'center', padding: '2rem' }}>
      <div style={{ width: '80px', height: '80px', background: '#27ae60', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2.5rem', marginBottom: '1.5rem' }}>
        <i className="fas fa-check"></i>
      </div>
      <h1 style={{ color: '#1a3a5c', fontFamily: 'Playfair Display', fontSize: '2.5rem', marginBottom: '1rem' }}>¡Pago Exitoso!</h1>
      <p style={{ color: '#6b7b8d', fontSize: '1.1rem', maxWidth: '500px', marginBottom: '2rem' }}>
        Tu reserva ha sido confirmada y el pago se procesó correctamente. Te enviaremos un email con todos los detalles de tu tour.
      </p>
      <Link href="/" style={{ padding: '12px 30px', background: '#c8a45c', color: '#1a3a5c', textDecoration: 'none', borderRadius: '50px', fontWeight: 'bold' }}>
        Volver al Inicio
      </Link>
    </div>
  );
}