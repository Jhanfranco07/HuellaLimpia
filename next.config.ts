import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // El formulario acepta imágenes de 5 MiB; multipart añade unos bytes al cuerpo.
    serverActions: { bodySizeLimit: '6mb' },
  },
};

export default nextConfig;
