/**
 * Deterministic monochrome grain tile used by .surface-grain (64×64, 8-level greyscale PNG; noise needs no more precision).
 * Run from site/: node scripts/generate-textures.mjs
 */
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const out = fileURLToPath(new URL('../src/assets/textures/grain.png', import.meta.url));
const size = 64;
let seed = 0x7a4e2b1d; // fixed seed → identical output every run
const rand = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 0xffffffff;
const px = Buffer.alloc(size * size);
for (let i = 0; i < px.length; i++) px[i] = Math.round(128 + (rand() + rand() + rand() - 1.5) * 90);
await sharp(px, { raw: { width: size, height: size, channels: 1 } }).png({ compressionLevel: 9, palette: true, colours: 8, dither: 0 }).toFile(out);
console.log('grain.png written');
