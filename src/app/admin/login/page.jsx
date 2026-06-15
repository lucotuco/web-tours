"use client";
import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Datos incorrectos. Intentalo de nuevo.");
    } else {
      router.push('/admin'); // Si sale bien, lo mandamos al admin
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f6f2' }}>
      <form onSubmit={handleLogin} style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ color: '#1a3a5c', marginBottom: '1.5rem', textAlign: 'center', fontFamily: 'Playfair Display' }}>Admin Login</h2>
        
        {error && <p style={{ color: '#e74c3c', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} required />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Contraseña</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} required />
        </div>

        <button type="submit" style={{ width: '100%', padding: '12px', background: '#c8a45c', color: '#1a3a5c', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
          Entrar al Panel
        </button>
      </form>
    </div>
  );
}