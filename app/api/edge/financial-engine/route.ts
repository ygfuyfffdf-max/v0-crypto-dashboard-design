import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;
    
    // Simulated Edge Processing
    const start = performance.now();
    
    let result;
    if (action === 'calculate_roi') {
      // In a real scenario, we might call the WASM module here if supported in Edge
      // Or perform lightweight logic
      result = payload.map((val: number) => val * 1.05); 
    } else {
      result = { error: 'Unknown action' };
    }

    const duration = performance.now() - start;
    
    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        latency: `${duration.toFixed(2)}ms`,
        region: req.geo?.region || 'global-edge',
        city: req.geo?.city || 'unknown'
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Edge processing failed' }, { status: 500 });
  }
}
