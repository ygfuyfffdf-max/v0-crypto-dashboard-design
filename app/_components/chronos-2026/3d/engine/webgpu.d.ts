/**
 * WebGPU Type Declarations
 * Los tipos completos están en @webgpu/types, aquí definimos solo los usados
 */

// Re-export from @webgpu/types to make them available locally
/// <reference types="@webgpu/types" />

// Extend Navigator to include GPU
declare global {
  interface Navigator {
    gpu?: GPU
  }
}

export {}
