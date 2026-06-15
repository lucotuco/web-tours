"use client";
import Link from 'next/link';

export default function PendingPage() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8f6f2', textAlign: 'center', padding: '2rem' }}>
      <div style={{ width: '80px', height: '80px', background: '#f39c12', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2.5rem', marginBottom: '1.5rem' }}>
        <i className="fas fa-clock"></i>
      </div>
      <h1 style={{ color: '#1a3a5c', fontFamily: 'Playfair Display', fontSize: '2.5rem', marginBottom: '1rem' }}>Pago Pendiente</h1>
      <p style={{ color: '#6b7b8d', fontSize: '1.1rem', maxWidth: '500px', marginBottom: '2rem' }}>
        Tu pago está en proceso de validación. Una vez que se acredite, confirmaremos tu reserva.
      </p>
      <Link href="/" style={{ padding: '12px 30px', background: '#1a3a5c', color: 'white', textDecoration: 'none', borderRadius: '50px', fontWeight: 'bold' }}>
        Volver al Inicio
      </Link>
    </div>
  );
}