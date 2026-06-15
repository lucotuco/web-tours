import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8f6f2' }}>
      <h1 style={{ fontSize: '4rem', color: '#1a3a5c', fontFamily: 'Playfair Display' }}>404</h1>
      <p style={{ fontSize: '1.2rem', color: '#6b7b8d', marginBottom: '2rem' }}>Parece que te has perdido. Esta página no existe.</p>
      <Link href="/" style={{ padding: '12px 24px', background: '#c8a45c', color: '#1a3a5c', textDecoration: 'none', borderRadius: '50px', fontWeight: 'bold' }}>
        Volver a casa
      </Link>
    </div>
  );
}