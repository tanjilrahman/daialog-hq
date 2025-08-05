/**
 * Next.js configuration for Daialog HQ.  We enable React strict mode.
 */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Exclude Supabase functions from the build
    config.externals = config.externals || [];
    config.externals.push({
      "npm:@supabase/supabase-js@2.43.0": "commonjs @supabase/supabase-js",
      "jsr:@supabase/functions-js/edge-runtime.d.ts":
        "commonjs @supabase/functions-js",
    });

    return config;
  },
  // Exclude supabase directory from TypeScript compilation
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporarily disable ESLint during builds
  },
};

module.exports = nextConfig;
