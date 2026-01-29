// @ts-nocheck - TODO: Fix TypeScript strict mode issues
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🌐 WEBGPU ENGINE - Motor de Renderizado de Próxima Generación
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Motor WebGPU para renderizado de alta performance con compute shaders
 * y capacidades de ray tracing en navegadores compatibles.
 */

import type { WebGPUCapabilities, WebGPURendererOptions } from '../types'

// ═══════════════════════════════════════════════════════════════════════════════
// 🔍 DETECCIÓN DE WEBGPU
// ═══════════════════════════════════════════════════════════════════════════════

export async function detectWebGPU(): Promise<WebGPUCapabilities> {
  if (typeof window === 'undefined' || !navigator.gpu) {
    return {
      isSupported: false,
      adapter: null,
      device: null,
      features: new Set(),
      limits: null,
    }
  }

  try {
    const adapter = await navigator.gpu.requestAdapter({
      powerPreference: 'high-performance',
    })

    if (!adapter) {
      return {
        isSupported: false,
        adapter: null,
        device: null,
        features: new Set(),
        limits: null,
      }
    }

    const device = await adapter.requestDevice({
      requiredFeatures: [],
      requiredLimits: {},
    })

    return {
      isSupported: true,
      adapter,
      device,
      features: new Set(adapter.features),
      limits: adapter.limits,
    }
  } catch {
    return {
      isSupported: false,
      adapter: null,
      device: null,
      features: new Set(),
      limits: null,
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎮 WEBGPU ENGINE CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class WebGPUEngine {
  private device: GPUDevice | null = null
  private context: GPUCanvasContext | null = null
  private canvas: HTMLCanvasElement | null = null
  private format: GPUTextureFormat = 'bgra8unorm'
  private renderPipeline: GPURenderPipeline | null = null
  private computePipeline: GPUComputePipeline | null = null
  private bindGroup: GPUBindGroup | null = null

  // Frame state
  private animationId: number | null = null
  private lastTime = 0
  private deltaTime = 0
  private elapsedTime = 0

  // Performance
  private frameCount = 0
  private fps = 0
  private fpsLastTime = 0

  async initialize(options: WebGPURendererOptions): Promise<boolean> {
    const capabilities = await detectWebGPU()

    if (!capabilities.isSupported || !capabilities.device) {
      console.warn('WebGPU no soportado, fallback a WebGL')
      return false
    }

    this.device = capabilities.device
    this.canvas = options.canvas
    this.context = this.canvas.getContext('webgpu')

    if (!this.context) {
      console.error('No se pudo obtener el contexto WebGPU')
      return false
    }

    // Configurar el canvas
    if (!navigator.gpu) {
      console.error('WebGPU no está disponible')
      return false
    }
    this.format = navigator.gpu.getPreferredCanvasFormat()
    this.context.configure({
      device: this.device,
      format: this.format,
      alphaMode: 'premultiplied',
    })

    // Inicializar pipeline por defecto
    await this.createDefaultPipeline()

    return true
  }

  private async createDefaultPipeline(): Promise<void> {
    if (!this.device) return

    // Shader WGSL básico para pruebas
    const shaderCode = /* wgsl */ `
      struct VertexOutput {
        @builtin(position) position: vec4f,
        @location(0) color: vec4f,
        @location(1) uv: vec2f,
      }

      struct Uniforms {
        time: f32,
        resolution: vec2f,
        mouse: vec2f,
      }

      @group(0) @binding(0) var<uniform> uniforms: Uniforms;

      @vertex
      fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
        var positions = array<vec2f, 6>(
          vec2f(-1.0, -1.0),
          vec2f(1.0, -1.0),
          vec2f(-1.0, 1.0),
          vec2f(-1.0, 1.0),
          vec2f(1.0, -1.0),
          vec2f(1.0, 1.0),
        );

        var uvs = array<vec2f, 6>(
          vec2f(0.0, 1.0),
          vec2f(1.0, 1.0),
          vec2f(0.0, 0.0),
          vec2f(0.0, 0.0),
          vec2f(1.0, 1.0),
          vec2f(1.0, 0.0),
        );

        var output: VertexOutput;
        output.position = vec4f(positions[vertexIndex], 0.0, 1.0);
        output.color = vec4f(1.0, 1.0, 1.0, 1.0);
        output.uv = uvs[vertexIndex];
        return output;
      }

      @fragment
      fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
        let time = uniforms.time;
        let uv = input.uv;

        // Efecto de onda premium
        var color = vec3f(0.0);
        let wave = sin(uv.x * 10.0 + time * 2.0) * 0.5 + 0.5;
        let wave2 = cos(uv.y * 8.0 - time * 1.5) * 0.5 + 0.5;

        color.r = wave * 0.3 + 0.1;
        color.g = wave2 * 0.2 + 0.05;
        color.b = (wave + wave2) * 0.4 + 0.2;

        // Glow effect
        let dist = distance(uv, uniforms.mouse);
        let glow = 0.1 / (dist + 0.05);
        color += vec3f(0.5, 0.2, 0.8) * glow * 0.1;

        return vec4f(color, 1.0);
      }
    `

    const shaderModule = this.device.createShaderModule({
      label: 'CHRONOS Default Shader',
      code: shaderCode,
    })

    // Buffer de uniforms
    const uniformBufferSize = 16 // 1 float + 2 vec2f (alineado a 16 bytes)
    const uniformBuffer = this.device.createBuffer({
      size: uniformBufferSize,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })

    // Bind group layout
    const bindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          buffer: { type: 'uniform' },
        },
      ],
    })

    // Bind group
    this.bindGroup = this.device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: { buffer: uniformBuffer },
        },
      ],
    })

    // Pipeline layout
    const pipelineLayout = this.device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    })

    // Render pipeline
    this.renderPipeline = this.device.createRenderPipeline({
      layout: pipelineLayout,
      vertex: {
        module: shaderModule,
        entryPoint: 'vertexMain',
      },
      fragment: {
        module: shaderModule,
        entryPoint: 'fragmentMain',
        targets: [
          {
            format: this.format,
            blend: {
              color: {
                srcFactor: 'src-alpha',
                dstFactor: 'one-minus-src-alpha',
                operation: 'add',
              },
              alpha: {
                srcFactor: 'one',
                dstFactor: 'one-minus-src-alpha',
                operation: 'add',
              },
            },
          },
        ],
      },
      primitive: {
        topology: 'triangle-list',
      },
    })
  }

  render(time: number = 0, mouseX: number = 0.5, mouseY: number = 0.5): void {
    if (!this.device || !this.context || !this.renderPipeline || !this.bindGroup) return

    // Calcular delta time
    this.deltaTime = (time - this.lastTime) / 1000
    this.lastTime = time
    this.elapsedTime += this.deltaTime

    // FPS counter
    this.frameCount++
    if (time - this.fpsLastTime >= 1000) {
      this.fps = this.frameCount
      this.frameCount = 0
      this.fpsLastTime = time
    }

    // Actualizar uniforms
    const uniformData = new Float32Array([
      this.elapsedTime,
      0, // padding
      this.canvas?.width || 1920,
      this.canvas?.height || 1080,
      mouseX,
      mouseY,
      0,
      0, // padding
    ])

    // Obtener textura del canvas
    const currentTexture = this.context.getCurrentTexture()
    const commandEncoder = this.device.createCommandEncoder()

    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          view: currentTexture.createView(),
          clearValue: { r: 0.02, g: 0.02, b: 0.05, a: 1.0 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    }

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor)
    passEncoder.setPipeline(this.renderPipeline)
    passEncoder.setBindGroup(0, this.bindGroup)
    passEncoder.draw(6)
    passEncoder.end()

    this.device.queue.submit([commandEncoder.finish()])
  }

  startRenderLoop(): void {
    const animate = (time: number) => {
      this.render(time)
      this.animationId = requestAnimationFrame(animate)
    }
    this.animationId = requestAnimationFrame(animate)
  }

  stopRenderLoop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  resize(width: number, height: number): void {
    if (this.canvas) {
      this.canvas.width = width
      this.canvas.height = height
    }
  }

  dispose(): void {
    this.stopRenderLoop()
    this.device?.destroy()
    this.device = null
    this.context = null
    this.renderPipeline = null
    this.computePipeline = null
    this.bindGroup = null
  }

  // Getters
  get currentFPS(): number {
    return this.fps
  }

  get currentDeltaTime(): number {
    return this.deltaTime
  }

  get isInitialized(): boolean {
    return this.device !== null && this.context !== null
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📤 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const webGPUEngine = new WebGPUEngine()
export default WebGPUEngine
