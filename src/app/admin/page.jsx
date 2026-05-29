"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Estados de Tours Bilingües
  const [tours, setTours] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ 
    titulo_es: '', titulo_en: '', 
    precio: '', precio_ars: '', duracion: '', 
    descripcion_es: '', descripcion_en: '', 
    categoria_es: 'Popular', categoria_en: 'Popular' 
  });

  // Estados del Calendario
  const [reservas, setReservas] = useState([]);
  const [fechasBloqueadas, setFechasBloqueadas] = useState([]);
  const [fechaABloquear, setFechaABloquear] = useState(null);
  const [motivoBloqueo, setMotivoBloqueo] = useState('');
  const [fechaCalendarioGrande, setFechaCalendarioGrande] = useState(new Date());

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push('/login');
      else { setUser(user); fetchDashboardData(); }
    };
    checkUser();
  }, [router]);

  async function fetchDashboardData() {
    setLoading(true);
    const { data: t } = await supabase.from('tours').select('*').order('created_at', { ascending: false });
    setTours(t || []);
    
    const hoyStr = new Date().toISOString().split('T')[0];
    // Al traer *, automáticamente obtenemos las nuevas columnas (horario, notas, etc.)
    const { data: r } = await supabase.from('reservas').select('*, tours(titulo_es)').gte('fecha_tour', hoyStr).order('fecha_tour', { ascending: true });
    setReservas(r || []);

    const { data: f } = await supabase.from('fechas_bloqueadas').select('*').order('fecha', { ascending: true });
    setFechasBloqueadas(f || []);
    setLoading(false);
  }

  // --- Lógica del Calendario Grande (Actualizada para soportar turnos y pendientes) ---
  const mapearFechasDecoradoras = () => {
    const clasesPorFecha = {};
    
    // 1. Prioridad: Días bloqueados por el Admin
    fechasBloqueadas.forEach(fb => { clasesPorFecha[fb.fecha] = "dia-bloqueado-admin"; });
    
    // 2. Procesar reservas del día
    reservas.forEach(res => {
      const fecha = res.fecha_tour;
      if (clasesPorFecha[fecha] === "dia-bloqueado-admin") return;

      const reservasDelDia = reservas.filter(r => r.fecha_tour === fecha);
      const tienePendiente = reservasDelDia.some(r => r.estado?.includes('pendiente'));

      if (reservasDelDia.length >= 3) {
        clasesPorFecha[fecha] = "dia-lleno"; // Lleno (Mañana, Tarde y Noche reservados)
      } else if (tienePendiente) {
        clasesPorFecha[fecha] = "dia-pendiente"; // Si tiene algún pago pendiente, lo marca distinto
      } else {
        clasesPorFecha[fecha] = "dia-con-reserva"; // Tiene reservas y todas están pagadas
      }
    });
    return clasesPorFecha;
  };

  const clasesDecoradoras = mapearFechasDecoradoras();

  const renderizarEstiloDia = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return clasesDecoradoras[`${year}-${month}-${day}`] || "";
  };

  const obtenerInfoDiaSeleccionado = () => {
    if (!fechaCalendarioGrande) return null;
    const year = fechaCalendarioGrande.getFullYear();
    const month = String(fechaCalendarioGrande.getMonth() + 1).padStart(2, '0');
    const day = String(fechaCalendarioGrande.getDate()).padStart(2, '0');
    const fechaStr = `${year}-${month}-${day}`;

    return { 
      fechaStr, 
      reservasDelDia: reservas.filter(r => r.fecha_tour === fechaStr), 
      bloqueoDelDia: fechasBloqueadas.find(f => f.fecha === fechaStr) 
    };
  };
  const infoDia = obtenerInfoDiaSeleccionado();

  // --- Acciones ---
  const handleSaveTour = async (e) => {
    e.preventDefault();
    const file = e.target.image_file.files[0];
    let imagen_url = formData.imagen_url;

    if (file) {
      const fileName = `${Date.now()}-${file.name}`;
      await supabase.storage.from('tours-images').upload(fileName, file);
      const { data: { publicUrl } } = supabase.storage.from('tours-images').getPublicUrl(fileName);
      imagen_url = publicUrl;
    }

    const payload = { ...formData, imagen_url };
    if (editingId) {
      await supabase.from('tours').update(payload).eq('id', editingId);
      setEditingId(null);
    } else {
      await supabase.from('tours').insert([{ ...payload, activo: true }]);
    }
    setFormData({ titulo_es: '', titulo_en: '', precio: '', precio_ars: '', duracion: '', descripcion_es: '', descripcion_en: '', categoria_es: 'Popular', categoria_en: 'Popular' });
    e.target.reset();
    fetchDashboardData();
  };

  const handleEdit = (tour) => {
    setEditingId(tour.id);
    setFormData({ ...tour });
    window.scrollTo(0, document.body.scrollHeight);
  };

  const toggleActivo = async (id, estadoActual) => {
    await supabase.from('tours').update({ activo: !estadoActual }).eq('id', id);
    fetchDashboardData();
  };

  const handleBloquearFecha = async (e) => {
    e.preventDefault();
    if (!fechaABloquear) return;
    const fStr = `${fechaABloquear.getFullYear()}-${String(fechaABloquear.getMonth()+1).padStart(2,'0')}-${String(fechaABloquear.getDate()).padStart(2,'0')}`;
    await supabase.from('fechas_bloqueadas').insert([{ fecha: fStr, motivo: motivoBloqueo }]);
    setFechaABloquear(null); setMotivoBloqueo(''); fetchDashboardData();
  };

  const handleDesbloquear = async (id) => {
    await supabase.from('fechas_bloqueadas').delete().eq('id', id);
    fetchDashboardData();
  };

  if (!user || loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando Panel...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto', background: '#fcfbfa' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#1a3a5c', fontFamily: 'Playfair Display, serif' }}>Panel de Control Bilingüe</h1>
        <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} style={s.btnCancel}>Cerrar Sesión</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
        {/* PANEL: Próximas Reservas con scroll y estados de pago claros */}
        <section style={s.card}>
          <h2 style={s.cardTitle}>⏰ Próximas Reservas y Pagos</h2>
          <div style={{ maxHeight: '280px', overflowY: 'auto', paddingRight: '5px' }}>
            {reservas.length === 0 ? (
              <p style={{ color: '#777', fontSize: '0.95rem' }}>No hay próximas reservas registradas.</p>
            ) : (
             reservas.slice(0, 2).map(res => {
                const horarioTexto = res.horario === 'morning' ? 'Mañana (9:00)' : res.horario === 'afternoon' ? 'Tarde (14:00)' : 'Noche (19:00)';
                const esPendiente = res.estado?.includes('pendiente');
                return (
                  <div key={res.id} style={{ ...s.reservaItem, borderLeft: esPendiente ? '4px solid #e74c3c' : '4px solid #27ae60' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '4px' }}>
                      <span style={{ color: '#1a3a5c' }}>📅 {res.fecha_tour} — {horarioTexto}</span>
                      <span style={{ color: esPendiente ? '#e74c3c' : '#27ae60', fontSize: '0.8rem', background: esPendiente ? '#ffebee' : '#e8f5e9', padding: '2px 6px', borderRadius: '4px' }}>
                        {esPendiente ? 'PENDIENTE' : 'PAGADO'}
                      </span>
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#2c3e50' }}>{res.tours?.titulo_es}</div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7b8d', marginTop: '2px' }}>
                      👤 {res.nombre_cliente} ({res.pasajeros} pax) | ✉️ {res.email_cliente}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section style={s.card}>
          <h2 style={s.cardTitle}>⛔ Bloquear Fecha</h2>
          <form onSubmit={handleBloquearFecha} style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
            <DatePicker selected={fechaABloquear} onChange={date => setFechaABloquear(date)} placeholderText="Elegí el día a bloquear" className="date-picker-input" dateFormat="dd/MM/yyyy" />
            <input type="text" placeholder="Motivo (ej: Vacaciones)" value={motivoBloqueo} onChange={e => setMotivoBloqueo(e.target.value)} style={s.input} />
            <button type="submit" style={s.btnSave}>Bloquear Fecha</button>
          </form>
        </section>
      </div>

      {/* SECCIÓN: Calendario General con detalles horarios */}
      <section style={{ ...s.card, marginBottom: '3rem' }}>
        <h2 style={s.cardTitle}>📅 Calendario de Disponibilidad</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2rem' }}>
          <div className="calendario-admin-grande">
            <DatePicker selected={fechaCalendarioGrande} onChange={(date) => setFechaCalendarioGrande(date)} dayClassName={renderizarEstiloDia} inline />
          </div>
          <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #eef0f2' }}>
            <h3 style={{ marginTop: 0, color: '#1a3a5c', marginBottom: '15px', fontSize: '1.2rem' }}>Detalle del {infoDia?.fechaStr}</h3>
            
            {infoDia?.bloqueoDelDia && (
              <div style={{ background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                <span>🚫 Bloqueado por: {infoDia.bloqueoDelDia.motivo}</span>
                <button onClick={() => handleDesbloquear(infoDia.bloqueoDelDia.id)} style={{ background: 'white', border: '1px solid #c62828', color: '#c62828', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>Desbloquear</button>
              </div>
            )}
            
            {infoDia?.reservasDelDia.length === 0 && !infoDia?.bloqueoDelDia && (
              <p style={{ color: '#6b7b8d', fontStyle: 'italic', fontSize: '0.95rem' }}>No hay actividades registradas en esta fecha.</p>
            )}

            {infoDia?.reservasDelDia.map(r => {
              const horarioTexto = r.horario === 'morning' ? 'Mañana (9:00)' : r.horario === 'afternoon' ? 'Tarde (14:00)' : 'Noche (19:00)';
              const esPendiente = r.estado?.includes('pendiente');
              return (
                <div key={r.id} style={{ padding: '12px', background: 'white', borderLeft: esPendiente ? '4px solid #e74c3c' : '4px solid #27ae60', marginBottom: '10px', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 'bold', color: '#1a3a5c', fontSize: '0.9rem' }}>⏰ {horarioTexto}</span>
                    <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: esPendiente ? '#ffebee' : '#e8f5e9', color: esPendiente ? '#c62828' : '#2e7d32', fontWeight: 'bold' }}>
                      {esPendiente ? 'Pago Pendiente' : 'Aprobado'}
                    </span>
                  </div>
                  <strong style={{ fontSize: '1.1rem', color: '#2c3e50' }}>{r.tours?.titulo_es}</strong>
                  <div style={{ fontSize: '0.9rem', color: '#6b7b8d', marginTop: '4px' }}>
                    👤 {r.nombre_cliente} ({r.pasajeros} pax)
                  </div>
                  {r.notas && (
                    <div style={{ fontStyle: 'italic', fontSize: '0.8rem', color: '#555', background: '#f8f6f2', padding: '6px', borderRadius: '4px', marginTop: '6px' }}>
                      📝 Nota: {r.notas}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Creación de Tours */}
      <section style={{ ...s.card, marginBottom: '3rem' }}>
        <h2 style={s.cardTitle}>{editingId ? '📝 Editando Tour' : '🚀 Nuevo Tour'}</h2>
        <form onSubmit={handleSaveTour}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
              <h4 style={{marginTop: 0, color: '#1a3a5c'}}>Textos en Español</h4>
              <input type="text" placeholder="Título" value={formData.titulo_es} onChange={e => setFormData({...formData, titulo_es: e.target.value})} required style={s.input}/>
              <textarea placeholder="Descripción" value={formData.descripcion_es} onChange={e => setFormData({...formData, descripcion_es: e.target.value})} style={{...s.input, height:'80px'}}/>
              <input type="text" placeholder="Categoría" value={formData.categoria_es} onChange={e => setFormData({...formData, categoria_es: e.target.value})} style={s.input}/>
            </div>
            <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px' }}>
              <h4 style={{marginTop: 0, color: '#1a3a5c'}}>Textos en Inglés</h4>
              <input type="text" placeholder="Title" value={formData.titulo_en} onChange={e => setFormData({...formData, titulo_en: e.target.value})} style={s.input}/>
              <textarea placeholder="Description" value={formData.descripcion_en} onChange={e => setFormData({...formData, descripcion_en: e.target.value})} style={{...s.input, height:'80px'}}/>
              <input type="text" placeholder="Category" value={formData.categoria_en} onChange={e => setFormData({...formData, categoria_en: e.target.value})} style={s.input}/>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <input type="number" placeholder="Precio USD" value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})} required style={s.input}/>
            <input type="number" placeholder="Precio ARS" value={formData.precio_ars} onChange={e => setFormData({...formData, precio_ars: e.target.value})} required style={s.input}/>
            <input type="text" placeholder="Duración (ej: 4hs)" value={formData.duracion} onChange={e => setFormData({...formData, duracion: e.target.value})} style={s.input}/>
            <input type="file" name="image_file" accept="image/*" style={s.input}/>
          </div>
          <button type="submit" style={s.btnSave}>{editingId ? 'Guardar Cambios' : 'Crear Tour'}</button>
          {editingId && <button type="button" onClick={() => {setEditingId(null); setFormData({ titulo_es: '', titulo_en: '', precio: '', precio_ars: '', duracion: '', descripcion_es: '', descripcion_en: '', categoria_es: '', categoria_en: '' })}} style={{...s.btnCancel, marginLeft:'10px'}}>Cancelar</button>}
        </form>
      </section>

      {/* Catálogo */}
      <section>
        <h2 style={{color: '#1a3a5c', marginBottom: '15px'}}>Catálogo de Tours</h2>
        <div style={{ display: 'grid', gap: '10px' }}>
          {tours.map(t => (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', opacity: t.activo ? 1 : 0.5 }}>
              <div><strong>{t.titulo_es}</strong> | USD {t.precio}</div>
              <div>
                <button onClick={() => handleEdit(t)} style={s.btnAction}>Editar</button>
                <button onClick={() => toggleActivo(t.id, t.activo)} style={s.btnAction}>{t.activo ? 'Desactivar' : 'Activar'}</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const s = {
  card: { background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' },
  cardTitle: { marginTop: 0, marginBottom: '20px', borderBottom: '2px solid #f7f5f0', paddingBottom: '10px', color: '#1a3a5c', fontFamily: 'Playfair Display, serif' },
  input: { padding: '10px', borderRadius: '6px', border: '1px solid #ddd', width: '100%', boxSizing: 'border-box', marginBottom: '10px', fontFamily: 'inherit' },
  btnSave: { padding: '12px 24px', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  btnCancel: { padding: '12px 24px', background: '#eee', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer' },
  btnAction: { marginLeft: '10px', padding: '6px 12px', background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' },
  reservaItem: { padding: '12px', border: '1px solid #e8e6e0', borderRadius: '8px', marginBottom: '10px', background: '#faf9f6' }
};