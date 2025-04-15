import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const manifestPath = path.join(__dirname, 'manifest.base.json');
const manifestContent = readFileSync(manifestPath, 'utf8');
const manifest = JSON.parse(manifestContent);

const iconsPath = path.join(__dirname, 'public/icons/icons.json');
const iconsContent = readFileSync(iconsPath, 'utf8');
const icons = JSON.parse(iconsContent).icons;

manifest.icons = icons;

writeFileSync(
  path.join(__dirname, 'manifest.json'),
  JSON.stringify(manifest, null, 2),
  'utf8'
);

console.log('Manifest.json foi gerado com sucesso!');