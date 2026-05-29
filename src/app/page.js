import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ToursSection from '../components/ToursSection';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <ToursSection />
      <Footer />
    </main>
  );
}