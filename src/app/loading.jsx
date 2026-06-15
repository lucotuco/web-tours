export default function Loading() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8f6f2' }}>
      <div className="spinner" style={{ width: '50px', height: '50px', borderWidth: '4px', marginBottom: '1rem' }}></div>
      <p style={{ color: '#1a3a5c', fontWeight: '600' }}>Cargando experiencia...</p>
    </div>
  );
}