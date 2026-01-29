/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🔮 VOLUMETRIC GLOW SHADER — WEBGPU WGSL ULTRA PREMIUM 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Shader de glow volumétrico para:
 * - Orb central con resplandor cinematográfico
 * - God rays dinámicos
 * - Pulse-sync para "respirar"
 * - Mood-adaptive intensity
 * - Holographic shimmer effect
 *
 * @version 1.0.0 SUPREME
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// UNIFORMS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

struct GlowUniforms {
  time: f32,
  intensity: f32,      // 0-2 glow strength
  pulse: f32,          // MediaPipe pulse 0-1
  mood: f32,           // 0 calm, 1 euphoric
  colorBase: vec3<f32>,
  innerRadius: f32,    // Core radius
  outerRadius: f32,    // Max glow radius
  rayCount: f32,       // God rays count (8-16)
  rayIntensity: f32,   // God rays strength
}

@group(0) @binding(0) var<uniform> uniforms: GlowUniforms;

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

fn hash(p: vec2<f32>) -> f32 {
  return fract(sin(dot(p, vec2<f32>(127.1, 311.7))) * 43758.5453);
}

fn valueNoise(p: vec2<f32>) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(hash(i + vec2<f32>(0.0, 0.0)), hash(i + vec2<f32>(1.0, 0.0)), u.x),
    mix(hash(i + vec2<f32>(0.0, 1.0)), hash(i + vec2<f32>(1.0, 1.0)), u.x),
    u.y
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// GLOW FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

// Inverse distance falloff para glow volumétrico
fn volumetricGlow(dist: f32, intensity: f32) -> f32 {
  return intensity / (dist * 10.0 + 0.1);
}

// Exponential falloff más suave
fn softGlow(dist: f32, radius: f32, sharpness: f32) -> f32 {
  return exp(-pow(dist / radius, sharpness));
}

// God rays radiales
fn godRays(uv: vec2<f32>, time: f32, rayCount: f32, intensity: f32) -> f32 {
  let angle = atan2(uv.y, uv.x);
  let dist = length(uv);

  // Rays pattern
  let rays = sin(angle * rayCount + time * 0.5) * 0.5 + 0.5;
  let raysFalloff = smoothstep(0.5, 0.0, dist);

  // Noise modulation
  let noise = valueNoise(vec2<f32>(angle * 2.0, time * 0.3)) * 0.3 + 0.7;

  return rays * raysFalloff * intensity * noise;
}

// Holographic shimmer
fn holographicShimmer(uv: vec2<f32>, time: f32) -> vec3<f32> {
  let angle = atan2(uv.y, uv.x);
  let dist = length(uv);

  // RGB shift based on angle
  let r = sin(angle * 3.0 + time * 2.0) * 0.5 + 0.5;
  let g = sin(angle * 3.0 + time * 2.0 + 2.094) * 0.5 + 0.5; // +120°
  let b = sin(angle * 3.0 + time * 2.0 + 4.189) * 0.5 + 0.5; // +240°

  return vec3<f32>(r, g, b) * smoothstep(0.3, 0.0, dist) * 0.2;
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FRAGMENT SHADER — Volumetric Glow Principal
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

@fragment
fn main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
  let time = uniforms.time;
  let intensity = uniforms.intensity;
  let pulse = uniforms.pulse;
  let mood = uniforms.mood;
  let colorBase = uniforms.colorBase;
  let innerRadius = uniforms.innerRadius;
  let outerRadius = uniforms.outerRadius;
  let rayCount = uniforms.rayCount;
  let rayIntensity = uniforms.rayIntensity;

  // Coordenadas centradas
  let centeredUv = uv - vec2<f32>(0.5, 0.5);
  let dist = length(centeredUv);

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // CORE GLOW — Centro brillante
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  // Breathing effect sincronizado con pulso
  let breathingScale = 1.0 + sin(time * 1.5) * pulse * 0.15;
  let adjustedDist = dist / breathingScale;

  // Glow principal volumétrico
  let coreGlow = volumetricGlow(adjustedDist, intensity * 0.3);

  // Soft outer glow
  let softOuter = softGlow(adjustedDist, outerRadius, 2.0) * intensity * 0.5;

  // Sharp inner core
  let sharpCore = softGlow(adjustedDist, innerRadius, 4.0) * intensity * 0.8;

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // GOD RAYS — Rayos divinos radiales
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  let rays = godRays(centeredUv, time, rayCount, rayIntensity);

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // HOLOGRAPHIC SHIMMER — Iridiscencia premium
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  let shimmer = holographicShimmer(centeredUv, time);

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // COLOR COMPOSITION
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  // Colores mood-adaptive
  let calmColor = vec3<f32>(0.55, 0.0, 1.0);   // Violeta brillante
  let euphoricColor = vec3<f32>(1.0, 0.84, 0.0); // Oro

  let moodColor = mix(calmColor, euphoricColor, mood);
  let finalColorBase = mix(colorBase, moodColor, 0.7);

  // Combinar componentes de glow
  let totalGlow = coreGlow + softOuter + sharpCore * 0.5;

  var finalColor = finalColorBase * totalGlow;

  // Añadir god rays
  finalColor += finalColorBase * rays * 0.3;

  // Añadir shimmer holográfico
  finalColor += shimmer * (1.0 + mood * 0.5);

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // PULSE EFFECTS — Latido sincronizado
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  // Pulse ring expansion
  let pulseRing = smoothstep(0.02, 0.0, abs(adjustedDist - 0.2 - pulse * 0.1));
  finalColor += moodColor * pulseRing * pulse * 0.5;

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // FINAL OUTPUT
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  // Clamp para HDR pero mantener brillo
  finalColor = min(finalColor, vec3<f32>(3.0, 3.0, 3.0));

  // Alpha basado en glow total
  let alpha = min(totalGlow + rays * 0.2, 1.0);

  return vec4<f32>(finalColor, alpha);
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// VERTEX SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
}

@vertex
fn vertex_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  var pos = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>(3.0, -1.0),
    vec2<f32>(-1.0, 3.0)
  );

  var output: VertexOutput;
  output.position = vec4<f32>(pos[vertexIndex], 0.0, 1.0);
  output.uv = (pos[vertexIndex] + 1.0) * 0.5;
  output.uv.y = 1.0 - output.uv.y;

  return output;
}
