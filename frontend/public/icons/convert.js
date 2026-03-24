const sharp = require('sharp');
const fs = require('fs');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const svgTemplate = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7C3AED"/>
      <stop offset="100%" style="stop-color:#5B21B6"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="80" fill="url(#bg)"/>
  <text x="256" y="340" text-anchor="middle" font-family="Arial,sans-serif" font-size="280" fill="white" font-weight="bold">⚡</text>
</svg>`;

async function generateIcons() {
  for (const size of sizes) {
    const svg = Buffer.from(svgTemplate(size));
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(`icon-${size}x${size}.png`);
    console.log(`Created icon-${size}x${size}.png`);
  }
}

generateIcons().catch(console.error);
