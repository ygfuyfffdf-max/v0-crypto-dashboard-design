/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎨 CHRONOS 2026 — ULTRA POST-PROCESSING EFFECTS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de post-procesamiento cinematográfico con:
 * - HBAO+ Custom (32 samples, multi-bounce)
 * - SSAO cuántico con profundidad
 * - Bloom cinematográfico
 * - Chromatic aberration
 * - Film grain premium
 * - Vignette dinámico
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { useThree } from '@react-three/fiber'
import {
  Bloom,
  ChromaticAberration,
  DepthOfField,
  Noise,
  SMAA,
  ToneMapping,
  Vignette,
} from '@react-three/postprocessing'
import { BlendFunction, Effect, KernelSize, SMAAPreset, ToneMappingMode } from 'postprocessing'
import { useMemo } from 'react'
import * as THREE from 'three'
import { SafeEffectComposer } from '@/app/_components/chronos-2026/3d/effects/SafeEffectComposer'

// ═══════════════════════════════════════════════════════════════════════════════
// HBAO+ CUSTOM EFFECT
// ═══════════════════════════════════════════════════════════════════════════════

const HBAOFragmentShader = /* glsl */ `
  uniform sampler2D tDepth;
  uniform sampler2D tNormal;
  uniform float aoRadius;
  uniform float aoIntensity;
  uniform float aoBias;
  uniform float aoFalloff;
  uniform int aoSamples;
  uniform float aoMultiBounce;
  uniform vec3 aoColor;
  uniform float cameraNear;
  uniform float cameraFar;
  uniform vec2 resolution;
  uniform float time;

  const float PI = 3.14159265359;
  const float TWO_PI = 6.28318530718;

  // 32 Poisson disk samples
  const vec2 poissonDisk[32] = vec2[32](
    vec2(-0.94201624, -0.39906216),
    vec2(0.94558609, -0.76890725),
    vec2(-0.094184101, -0.92938870),
    vec2(0.34495938, 0.29387760),
    vec2(-0.91588581, 0.45771432),
    vec2(-0.81544232, -0.87912464),
    vec2(-0.38277543, 0.27676845),
    vec2(0.97484398, 0.75648379),
    vec2(0.44323325, -0.97511554),
    vec2(0.53742981, -0.47373420),
    vec2(-0.26496911, -0.41893023),
    vec2(0.79197514, 0.19090188),
    vec2(-0.24188840, 0.99706507),
    vec2(-0.81409955, 0.91437590),
    vec2(0.19984126, 0.78641367),
    vec2(0.14383161, -0.14100790),
    vec2(-0.44451171, -0.78019903),
    vec2(0.69659925, 0.57659589),
    vec2(-0.57110559, 0.71572578),
    vec2(0.35510920, 0.93263537),
    vec2(-0.72444338, -0.27720070),
    vec2(0.80543941, -0.22033986),
    vec2(-0.15171504, 0.56879872),
    vec2(-0.59504920, -0.10660980),
    vec2(0.07599921, 0.39338917),
    vec2(0.52460110, 0.10695580),
    vec2(-0.32707792, 0.13486947),
    vec2(0.91680853, 0.38930209),
    vec2(-0.03894350, -0.64849061),
    vec2(0.67267892, -0.70470667),
    vec2(-0.91696411, 0.08429023),
    vec2(0.27408555, -0.30634899)
  );

  float linearizeDepth(float depth) {
    float z = depth * 2.0 - 1.0;
    return (2.0 * cameraNear * cameraFar) / (cameraFar + cameraNear - z * (cameraFar - cameraNear));
  }

  vec3 getViewPos(vec2 uv) {
    float depth = texture2D(tDepth, uv).x;
    float linearDepth = linearizeDepth(depth);
    vec2 ndc = uv * 2.0 - 1.0;
    float aspect = resolution.x / resolution.y;
    return vec3(ndc.x * aspect * linearDepth, ndc.y * linearDepth, -linearDepth);
  }

  vec3 multiBounce(float ao, vec3 albedo) {
    vec3 a = 2.0404 * albedo - 0.3324;
    vec3 b = -4.7951 * albedo + 0.6417;
    vec3 c = 2.7552 * albedo + 0.6903;
    float x = ao;
    return max(vec3(ao), ((x * a + b) * x + c) * x);
  }

  float horizonOcclusion(vec3 viewPos, vec3 viewNormal, vec2 uv) {
    float occlusion = 0.0;
    float radius = aoRadius;

    float rotationAngle = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453) * TWO_PI;
    float c = cos(rotationAngle);
    float s = sin(rotationAngle);
    mat2 rotation = mat2(c, -s, s, c);

    for (int i = 0; i < 32; i++) {
      if (i >= aoSamples) break;

      vec2 sampleDir = rotation * poissonDisk[i];
      vec2 sampleUV = uv + sampleDir * (radius / resolution);

      vec3 samplePos = getViewPos(sampleUV);
      vec3 sampleVec = samplePos - viewPos;

      float sampleDist = length(sampleVec);
      vec3 sampleDir3D = sampleVec / sampleDist;

      float cosHorizon = dot(viewNormal, sampleDir3D);
      float falloff = 1.0 - smoothstep(0.0, aoRadius, sampleDist);
      falloff *= falloff;

      float contribution = max(0.0, cosHorizon - aoBias) * falloff;
      occlusion += contribution;
    }

    return 1.0 - (occlusion / float(aoSamples)) * aoIntensity;
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec3 viewPos = getViewPos(uv);
    vec3 normal = texture2D(tNormal, uv).xyz * 2.0 - 1.0;

    float ao = horizonOcclusion(viewPos, normal, uv);

    float depth = length(viewPos);
    ao = mix(ao, 1.0, smoothstep(aoFalloff * 0.5, aoFalloff, depth));

    vec3 aoMulti = multiBounce(ao, inputColor.rgb);
    vec3 finalColor = inputColor.rgb * mix(vec3(ao), aoMulti, aoMultiBounce);
    finalColor = mix(finalColor, finalColor * aoColor, (1.0 - ao) * 0.3);

    outputColor = vec4(finalColor, inputColor.a);
  }
`

class HBAOEffect extends Effect {
  constructor({
    radius = 0.5,
    intensity = 1.0,
    bias = 0.025,
    falloff = 100.0,
    samples = 32,
    multiBounce = 0.5,
    color = new THREE.Color(0.8, 0.8, 1.0),
    cameraNear = 0.1,
    cameraFar = 1000,
    resolution = new THREE.Vector2(1920, 1080),
  } = {}) {
    super('HBAOEffect', HBAOFragmentShader, {
      blendFunction: BlendFunction.MULTIPLY,
      uniforms: new Map<string, THREE.Uniform<unknown>>([
        ['tDepth', new THREE.Uniform(null)],
        ['tNormal', new THREE.Uniform(null)],
        ['aoRadius', new THREE.Uniform(radius)],
        ['aoIntensity', new THREE.Uniform(intensity)],
        ['aoBias', new THREE.Uniform(bias)],
        ['aoFalloff', new THREE.Uniform(falloff)],
        ['aoSamples', new THREE.Uniform(samples)],
        ['aoMultiBounce', new THREE.Uniform(multiBounce)],
        ['aoColor', new THREE.Uniform(color)],
        ['cameraNear', new THREE.Uniform(cameraNear)],
        ['cameraFar', new THREE.Uniform(cameraFar)],
        ['resolution', new THREE.Uniform(resolution)],
        ['time', new THREE.Uniform(0)],
      ]),
    })
  }

  update(_renderer: THREE.WebGLRenderer, _inputBuffer: THREE.WebGLRenderTarget, deltaTime: number) {
    const time = this.uniforms.get('time')
    if (time) {
      time.value += deltaTime
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUANTUM DEPTH EFFECT
// ═══════════════════════════════════════════════════════════════════════════════

const QuantumDepthFragmentShader = /* glsl */ `
  uniform float intensity;
  uniform float time;
  uniform vec3 nearColor;
  uniform vec3 farColor;
  uniform float waveFrequency;
  uniform float waveAmplitude;

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    // Quantum wave interference pattern
    float wave1 = sin(uv.x * waveFrequency + time) * waveAmplitude;
    float wave2 = cos(uv.y * waveFrequency * 0.7 + time * 1.3) * waveAmplitude;
    float wave3 = sin((uv.x + uv.y) * waveFrequency * 0.5 + time * 0.8) * waveAmplitude;

    float interference = (wave1 + wave2 + wave3) / 3.0;

    // Apply quantum depth color shift
    vec3 depthColor = mix(nearColor, farColor, interference + 0.5);
    vec3 finalColor = mix(inputColor.rgb, inputColor.rgb * depthColor, intensity);

    outputColor = vec4(finalColor, inputColor.a);
  }
`

class QuantumDepthEffect extends Effect {
  constructor({
    intensity = 0.1,
    nearColor = new THREE.Color(0.9, 0.95, 1.0),
    farColor = new THREE.Color(0.7, 0.8, 1.0),
    waveFrequency = 10.0,
    waveAmplitude = 0.02,
  } = {}) {
    super('QuantumDepthEffect', QuantumDepthFragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, THREE.Uniform<number | THREE.Color>>([
        ['intensity', new THREE.Uniform(intensity)],
        ['time', new THREE.Uniform(0)],
        ['nearColor', new THREE.Uniform(nearColor)],
        ['farColor', new THREE.Uniform(farColor)],
        ['waveFrequency', new THREE.Uniform(waveFrequency)],
        ['waveAmplitude', new THREE.Uniform(waveAmplitude)],
      ]) as Map<string, THREE.Uniform<number>>,
    })
  }

  update(_renderer: THREE.WebGLRenderer, _inputBuffer: THREE.WebGLRenderTarget, deltaTime: number) {
    const time = this.uniforms.get('time')
    if (time) {
      time.value += deltaTime
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FILM GRAIN PREMIUM
// ═══════════════════════════════════════════════════════════════════════════════

const FilmGrainFragmentShader = /* glsl */ `
  uniform float intensity;
  uniform float time;
  uniform float response;
  uniform float lumAmount;

  float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 uvRandom = uv;
    uvRandom.y *= rand(vec2(uvRandom.y, time));

    float grain = rand(uvRandom) - 0.5;

    // Luminance-based grain response
    float lum = dot(inputColor.rgb, vec3(0.299, 0.587, 0.114));
    float grainAmount = mix(intensity, intensity * 0.5, lum * lumAmount);

    grain *= grainAmount * response;

    vec3 finalColor = inputColor.rgb + vec3(grain);

    outputColor = vec4(finalColor, inputColor.a);
  }
`

class FilmGrainEffect extends Effect {
  constructor({ intensity = 0.05, response = 1.0, lumAmount = 0.5 } = {}) {
    super('FilmGrainEffect', FilmGrainFragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map([
        ['intensity', new THREE.Uniform(intensity)],
        ['time', new THREE.Uniform(0)],
        ['response', new THREE.Uniform(response)],
        ['lumAmount', new THREE.Uniform(lumAmount)],
      ]),
    })
  }

  update(_renderer: THREE.WebGLRenderer, _inputBuffer: THREE.WebGLRenderTarget, deltaTime: number) {
    const time = this.uniforms.get('time')
    if (time) {
      time.value += deltaTime
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHRONOS POST-PROCESSING COMPOSER
// ═══════════════════════════════════════════════════════════════════════════════

export interface ChronosPostProcessingProps {
  enabled?: boolean
  quality?: 'low' | 'medium' | 'high' | 'ultra'
  bloom?: {
    enabled?: boolean
    intensity?: number
    luminanceThreshold?: number
    luminanceSmoothing?: number
  }
  hbao?: {
    enabled?: boolean
    radius?: number
    intensity?: number
    samples?: number
  }
  chromatic?: {
    enabled?: boolean
    offset?: number
  }
  vignette?: {
    enabled?: boolean
    darkness?: number
    offset?: number
  }
  filmGrain?: {
    enabled?: boolean
    intensity?: number
  }
  quantumDepth?: {
    enabled?: boolean
    intensity?: number
  }
  dof?: {
    enabled?: boolean
    focusDistance?: number
    focalLength?: number
    bokehScale?: number
  }
}

export function ChronosPostProcessing({
  enabled = true,
  quality = 'high',
  bloom = { enabled: true, intensity: 0.5, luminanceThreshold: 0.8, luminanceSmoothing: 0.3 },
  hbao = { enabled: true, radius: 0.5, intensity: 1.0, samples: 32 },
  chromatic = { enabled: true, offset: 0.001 },
  vignette = { enabled: true, darkness: 0.4, offset: 0.3 },
  filmGrain = { enabled: true, intensity: 0.03 },
  quantumDepth = { enabled: false, intensity: 0.05 },
  dof = { enabled: false, focusDistance: 0.01, focalLength: 0.02, bokehScale: 2 },
}: ChronosPostProcessingProps) {
  const { size, camera, gl, scene } = useThree()

  // Quality presets
  const qualitySettings = useMemo(() => {
    switch (quality) {
      case 'low':
        return { samples: 8, bloomKernel: KernelSize.SMALL }
      case 'medium':
        return { samples: 16, bloomKernel: KernelSize.MEDIUM }
      case 'high':
        return { samples: 24, bloomKernel: KernelSize.LARGE }
      case 'ultra':
        return { samples: 32, bloomKernel: KernelSize.HUGE }
    }
  }, [quality])

  // Create effects
  const hbaoEffect = useMemo(() => {
    if (!hbao.enabled) return null
    return new HBAOEffect({
      radius: hbao.radius,
      intensity: hbao.intensity,
      samples: Math.min(hbao.samples || 32, qualitySettings.samples),
      cameraNear: (camera as THREE.PerspectiveCamera).near,
      cameraFar: (camera as THREE.PerspectiveCamera).far,
      resolution: new THREE.Vector2(size.width, size.height),
    })
  }, [hbao, qualitySettings, camera, size])

  const quantumEffect = useMemo(() => {
    if (!quantumDepth.enabled) return null
    return new QuantumDepthEffect({
      intensity: quantumDepth.intensity,
    })
  }, [quantumDepth])

  const filmGrainEffect = useMemo(() => {
    if (!filmGrain.enabled) return null
    return new FilmGrainEffect({
      intensity: filmGrain.intensity,
    })
  }, [filmGrain])

  if (!enabled || !gl || !scene || !camera) return null

  return (
    <SafeEffectComposer multisampling={quality === 'ultra' ? 8 : quality === 'high' ? 4 : 0}>
      <SMAA preset={SMAAPreset.HIGH} />

      <Bloom
        intensity={bloom.enabled ? bloom.intensity : 0}
        luminanceThreshold={bloom.luminanceThreshold}
        luminanceSmoothing={bloom.luminanceSmoothing}
        kernelSize={qualitySettings.bloomKernel}
        mipmapBlur
      />

      <DepthOfField
        focusDistance={dof.enabled ? dof.focusDistance : 0}
        focalLength={dof.enabled ? dof.focalLength : 0}
        bokehScale={dof.enabled ? dof.bokehScale : 0}
      />

      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={
          new THREE.Vector2(
            chromatic.enabled ? chromatic.offset : 0,
            chromatic.enabled ? chromatic.offset : 0,
          )
        }
        radialModulation={false}
        modulationOffset={0}
      />

      <Vignette
        darkness={vignette.enabled ? vignette.darkness : 0}
        offset={vignette.enabled ? vignette.offset : 0}
        blendFunction={BlendFunction.NORMAL}
      />

      {filmGrainEffect ? <primitive object={filmGrainEffect} /> : <></>}
      {quantumEffect ? <primitive object={quantumEffect} /> : <></>}
      {hbaoEffect ? <primitive object={hbaoEffect} /> : <></>}

      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />

      <Noise opacity={0.02} blendFunction={BlendFunction.OVERLAY} />
    </SafeEffectComposer>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CINEMATIC TRANSITION EFFECT
// ═══════════════════════════════════════════════════════════════════════════════

const CinematicTransitionFragmentShader = /* glsl */ `
  uniform float progress;
  uniform int transitionType;
  uniform vec3 color;
  uniform float time;

  float easeInOutCubic(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    float p = easeInOutCubic(progress);
    vec3 finalColor = inputColor.rgb;
    float alpha = 1.0;

    if (transitionType == 0) {
      // Fade to black
      finalColor = mix(inputColor.rgb, color, p);
    } else if (transitionType == 1) {
      // Radial wipe
      float dist = distance(uv, vec2(0.5));
      float wipe = smoothstep(p * 1.5 - 0.5, p * 1.5, dist);
      finalColor = mix(color, inputColor.rgb, wipe);
    } else if (transitionType == 2) {
      // Pixelate
      float pixelSize = mix(1.0, 100.0, p);
      vec2 pixelUV = floor(uv * pixelSize) / pixelSize;
      finalColor = mix(inputColor.rgb, color, p);
    } else if (transitionType == 3) {
      // Glitch
      float glitch = sin(uv.y * 100.0 + time * 10.0) * 0.5 + 0.5;
      float glitchStrength = p * glitch;
      vec2 glitchOffset = vec2(glitchStrength * 0.1, 0.0);
      finalColor = mix(inputColor.rgb, color, glitchStrength);
    }

    outputColor = vec4(finalColor, alpha);
  }
`

class CinematicTransitionEffect extends Effect {
  constructor() {
    super('CinematicTransitionEffect', CinematicTransitionFragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, THREE.Uniform<number | THREE.Color>>([
        ['progress', new THREE.Uniform(0)],
        ['transitionType', new THREE.Uniform(0)],
        ['color', new THREE.Uniform(new THREE.Color(0, 0, 0))],
        ['time', new THREE.Uniform(0)],
      ]) as Map<string, THREE.Uniform<number>>,
    })
  }

  setProgress(value: number) {
    const progress = this.uniforms.get('progress')
    if (progress) progress.value = value
  }

  setTransitionType(type: number) {
    const transitionType = this.uniforms.get('transitionType')
    if (transitionType) transitionType.value = type
  }

  setColor(color: THREE.Color) {
    const colorUniform = this.uniforms.get('color')
    if (colorUniform) colorUniform.value = color
  }

  update(_renderer: THREE.WebGLRenderer, _inputBuffer: THREE.WebGLRenderTarget, deltaTime: number) {
    const time = this.uniforms.get('time')
    if (time) time.value += deltaTime
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export { CinematicTransitionEffect, FilmGrainEffect, HBAOEffect, QuantumDepthEffect }
export default ChronosPostProcessing
