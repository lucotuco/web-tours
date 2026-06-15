"use client";
import { useState, useEffect } from 'react';
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase'; // Importamos Supabase

export default function Contact() {
  const { lang, t } = useLanguage();
  const [toast, setToast] = useState({ show: false, type: '', title: '', msg: '' });
  const [isSending, setIsSending] = useState(false);
  
  // NUEVO ESTADO: Para guardar los tours dinámicos de la base de datos
  const [toursDinamic, setToursDinamic] = useState([]);

  // NUEVO EFFECT: Traemos los tours ordenados y activos de Supabase
  useEffect(() => {
    async function fetchToursContacto() {
      const { data } = await supabase
        .from('tours')
        .select('id, titulo_es, titulo_en')
        .eq('activo', true)
        .order('orden', { ascending: true });
      
      if (data) setToursDinamic(data);
    }
    fetchToursContacto();
  }, []);

  const showToast = (type, title, msg) => {
    setToast({ show: true, type, title, msg });
    setTimeout(() => setToast({ show: false, type: '', title: '', msg: '' }), 4000);
  };

  const handleContactForm = async (e) => {
    e.preventDefault();
    setIsSending(true);

    const formData = {
      nombre: e.target.elements.nombre.value,
      apellido: e.target.elements.apellido.value,
      email: e.target.elements.email.value,
      tour: e.target.elements.tour.value,
      mensaje: e.target.elements.mensaje.value,
    };

    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showToast(
          'success', 
          t('¡Mensaje Enviado!', 'Message Sent!'), 
          t('Te responderemos pronto.', 'We will respond soon.')
        );
        e.target.reset();
      } else {
        throw new Error("Fallo en el servidor");
      }
    } catch (error) {
      showToast(
        'error', 
        t('Error al enviar', 'Error Sending'), 
        t('Inténtalo de nuevo más tarde.', 'Please try again later.')
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="contact animate-on-scroll" id="contacto">
      <div className="section-header">
        <div className="section-badge">
          <i className="fas fa-headset"></i> 
          <span>{t('Contacto', 'Contact')}</span>
        </div>
        <h2>{t('¿Tenés Preguntas?', 'Have Questions?')}</h2>
        <p>{t('Estamos aquí para ayudarte. Contactanos y te responderemos a la brevedad.', "We're here to help. Contact us and we'll respond as soon as possible.")}</p>
      </div>
      
      <div className="contact-grid">
        <div className="contact-info">
          <div className="contact-info-item">
            <div className="contact-info-icon"><i className="fas fa-map-marker-alt"></i></div>
            <div>
              <h4>{t('Dirección', 'Address')}</h4>
              <p>Arce 215<br/>CABA Buenos Aires, Argentina C1426</p>
            </div>
          </div>
          <div className="contact-info-item">
            <div className="contact-info-icon"><i className="fas fa-phone-alt"></i></div>
            <div>
              <h4>{t('Teléfono', 'Phone')}</h4>
              <p>+54 9 11 4140-4888</p>
            </div>
          </div>
          <div className="contact-info-item">
            <div className="contact-info-icon"><i className="fas fa-envelope"></i></div>
            <div>
              <h4>{t('Email', 'Email')}</h4>
              <p>premiersurtours@gmail.com</p>
            </div>
          </div>
          <div className="contact-info-item">
            <div className="contact-info-icon"><i className="fas fa-clock"></i></div>
            <div>
              <h4>{t('Horario', 'Hours')}</h4>
              <p>{t('Lunes a Domingo: 8:00 - 21:00', 'Monday to Sunday: 8:00 AM - 9:00 PM')}</p>
            </div>
          </div>
          
          <div className="contact-social">
            <a href="#"><i className="fab fa-facebook-f"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="https://wa.me/5491141404888" target="_blank" rel="noreferrer"><i className="fab fa-whatsapp"></i></a>
            <a href="#"><i className="fab fa-tripadvisor"></i></a>
            <a href="#"><i className="fab fa-youtube"></i></a>
          </div>
        </div>

        <div className="contact-form">
          <form onSubmit={handleContactForm}>
            <div className="form-row">
              <div className="form-group">
                <label>{t('Nombre', 'First Name')}</label>
                <input type="text" name="nombre" required placeholder={t("Tu nombre", "Your name")} />
              </div>
              <div className="form-group">
                <label>{t('Apellido', 'Last Name')}</label>
                <input type="text" name="apellido" required placeholder={t("Tu apellido", "Your last name")} />
              </div>
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" required placeholder="tu@email.com" />
            </div>
            
            <div className="form-group">
              <label>{t('Tour de Interés', 'Tour of Interest')}</label>
              <select name="tour" required>
                <option value="">{t('Seleccioná un tour', 'Select a tour')}</option>
                {/* REEMPLAZO: Mapeamos los tours reales de la base de datos de forma bilingüe */}
                {toursDinamic.map((tItem) => (
                  <option key={tItem.id} value={lang === 'es' ? tItem.titulo_es : tItem.titulo_en}>
                    {lang === 'es' ? tItem.titulo_es : tItem.titulo_en}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>{t('Mensaje', 'Message')}</label>
              <textarea name="mensaje" rows="4" required placeholder={t("Tu consulta o mensaje...", "Your inquiry or message...")}></textarea>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={isSending}>
              {isSending ? (
                <span>{t('Enviando...', 'Sending...')}</span>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i>
                  <span>{t('Enviar Mensaje', 'Send Message')}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
      
      <div className={`toast ${toast.show ? 'show' : ''}`}>
        <div className={`toast-icon ${toast.type}`}>
          {toast.type === 'success' ? <i className="fas fa-check"></i> : <i className="fas fa-exclamation"></i>}
        </div>
        <div className="toast-text">
          <strong>{toast.title}</strong>
          <span>{toast.msg}</span>
        </div>
      </div>
    </section>
  );
}