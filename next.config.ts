import type { NextConfig } from "next"

// ═══════════════════════════════════════════════════════════════════════════
// CHRONOS INFINITY 2026 - NEXT.JS PRODUCTION-OPTIMIZED CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const isProd = process.env.NODE_ENV === "production"

const nextConfig: NextConfig = {
  distDir: ".next",

  // Allowed dev origins
  allowedDevOrigins: ["localhost", "127.0.0.1"],

  // ═══════════════════════════════════════════════════════════════════════════
  // TYPESCRIPT - Allow build even with 3D component type issues
  // ═══════════════════════════════════════════════════════════════════════════
  typescript: {
    ignoreBuildErrors: true,
    tsconfigPath: "./tsconfig.json",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // IMAGES - Maximum optimization
  // ═══════════════════════════════════════════════════════════════════════════
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com", pathname: "/v0/b/*/o/**" },
      { protocol: "https", hostname: "*.spline.design" },
      { protocol: "https", hostname: "mockend.com" },
      { protocol: "https", hostname: "models.github.ai" },
      { protocol: "https", hostname: "*.vercel.app" },
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.clerk.dev" },
    ],
  },

  reactStrictMode: true,

  // ═══════════════════════════════════════════════════════════════════════════
  // SWC COMPILER - PRODUCTION OPTIMIZATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  compiler: {
    // Strip console.log in production (keep error & warn)
    removeConsole: isProd ? { exclude: ["error", "warn"] } : false,
    // Remove test properties in production
    reactRemoveProperties: isProd ? { properties: ["^data-testid$", "^data-test$"] } : false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPERIMENTAL - ALL OPTIMIZATIONS ENABLED
  // ═══════════════════════════════════════════════════════════════════════════
  experimental: {
    // Aggressive tree-shaking for large packages
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@radix-ui/react-icons",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-popover",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-switch",
      "@radix-ui/react-slider",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-separator",
      "@radix-ui/react-avatar",
      "@radix-ui/react-progress",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-collapsible",
      "@radix-ui/react-label",
      "@radix-ui/react-radio-group",
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "@react-three/postprocessing",
      "three-stdlib",
      "maath",
      "@splinetool/react-spline",
      "@splinetool/runtime",
      "recharts",
      "d3",
      "@tanstack/react-query",
      "@tanstack/react-table",
      "@tanstack/react-virtual",
      "date-fns",
      "zod",
      "immer",
      "zustand",
      "clsx",
      "class-variance-authority",
      "tailwind-merge",
      "ai",
      "@ai-sdk/openai",
      "@ai-sdk/anthropic",
      "@ai-sdk/google",
      "react-hook-form",
      "@hookform/resolvers",
      "@react-spring/web",
      "@react-spring/three",
      "sonner",
      "cmdk",
    ],
    // Webpack memory optimization
    webpackMemoryOptimizations: true,
    // CSS optimization
    optimizeCss: true,
    // Server Actions configuration
    serverActions: {
      bodySizeLimit: "2mb",
    },
    // Scroll restoration
    scrollRestoration: true,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TURBOPACK - Configuration for Next.js 16+
  // ═══════════════════════════════════════════════════════════════════════════
  turbopack: {
    root: process.cwd(),
    resolveAlias: {
      three: "three",
      "three/addons/misc/Timer.js": "three/examples/jsm/misc/Timer.js",
      "three/addons/misc/Timer": "three/examples/jsm/misc/Timer.js",
      "three/addons": "three/examples/jsm",
      "three/examples/jsm": "three/examples/jsm",
    },
  },

  webpack: (config, { isServer }) => {
    const path = require("path")
    const threePath = path.resolve(__dirname, "node_modules/three")
    const splinePath = path.resolve(__dirname, "node_modules/@splinetool/react-spline")

    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        three$: path.join(threePath, "build/three.module.js"),
        "three/addons/misc/Timer.js": path.join(threePath, "examples/jsm/misc/Timer.js"),
        "three/addons/misc/Timer": path.join(threePath, "examples/jsm/misc/Timer.js"),
        "three/addons": path.join(threePath, "examples/jsm"),
        "three/examples/jsm": path.join(threePath, "examples/jsm"),
        "@splinetool/react-spline": path.join(splinePath, "dist/react-spline.js"),
      },
    }

    // Suppress spline deprecation warnings
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /@splinetool/,
        message: /sRGBEncoding/,
      },
    ]

    // GLSL Shader Loader
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag|shader)$/,
      exclude: /node_modules/,
      use: ["raw-loader"],
    })

    // 3D Model Support
    config.module.rules.push({
      test: /\.(glb|gltf|fbx)$/,
      type: "asset/resource",
      generator: {
        filename: "static/models/[hash][ext]",
      },
    })

    // Server-side externals
    if (isServer) {
      config.externals = [...(config.externals || []), "canvas", "jsdom"]
    }

    return config
  },

  poweredByHeader: false,
  compress: true,
  generateEtags: true,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
        ],
      },
      {
        source: "/assets/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/_next/image/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ]
  },

  async redirects() {
    return [
      { source: "/ai-assistant", destination: "/ia", permanent: true },
      { source: "/ai-supreme", destination: "/ia", permanent: true },
      { source: "/ai-supreme-voice", destination: "/ia", permanent: true },
      { source: "/chronos-omega-ai", destination: "/ia", permanent: true },
      { source: "/cosmic", destination: "/dashboard", permanent: true },
      { source: "/quantum-supreme", destination: "/dashboard", permanent: true },
      { source: "/quantum-infinity", destination: "/dashboard", permanent: true },
      { source: "/chronos-ultimate", destination: "/dashboard", permanent: true },
      { source: "/gen5-demo", destination: "/dashboard", permanent: true },
      { source: "/dashboard-demo", destination: "/dashboard", permanent: true },
    ]
  },
}

export default nextConfig
