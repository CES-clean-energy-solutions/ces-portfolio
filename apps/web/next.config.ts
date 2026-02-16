import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // Turbopack config (Next.js 16 default bundler)
  turbopack: {},

  // Exclude .claude symlink (owned by root) from file watching to prevent permission errors
  webpack: (config) => {
    if (config.watchOptions) {
      config.watchOptions.ignored = [
        ...(Array.isArray(config.watchOptions.ignored) ? config.watchOptions.ignored : [config.watchOptions.ignored]),
        '**/.claude/**',
      ];
    } else {
      config.watchOptions = {
        ignored: ['**/.claude/**', '**/node_modules/**'],
      };
    }
    return config;
  },
};

export default nextConfig;
