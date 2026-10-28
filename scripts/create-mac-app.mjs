import { mkdir, writeFile, chmod } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const app = join(root, 'Abrir Lumen.app', 'Contents');
await mkdir(join(app, 'MacOS'), { recursive: true });
const quote = s => `'${s.replaceAll("'", "'\\''")}'`;
const launcher = `#!/bin/sh\ncd ${quote(root)} || exit 1\nexec ${quote(process.execPath)} ${quote(join(root, 'scripts', 'launch.mjs'))} >>${quote(join(root, '.runtime', 'launcher.log'))} 2>&1\n`;
await mkdir(join(root, '.runtime'), { recursive: true });
await writeFile(join(app, 'MacOS', 'Lumen'), launcher);
await chmod(join(app, 'MacOS', 'Lumen'), 0o755);
await writeFile(join(app, 'Info.plist'), `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"><plist version="1.0"><dict><key>CFBundleName</key><string>Lumen</string><key>CFBundleDisplayName</key><string>Abrir Lumen</string><key>CFBundleIdentifier</key><string>local.lumen.estudo</string><key>CFBundleVersion</key><string>1.0</string><key>CFBundlePackageType</key><string>APPL</string><key>CFBundleExecutable</key><string>Lumen</string><key>LSUIElement</key><true/><key>NSHighResolutionCapable</key><true/></dict></plist>`);
try { execFileSync('/usr/bin/codesign', ['--force', '--sign', '-', join(root, 'Abrir Lumen.app')], { stdio: 'pipe' }); } catch {}
console.log('Atalho criado: Abrir Lumen.app. Execute novamente este script se mover a pasta.');
