/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'via.placeholder.com' }, // Para tus imágenes de prueba
      { protocol: 'https', hostname: 'image.qwenlm.ai' }, // Para la imagen del About
      { protocol: 'https', hostname: '**.supabase.co' } // ¡MUY IMPORTANTE! Para las fotos que subas a Supabase
    ],
  },
};

export default nextConfig;