import { LanguageProvider } from '../context/LanguageContext';
import './globals.css';

export const metadata = {
  title: 'Premier Sur Tours',
  description: 'Descubrí los mejores tours con nosotros.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        {/* Importamos los íconos de FontAwesome y las tipografías premium */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}