/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 QUANTUM VOID SHADER — WEBGPU WGSL ULTRA PREMIUM 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Shader de fondo cuántico con:
 * - Distorsión líquida violeta/oro reactiva al pulso
 * - FBM (Fractal Brownian Motion) noise multi-octava
 * - Mood-adaptive color transitions (calm → euphoric)
 * - MediaPipe pulse synchronization
 * - 60fps GPU offload optimizado
 *
 * @version 1.0.0 SUPREME
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// UNIFORMS — Parámetros de control
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

struct Uniforms {
  time: f32,        // Tiempo de animación
  mood: f32,        // 0 = calm violeta, 1 = euphoric oro
  pulse: f32,       // MediaPipe pulso normalized 0-1
  intensity: f32,   // Intensidad general 0-1
  resolution: vec2<f32>, // Resolución de pantalla
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FUNCIONES DE NOISE — Simplex 3D optimizado para GPU
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

fn mod289(x: vec4<f32>) -> vec4<f32> {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

fn mod289_3(x: vec3<f32>) -> vec3<f32> {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

fn permute(x: vec4<f32>) -> vec4<f32> {
  return mod289(((x * 34.0) + 1.0) * x);
}

fn taylorInvSqrt(r: vec4<f32>) -> vec4<f32> {
  return 1.79284291400159 - 0.85373472095314 * r;
}

// Simplex 3D Noise optimizado WGSL
fn snoise(v: vec3<f32>) -> f32 {
  let C = vec2<f32>(1.0/6.0, 1.0/3.0);
  let D = vec4<f32>(0.0, 0.5, 1.0, 2.0);

  // First corner
  var i = floor(v + dot(v, vec3<f32>(C.y, C.y, C.y)));
  let x0 = v - i + dot(i, vec3<f32>(C.x, C.x, C.x));

  // Other corners
  let g = step(x0.yzx, x0.xyz);
  let l = 1.0 - g;
  let i1 = min(g.xyz, l.zxy);
  let i2 = max(g.xyz, l.zxy);

  let x1 = x0 - i1 + vec3<f32>(C.x, C.x, C.x);
  let x2 = x0 - i2 + vec3<f32>(C.y, C.y, C.y);
  let x3 = x0 - vec3<f32>(D.y, D.y, D.y);

  // Permutations
  i = mod289_3(i);
  let p = permute(permute(permute(
    i.z + vec4<f32>(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4<f32>(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4<f32>(0.0, i1.x, i2.x, 1.0));

  // Gradients
  let n_ = 1.0/7.0;
  let ns = n_ * D.wyz - D.xzx;

  let j = p - 49.0 * floor(p * ns.z * ns.z);
  let x_ = floor(j * ns.z);
  let y_ = floor(j - 7.0 * x_);

  let x = x_ * ns.x + vec4<f32>(ns.y, ns.y, ns.y, ns.y);
  let y = y_ * ns.x + vec4<f32>(ns.y, ns.y, ns.y, ns.y);
  let h = 1.0 - abs(x) - abs(y);

  let b0 = vec4<f32>(x.xy, y.xy);
  let b1 = vec4<f32>(x.zw, y.zw);

  let s0 = floor(b0) * 2.0 + 1.0;
  let s1 = floor(b1) * 2.0 + 1.0;
  let sh = -step(h, vec4<f32>(0.0, 0.0, 0.0, 0.0));

  let a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  let a1 = b1.xzyw + s1.xzyw * sh.zzww;

  var p0 = vec3<f32>(a0.xy, h.x);
  var p1 = vec3<f32>(a0.zw, h.y);
  var p2 = vec3<f32>(a1.xy, h.z);
  var p3 = vec3<f32>(a1.zw, h.w);

  // Normalise gradients
  let norm = taylorInvSqrt(vec4<f32>(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  // Mix final noise value
  var m = max(0.6 - vec4<f32>(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), vec4<f32>(0.0));
  m = m * m;
  return 42.0 * dot(m * m, vec4<f32>(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FBM — Fractal Brownian Motion multi-octava
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

fn fbm(p: vec3<f32>) -> f32 {
  var value = 0.0;
  var amplitude = 0.5;
  var frequency = 1.0;
  var pos = p;

  // 5 octavas para detalle cinematográfico
  for (var i = 0; i < 5; i++) {
    value += amplitude * snoise(pos * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }

  return value;
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COLORES — Paleta Chronos Premium
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

fn getVioletDeep() -> vec3<f32> {
  return vec3<f32>(0.25, 0.0, 0.5); // Violeta profundo calm
}

fn getVioletBright() -> vec3<f32> {
  return vec3<f32>(0.55, 0.0, 1.0); // Violeta brillante
}

fn getGoldEuphoric() -> vec3<f32> {
  return vec3<f32>(1.0, 0.84, 0.0); // Oro euphoric
}

fn getGoldIntense() -> vec3<f32> {
  return vec3<f32>(1.0, 0.65, 0.0); // Oro intenso
}

fn getFuchsiaAccent() -> vec3<f32> {
  return vec3<f32>(1.0, 0.0, 0.5); // Fucsia acento
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FRAGMENT SHADER — Quantum Void Principal
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

@fragment
fn main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
  let time = uniforms.time;
  let mood = uniforms.mood;
  let pulse = uniforms.pulse;
  let intensity = uniforms.intensity;

  // Coordenadas centradas
  let centeredUv = uv - vec2<f32>(0.5, 0.5);
  let dist = length(centeredUv);

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // NOISE LAYERS — Multi-capa para profundidad
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  // Capa base: movimiento lento orbital
  let noisePos1 = vec3<f32>(
    centeredUv.x * 3.0 + time * 0.05,
    centeredUv.y * 3.0 + time * 0.03,
    time * 0.1
  );
  let noise1 = fbm(noisePos1) * 0.5 + 0.5;

  // Capa media: ondulación reactiva al pulso
  let pulseWave = sin(time * 2.0 + dist * 10.0) * pulse * 0.3;
  let noisePos2 = vec3<f32>(
    centeredUv.x * 5.0 + pulseWave,
    centeredUv.y * 5.0 - pulseWave,
    time * 0.2 + pulse
  );
  let noise2 = fbm(noisePos2) * 0.5 + 0.5;

  // Capa detalle: micro-texturas
  let noisePos3 = vec3<f32>(
    centeredUv.x * 10.0 + time * 0.1,
    centeredUv.y * 10.0 - time * 0.1,
    time * 0.3
  );
  let noise3 = snoise(noisePos3) * 0.5 + 0.5;

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // DISTORSIÓN LÍQUIDA — Efecto fluido orgánico
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  let distortion = sin(centeredUv.x * 10.0 + time) * sin(centeredUv.y * 10.0 + time) * 0.05 * pulse;
  let warpedDist = dist + distortion;

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // COLOR MIXING — Mood-adaptive gradientes
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  // Gradiente radial base
  let radialGrad = 1.0 - smoothstep(0.0, 0.7, warpedDist);

  // Colores base según mood
  let calmColor = mix(getVioletDeep(), getVioletBright(), noise1);
  let euphoricColor = mix(getGoldEuphoric(), getGoldIntense(), noise2);

  // Transición calm → euphoric
  var baseColor = mix(calmColor, euphoricColor, mood);

  // Añadir acento fucsia en highlights
  let highlight = smoothstep(0.6, 0.8, noise2) * (1.0 - mood * 0.5);
  baseColor = mix(baseColor, getFuchsiaAccent(), highlight * 0.3);

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // EFECTOS VOLUMÉTRICOS — Glow y profundidad
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  // Glow central (orb)
  let glowIntensity = 1.0 / (warpedDist * 4.0 + 0.5) * intensity;
  let glowColor = mix(getVioletBright(), getGoldEuphoric(), mood) * glowIntensity;

  // Vignette suave
  let vignette = smoothstep(0.8, 0.3, dist);

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // COMPOSICIÓN FINAL
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  // Mezclar todas las capas
  let finalNoise = (noise1 * 0.4 + noise2 * 0.4 + noise3 * 0.2);
  var finalColor = baseColor * (finalNoise * 0.5 + 0.5);

  // Añadir glow
  finalColor += glowColor * 0.5;

  // Aplicar vignette
  finalColor *= vignette;

  // Pulse breathing effect
  let breathing = 1.0 + sin(time * 1.5) * pulse * 0.1;
  finalColor *= breathing;

  // Intensidad general
  finalColor *= intensity;

  // Alpha con falloff suave
  let alpha = vignette * intensity * (0.8 + noise1 * 0.2);

  return vec4<f32>(finalColor, alpha);
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// VERTEX SHADER — Passthrough para fullscreen quad
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
}

@vertex
fn vertex_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  // Fullscreen triangle technique
  var pos = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>(3.0, -1.0),
    vec2<f32>(-1.0, 3.0)
  );

  var output: VertexOutput;
  output.position = vec4<f32>(pos[vertexIndex], 0.0, 1.0);
  output.uv = (pos[vertexIndex] + 1.0) * 0.5;
  output.uv.y = 1.0 - output.uv.y; // Flip Y

  return output;
}
