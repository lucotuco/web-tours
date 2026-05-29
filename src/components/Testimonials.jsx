"use client";
import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Testimonials() {
  const { t } = useLanguage();

  return (
    <section className="testimonials animate-on-scroll visible" id="testimonios">
      <div className="section-header">
        <div className="section-badge">
          <i className="fas fa-quote-left"></i> 
          <span>{t('Testimonios', 'Testimonials')}</span>
        </div>
        <h2>{t('Lo que Dicen Nuestros Turistas', 'What Our Tourists Say')}</h2>
        <p>{t('Miles de viajeros de todo el mundo ya vivieron la experiencia Premier Sur Tours.', 'Thousands of travelers from around the world have already lived the Premier Sur Tours experience.')}</p>
      </div>
      
      <div className="testimonials-grid">
        {/* Testimonio 1 */}
        <div className="testimonial-card">
          <div className="testimonial-stars">
            <i className="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
          </div>
          <p className="testimonial-text">
            {t('"Increíble experiencia. El City Tour fue espectacular, nuestro guía Martín conocía cada historia de cada calle. ¡100% recomendado!"', '"Incredible experience. The City Tour was spectacular, our guide Martín knew every story of every street. 100% recommended!"')}
          </p>
          <div className="testimonial-author">
            <div className="testimonial-avatar">JM</div>
            <div>
              <div className="testimonial-name">James Miller</div>
              <div className="testimonial-origin">New York, USA</div>
            </div>
          </div>
        </div>

        {/* Testimonio 2 */}
        <div className="testimonial-card">
          <div className="testimonial-stars">
            <i className="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
          </div>
          <p className="testimonial-text">
            {t('"La Pampa Argentina y el Gaucho fue lo mejor de nuestro viaje. La comida, la cabalgata, todo perfecto. Una experiencia única e inolvidable."', '"The Argentine Pampa & the Gaucho was the best of our trip. The food, the horseback riding, everything perfect. A unique and unforgettable experience."')}
          </p>
          <div className="testimonial-author">
            <div className="testimonial-avatar">SL</div>
            <div>
              <div className="testimonial-name">Sophie Laurent</div>
              <div className="testimonial-origin">{t('Paris, Francia', 'Paris, France')}</div>
            </div>
          </div>
        </div>

        {/* Testimonio 3 */}
        <div className="testimonial-card">
          <div className="testimonial-stars">
            <i className="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
          </div>
          <p className="testimonial-text">
            {t('"El tour del Delta fue mágico. La naturaleza, las islas, el almuerzo... todo perfecto. El guía bilingüe hizo toda la diferencia. Volveremos!"', '"The Delta tour was magical. The nature, the islands, the lunch... everything perfect. The bilingual guide made all the difference. We\'ll be back!"')}
          </p>
          <div className="testimonial-author">
            <div className="testimonial-avatar">TK</div>
            <div>
              <div className="testimonial-name">Takeshi Kimura</div>
              <div className="testimonial-origin">{t('Tokio, Japón', 'Tokyo, Japan')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}