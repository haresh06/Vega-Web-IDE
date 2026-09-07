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

    // Map of all project files { "main.cpp": "...", "delay.c": "...", "delay.h": "..." }
    const projectFiles: Record<string, string> = {};

    if (body.files && typeof body.files === 'object') {
      for (const [fileName, fileObj] of Object.entries(body.files)) {
        projectFiles[fileName] = typeof fileObj === 'string' ? fileObj : (fileObj as { content?: string }).content || '';
      }
    }

    // Ensure active/provided code is in projectFiles if supplied
    if (typeof body.code === 'string' && body.code.trim()) {
      const activeName = body.activeFile || 'main.cpp';
      projectFiles[activeName] = body.code;
    } else if (typeof body.sourceCode === 'string' && body.sourceCode.trim()) {
      const activeName = body.activeFile || 'main.cpp';
      projectFiles[activeName] = body.sourceCode;
    }

    // If still empty, return error
    if (Object.keys(projectFiles).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No source code or project files provided.',
          phase: 'validation',
        },
        { status: 400 }
      );
    }

    // Identify main source file (main.cpp, main.c, sketch.ino, or first .c/.cpp)
    let mainKey =
      Object.keys(projectFiles).find(
        (k) => k === 'main.cpp' || k === 'main.c' || k === 'sketch.ino' || k === 'sketch.cpp'
      ) ||
      Object.keys(projectFiles).find((k) => k.endsWith('.cpp') || k.endsWith('.c')) ||
      Object.keys(projectFiles)[0];

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

    // Write all project files into the temporary build folder
    for (const [fileName, fileContent] of Object.entries(projectFiles)) {
      const sanitizedName = path.basename(fileName);
      let contentToWrite = fileContent;

      // For main sketch file, auto-inject #include <Arduino.h> if not already present
      if (
        (sanitizedName === mainKey || sanitizedName === 'main.cpp' || sanitizedName === 'main.c') &&
        !contentToWrite.includes('Arduino.h') &&
        !contentToWrite.includes('thejas32')
      ) {
        contentToWrite = `#include <Arduino.h>\n${contentToWrite}`;
      }

      await fs.writeFile(path.join(tmpDir, sanitizedName), contentToWrite, 'utf-8');
    }

    // ========================================================================
    // STEP 1: COMPILE ALL SOURCE FILES (.cpp, .c) TO OBJECT FILES (.o)
    // ========================================================================
    const sourceFiles = Object.keys(projectFiles).filter((name) => {
      const lower = name.toLowerCase();
      return lower.endsWith('.c') || lower.endsWith('.cpp') || lower.endsWith('.cc') || lower.endsWith('.cxx');
    });

    if (sourceFiles.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No compilable C/C++ source files found (.c, .cpp).',
          phase: 'compile',
        },
        { status: 400 }
      );
    }

    const compiledObjectFiles: string[] = [];
    const allCompileStdout: string[] = [];
    const allCompileStderr: string[] = [];

    for (const srcName of sourceFiles) {
      const sanitizedSrc = path.basename(srcName);
      const srcFullPath = path.join(tmpDir, sanitizedSrc);
      const objName = `${path.parse(sanitizedSrc).name}_${crypto.createHash('md5').update(sanitizedSrc).digest('hex').slice(0, 4)}.o`;
      const objFullPath = path.join(tmpDir, objName);

      const isCpp = srcName.toLowerCase().endsWith('.cpp') || srcName.toLowerCase().endsWith('.cc') || srcName.toLowerCase().endsWith('.cxx');
      const compilerExecutable = GXX_PATH;

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
        srcFullPath,
        '-o',
        objFullPath,
      ];

      const compileRes = await runCommand(compilerExecutable, compileArgs, tmpDir);

      if (compileRes.stdout) allCompileStdout.push(`[${sanitizedSrc}] ${compileRes.stdout}`);
      if (compileRes.stderr) allCompileStderr.push(`[${sanitizedSrc}] ${compileRes.stderr}`);

      if (compileRes.code !== 0) {
        return NextResponse.json(
          {
            success: false,
            phase: 'compile',
            error: `Compilation failed for file '${sanitizedSrc}'.`,
            stdout: allCompileStdout.join('\n'),
            stderr: allCompileStderr.join('\n') || compileRes.stderr,
          },
          { status: 422 }
        );
      }

      compiledObjectFiles.push(objFullPath);
    }

    // ========================================================================
    // STEP 2: LINK ALL OBJECT FILES WITH PRECOMPILED core.a & link1.lds (.o -> .elf)
    // ========================================================================
    const elfFile = path.join(tmpDir, 'firmware.elf');
    const binFile = path.join(tmpDir, 'firmware.bin');

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
      ...compiledObjectFiles,
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
          error: 'Linking failed with unresolved symbols or errors.',
          stdout: allCompileStdout.join('\n') + (linkRes.stdout ? `\n${linkRes.stdout}` : ''),
          stderr: allCompileStderr.join('\n') + (linkRes.stderr ? `\n${linkRes.stderr}` : ''),
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
      compiledFiles: sourceFiles,
      stdout: [...allCompileStdout, linkRes.stdout, sizeRes.stdout].filter(Boolean).join('\n'),
      stderr: [...allCompileStderr, linkRes.stderr].filter(Boolean).join('\n'),
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
