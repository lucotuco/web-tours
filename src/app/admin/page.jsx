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
    const { data: r } = await supabase.from('reservas').select('*, tours(titulo_es)').gte('fecha_tour', hoyStr).order('fecha_tour', { ascending: true });
    setReservas(r || []);

    const { data: f } = await supabase.from('fechas_bloqueadas').select('*').order('fecha', { ascending: true });
    setFechasBloqueadas(f || []);
    setLoading(false);
  }

  // --- Lógica del Calendario Grande ---
  const mapearFechasDecoradoras = () => {
    const clasesPorFecha = {};
    fechasBloqueadas.forEach(fb => { clasesPorFecha[fb.fecha] = "dia-bloqueado-admin"; });
    reservas.forEach(res => {
      if (!clasesPorFecha[res.fecha_tour]) clasesPorFecha[res.fecha_tour] = "dia-con-reserva";
      else if (clasesPorFecha[res.fecha_tour] === "dia-con-reserva") clasesPorFecha[res.fecha_tour] = "dia-lleno";
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
    window.scrollTo(0, document.body.scrollHeight); // Lleva al form
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
        <h1 style={{ color: '#1a3a5c' }}>Panel de Control Bilingüe</h1>
        <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} style={s.btnCancel}>Cerrar Sesión</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
        <section style={s.card}>
          <h2 style={s.cardTitle}>⏰ Próximas Reservas</h2>
          {reservas.slice(0, 2).map(res => (
            <div key={res.id} style={s.reservaItem}>
              <div style={{ fontWeight: 'bold', color: '#c8a45c' }}>📅 {res.fecha_tour} - <span style={{fontSize:'0.8rem', color:'#555'}}>{res.estado}</span></div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{res.tours?.titulo_es}</div>
              <div>👤 {res.nombre_cliente} ({res.pasajeros} pax) | ✉️ {res.email_cliente}</div>
            </div>
          ))}
        </section>

        <section style={s.card}>
          <h2 style={s.cardTitle}>⛔ Bloquear Fecha</h2>
          <form onSubmit={handleBloquearFecha} style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
            <DatePicker selected={fechaABloquear} onChange={date => setFechaABloquear(date)} placeholderText="Elegí el día a bloquear" className="date-picker-input" dateFormat="dd/MM/yyyy" />
            <input type="text" placeholder="Motivo (ej: Vacaciones)" value={motivoBloqueo} onChange={e => setMotivoBloqueo(e.target.value)} style={s.input} />
            <button type="submit" style={s.btnSave}>Bloquear</button>
          </form>
        </section>
      </div>

      <section style={{ ...s.card, marginBottom: '3rem' }}>
        <h2 style={s.cardTitle}>📅 Calendario General</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2rem' }}>
          <div className="calendario-admin-grande">
            <DatePicker selected={fechaCalendarioGrande} onChange={(date) => setFechaCalendarioGrande(date)} dayClassName={renderizarEstiloDia} inline />
          </div>
          <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0 }}>Detalle del {infoDia?.fechaStr}</h3>
            {infoDia?.bloqueoDelDia && (
              <div style={{ background: '#ffebee', color: '#c62828', padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Bloqueado: {infoDia.bloqueoDelDia.motivo}</span>
                <button onClick={() => handleDesbloquear(infoDia.bloqueoDelDia.id)}>Desbloquear</button>
              </div>
            )}
            {infoDia?.reservasDelDia.map(r => (
              <div key={r.id} style={{ padding: '8px', background: 'white', borderLeft: '4px solid #c8a45c', marginBottom: '8px' }}>
                <strong>{r.tours?.titulo_es}</strong><br/>{r.nombre_cliente} ({r.pasajeros} pax)
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ ...s.card, marginBottom: '3rem' }}>
        <h2 style={s.cardTitle}>{editingId ? '📝 Editando Tour' : '🚀 Nuevo Tour'}</h2>
        <form onSubmit={handleSaveTour}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
              <h4 style={{marginTop: 0}}>Textos en Español</h4>
              <input type="text" placeholder="Título" value={formData.titulo_es} onChange={e => setFormData({...formData, titulo_es: e.target.value})} required style={s.input}/>
              <textarea placeholder="Descripción" value={formData.descripcion_es} onChange={e => setFormData({...formData, descripcion_es: e.target.value})} style={{...s.input, height:'80px'}}/>
              <input type="text" placeholder="Categoría" value={formData.categoria_es} onChange={e => setFormData({...formData, categoria_es: e.target.value})} style={s.input}/>
            </div>
            <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px' }}>
              <h4 style={{marginTop: 0}}>Textos en Inglés</h4>
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

      <section>
        <h2>Catálogo de Tours</h2>
        <div style={{ display: 'grid', gap: '10px' }}>
          {tours.map(t => (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'white', borderRadius: '8px', opacity: t.activo ? 1 : 0.5 }}>
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
  cardTitle: { marginTop: 0, marginBottom: '20px', borderBottom: '2px solid #f7f5f0', paddingBottom: '10px' },
  input: { padding: '10px', borderRadius: '6px', border: '1px solid #ddd', width: '100%', boxSizing: 'border-box', marginBottom: '10px' },
  btnSave: { padding: '12px 24px', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  btnCancel: { padding: '12px 24px', background: '#eee', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer' },
  btnAction: { marginLeft: '10px', padding: '6px 12px', background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' },
  reservaItem: { padding: '15px', border: '1px solid #e8e6e0', borderRadius: '8px', marginBottom: '12px', background: '#faf9f6' }
};