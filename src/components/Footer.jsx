import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <a href="#" className="nav-logo" style={{ marginBottom: '0.5rem' }}>
            <div className="nav-logo-icon">PST</div>
            <div className="nav-logo-text">Premier <span>Sur</span> Tours</div>
          </a>
          <p>Tu puerta de entrada a las experiencias más auténticas de Buenos Aires. Desde 2015 creando recuerdos inolvidables para viajeros de todo el mundo.</p>
        </div>
        <div>
          <h4>Tours</h4>
          <ul className="footer-links">
            <li><a href="#tours">City Tour</a></li>
            <li><a href="#tours">City Tour Privado</a></li>
            <li><a href="#tours">City Tour Nocturno</a></li>
            <li><a href="#tours">La Pampa Argentina y el Gaucho</a></li>
            <li><a href="#tours">Delta del Río de la Plata</a></li>
          </ul>
        </div>
        <div>
          <h4>Empresa</h4>
          <ul className="footer-links">
            <li><a href="#nosotros">Sobre Nosotros</a></li>
            <li><a href="#testimonios">Testimonios</a></li>
            <li><a href="#contacto">Contacto</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">FAQ</a></li>
          </ul>
        </div>
        <div>
          <h4>Legal</h4>
          <ul className="footer-links">
            <li><a href="#">Términos y Condiciones</a></li>
            <li><a href="#">Política de Privacidad</a></li>
            <li><a href="#">Política de Cancelación</a></li>
            <li><a href="#">Reembolsos</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Premier Sur Tours. Todos los derechos reservados.</span>
        <span>Hecho con ❤️ en Buenos Aires</span>
      </div>
    </footer>
  );
}