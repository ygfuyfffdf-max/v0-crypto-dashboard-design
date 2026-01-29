// @ts-nocheck
/**
 * 🌐 WEBGL ORB SHADER — Custom WebGL Shader para el orb 3D
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * Shader personalizado con efectos de plasma, neón y distorsión
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import React, { useEffect, useRef } from 'react'

interface WebGLOrbProps {
  isActive: boolean
  intensity?: number
  colorScheme?: 'violet' | 'cyan' | 'rainbow'
}

export const WebGLOrb: React.FC<WebGLOrbProps> = ({
  isActive,
  intensity = 1,
  colorScheme = 'violet',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const timeRef = useRef(0)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!gl) {
      console.error('WebGL no soportado')
      return
    }

    // Ajustar tamaño del canvas
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Vertex shader
    const vertexShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `

    // Fragment shader con efectos avanzados
    const fragmentShaderSource = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform float intensity;
      uniform vec3 colorA;
      uniform vec3 colorB;
      uniform vec3 colorC;

      // Noise functions
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      // Plasma effect
      float plasma(vec2 uv, float t) {
        float a = sin(uv.x * 10.0 + t);
        float b = sin(uv.y * 10.0 + t * 1.2);
        float c = sin((uv.x + uv.y) * 10.0 + t * 1.5);
        float d = sin(length(uv - 0.5) * 20.0 + t * 2.0);
        return (a + b + c + d) / 4.0;
      }

      // Orb SDF
      float sphereSDF(vec2 uv, vec2 center, float radius) {
        return length(uv - center) - radius;
      }

      // Glow effect
      float glow(float d, float strength) {
        return exp(-d * d * strength);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec2 center = vec2(0.5, 0.5);

        // Crear efecto de distorsión
        float distortion = noise(uv * 5.0 + time * 0.1) * 0.05;
        uv += distortion;

        // Distancia al centro (orb)
        float dist = length(uv - center);
        float orbRadius = 0.25 * intensity;

        // Efectos de plasma
        float plasmaEffect = plasma(uv, time * 0.5);

        // Gradiente radial con plasma
        float radialGrad = 1.0 - smoothstep(0.0, orbRadius, dist);
        radialGrad += plasmaEffect * 0.3;

        // Crear múltiples capas de colores
        vec3 color = mix(colorA, colorB, radialGrad);
        color = mix(color, colorC, plasmaEffect * 0.5);

        // Glow effect alrededor del orb
        float glowEffect = glow(dist - orbRadius, 10.0);
        color += vec3(glowEffect) * colorB * intensity;

        // Efecto de pulso
        float pulse = sin(time * 2.0) * 0.1 + 0.9;
        color *= pulse;

        // Anillos concéntricos
        float rings = sin(dist * 30.0 - time * 5.0) * 0.5 + 0.5;
        color += vec3(rings * 0.1) * colorC;

        // Fade en los bordes
        float vignette = smoothstep(0.7, 0.3, dist);
        color *= vignette;

        // Alpha para transparencia
        float alpha = smoothstep(0.5, 0.0, dist - orbRadius * 1.5);

        gl_FragColor = vec4(color, alpha * 0.8);
      }
    `

    // Compilar shaders
    const compileShader = (source: string, type: number) => {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER)
    const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER)

    if (!vertexShader || !fragmentShader) return

    // Crear programa
    const program = gl.createProgram()
    if (!program) return

    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program))
      return
    }

    gl.useProgram(program)

    // Crear buffer de vértices (quad fullscreen)
    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    const positionLocation = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    // Obtener locations de uniforms
    const resolutionLocation = gl.getUniformLocation(program, 'resolution')
    const timeLocation = gl.getUniformLocation(program, 'time')
    const intensityLocation = gl.getUniformLocation(program, 'intensity')
    const colorALocation = gl.getUniformLocation(program, 'colorA')
    const colorBLocation = gl.getUniformLocation(program, 'colorB')
    const colorCLocation = gl.getUniformLocation(program, 'colorC')

    // Color schemes
    const colors = {
      violet: {
        a: [0.545, 0.361, 0.965], // #8b5cf6
        b: [0.925, 0.282, 0.6], // #ec4899
        c: [0.612, 0.153, 0.69], // #9c27b0
      },
      cyan: {
        a: [0.024, 0.714, 0.824], // #06b6d4
        b: [0.063, 0.725, 0.784], // #10b981
        c: [0.2, 0.8, 1.0], // cyan claro
      },
      rainbow: {
        a: [1.0, 0.0, 0.5],
        b: [0.0, 1.0, 0.5],
        c: [0.0, 0.5, 1.0],
      },
    }

    const scheme = colors[colorScheme]

    // Enable blending para transparencia
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    // Render loop
    const render = () => {
      if (!isActive) {
        animationRef.current = requestAnimationFrame(render)
        return
      }

      timeRef.current += 0.016 // ~60fps

      // Clear
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      // Set uniforms
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height)
      gl.uniform1f(timeLocation, timeRef.current)
      gl.uniform1f(intensityLocation, intensity)
      gl.uniform3fv(colorALocation, scheme.a)
      gl.uniform3fv(colorBLocation, scheme.b)
      gl.uniform3fv(colorCLocation, scheme.c)

      // Draw
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      animationRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', resizeCanvas)
      gl.deleteProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
      gl.deleteBuffer(buffer)
    }
  }, [isActive, intensity, colorScheme])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
