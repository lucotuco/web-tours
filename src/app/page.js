import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ToursSection from '../components/ToursSection';
import Footer from '../components/Footer';
import About from '../components/About';
import HowItWorks from '../components/HowItWorks';
import Contact from '../components/Contact';
import Testimonials from '../components/Testimonials';
import ScrollAnimations from '../components/ScrollAnimations';
import TransfersSection from '../components/TransfersSection';

export default function Home() {
  return (
    <main>
      <Navbar />
      <ScrollAnimations />
      <Hero />
      <About />
      <ToursSection />
      <TransfersSection />
      <HowItWorks />
      <Testimonials />
      <Contact />
      <Footer />
      <a href="https://wa.me/5491141404888" className="whatsapp-float" target="_blank" rel="noreferrer" title="WhatsApp">
  <i className="fab fa-whatsapp"></i>
</a>
    </main>
  );
}