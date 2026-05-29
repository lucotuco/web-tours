"use client";
import React, { useState, useEffect } from 'react';

export default function Navbar() {
  // Lógica para que la barra cambie de color al scrollear (lo que antes hacía el JS de la IA)
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
      <div className="nav-container">
        <a href="#" className="nav-logo">
          <div className="nav-logo-icon">PST</div>
          <div className="nav-logo-text">Premier <span>Sur</span> Tours</div>
        </a>
        <ul className="nav-links">
          <li><a href="#inicio">Inicio</a></li>
          <li><a href="#nosotros">Nosotros</a></li>
          <li><a href="#tours">Tours</a></li>
          <li><a href="#como-funciona">Cómo Funciona</a></li>
          <li><a href="#testimonios">Testimonios</a></li>
          <li><a href="#contacto">Contacto</a></li>
          <li>
            <div className="lang-toggle">
              <button className="lang-btn active">ES</button>
              <button className="lang-btn">EN</button>
            </div>
          </li>
        </ul>
        <button className="mobile-menu-btn">
          <i className="fas fa-bars"></i>
        </button>
      </div>
    </nav>
  );
}