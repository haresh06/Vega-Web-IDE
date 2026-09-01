import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

// ============================================================================
// VEGA ARIES V2 TOOLCHAIN PATHS & CONFIGURATION
// ============================================================================
const TOOLCHAIN_BIN = path.join(
  'C:',
  'Users',
  'hares',
  'AppData',
  'Local',
  'Arduino15',
  'packages',
  'vega',
  'tools',
  'riscv32-vega-elf-gcc',
  '002',
  'bin'
);

const GXX_PATH = path.join(TOOLCHAIN_BIN, 'riscv32-vega-elf-g++.exe');
const GCC_PATH = path.join(TOOLCHAIN_BIN, 'riscv32-vega-elf-gcc.exe');
const OBJCOPY_PATH = path.join(TOOLCHAIN_BIN, 'riscv32-vega-elf-objcopy.exe');
const SIZE_PATH = path.join(TOOLCHAIN_BIN, 'riscv32-vega-elf-size.exe');

const VEGA_HARDWARE_ROOT = path.join(
  'C:',
  'Users',
  'hares',
  'AppData',
  'Local',
  'Arduino15',
  'packages',
  'vega',
  'hardware',
  'riscv',
  '1.1.2'
);

const INC_CORE = path.join(VEGA_HARDWARE_ROOT, 'cores', 'arduino');
const INC_VARIANT = path.join(VEGA_HARDWARE_ROOT, 'variants', 'standard');
const INC_SYSTEM = path.join(VEGA_HARDWARE_ROOT, 'system', 'include');
const INC_THEJAS = path.join(VEGA_HARDWARE_ROOT, 'thejas32', 'include');
const LINK_LDS = path.join(VEGA_HARDWARE_ROOT, 'thejas32', 'link1.lds');

// Precompiled Arduino VEGA core.a for aries_v2 + serialMethod
const PRECOMPILED_CORE_A = path.join(
  'C:',
  'Users',
  'hares',
  'AppData',
  'Local',
  'arduino',
  'cores',
  'vega_riscv_aries_v2_upload_method_serialMethod_596ff6b2d676ced13c26ec5ff9cef8d7',
  'core.a'
);

/**
 * Execute child process wrapped in a Promise
 */
function runCommand(
  cmd: string,
  args: string[],
  cwd: string,
  timeoutMs = 30000
): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve) => {
    execFile(
      cmd,
      args,
      { cwd, timeout: timeoutMs, windowsHide: true },
      (error, stdout, stderr) => {
        resolve({
          stdout: stdout || '',
          stderr: stderr || (error && error.message ? error.message : ''),
          code: error ? (typeof error.code === 'number' ? error.code : 1) : 0,
        });
      }
    );
  });
}

/**
 * Parse GNU size tool output (-B format)
 */
function parseSizeOutput(sizeRaw: string) {
  const lines = sizeRaw.trim().split('\n');
  if (lines.length >= 2) {
    const parts = lines[1].trim().split(/\s+/);
    if (parts.length >= 4) {
      return {
        text: parseInt(parts[0], 10) || 0,
        data: parseInt(parts[1], 10) || 0,
        bss: parseInt(parts[2], 10) || 0,
        total: parseInt(parts[3], 10) || 0,
        raw: sizeRaw.trim(),
      };
    }
  }
  return { text: 0, data: 0, bss: 0, total: 0, raw: sizeRaw.trim() };
}

export async function POST(req: NextRequest) {
  let tmpDir = '';

  try {
    const body = await req.json();

    // Source code extraction: supports string `code`, `sourceCode`, or `files` object map
    let sourceCode = '';
    const extraFiles: Record<string, string> = {};

    if (typeof body.sourceCode === 'string') {
      sourceCode = body.sourceCode;
    } else if (typeof body.code === 'string') {
      sourceCode = body.code;
    } else if (body.files && typeof body.files === 'object') {
      // Find main source file (main.cpp, main.c, sketch.ino, etc.)
      const mainKey =
        Object.keys(body.files).find(
          (k) => k === 'main.cpp' || k === 'main.c' || k === 'sketch.ino' || k.endsWith('.cpp') || k.endsWith('.c')
        ) || Object.keys(body.files)[0];

      if (mainKey) {
        const item = body.files[mainKey];
        sourceCode = typeof item === 'string' ? item : item.content || '';
      }

      // Collect any additional header or source files
      for (const [fileName, fileObj] of Object.entries(body.files)) {
        if (fileName !== mainKey) {
          extraFiles[fileName] = typeof fileObj === 'string' ? fileObj : (fileObj as { content?: string }).content || '';
        }
      }
    }

    if (!sourceCode.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'No source code provided in request body.',
          phase: 'validation',
        },
        { status: 400 }
      );
    }

    // Verify toolchain paths existence on host
    try {
      await fs.access(GXX_PATH);
      await fs.access(OBJCOPY_PATH);
      await fs.access(LINK_LDS);
      await fs.access(PRECOMPILED_CORE_A);
    } catch (err: unknown) {
      const accessErr = err as Error;
      return NextResponse.json(
        {
          success: false,
          error: `VEGA Toolchain or resource path missing on server: ${accessErr.message}`,
          phase: 'environment',
        },
        { status: 500 }
      );
    }

    // Create unique temporary workspace directory
    const uniqueId = `vega_build_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    tmpDir = path.join(os.tmpdir(), uniqueId);
    await fs.mkdir(tmpDir, { recursive: true });

    // Write main source file (sketch.cpp)
    const mainSrcFile = path.join(tmpDir, 'sketch.cpp');
    const mainObjFile = path.join(tmpDir, 'sketch.o');
    const elfFile = path.join(tmpDir, 'sketch.elf');
    const binFile = path.join(tmpDir, 'sketch.bin');

    // Auto-inject #include <Arduino.h> if not already present and using Arduino constructs
    let processedCode = sourceCode;
    if (!processedCode.includes('Arduino.h') && !processedCode.includes('thejas32')) {
      processedCode = `#include <Arduino.h>\n${processedCode}`;
    }

    await fs.writeFile(mainSrcFile, processedCode, 'utf-8');

    // Write any auxiliary header/source files into the temporary build folder
    for (const [extraName, extraContent] of Object.entries(extraFiles)) {
      const sanitizedName = path.basename(extraName);
      await fs.writeFile(path.join(tmpDir, sanitizedName), extraContent, 'utf-8');
    }

    // ========================================================================
    // STEP 1: COMPILE SOURCE TO OBJECT FILE (.cpp -> .o)
    // ========================================================================
    const compileArgs = [
      '-c',
      '-O3',
      '-march=rv32im',
      '-mabi=ilp32',
      '-fpeel-loops',
      '-ffunction-sections',
      '-fdata-sections',
      '-fpermissive',
      '-Wno-unused-function',
      '-Wno-unused-variable',
      '-Wno-comment',
      '-Wno-dangling-else',
      '-Wno-unused-but-set-variable',
      '-Wall',
      '-fno-rtti',
      '-fno-exceptions',
      '-DF_CPU=100000000L',
      '-DVEGA_ARIES_V2',
      '-DARDUINO=10819',
      `-I${INC_SYSTEM}`,
      `-I${INC_THEJAS}`,
      `-I${INC_CORE}`,
      `-I${INC_VARIANT}`,
      `-I${tmpDir}`,
      '-include',
      'sys/cdefs.h',
      '-g',
      mainSrcFile,
      '-o',
      mainObjFile,
    ];

    const compileRes = await runCommand(GXX_PATH, compileArgs, tmpDir);

    if (compileRes.code !== 0) {
      return NextResponse.json(
        {
          success: false,
          phase: 'compile',
          error: 'Compilation failed with errors.',
          stdout: compileRes.stdout,
          stderr: compileRes.stderr,
        },
        { status: 422 }
      );
    }

    // ========================================================================
    // STEP 2: LINK OBJECT FILE WITH PRECOMPILED core.a & link1.lds (.o -> .elf)
    // ========================================================================
    const linkArgs = [
      '-march=rv32im',
      '-mabi=ilp32',
      `-T${LINK_LDS}`,
      '-nostartfiles',
      '-Wl,-N',
      '-Wl,--gc-sections',
      '-Wl,--wrap=malloc',
      '-Wl,--wrap=free',
      '-Wl,--wrap=sbrk',
      mainObjFile,
      '-nostdlib',
      '-Wl,--start-group',
      PRECOMPILED_CORE_A,
      '-lm',
      '-lstdc++',
      '-lc',
      '-lgloss',
      '-Wl,--end-group',
      '-lgcc',
      '-o',
      elfFile,
    ];

    const linkRes = await runCommand(GXX_PATH, linkArgs, tmpDir);

    if (linkRes.code !== 0) {
      return NextResponse.json(
        {
          success: false,
          phase: 'link',
          error: 'Linking failed with errors.',
          stdout: compileRes.stdout + (linkRes.stdout ? `\n${linkRes.stdout}` : ''),
          stderr: linkRes.stderr,
        },
        { status: 422 }
      );
    }

    // ========================================================================
    // STEP 3: CONVERT ELF TO RAW BINARY (.elf -> .bin)
    // ========================================================================
    const objcopyArgs = ['-R', '.rel.dyn', '-O', 'binary', elfFile, binFile];
    const objcopyRes = await runCommand(OBJCOPY_PATH, objcopyArgs, tmpDir);

    if (objcopyRes.code !== 0) {
      return NextResponse.json(
        {
          success: false,
          phase: 'objcopy',
          error: 'Binary generation with objcopy failed.',
          stdout: objcopyRes.stdout,
          stderr: objcopyRes.stderr,
        },
        { status: 500 }
      );
    }

    // ========================================================================
    // STEP 4: CALCULATE FIRMWARE SIZE VIA riscv32-vega-elf-size
    // ========================================================================
    const sizeArgs = ['-B', elfFile];
    const sizeRes = await runCommand(SIZE_PATH, sizeArgs, tmpDir);
    const parsedSize = parseSizeOutput(sizeRes.stdout);

    // Read generated binary into base64
    const binBuffer = await fs.readFile(binFile);
    const binBase64 = binBuffer.toString('base64');
    const checksum = crypto.createHash('sha256').update(binBuffer).digest('hex').slice(0, 8).toUpperCase();

    return NextResponse.json({
      success: true,
      filename: 'VEGA_ARIES_v2_TEST.bin',
      target: 'VEGA ARIES v2 (THEJAS32)',
      toolchain: 'riscv32-vega-elf-g++ (VEGA GCC 10.1.0)',
      f_cpu: '100000000L',
      binarySize: binBuffer.length,
      binaryBase64: binBase64,
      checksum: checksum,
      size: parsedSize,
      stdout: [compileRes.stdout, linkRes.stdout, sizeRes.stdout].filter(Boolean).join('\n'),
      stderr: [compileRes.stderr, linkRes.stderr].filter(Boolean).join('\n'),
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        phase: 'server',
        error: `Unexpected server error: ${err.message || 'Unknown error'}`,
      },
      { status: 500 }
    );
  } finally {
    // Clean up temporary workspace directory
    if (tmpDir) {
      try {
        await fs.rm(tmpDir, { recursive: true, force: true });
      } catch {
        // Ignore temporary cleanup errors
      }
    }
  }
}
