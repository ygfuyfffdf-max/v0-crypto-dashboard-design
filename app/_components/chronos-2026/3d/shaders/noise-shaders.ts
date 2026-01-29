/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🌊 CHRONOS 2026 — ADVANCED PROCEDURAL NOISE SHADERS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de noise procedural ultra-avanzado para visualizaciones financieras:
 * - FBM (Fractional Brownian Motion) multi-octava
 * - Worley Noise (Voronoi celular)
 * - Hybrid FBM + Worley para turbulencia
 * - Financial turbulence (flujos de capital)
 * - GPU Compute optimizado (280+ FPS móvil target)
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// GLSL NOISE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const noiseCommon = /* glsl */ `
  // Hash functions for procedural noise
  vec3 hash3(vec3 p) {
    p = vec3(
      dot(p, vec3(127.1, 311.7, 74.7)),
      dot(p, vec3(269.5, 183.3, 246.1)),
      dot(p, vec3(113.5, 271.9, 124.6))
    );
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float hash1(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
  }

  // Smooth interpolation
  vec3 smoothstep3(vec3 t) {
    return t * t * (3.0 - 2.0 * t);
  }

  // Quintic interpolation (smoother than smoothstep)
  vec3 quintic(vec3 t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
  }
`

// ═══════════════════════════════════════════════════════════════════════════════
// PERLIN NOISE (Base)
// ═══════════════════════════════════════════════════════════════════════════════

export const perlinNoise = /* glsl */ `
  ${noiseCommon}

  float perlinNoise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = quintic(f);

    return mix(
      mix(
        mix(dot(hash3(i + vec3(0,0,0)), f - vec3(0,0,0)),
            dot(hash3(i + vec3(1,0,0)), f - vec3(1,0,0)), u.x),
        mix(dot(hash3(i + vec3(0,1,0)), f - vec3(0,1,0)),
            dot(hash3(i + vec3(1,1,0)), f - vec3(1,1,0)), u.x), u.y),
      mix(
        mix(dot(hash3(i + vec3(0,0,1)), f - vec3(0,0,1)),
            dot(hash3(i + vec3(1,0,1)), f - vec3(1,0,1)), u.x),
        mix(dot(hash3(i + vec3(0,1,1)), f - vec3(0,1,1)),
            dot(hash3(i + vec3(1,1,1)), f - vec3(1,1,1)), u.x), u.y), u.z);
  }
`

// ═══════════════════════════════════════════════════════════════════════════════
// FBM (FRACTIONAL BROWNIAN MOTION)
// ═══════════════════════════════════════════════════════════════════════════════

export const fbmNoise = /* glsl */ `
  ${perlinNoise}

  // Standard FBM with configurable parameters
  float fbm(vec3 p, int octaves, float lacunarity, float gain) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    float maxValue = 0.0;

    for (int i = 0; i < octaves; i++) {
      value += amplitude * perlinNoise3D(p * frequency);
      maxValue += amplitude;
      amplitude *= gain;
      frequency *= lacunarity;
    }

    return value / maxValue;
  }

  // Ridged FBM (sharper peaks - like mountains of profit)
  float fbmRidged(vec3 p, int octaves, float lacunarity, float gain) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    float weight = 1.0;

    for (int i = 0; i < octaves; i++) {
      float n = 1.0 - abs(perlinNoise3D(p * frequency));
      n = n * n * weight;
      value += n * amplitude;
      weight = clamp(n * 2.0, 0.0, 1.0);
      amplitude *= gain;
      frequency *= lacunarity;
    }

    return value;
  }

  // Turbulent FBM (absolute value - for chaotic flows)
  float fbmTurbulent(vec3 p, int octaves, float lacunarity, float gain) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    float maxValue = 0.0;

    for (int i = 0; i < octaves; i++) {
      value += amplitude * abs(perlinNoise3D(p * frequency));
      maxValue += amplitude;
      amplitude *= gain;
      frequency *= lacunarity;
    }

    return value / maxValue;
  }

  // Billowed FBM (inverted ridged - for valleys/debts)
  float fbmBillowed(vec3 p, int octaves, float lacunarity, float gain) {
    return 1.0 - fbmRidged(p, octaves, lacunarity, gain);
  }

  // Domain warped FBM (ultra-organic look)
  float fbmWarped(vec3 p, int octaves) {
    vec3 q = vec3(
      fbm(p + vec3(0.0), octaves, 2.0, 0.5),
      fbm(p + vec3(5.2, 1.3, 2.8), octaves, 2.0, 0.5),
      fbm(p + vec3(1.7, 9.2, 3.1), octaves, 2.0, 0.5)
    );
    
    vec3 r = vec3(
      fbm(p + 4.0 * q + vec3(1.7, 9.2, 0.0), octaves, 2.0, 0.5),
      fbm(p + 4.0 * q + vec3(8.3, 2.8, 4.1), octaves, 2.0, 0.5),
      fbm(p + 4.0 * q + vec3(2.1, 6.3, 1.4), octaves, 2.0, 0.5)
    );
    
    return fbm(p + 4.0 * r, octaves, 2.0, 0.5);
  }
`

// ═══════════════════════════════════════════════════════════════════════════════
// WORLEY NOISE (VORONOI CELLULAR)
// ═══════════════════════════════════════════════════════════════════════════════

export const worleyNoise = /* glsl */ `
  ${noiseCommon}

  // Worley noise (F1 - distance to nearest feature point)
  float worleyF1(vec3 p) {
    vec3 id = floor(p);
    vec3 fd = fract(p);

    float minDist = 1.0;

    for (int z = -1; z <= 1; z++) {
      for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
          vec3 offset = vec3(float(x), float(y), float(z));
          vec3 cellId = id + offset;
          vec3 featurePoint = offset + hash3(cellId) * 0.5 + 0.5;
          vec3 delta = featurePoint - fd;
          float dist = length(delta);
          minDist = min(minDist, dist);
        }
      }
    }

    return minDist;
  }

  // Worley noise (F2 - distance to second nearest)
  vec2 worleyF1F2(vec3 p) {
    vec3 id = floor(p);
    vec3 fd = fract(p);

    float f1 = 1.0;
    float f2 = 1.0;

    for (int z = -1; z <= 1; z++) {
      for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
          vec3 offset = vec3(float(x), float(y), float(z));
          vec3 cellId = id + offset;
          vec3 featurePoint = offset + hash3(cellId) * 0.5 + 0.5;
          vec3 delta = featurePoint - fd;
          float dist = length(delta);
          
          if (dist < f1) {
            f2 = f1;
            f1 = dist;
          } else if (dist < f2) {
            f2 = dist;
          }
        }
      }
    }

    return vec2(f1, f2);
  }

  // Worley edge detection (F2 - F1)
  float worleyEdge(vec3 p) {
    vec2 f = worleyF1F2(p);
    return f.y - f.x;
  }

  // Smooth Worley (Manhattan distance variant)
  float worleySmooth(vec3 p) {
    vec3 id = floor(p);
    vec3 fd = fract(p);

    float minDist = 1.0;

    for (int z = -1; z <= 1; z++) {
      for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
          vec3 offset = vec3(float(x), float(y), float(z));
          vec3 cellId = id + offset;
          vec3 featurePoint = offset + hash3(cellId) * 0.5 + 0.5;
          vec3 delta = featurePoint - fd;
          // Chebyshev distance for smoother cells
          float dist = max(abs(delta.x), max(abs(delta.y), abs(delta.z)));
          minDist = min(minDist, dist);
        }
      }
    }

    return minDist;
  }
`

// ═══════════════════════════════════════════════════════════════════════════════
// HYBRID FBM + WORLEY (FINANCIAL TURBULENCE)
// ═══════════════════════════════════════════════════════════════════════════════

export const hybridNoise = /* glsl */ `
  ${fbmNoise}
  ${worleyNoise}

  // Hybrid noise: FBM modulated by Worley
  float hybridFBMWorley(vec3 p, int octaves, float blend) {
    float fbmVal = fbm(p, octaves, 2.0, 0.5);
    float worleyVal = worleyF1(p * 2.0);
    return mix(fbmVal, worleyVal, blend);
  }

  // Financial turbulence: capital flows visualization
  float financialTurbulence(vec3 p, float time, float volatility) {
    // Base flow using domain-warped FBM
    vec3 flowP = p + vec3(time * 0.1, time * 0.05, 0.0);
    float baseFlow = fbmWarped(flowP, 4);
    
    // Market volatility using ridged FBM
    float marketVolatility = fbmRidged(p * 3.0 + time * 0.3, 5, 2.2, 0.45) * volatility;
    
    // Cell structure using Worley (represents discrete transactions)
    float transactions = worleyEdge(p * 4.0 + time * 0.2) * 0.3;
    
    // Combine: smooth flows with sharp market events
    return baseFlow * (1.0 + marketVolatility) + transactions;
  }

  // Capital mountains: profit peaks
  float capitalMountains(vec3 p, float growth) {
    // Ridged FBM for sharp profit peaks
    float peaks = fbmRidged(p * 0.5, 6, 2.1, 0.52);
    
    // Worley cells for discrete gain regions
    float regions = 1.0 - worleyF1(p * 0.8);
    
    // Combine with growth multiplier
    return (peaks * 0.7 + regions * 0.3) * growth;
  }

  // Debt rivers: flowing obligations
  float debtRivers(vec3 p, float time) {
    // Billowed FBM for valley-like flows
    float valleys = fbmBillowed(p + vec3(time * 0.05, 0.0, time * 0.02), 5, 2.0, 0.5);
    
    // Turbulent edges for chaotic debt accumulation
    float edges = fbmTurbulent(p * 2.0 + time * 0.1, 4, 2.3, 0.48);
    
    // Worley channels for discrete debt streams
    float channels = worleyEdge(p * 1.5);
    
    return valleys * (1.0 - edges * 0.3) * (1.0 + channels * 0.2);
  }

  // Plasma effect: liquid capital
  float liquidCapital(vec3 p, float time) {
    // Multi-layer warped FBM
    float layer1 = fbmWarped(p + vec3(sin(time * 0.3), cos(time * 0.2), 0.0), 4);
    float layer2 = fbmWarped(p * 1.5 + vec3(cos(time * 0.4), 0.0, sin(time * 0.25)), 3);
    float layer3 = fbm(p * 3.0 + time * vec3(0.1, 0.15, 0.08), 5, 2.0, 0.5);
    
    // Combine with smooth blending
    return layer1 * 0.5 + layer2 * 0.3 + layer3 * 0.2;
  }
`

// ═══════════════════════════════════════════════════════════════════════════════
// FINANCIAL VISUALIZATION VERTEX SHADER
// ═══════════════════════════════════════════════════════════════════════════════

export const financialVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uVolatility;
  uniform float uGrowth;
  uniform float uNoiseScale;
  uniform float uDisplacementStrength;

  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying float vDisplacement;
  varying float vNoise;

  ${hybridNoise}

  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normal;

    // Calculate financial noise
    vec3 noisePos = position * uNoiseScale + uTime * 0.1;
    float noise = financialTurbulence(noisePos, uTime, uVolatility);
    vNoise = noise;

    // Displacement based on capital mountains
    float displacement = capitalMountains(noisePos, uGrowth) * uDisplacementStrength;
    vDisplacement = displacement;

    // Apply displacement along normal
    vec3 newPosition = position + normal * displacement;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`

// ═══════════════════════════════════════════════════════════════════════════════
// FINANCIAL VISUALIZATION FRAGMENT SHADER
// ═══════════════════════════════════════════════════════════════════════════════

export const financialFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColorProfit;
  uniform vec3 uColorDebt;
  uniform vec3 uColorNeutral;
  uniform float uEmissiveIntensity;
  uniform float uFresnelPower;
  uniform float uVolatility;

  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying float vDisplacement;
  varying float vNoise;

  ${hybridNoise}

  void main() {
    // Fresnel effect for edge glow
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), uFresnelPower);

    // Color based on displacement (profit = green, debt = red)
    float profitFactor = smoothstep(0.0, 0.5, vDisplacement);
    float debtFactor = smoothstep(-0.5, 0.0, -vDisplacement);
    
    vec3 baseColor = mix(
      mix(uColorNeutral, uColorProfit, profitFactor),
      uColorDebt,
      debtFactor
    );

    // Add noise-based color variation
    float colorNoise = vNoise * 0.3;
    baseColor = mix(baseColor, vec3(1.0), colorNoise * 0.1);

    // Emissive glow on high activity areas
    float activity = abs(vDisplacement) * uVolatility;
    vec3 emissive = baseColor * activity * uEmissiveIntensity;

    // Final color with fresnel rim
    vec3 finalColor = baseColor + emissive + fresnel * baseColor * 0.5;

    // Gamma correction
    finalColor = pow(finalColor, vec3(1.0 / 2.2));

    gl_FragColor = vec4(finalColor, 1.0);
  }
`

// ═══════════════════════════════════════════════════════════════════════════════
// LIQUID ORB SHADERS (Spline-quality plasma)
// ═══════════════════════════════════════════════════════════════════════════════

export const liquidOrbVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uDistort;
  uniform float uSpeed;

  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying float vElevation;

  ${fbmNoise}

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);

    // Multi-layer distortion
    vec3 pos = position;
    float time = uTime * uSpeed;
    
    // Domain warping for organic movement
    float warp = fbmWarped(pos * 0.5 + time * 0.1, 4);
    float turbulence = fbmTurbulent(pos * 2.0 + time * 0.2, 3, 2.0, 0.5);
    float ridges = fbmRidged(pos * 1.5 + time * 0.15, 4, 2.2, 0.5) * 0.3;
    
    // Combine noise layers
    float elevation = (warp * 0.6 + turbulence * 0.3 + ridges * 0.1) * uDistort;
    vElevation = elevation;
    
    // Apply displacement
    pos += normal * elevation;
    vPosition = pos;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

export const liquidOrbFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform float uColorMix;
  uniform float uFresnelPower;
  uniform float uRimIntensity;

  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying float vElevation;

  ${fbmNoise}

  void main() {
    // Fresnel for rim lighting
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), uFresnelPower);

    // Animated color gradient
    float colorNoise = fbm(vPosition * 2.0 + uTime * 0.2, 4, 2.0, 0.5);
    float colorMix = vElevation * uColorMix + colorNoise * 0.3;
    
    // Three-color gradient
    vec3 color = mix(
      mix(uColor1, uColor2, smoothstep(-0.2, 0.2, colorMix)),
      uColor3,
      smoothstep(0.2, 0.5, colorMix)
    );

    // Add rim glow
    vec3 rimColor = mix(uColor2, uColor3, fresnel);
    color += rimColor * fresnel * uRimIntensity;

    // Subtle iridescence
    float iridescence = sin(vPosition.x * 10.0 + uTime) * 0.05;
    color += vec3(iridescence, -iridescence * 0.5, iridescence * 0.8);

    // Emissive core
    float core = smoothstep(0.0, 0.3, 1.0 - length(vPosition));
    color += uColor2 * core * 0.5;

    // Gamma correction
    color = pow(color, vec3(1.0 / 2.2));

    gl_FragColor = vec4(color, 0.95);
  }
`

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT ALL SHADERS
// ═══════════════════════════════════════════════════════════════════════════════

export const shaders = {
  noise: {
    common: noiseCommon,
    perlin: perlinNoise,
    fbm: fbmNoise,
    worley: worleyNoise,
    hybrid: hybridNoise,
  },
  financial: {
    vertex: financialVertexShader,
    fragment: financialFragmentShader,
  },
  liquidOrb: {
    vertex: liquidOrbVertexShader,
    fragment: liquidOrbFragmentShader,
  },
}

export default shaders
