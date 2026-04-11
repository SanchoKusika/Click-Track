#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const { existsSync, readFileSync } = require('node:fs');
const { spawnSync } = require('node:child_process');
const { dirname, join, resolve } = require('node:path');
const { createRequire } = require('node:module');

const frontendRoot = resolve(__dirname, '..');

function fail(message) {
  process.stderr.write(`[gen:api] ${message}\n`);
  process.stderr.write(
    '[gen:api] Recovery: reinstall dependencies from repo root (`npm ci`) and rerun `npm run gen:api --workspace frontend`.\n'
  );
  process.exit(1);
}

function findPackageRoot(startFilePath) {
  let currentDir = dirname(startFilePath);
  while (true) {
    const packagePath = join(currentDir, 'package.json');
    if (existsSync(packagePath)) {
      return packagePath;
    }
    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) {
      return null;
    }
    currentDir = parentDir;
  }
}

let esbuildPackagePath = '';
let esbuildBinaryPath = '';
let expectedVersion = '';
let orvalEntrypointPath = '';
try {
  const frontendRequire = createRequire(join(frontendRoot, 'package.json'));
  const orvalEntryPath = frontendRequire.resolve('orval');
  const orvalPackagePath = findPackageRoot(orvalEntryPath);
  if (!orvalPackagePath) {
    fail(`Cannot find package root for ${orvalEntryPath}`);
  }
  const orvalPackageJson = JSON.parse(readFileSync(orvalPackagePath, 'utf8'));
  const orvalCoreEntryPath = frontendRequire.resolve('@orval/core');
  const orvalCoreRequire = createRequire(orvalCoreEntryPath);

  const esbuildEntryPath = orvalCoreRequire.resolve('esbuild');
  const resolvedEsbuildPackagePath = findPackageRoot(esbuildEntryPath);
  if (!resolvedEsbuildPackagePath) {
    fail(`Cannot find package root for ${esbuildEntryPath}`);
  }
  esbuildPackagePath = resolvedEsbuildPackagePath;
  esbuildBinaryPath = join(dirname(esbuildPackagePath), 'bin', 'esbuild');
  expectedVersion = String(JSON.parse(readFileSync(esbuildPackagePath, 'utf8')).version ?? '').trim();

  const binField = orvalPackageJson.bin;
  const relativeBinPath =
    typeof binField === 'string' ? binField : (binField?.orval ?? Object.values(binField ?? {})[0]);
  if (!relativeBinPath) {
    fail(`Cannot resolve orval binary from ${orvalPackagePath}`);
  }
  orvalEntrypointPath = join(dirname(orvalPackagePath), relativeBinPath);
} catch {
  fail('Cannot resolve orval/esbuild paths from installed dependencies');
}

if (!existsSync(esbuildPackagePath)) {
  fail(`Cannot find ${esbuildPackagePath}`);
}

if (!existsSync(esbuildBinaryPath)) {
  fail(`Cannot find ${esbuildBinaryPath}`);
}

if (!existsSync(orvalEntrypointPath)) {
  fail(`Cannot find ${orvalEntrypointPath}`);
}

if (!expectedVersion) {
  fail(`Cannot resolve esbuild version from ${esbuildPackagePath}`);
}

const versionCheck = spawnSync(esbuildBinaryPath, ['--version'], {
  encoding: 'utf8',
});

if (versionCheck.error) {
  fail(`Cannot execute esbuild binary at ${esbuildBinaryPath}: ${versionCheck.error.message}`);
}

if (versionCheck.status !== 0) {
  const details = `${versionCheck.stdout ?? ''}${versionCheck.stderr ?? ''}`.trim();
  fail(`esbuild version check failed: ${details || 'unknown error'}`);
}

const binaryVersion = `${versionCheck.stdout ?? ''}${versionCheck.stderr ?? ''}`.trim().split('\n').pop().trim();

if (binaryVersion !== expectedVersion) {
  fail(`esbuild version mismatch: package=${expectedVersion}, binary=${binaryVersion}`);
}

const run = spawnSync(process.execPath, [orvalEntrypointPath, '--config', 'orval.config.cjs'], {
  cwd: frontendRoot,
  env: {
    ...process.env,
    ESBUILD_BINARY_PATH: esbuildBinaryPath,
  },
  stdio: 'inherit',
});

if (run.error) {
  fail(`Failed to start orval: ${run.error.message}`);
}

process.exit(run.status ?? 1);
