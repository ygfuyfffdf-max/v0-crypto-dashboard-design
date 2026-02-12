/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🔷 CHRONOS PROCEDURAL GEOMETRY — SDF RAY MARCHING
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Geometría procedural avanzada usando Signed Distance Fields:
 * - Ray marching en GPU
 * - Operaciones CSG (union, intersection, subtraction, smooth blend)
 * - Primitivas procedurales (sphere, box, torus, etc.)
 * - Ambient occlusion en tiempo real
 * - Soft shadows
 * - Fractales 3D (Mandelbulb, Menger Sponge)
 *
 * @version SDF-SUPREME 2026.1
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { memo, useMemo, useRef } from 'react'
import * as THREE from 'three'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 SDF SHADER LIBRARY
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const SDF_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const SDF_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec3 uCameraPosition;
  uniform mat4 uCameraMatrix;
  uniform float uMorphProgress;
  uniform int uShape;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform float uRotationSpeed;
  uniform float uScale;

  varying vec2 vUv;
  varying vec3 vPosition;

  const int MAX_STEPS = 100;
  const float MAX_DIST = 100.0;
  const float SURF_DIST = 0.001;
  const float PI = 3.14159265359;

  // ═══════════════════════════════════════════════════════════════════════════
  // ROTATION MATRICES
  // ═══════════════════════════════════════════════════════════════════════════

  mat2 rot2D(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
  }

  mat3 rotateX(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c);
  }

  mat3 rotateY(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c);
  }

  mat3 rotateZ(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat3(c, -s, 0.0, s, c, 0.0, 0.0, 0.0, 1.0);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SDF PRIMITIVES
  // ═══════════════════════════════════════════════════════════════════════════

  float sdSphere(vec3 p, float r) {
    return length(p) - r;
  }

  float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
  }

  float sdRoundBox(vec3 p, vec3 b, float r) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
  }

  float sdTorus(vec3 p, vec2 t) {
    vec2 q = vec2(length(p.xz) - t.x, p.y);
    return length(q) - t.y;
  }

  float sdCappedTorus(vec3 p, vec2 sc, float ra, float rb) {
    p.x = abs(p.x);
    float k = (sc.y * p.x > sc.x * p.y) ? dot(p.xy, sc) : length(p.xy);
    return sqrt(dot(p, p) + ra * ra - 2.0 * ra * k) - rb;
  }

  float sdCylinder(vec3 p, float h, float r) {
    vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h);
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
  }

  float sdCone(vec3 p, vec2 c, float h) {
    vec2 q = h * vec2(c.x / c.y, -1.0);
    vec2 w = vec2(length(p.xz), p.y);
    vec2 a = w - q * clamp(dot(w, q) / dot(q, q), 0.0, 1.0);
    vec2 b = w - q * vec2(clamp(w.x / q.x, 0.0, 1.0), 1.0);
    float k = sign(q.y);
    float d = min(dot(a, a), dot(b, b));
    float s = max(k * (w.x * q.y - w.y * q.x), k * (w.y - q.y));
    return sqrt(d) * sign(s);
  }

  float sdOctahedron(vec3 p, float s) {
    p = abs(p);
    float m = p.x + p.y + p.z - s;
    vec3 q;
    if (3.0 * p.x < m) q = p.xyz;
    else if (3.0 * p.y < m) q = p.yzx;
    else if (3.0 * p.z < m) q = p.zxy;
    else return m * 0.57735027;
    float k = clamp(0.5 * (q.z - q.y + s), 0.0, s);
    return length(vec3(q.x, q.y - s + k, q.z - k));
  }

  float sdHexPrism(vec3 p, vec2 h) {
    const vec3 k = vec3(-0.8660254, 0.5, 0.57735);
    p = abs(p);
    p.xy -= 2.0 * min(dot(k.xy, p.xy), 0.0) * k.xy;
    vec2 d = vec2(length(p.xy - vec2(clamp(p.x, -k.z * h.x, k.z * h.x), h.x)) * sign(p.y - h.x), p.z - h.y);
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CSG OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  float opUnion(float d1, float d2) {
    return min(d1, d2);
  }

  float opSubtraction(float d1, float d2) {
    return max(-d1, d2);
  }

  float opIntersection(float d1, float d2) {
    return max(d1, d2);
  }

  float opSmoothUnion(float d1, float d2, float k) {
    float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
    return mix(d2, d1, h) - k * h * (1.0 - h);
  }

  float opSmoothSubtraction(float d1, float d2, float k) {
    float h = clamp(0.5 - 0.5 * (d2 + d1) / k, 0.0, 1.0);
    return mix(d2, -d1, h) + k * h * (1.0 - h);
  }

  float opSmoothIntersection(float d1, float d2, float k) {
    float h = clamp(0.5 - 0.5 * (d2 - d1) / k, 0.0, 1.0);
    return mix(d2, d1, h) + k * h * (1.0 - h);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FRACTALS
  // ═══════════════════════════════════════════════════════════════════════════

  // Mandelbulb fractal
  float sdMandelbulb(vec3 pos, float power) {
    vec3 z = pos;
    float dr = 1.0;
    float r = 0.0;

    for (int i = 0; i < 8; i++) {
      r = length(z);
      if (r > 2.0) break;

      float theta = acos(z.z / r) * power;
      float phi = atan(z.y, z.x) * power;
      float zr = pow(r, power);

      dr = pow(r, power - 1.0) * power * dr + 1.0;

      z = zr * vec3(
        sin(theta) * cos(phi),
        sin(phi) * sin(theta),
        cos(theta)
      );
      z += pos;
    }

    return 0.5 * log(r) * r / dr;
  }

  // Menger Sponge
  float sdMengerSponge(vec3 p, int iterations) {
    float d = sdBox(p, vec3(1.0));

    float s = 1.0;
    for (int i = 0; i < 4; i++) {
      if (i >= iterations) break;

      vec3 a = mod(p * s, 2.0) - 1.0;
      s *= 3.0;
      vec3 r = abs(1.0 - 3.0 * abs(a));

      float da = max(r.x, r.y);
      float db = max(r.y, r.z);
      float dc = max(r.z, r.x);
      float c = (min(da, min(db, dc)) - 1.0) / s;

      d = max(d, c);
    }

    return d;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE COMPOSITION
  // ═══════════════════════════════════════════════════════════════════════════

  float getScene(vec3 p) {
    // Apply rotation
    float t = uTime * uRotationSpeed;
    p = rotateY(t * 0.5) * rotateX(t * 0.3) * p;
    p /= uScale;

    float d = MAX_DIST;

    // Morph between shapes
    if (uShape == 0) {
      // Morphing sphere-box-torus
      float sphere = sdSphere(p, 0.8);
      float box = sdRoundBox(p, vec3(0.6), 0.1);
      float torus = sdTorus(p, vec2(0.7, 0.25));

      float morph = sin(uTime * 0.5) * 0.5 + 0.5;
      d = opSmoothUnion(sphere, opSmoothUnion(box, torus, 0.3 * morph), 0.3 * (1.0 - morph));
    }
    else if (uShape == 1) {
      // Mandelbulb
      float power = 8.0 + sin(uTime * 0.2) * 2.0;
      d = sdMandelbulb(p * 1.5, power) / 1.5;
    }
    else if (uShape == 2) {
      // Menger Sponge
      d = sdMengerSponge(p, 3);
    }
    else if (uShape == 3) {
      // Organic blob
      float sphere = sdSphere(p, 0.6);

      // Add organic deformation
      float noise = sin(p.x * 5.0 + uTime) * sin(p.y * 5.0 + uTime * 0.7) * sin(p.z * 5.0 + uTime * 0.3) * 0.1;
      d = sphere + noise;

      // Subtract inner cavities
      float cavity1 = sdSphere(p - vec3(0.3, 0.0, 0.0), 0.3);
      float cavity2 = sdSphere(p + vec3(0.2, 0.2, -0.2), 0.25);
      d = opSmoothSubtraction(cavity1, d, 0.1);
      d = opSmoothSubtraction(cavity2, d, 0.1);
    }
    else if (uShape == 4) {
      // Quantum crystal
      float oct = sdOctahedron(p, 0.7);
      float sphere = sdSphere(p, 0.5);

      // Rotating inner structure
      vec3 rp = rotateY(uTime) * rotateZ(uTime * 0.7) * p;
      float hex = sdHexPrism(rp, vec2(0.3, 0.8));

      d = opSmoothUnion(oct, opSmoothIntersection(sphere, hex, 0.1), 0.15);
    }

    return d * uScale;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RAY MARCHING
  // ═══════════════════════════════════════════════════════════════════════════

  float rayMarch(vec3 ro, vec3 rd) {
    float dO = 0.0;

    for (int i = 0; i < MAX_STEPS; i++) {
      vec3 p = ro + rd * dO;
      float dS = getScene(p);
      dO += dS;
      if (dO > MAX_DIST || abs(dS) < SURF_DIST) break;
    }

    return dO;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NORMAL CALCULATION
  // ═══════════════════════════════════════════════════════════════════════════

  vec3 getNormal(vec3 p) {
    float d = getScene(p);
    vec2 e = vec2(0.001, 0.0);

    vec3 n = d - vec3(
      getScene(p - e.xyy),
      getScene(p - e.yxy),
      getScene(p - e.yyx)
    );

    return normalize(n);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AMBIENT OCCLUSION
  // ═══════════════════════════════════════════════════════════════════════════

  float getAO(vec3 p, vec3 n) {
    float occ = 0.0;
    float sca = 1.0;

    for (int i = 0; i < 5; i++) {
      float h = 0.01 + 0.12 * float(i) / 4.0;
      float d = getScene(p + h * n);
      occ += (h - d) * sca;
      sca *= 0.95;
    }

    return clamp(1.0 - 3.0 * occ, 0.0, 1.0);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SOFT SHADOWS
  // ═══════════════════════════════════════════════════════════════════════════

  float getSoftShadow(vec3 ro, vec3 rd, float mint, float maxt, float k) {
    float res = 1.0;
    float t = mint;

    for (int i = 0; i < 32; i++) {
      if (t >= maxt) break;
      float h = getScene(ro + rd * t);
      if (h < 0.001) return 0.0;
      res = min(res, k * h / t);
      t += h;
    }

    return res;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN
  // ═══════════════════════════════════════════════════════════════════════════

  void main() {
    vec2 uv = (vUv - 0.5) * 2.0;
    uv.x *= uResolution.x / uResolution.y;

    // Camera setup
    vec3 ro = uCameraPosition;
    vec3 rd = normalize(vec3(uv, -1.5));
    rd = (uCameraMatrix * vec4(rd, 0.0)).xyz;

    // Ray march
    float d = rayMarch(ro, rd);

    vec3 col = vec3(0.0);

    if (d < MAX_DIST) {
      vec3 p = ro + rd * d;
      vec3 n = getNormal(p);

      // Lighting
      vec3 lightPos = vec3(3.0, 5.0, 4.0);
      vec3 lightDir = normalize(lightPos - p);
      vec3 viewDir = normalize(ro - p);
      vec3 halfDir = normalize(lightDir + viewDir);

      // Diffuse
      float diff = max(dot(n, lightDir), 0.0);

      // Specular (Blinn-Phong)
      float spec = pow(max(dot(n, halfDir), 0.0), 64.0);

      // Fresnel
      float fresnel = pow(1.0 - max(dot(n, viewDir), 0.0), 3.0);

      // Ambient occlusion
      float ao = getAO(p, n);

      // Soft shadows
      float shadow = getSoftShadow(p + n * 0.02, lightDir, 0.02, 5.0, 16.0);

      // Color based on normal and position
      vec3 baseColor = mix(uColor1, uColor2, (n.y + 1.0) * 0.5);
      baseColor = mix(baseColor, uColor3, fresnel);

      // Add iridescence
      float iridescence = sin(dot(n, viewDir) * 10.0 + uTime) * 0.1;
      baseColor += vec3(iridescence, iridescence * 0.5, -iridescence);

      // Combine lighting
      col = baseColor * (0.2 + diff * shadow * 0.8);
      col += vec3(1.0) * spec * shadow * 0.5;
      col += uColor1 * fresnel * 0.3;
      col *= ao;

      // Rim light
      float rim = 1.0 - max(dot(n, viewDir), 0.0);
      col += uColor2 * pow(rim, 4.0) * 0.3;
    }

    // Background gradient
    vec3 bg = mix(vec3(0.02, 0.01, 0.05), vec3(0.05, 0.02, 0.1), vUv.y);
    col = mix(bg, col, step(0.001, MAX_DIST - d));

    // Fog
    float fog = 1.0 - exp(-d * 0.05);
    col = mix(col, bg, fog);

    // Tone mapping
    col = col / (col + vec3(1.0));

    // Gamma correction
    col = pow(col, vec3(1.0 / 2.2));

    gl_FragColor = vec4(col, 1.0);
  }
`

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎮 SDF VIEWER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type SDFShape = 'morph' | 'mandelbulb' | 'menger' | 'organic' | 'crystal'

interface ProceduralSDFProps {
  shape?: SDFShape
  colors?: [string, string, string]
  rotationSpeed?: number
  scale?: number
  position?: [number, number, number]
  size?: [number, number]
}

export const ProceduralSDF = memo(function ProceduralSDF({
  shape = 'morph',
  colors = ['#8B00FF', '#FFD700', '#FF1493'],
  rotationSpeed = 0.3,
  scale = 1,
  position = [0, 0, 0],
  size = [4, 4],
}: ProceduralSDFProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { camera, size: viewportSize } = useThree()

  const shapeIndex = useMemo(() => {
    const shapes: SDFShape[] = ['morph', 'mandelbulb', 'menger', 'organic', 'crystal']
    return shapes.indexOf(shape)
  }, [shape])

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: SDF_VERTEX_SHADER,
      fragmentShader: SDF_FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(viewportSize.width, viewportSize.height) },
        uCameraPosition: { value: camera.position.clone() },
        uCameraMatrix: { value: camera.matrixWorld.clone() },
        uMorphProgress: { value: 0 },
        uShape: { value: shapeIndex },
        uColor1: { value: new THREE.Color(colors[0]) },
        uColor2: { value: new THREE.Color(colors[1]) },
        uColor3: { value: new THREE.Color(colors[2]) },
        uRotationSpeed: { value: rotationSpeed },
        uScale: { value: scale },
      },
      transparent: true,
    })
  }, [camera, viewportSize, shapeIndex, colors, rotationSpeed, scale])

  useFrame((state) => {
    if (materialRef.current && materialRef.current.uniforms) {
      if (materialRef.current.uniforms.uTime) materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
      if (materialRef.current.uniforms.uCameraPosition) materialRef.current.uniforms.uCameraPosition.value.copy(camera.position)
      if (materialRef.current.uniforms.uCameraMatrix) materialRef.current.uniforms.uCameraMatrix.value.copy(camera.matrixWorld)
      if (materialRef.current.uniforms.uResolution) materialRef.current.uniforms.uResolution.value.set(viewportSize.width, viewportSize.height)
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[size[0], size[1]]} />
      <primitive object={material} ref={materialRef} attach="material" />
    </mesh>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📤 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export default ProceduralSDF
