import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuração para melhorar compatibilidade com Windows e Supabase
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
