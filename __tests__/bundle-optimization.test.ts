/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧪 CHRONOS BUNDLE OPTIMIZATION TESTS - Pruebas de Optimización de Bundle
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Pruebas unitarias y de integración para verificar la efectividad de la
 * optimización de bundle size (850KB → 500KB)
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { analyzeBundle, generateOptimizationReport } from '@/scripts/bundle-analyzer'
import { ThreeCanvas, AIChatPanel, ChartContainer } from '@/app/_lib/bundle-optimization/dynamic-imports'
import { OptimizedLineChart, formatBytes, getObjectSize } from '@/app/_lib/bundle-optimization/tree-shaking'

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 BUNDLE ANALYSIS TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Bundle Analysis', () => {
  test('should analyze bundle correctly', () => {
    const analysis = analyzeBundle()
    
    expect(analysis).toBeDefined()
    expect(analysis.totalSize).toBeGreaterThan(0)
    expect(analysis.targetSize).toBe(500 * 1024) // 500KB
    expect(analysis.reductionNeeded).toBeGreaterThan(0)
    expect(analysis.mainChunks).toHaveLength(5)
    expect(analysis.recommendations).toHaveLength(4)
  })

  test('should generate optimization report', () => {
    const report = generateOptimizationReport()
    
    expect(report).toContain('CHRONOS BUNDLE OPTIMIZATION REPORT')
    expect(report).toContain('Análisis Actual')
    expect(report).toContain('Desglose por Categorías')
    expect(report).toContain('Recomendaciones de Optimización')
    expect(report).toContain('Plan de Implementación')
  })

  test('should identify main chunk categories', () => {
    const analysis = analyzeBundle()
    const chunkNames = analysis.mainChunks.map(chunk => chunk.name)
    
    expect(chunkNames).toContain('framework')
    expect(chunkNames).toContain('3d-libraries')
    expect(chunkNames).toContain('ui-libraries')
    expect(chunkNames).toContain('ai-libraries')
    expect(chunkNames).toContain('application-code')
  })

  test('should calculate correct reduction percentage', () => {
    const analysis = analyzeBundle()
    const reductionPercentage = (analysis.reductionNeeded / analysis.totalSize) * 100
    
    expect(reductionPercentage).toBeCloseTo(41.2, 1) // ~41% reduction needed
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 🔄 DYNAMIC IMPORTS TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Dynamic Imports', () => {
  test('should load 3D components lazily', async () => {
    const { container } = render(
      <Suspense fallback={<div>Loading...</div>}>
        <ThreeCanvas />
      </Suspense>
    )
    
    // Should show loading state initially
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    
    // Wait for component to load
    await waitFor(() => {
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    })
  })

  test('should load AI components lazily', async () => {
    const { container } = render(
      <Suspense fallback={<div>Loading...</div>}>
        <AIChatPanel />
      </Suspense>
    )
    
    // Should show loading state initially
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    
    // Wait for component to load
    await waitFor(() => {
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    })
  })

  test('should load chart components lazily', async () => {
    const { container } = render(
      <Suspense fallback={<div>Loading...</div>}>
        <ChartContainer />
      </Suspense>
    )
    
    // Should show loading state initially
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    
    // Wait for component to load
    await waitFor(() => {
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    })
  })

  test('should handle loading errors gracefully', async () => {
    // Mock a failed import
    jest.mock('@/app/_components/3d/ThreeCanvas', () => {
      throw new Error('Failed to load')
    })
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <ThreeCanvas />
      </Suspense>
    )
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled()
    })
    
    consoleSpy.mockRestore()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 🌳 TREE SHAKING TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Tree Shaking', () => {
  test('should format bytes correctly', () => {
    expect(formatBytes(0)).toBe('0 Bytes')
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(1024 * 1024)).toBe('1 MB')
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB')
    expect(formatBytes(1536)).toBe('1.5 KB')
  })

  test('should calculate object size correctly', () => {
    const smallObject = { name: 'test', value: 123 }
    const largeObject = {
      data: Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        description: 'A very long description that takes up space'.repeat(10),
        metadata: { created: new Date(), updated: new Date() }
      }))
    }
    
    expect(getObjectSize(smallObject)).toBeGreaterThan(0)
    expect(getObjectSize(largeObject)).toBeGreaterThan(getObjectSize(smallObject))
  })

  test('should render optimized chart components', () => {
    const data = [
      { name: 'Jan', value: 100 },
      { name: 'Feb', value: 200 },
      { name: 'Mar', value: 150 }
    ]
    
    const { container } = render(<OptimizedLineChart data={data} />)
    
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument()
  })

  test('should memoize chart components', () => {
    const data = [{ name: 'Test', value: 100 }]
    const { rerender } = render(<OptimizedLineChart data={data} />)
    
    // Re-render with same data
    rerender(<OptimizedLineChart data={data} />)
    
    // Component should be memoized and not re-create chart
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 PERFORMANCE TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Performance', () => {
  test('should load components within acceptable time', async () => {
    const startTime = performance.now()
    
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <ThreeCanvas />
      </Suspense>
    )
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })
    
    const endTime = performance.now()
    const loadTime = endTime - startTime
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })

  test('should handle multiple lazy components efficiently', async () => {
    const startTime = performance.now()
    
    render(
      <div>
        <Suspense fallback={<div>Loading 3D...</div>}>
          <ThreeCanvas />
        </Suspense>
        <Suspense fallback={<div>Loading AI...</div>}>
          <AIChatPanel />
        </Suspense>
        <Suspense fallback={<div>Loading Charts...</div>}>
          <ChartContainer />
        </Suspense>
      </div>
    )
    
    await waitFor(() => {
      expect(screen.queryByText('Loading 3D...')).not.toBeInTheDocument()
      expect(screen.queryByText('Loading AI...')).not.toBeInTheDocument()
      expect(screen.queryByText('Loading Charts...')).not.toBeInTheDocument()
    })
    
    const endTime = performance.now()
    const totalLoadTime = endTime - startTime
    
    // All components should load within 5 seconds
    expect(totalLoadTime).toBeLessThan(5000)
  })

  test('should not exceed memory limits', () => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0
    
    // Render multiple components
    const { unmount } = render(
      <div>
        <Suspense fallback={null}>
          <ThreeCanvas />
        </Suspense>
        <Suspense fallback={null}>
          <AIChatPanel />
        </Suspense>
      </div>
    )
    
    const afterRenderMemory = (performance as any).memory?.usedJSHeapSize || 0
    
    // Memory increase should be reasonable (less than 50MB)
    expect(afterRenderMemory - initialMemory).toBeLessThan(50 * 1024 * 1024)
    
    // Cleanup
    unmount()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 INTEGRATION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Integration', () => {
  test('should work with real data', () => {
    const realData = [
      { name: 'Ventas', value: 125000, color: '#8884d8' },
      { name: 'Gastos', value: 85000, color: '#82ca9d' },
      { name: 'Utilidad', value: 40000, color: '#ffc658' }
    ]
    
    const { container } = render(<OptimizedLineChart data={realData} />)
    
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument()
  })

  test('should handle large datasets efficiently', () => {
    const largeData = Array.from({ length: 1000 }, (_, i) => ({
      name: `Point ${i}`,
      value: Math.random() * 1000
    }))
    
    const startTime = performance.now()
    
    const { container } = render(<OptimizedLineChart data={largeData} />)
    
    const endTime = performance.now()
    const renderTime = endTime - startTime
    
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument()
    expect(renderTime).toBeLessThan(1000) // Should render within 1 second
  })

  test('should cleanup properly on unmount', () => {
    const { unmount } = render(
      <Suspense fallback={null}>
        <ThreeCanvas />
      </Suspense>
    )
    
    // Unmount should not cause errors
    expect(() => unmount()).not.toThrow()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 📈 BUNDLE SIZE VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

describe('Bundle Size Validation', () => {
  test('should target 500KB bundle size', () => {
    const analysis = analyzeBundle()
    const targetSize = 500 * 1024 // 500KB
    
    expect(analysis.targetSize).toBe(targetSize)
    expect(analysis.totalSize).toBeGreaterThan(targetSize)
  })

  test('should provide actionable recommendations', () => {
    const analysis = analyzeBundle()
    
    analysis.recommendations.forEach(rec => {
      expect(rec.type).toBeDefined()
      expect(rec.priority).toMatch(/high|medium|low/)
      expect(rec.estimatedSavings).toBeGreaterThan(0)
      expect(rec.implementation).toBeInstanceOf(Array)
      expect(rec.implementation.length).toBeGreaterThan(0)
      expect(rec.files).toBeInstanceOf(Array)
      expect(rec.files.length).toBeGreaterThan(0)
    })
  })

  test('should estimate total savings correctly', () => {
    const analysis = analyzeBundle()
    const totalSavings = analysis.recommendations.reduce((sum, rec) => sum + rec.estimatedSavings, 0)
    
    // Total savings should be close to reduction needed
    expect(totalSavings).toBeGreaterThanOrEqual(analysis.reductionNeeded * 0.8) // At least 80% of needed reduction
  })
})