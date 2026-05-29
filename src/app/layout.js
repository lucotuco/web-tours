import { LanguageProvider } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import './globals.css';

export const metadata = {
  title: 'Premier Sur Tours',
  description: 'Descubrí los mejores tours con nosotros.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <LanguageProvider>
          <LanguageSwitcher />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}