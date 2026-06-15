"use client";
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';

export default function SuccessPage() {
  const { t } = useLanguage();
  
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8f6f2', textAlign: 'center', padding: '2rem' }}>
      <div style={{ width: '80px', height: '80px', background: '#27ae60', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2.5rem', marginBottom: '1.5rem' }}>
        <i className="fas fa-check"></i>
      </div>
      <h1 style={{ color: '#1a3a5c', fontFamily: 'Playfair Display', fontSize: '2.5rem', marginBottom: '1rem' }}>
        {t('¡Pago Exitoso!', 'Payment Successful!')}
      </h1>
      <p style={{ color: '#6b7b8d', fontSize: '1.1rem', maxWidth: '500px', marginBottom: '2rem' }}>
        {t('Tu reserva ha sido confirmada y el pago se procesó correctamente. Te enviaremos un email con todos los detalles de tu tour.', 'Your booking has been confirmed and the payment was processed successfully. We will send you an email with all the details of your tour.')}
      </p>
      <Link href="/" style={{ padding: '12px 30px', background: '#c8a45c', color: '#1a3a5c', textDecoration: 'none', borderRadius: '50px', fontWeight: 'bold' }}>
        {t('Volver al Inicio', 'Back to Home')}
      </Link>
    </div>
  );
}