"use client"; // Los componentes de error deben ser de cliente
import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8f6f2' }}>
      <h2 style={{ color: '#e74c3c', marginBottom: '1rem' }}>¡Ups! Algo salió mal.</h2>
      <button onClick={() => reset()} style={{ padding: '10px 20px', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
        Intentar nuevamente
      </button>
    </div>
  );
}