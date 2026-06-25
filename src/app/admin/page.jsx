"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function AdminPage() {
  const [tours, setTours] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [reservasTransfers, setReservasTransfers] = useState([]);
  const [fechasBloqueadas, setFechasBloqueadas] = useState([]);
  const [activeTab, setActiveTab] = useState('tours'); // Estado para el botón alternador
  
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState('');
  const router = useRouter();

  const [nuevaFecha, setNuevaFecha] = useState('');
  const [motivoFecha, setMotivoFecha] = useState('');
  const [fechaCalendarioGrande, setFechaCalendarioGrande] = useState(new Date());
  const [imagenFile, setImagenFile] = useState(null);

  const [formData, setFormData] = useState({
    titulo_es: '', titulo_en: '',
    precio: '', precio_ars: '',
    duracion: '', imagen_url: '',
    descripcion_es: '', descripcion_en: '',
    categoria_es: 'Popular', categoria_en: 'Popular',
    activo: true 
  });

  const fetchDashboardData = async () => {
    setLoading(true);

    const { data: t } = await supabase.from('tours').select('*').order('orden', { ascending: true });
    if (t) setTours(t);

    const { data: tr } = await supabase.from('transfers').select('*').order('orden', { ascending: true });
    if (tr) setTransfers(tr);

    const hoyObj = new Date();
    const year = hoyObj.getFullYear();
    const month = String(hoyObj.getMonth() + 1).padStart(2, '0');
    const day = String(hoyObj.getDate()).padStart(2, '0');
    const hoy = `${year}-${month}-${day}`;

    const { data: r } = await supabase.from('reservas')
      .select('*, tours(titulo_es)')
      .gte('fecha_tour', hoy)
      .order('fecha_tour', { ascending: true });
    if (r) setReservas(r);

    const { data: rt } = await supabase.from('reservas_transfer')
      .select('*, transfers(titulo_es)')
      .gte('fecha_transfer', hoy)
      .order('fecha_transfer', { ascending: true });
    if (rt) setReservasTransfers(rt);

    const { data: f } = await supabase.from('fechas_bloqueadas')
      .select('*')
      .gte('fecha', hoy)
      .order('fecha', { ascending: true });
    if (f) setFechasBloqueadas(f);

    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  /* ================= MÉTODOS DE FORMULARIOS ================= */
  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImagenFile(e.target.files[0]);
    }
  };

  const handleSubmitTour = async (e) => {
    e.preventDefault();
    try {
      let finalImageUrl = formData.imagen_url;

      // Si el usuario seleccionó una imagen nueva de su compu, la subimos a Supabase
      if (imagenFile) {
        const fileExt = imagenFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const folder = activeTab === 'tours' ? 'tours' : 'transfers';
        const filePath = `${folder}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('tours-images')
          .upload(filePath, imagenFile);
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('tours-images')
          .getPublicUrl(filePath);
        finalImageUrl = publicUrlData.publicUrl;
      }

      // Preparamos los datos base compartidos por ambos
      const baseDataToSave = {
        titulo_es: formData.titulo_es,
        titulo_en: formData.titulo_en,
        precio: formData.precio,
        precio_ars: formData.precio_ars,
        imagen_url: finalImageUrl,
        descripcion_es: formData.descripcion_es,
        descripcion_en: formData.descripcion_en,
        activo: formData.activo
      };

      // Si es un tour, agregamos los campos extra. Si es transfer, los omitimos.
      const dataToSave = activeTab === 'tours' 
        ? { ...baseDataToSave, duracion: formData.duracion, categoria_es: formData.categoria_es, categoria_en: formData.categoria_en }
        : baseDataToSave;

      const tabla = activeTab === 'tours' ? 'tours' : 'transfers';
      const listaActual = activeTab === 'tours' ? tours : transfers;

      if (editingId) {
        const { error } = await supabase.from(tabla).update(dataToSave).eq('id', editingId);
        if (error) throw error;
        showToast(`${activeTab === 'tours' ? 'Tour' : 'Transfer'} actualizado con éxito`);
      } else {
        const newOrden = listaActual.length;
        const { error } = await supabase.from(tabla).insert([{ ...dataToSave, orden: newOrden }]);
        if (error) throw error;
        showToast(`${activeTab === 'tours' ? 'Tour' : 'Transfer'} creado con éxito`);
      }

      // Limpiamos todo después de guardar
      setFormData({
        titulo_es: '', titulo_en: '', precio: '', precio_ars: '', duracion: '', imagen_url: '',
        descripcion_es: '', descripcion_en: '', categoria_es: 'Popular', categoria_en: 'Popular', activo: true
      });
      setImagenFile(null); // Limpiamos el archivo
      setEditingId(null);
      fetchDashboardData();
    } catch (error) {
      console.error("ERROR DE SUPABASE:", error);
      alert("Error al guardar: " + (error.message || error.details || JSON.stringify(error)));
    }
  };

  const handleEditItem = (item) => {
    setFormData({
      titulo_es: item.titulo_es || '', titulo_en: item.titulo_en || '',
      precio: item.precio || '', precio_ars: item.precio_ars || '',
      duracion: item.duracion || '', imagen_url: item.imagen_url || '',
      descripcion_es: item.descripcion_es || '', descripcion_en: item.descripcion_en || '',
      categoria_es: item.categoria_es || 'Popular', categoria_en: item.categoria_en || 'Popular',
      activo: item.activo !== false 
    });
    setEditingId(item.id);
    setImagenFile(null); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteItem = async (id) => {
    const itemName = activeTab === 'tours' ? 'tour' : 'transfer';
    if (!window.confirm(`¿Seguro que quieres eliminar este ${itemName} permanentemente?`)) return;
    try {
      const tabla = activeTab === 'tours' ? 'tours' : 'transfers';
      await supabase.from(tabla).delete().eq('id', id);
      showToast(`${activeTab === 'tours' ? 'Tour' : 'Transfer'} eliminado`);
      fetchDashboardData();
    } catch (error) {
      alert(`No se pudo eliminar el ${itemName}.`);
    }
  };

  const handleToggleActivo = async (item) => {
    try {
      const tabla = activeTab === 'tours' ? 'tours' : 'transfers';
      await supabase.from(tabla).update({ activo: !item.activo }).eq('id', item.id);
      showToast(item.activo ? "Ocultado de la web" : "Activado en la web");
      fetchDashboardData();
    } catch (error) {
      alert("Error al cambiar el estado.");
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const items = Array.from(activeTab === 'tours' ? tours : transfers);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    const updatedItems = items.map((item, index) => ({ ...item, orden: index }));
    
    if (activeTab === 'tours') {
      setTours(updatedItems);
    } else {
      setTransfers(updatedItems);
    }

    try {
      const tabla = activeTab === 'tours' ? 'tours' : 'transfers';
      const promises = updatedItems.map(item =>
        supabase.from(tabla).update({ orden: item.orden }).eq('id', item.id)
      );
      await Promise.all(promises);
      showToast("Orden guardado");
    } catch (error) {
      alert("Error al guardar el orden. Recarga la página.");
    }
  };

  /* ================= MÉTODOS DEL CALENDARIO Y RESERVAS ================= */
  const handleActualizarEstadoReserva = async (id, nuevoEstado) => {
    try {
      if (activeTab === 'tours') {
        setReservas(reservas.map(r => r.id === id ? { ...r, estado: nuevoEstado } : r));
        await supabase.from('reservas').update({ estado: nuevoEstado }).eq('id', id);
      } else {
        setReservasTransfers(reservasTransfers.map(r => r.id === id ? { ...r, estado: nuevoEstado } : r));
        await supabase.from('reservas_transfer').update({ estado: nuevoEstado }).eq('id', id);
      }
      showToast("Estado de reserva actualizado");
    } catch (error) {
      alert("Error al actualizar reserva");
      fetchDashboardData(); 
    }
  };

  const handleBloquearFecha = async (e) => {
    e.preventDefault();
    if (!nuevaFecha) return;
    try {
      await supabase.from('fechas_bloqueadas').insert([{ fecha: nuevaFecha, motivo: motivoFecha }]);
      showToast("Fecha bloqueada exitosamente");
      setNuevaFecha('');
      setMotivoFecha('');
      fetchDashboardData();
    } catch (error) {
      alert("Error al bloquear la fecha");
    }
  };

  const handleDesbloquearFecha = async (id) => {
    try {
      await supabase.from('fechas_bloqueadas').delete().eq('id', id);
      showToast("Fecha desbloqueada");
      fetchDashboardData();
    } catch (error) {
      alert("Error al desbloquear la fecha");
    }
  };

  const renderizarEstiloDia = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const fechaStr = `${year}-${month}-${day}`;

    if (fechasBloqueadas.some(fb => fb.fecha === fechaStr)) return "dia-bloqueado-admin";
    
    const currentReservas = activeTab === 'tours' ? reservas : reservasTransfers;
    const reservasDelDia = currentReservas.filter(r => (activeTab === 'tours' ? r.fecha_tour : r.fecha_transfer) === fechaStr);
    
    if (reservasDelDia.length === 0) return "";
    
    const tienePendiente = reservasDelDia.some(r => r.estado?.includes('pendiente'));
    if (reservasDelDia.length >= 3) return "dia-lleno"; 
    
    if (tienePendiente) return "dia-pendiente";
    
    return "dia-con-reserva"; 
  };

  const obtenerInfoDiaSeleccionado = () => {
    if (!fechaCalendarioGrande) return null;
    const year = fechaCalendarioGrande.getFullYear();
    const month = String(fechaCalendarioGrande.getMonth() + 1).padStart(2, '0');
    const day = String(fechaCalendarioGrande.getDate()).padStart(2, '0');
    const fechaStr = `${year}-${month}-${day}`;
    
    const currentReservas = activeTab === 'tours' ? reservas : reservasTransfers;

    return { 
      fechaStr, 
      reservasDelDia: currentReservas.filter(r => (activeTab === 'tours' ? r.fecha_tour : r.fecha_transfer) === fechaStr), 
      bloqueoDelDia: fechasBloqueadas.find(f => f.fecha === fechaStr) 
    };
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const styles = {
    container: { maxWidth: '1400px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui', color: '#333' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '30px' },
    card: { background: '#f9f9f9', padding: '25px', borderRadius: '12px', border: '1px solid #eee' },
    input: { padding: '10px', borderRadius: '6px', border: '1px solid #ddd', width: '100%', marginBottom: '10px' },
    btnPrimary: { padding: '10px 15px', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    btnDanger: { padding: '6px 12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    btnWarning: { padding: '6px 12px', background: '#f39c12', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    listItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', border: '1px solid #eee', padding: '15px', marginBottom: '10px', borderRadius: '8px' },
    toast: { position: 'fixed', bottom: '20px', right: '20px', background: '#2ecc71', color: 'white', padding: '15px 25px', borderRadius: '8px', opacity: toast ? 1 : 0, transition: '0.3s', zIndex: 1000 }
  };

  const infoDia = obtenerInfoDiaSeleccionado();
  const proximasReservas = activeTab === 'tours' ? reservas : reservasTransfers;

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Cargando panel de administración...</div>;

  return (
    <div style={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#1a3a5c', margin: 0, fontFamily: 'Playfair Display, serif' }}>Panel de Administración</h1>
        <button onClick={handleLogout} style={{ ...styles.btnDanger, background: '#7f8c8d', padding: '10px 15px', fontWeight: 'bold' }}>
          Cerrar Sesión 🚪
        </button>
      </div>

      {/* SELECTOR DE PESTAÑAS */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', borderBottom: '2px solid #eee', paddingBottom: '15px' }}>
        <button 
          onClick={() => { setActiveTab('tours'); setEditingId(null); }} 
          style={{ ...styles.btnPrimary, background: activeTab === 'tours' ? '#1a3a5c' : '#ccc', padding: '12px 24px', fontSize: '1.1rem' }}>
          🗺️ Gestionar Tours
        </button>
        <button 
          onClick={() => { setActiveTab('transfers'); setEditingId(null); }} 
          style={{ ...styles.btnPrimary, background: activeTab === 'transfers' ? '#1a3a5c' : '#ccc', padding: '12px 24px', fontSize: '1.1rem' }}>
          🚗 Gestionar Transfers
        </button>
      </div>

      <div style={styles.grid}>
      
        <div>
          <div style={styles.card}>
            <h2>{editingId ? `Editar ${activeTab === 'tours' ? 'Tour' : 'Transfer'}` : `Crear Nuevo ${activeTab === 'tours' ? 'Tour' : 'Transfer'}`}</h2>
            <form onSubmit={handleSubmitTour}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input style={styles.input} name="titulo_es" placeholder="Título (ES)" value={formData.titulo_es} onChange={handleInputChange} required />
                <input style={styles.input} name="titulo_en" placeholder="Título (EN)" value={formData.titulo_en} onChange={handleInputChange} required />
                <input style={styles.input} type="number" name="precio" placeholder="Precio USD" value={formData.precio} onChange={handleInputChange} required />
                <input style={styles.input} type="number" name="precio_ars" placeholder="Precio ARS" value={formData.precio_ars} onChange={handleInputChange} required />
              </div>
      
              {activeTab === 'tours' && (
                <input style={styles.input} name="duracion" placeholder="Duración (Ej: 3 hs)" value={formData.duracion} onChange={handleInputChange} />
              )}
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 'bold' }}>
                  Imagen del {activeTab === 'tours' ? 'Tour' : 'Transfer'}
                </label>
                <input 
                  type="file" 
                  accept="image/*" 
                  style={styles.input} 
                  onChange={handleImageChange} 
                />
  
                {/* Si estamos editando y ya hay una foto cargada, le avisamos */}
                {editingId && formData.imagen_url && !imagenFile && (
                  <p style={{ fontSize: '0.8rem', color: '#666', margin: '0' }}>
                    Dejar en blanco para mantener la imagen actual.
                  </p>
                )}
              </div>
              <textarea style={{...styles.input, minHeight: '60px'}} name="descripcion_es" placeholder="Descripción (ES)" value={formData.descripcion_es} onChange={handleInputChange} required />
              <textarea style={{...styles.input, minHeight: '60px'}} name="descripcion_en" placeholder="Descripción (EN)" value={formData.descripcion_en} onChange={handleInputChange} required />
            
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', cursor: 'pointer' }}>
                <input type="checkbox" name="activo" checked={formData.activo} onChange={handleInputChange} />
                <strong>{activeTab === 'tours' ? 'Tour' : 'Transfer'} Activo (Visible en la web)</strong>
              </label>

              <button type="submit" style={{...styles.btnPrimary, width: '100%'}}>
                {editingId ? 'Guardar Cambios' : `Crear ${activeTab === 'tours' ? 'Tour' : 'Transfer'}`}
              </button>
              {editingId && (
                <button type="button" onClick={() => setEditingId(null)} style={{...styles.btnPrimary, background: '#7f8c8d', width: '100%', marginTop: '10px'}}>
                  Cancelar Edición
                </button>
              )}
            </form>
          </div>

          <h2 style={{ marginTop: '30px', marginBottom: '15px' }}>{activeTab === 'tours' ? 'Tours' : 'Transfers'} (Arrastrar para ordenar)</h2>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="items-list">
              {(provided) => (
                <ul {...provided.droppableProps} ref={provided.innerRef} style={{ padding: 0 }}>
                  {(activeTab === 'tours' ? tours : transfers).map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                      {(provided, snapshot) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          style={{
                            ...provided.draggableProps.style,
                            ...styles.listItem,
                            opacity: item.activo ? 1 : 0.6,
                            boxShadow: snapshot.isDragging ? '0 5px 15px rgba(0,0,0,0.1)' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div {...provided.dragHandleProps} style={{ cursor: 'grab', color: '#aaa' }}>☰</div>
                            <div>
                              <strong>{item.titulo_es}</strong> {!item.activo && <span style={{color: 'red', fontSize: '0.8rem'}}>(Inactivo)</span>}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button onClick={() => handleToggleActivo(item)} style={styles.btnWarning} title={item.activo ? "Desactivar" : "Activar"}>
                              {item.activo ? '👁️' : '🙈'}
                            </button>
                            <button onClick={() => handleEditItem(item)} style={{...styles.btnWarning, background: '#3498db'}}>✎</button>
                            <button onClick={() => handleDeleteItem(item.id)} style={styles.btnDanger}>✕</button>
                          </div>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <div>
          <div style={{ ...styles.card, marginBottom: '30px' }}>
            <h2>Próximas Reservas Generales ({activeTab === 'tours' ? 'Tours' : 'Transfers'})</h2>
            {proximasReservas.length === 0 ? <p>No hay reservas futuras.</p> : (
              <ul style={{ padding: 0, maxHeight: '300px', overflowY: 'auto' }}>
                {proximasReservas.map(res => {
                  const titulo = activeTab === 'tours' ? res.tours?.titulo_es : res.transfers?.titulo_es;
                  const fecha = activeTab === 'tours' ? res.fecha_tour : res.fecha_transfer;
                  const horarioTexto = res.horario === 'morning' ? 'Mañana (9:00)' : res.horario === 'afternoon' ? 'Tarde (14:00)' : res.horario === 'evening' ? 'Noche (19:00)' : res.horario;
                  
                  return (
                    <li key={res.id} style={styles.listItem}>
                      <div>
                        <strong>{fecha} - {horarioTexto}</strong><br/>
                        <span style={{ fontSize: '0.9rem' }}>{titulo} ({res.pasajeros} pax)</span><br/>
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>{res.nombre_cliente}</span>
                      </div>
                      
                      <select 
                        value={res.estado} 
                        onChange={(e) => handleActualizarEstadoReserva(res.id, e.target.value)}
                        style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc', outline: 'none' }}
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="pendiente (Mercado Pago)">Pendiente (Mercado Pago)</option>
                        <option value="confirmado y pagado (Mercado Pago)">Confirmado (Mercado Pago)</option>
                        <option value="confirmado y pagado (PayPal)">Confirmado (PayPal)</option>
                        <option value="confirmado">Confirmado (Manual)</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div style={{ ...styles.card, marginBottom: '30px' }}>
            <h2>Bloquear Fechas</h2>
            <form onSubmit={handleBloquearFecha} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input type="date" value={nuevaFecha} onChange={e => setNuevaFecha(e.target.value)} style={{ ...styles.input, marginBottom: 0 }} required />
              <input type="text" placeholder="Motivo (opcional)" value={motivoFecha} onChange={e => setMotivoFecha(e.target.value)} style={{ ...styles.input, marginBottom: 0 }} />
              <button type="submit" style={styles.btnPrimary}>Bloquear</button>
            </form>
          </div>

          <div style={styles.card}>
            <h2>Disponibilidad General ({activeTab === 'tours' ? 'Tours' : 'Transfers'})</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '20px', marginTop: '15px', alignItems: 'start' }}>
              
              <div style={{ paddingBottom: '10px' }} className="calendario-admin-grande">
                <DatePicker 
                  selected={fechaCalendarioGrande} 
                  onChange={(date) => setFechaCalendarioGrande(date)} 
                  dayClassName={renderizarEstiloDia} 
                  inline 
                />
              </div>
              
              <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', height: '100%' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#1a3a5c', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                  Detalles del: {fechaCalendarioGrande.toLocaleDateString('es-AR')}
                </h3>

                {infoDia?.bloqueoDelDia && (
                  <div style={{ background: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                    <span style={{ fontWeight: 'bold' }}>🚫 Día Bloqueado</span>
                    <span style={{ fontSize: '0.9rem' }}>Motivo: {infoDia.bloqueoDelDia.motivo || 'No especificado'}</span>
                    <button onClick={() => handleDesbloquearFecha(infoDia.bloqueoDelDia.id)} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: '#c62828', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>Desbloquear día</button>
                  </div>
                )}

                {infoDia?.reservasDelDia.length === 0 && !infoDia?.bloqueoDelDia && (
                  <p style={{ fontSize: '0.9rem', color: '#777', fontStyle: 'italic', margin: 0 }}>
                    Sin actividad registrada para esta fecha.
                  </p>
                )}
                
                {infoDia?.reservasDelDia.length > 0 && (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '400px', overflowY: 'auto' }}>
                    {infoDia.reservasDelDia.map(r => (
                      <li key={r.id} style={{ padding: '15px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '12px', background: '#fafafa' }}>
                        
                        <p style={{ margin: '0 0 10px 0', color: '#1a3a5c', fontWeight: 'bold', fontSize: '1rem' }}>
                          {activeTab === 'tours' ? r.tours?.titulo_es : r.transfers?.titulo_es}
                        </p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px', fontSize: '0.9rem', color: '#444' }}>
                          <span>👤 <strong>Cliente:</strong> {r.nombre_cliente}</span>
                          <span>📱 <strong>Teléfono:</strong> {r.telefono || 'No especificado'}</span>
                          <span>📝 <strong>Notas:</strong> {r.notas || 'Sin notas'}</span>
                          
                          {activeTab === 'tours' ? (
                            <>
                              <span>📍 <strong>Lugar de Recogida:</strong> {r.recogida || 'No especificado'}</span>
                              <span>👥 <strong>Pasajeros:</strong> {r.pasajeros} (Adultos: {r.adultos || 0}, Niños: {r.ninos || 0})</span>
                              <span>🕒 <strong>Horario:</strong> {r.horario === 'morning' ? 'Mañana' : r.horario === 'afternoon' ? 'Tarde' : 'Noche'}</span>
                              <span>🗣️ <strong>Idioma:</strong> {r.idioma === 'en' ? 'Inglés' : r.idioma === 'both' ? 'Bilingüe' : 'Español'}</span>
                            </>
                          ) : (
                            <>
                              <span>📍 <strong>Sentido:</strong> {r.sentido || 'No especificado'}</span>
                              <span>🏠 <strong>Dirección:</strong> {r.direccion || 'No especificado'}</span>
                              <span>👥 <strong>Pasajeros:</strong> {r.pasajeros}</span>
                              <span>🕒 <strong>Horario:</strong> {r.horario || 'No especificado'}</span>
                            </>
                          )}
                        </div>
                        
                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ 
                            padding: '4px 10px', 
                            borderRadius: '12px', 
                            fontSize: '0.8rem', 
                            fontWeight: 'bold',
                            background: r.estado.includes('confirmado') ? '#d1fae5' : r.estado.includes('cancelado') ? '#fee2e2' : '#fef3c7',
                            color: r.estado.includes('confirmado') ? '#065f46' : r.estado.includes('cancelado') ? '#991b1b' : '#92400e'
                          }}>
                            {r.estado}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      <div style={styles.toast}>✓ {toast}</div>
    </div>
  );
}