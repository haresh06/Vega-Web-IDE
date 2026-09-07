import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Server-side Compile Route
 * 
 * Note: VEGA compilation is designed to run locally on the client's machine via the
 * portable VEGA Lab Compiler helper at http://127.0.0.1:4000 to enable full offline
 * compilation without server-side toolchain dependencies.
 */
export async function GET() {
  return NextResponse.json({
    status: 'info',
    message: 'VEGA Web IDE uses the local compiler helper at http://127.0.0.1:4000 for RISC-V compilation.',
    localHelperUrl: 'http://127.0.0.1:4000',
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // If a request is received on the server route, proxy it to local helper or instruct client
    return NextResponse.json({
      success: false,
      error: 'Direct server compilation is deprecated. Please use the local VEGA compiler helper at http://127.0.0.1:4000.',
      phase: 'environment',
      helperUrl: 'http://127.0.0.1:4000',
    }, { status: 400 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: err.message || 'Invalid request',
    }, { status: 400 });
  }
}

