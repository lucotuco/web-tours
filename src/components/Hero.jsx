import React from 'react';

export default function Hero() {
  return (
    <section className="hero" id="inicio">
      <div className="hero-bg"></div>
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <div className="hero-badge">
          <i className="fas fa-star"></i>
          <span>La mejor experiencia turística en Buenos Aires</span>
        </div>
        <h1>Descubrí <span>Buenos Aires</span> con Nosotros</h1>
        <p>Explorá la ciudad más vibrante de Sudamérica con tours guiados en español e inglés. Experiencias únicas, guías expertos y momentos inolvidables te esperan.</p>
        <div className="hero-buttons">
          <a href="#tours" className="btn btn-primary">
            <i className="fas fa-map-marked-alt"></i>
            <span>Ver Tours</span>
          </a>
          <a href="#contacto" className="btn btn-outline">
            <i className="fas fa-envelope"></i>
            <span>Contactanos</span>
          </a>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-number">2,500+</div>
            <div className="hero-stat-label">Turistas felices</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-number">5</div>
            <div className="hero-stat-label">Tours exclusivos</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-number">4.9</div>
            <div className="hero-stat-label">Calificación promedio</div>
          </div>
        </div>
      </div>
      <div className="scroll-indicator">
        <i className="fas fa-chevron-down"></i>
      </div>
    </section>
  );
}