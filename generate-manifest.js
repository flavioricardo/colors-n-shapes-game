const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, 'manifest.base.json');
const manifest = require(manifestPath);

const iconsPath = path.join(__dirname, 'icons/icons.json');
const icons = require(iconsPath);

manifest.icons = icons;

fs.writeFileSync(
  path.join(__dirname, 'manifest.json'),
  JSON.stringify(manifest, null, 2),
  'utf8'
);

console.log('Manifest.json foi gerado com sucesso!');
