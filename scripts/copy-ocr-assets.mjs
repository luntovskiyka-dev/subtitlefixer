import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public/ocr');
mkdirSync(out, { recursive: true });

const pairs = [
  ['node_modules/tesseract.js/dist/worker.min.js', 'worker.min.js'],
  ['node_modules/tesseract.js/dist/worker.min.js.LICENSE.txt', 'worker.min.js.LICENSE.txt'],
  ['node_modules/tesseract.js-core/tesseract-core-simd-lstm.wasm.js', 'tesseract-core-simd-lstm.wasm.js'],
  ['node_modules/tesseract.js-core/tesseract-core-simd-lstm.wasm', 'tesseract-core-simd-lstm.wasm'],
  ['node_modules/tesseract.js-core/tesseract-core-lstm.wasm.js', 'tesseract-core-lstm.wasm.js'],
  ['node_modules/tesseract.js-core/tesseract-core-lstm.wasm', 'tesseract-core-lstm.wasm'],
];

let bytes = 0;
for (const [from, name] of pairs) {
  const source = join(root, from);
  if (!existsSync(source)) {
    throw new Error(`Missing ${from}. Run npm install before building OCR assets.`);
  }
  const target = join(out, name);
  copyFileSync(source, target);
  bytes += statSync(target).size;
}

for (const [from, name] of [
  ['node_modules/tesseract.js-core/LICENSE', 'tesseract.js-core.LICENSE'],
  ['node_modules/tesseract.js/LICENSE', 'tesseract.js.LICENSE'],
]) {
  const source = join(root, from);
  if (existsSync(source)) copyFileSync(source, join(out, name));
}

console.log(`Copied OCR runtime to public/ocr (${bytes} bytes).`);
