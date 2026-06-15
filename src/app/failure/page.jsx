"use client";
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';

export default function FailurePage() {
  const { t } = useLanguage();
  
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8f6f2', textAlign: 'center', padding: '2rem' }}>
      <div style={{ width: '80px', height: '80px', background: '#e74c3c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2.5rem', marginBottom: '1.5rem' }}>
        <i className="fas fa-times"></i>
      </div>
      <h1 style={{ color: '#1a3a5c', fontFamily: 'Playfair Display', fontSize: '2.5rem', marginBottom: '1rem' }}>
        {t('Pago Rechazado', 'Payment Rejected')}
      </h1>
      <p style={{ color: '#6b7b8d', fontSize: '1.1rem', maxWidth: '500px', marginBottom: '2rem' }}>
        {t('Hubo un problema al procesar tu pago. Por favor, intenta nuevamente o utiliza otro método de pago.', 'There was a problem processing your payment. Please try again or use a different payment method.')}
      </p>
      <Link href="/" style={{ padding: '12px 30px', background: '#1a3a5c', color: 'white', textDecoration: 'none', borderRadius: '50px', fontWeight: 'bold' }}>
        {t('Volver a intentar', 'Try Again')}
      </Link>
    </div>
  );
}