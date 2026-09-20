#!/usr/bin/env node

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const versionArg = process.argv[2];

if (!versionArg) {
  console.error('Uso: node scripts/update-versions.mjs <versione>');
  console.error('Esempio: node scripts/update-versions.mjs 0.4.2');
  process.exit(1);
}

const version = versionArg.trim();
const semverPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

if (!semverPattern.test(version)) {
  console.error(`Versione non valida: "${version}"`);
  console.error('Inserire un valore del tipo: 0.4.2, 1.2.3-beta.1 o 1.2.3+build.5');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const ignoreDirs = new Set([
  '.git',
  'node_modules',
  '.angular',
  'dist',
  'build',
  'coverage',
  'obj',
  'bin',
  'target',
]);

function collectFiles(dirPath, files) {
  for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
    if (entry.name === '.git') continue;

    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (ignoreDirs.has(entry.name)) continue;
      collectFiles(fullPath, files);
      continue;
    }

    if (entry.isFile()) {
      files.push(fullPath);
    }
  }
}

function updatePackageJson(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const json = JSON.parse(raw);

  if (!json || typeof json !== 'object') return false;
  if (typeof json.version !== 'string') return false;

  json.version = version;
  writeFileSync(filePath, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
  return true;
}

function updateTauriConfig(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const json = JSON.parse(raw);

  if (!json || typeof json !== 'object') return false;
  if (typeof json.version !== 'string') return false;

  json.version = version;
  writeFileSync(filePath, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
  return true;
}

function updateCargoToml(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const updated = raw.replace(/^version\s*=\s*"[^"]+"/gm, `version = "${version}"`);

  if (updated === raw) return false;

  writeFileSync(filePath, updated, 'utf8');
  return true;
}

const files = [];
collectFiles(repoRoot, files);

const updatedFiles = [];

for (const filePath of files) {
  const baseName = path.basename(filePath);

  try {
    if (baseName === 'package.json') {
      if (updatePackageJson(filePath)) {
        updatedFiles.push(path.relative(repoRoot, filePath));
      }
    } else if (baseName === 'tauri.conf.json') {
      if (updateTauriConfig(filePath)) {
        updatedFiles.push(path.relative(repoRoot, filePath));
      }
    } else if (baseName === 'Cargo.toml') {
      if (updateCargoToml(filePath)) {
        updatedFiles.push(path.relative(repoRoot, filePath));
      }
    }
  } catch (error) {
    // Ignora file non JSON/TOML validi o altri casi non applicabili.
  }
}

if (updatedFiles.length === 0) {
  console.log(`Nessun file manifest con versioni trovate da aggiornare per ${version}.`);
  process.exit(0);
}

console.log(`Versione aggiornata a ${version} su ${updatedFiles.length} file:`);
for (const file of updatedFiles) {
  console.log(`- ${file}`);
}
