const fs = require('fs');

// Create a simple colored PNG icon using a data URL approach
// We'll create placeholder icons that work

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const createIconData = (size) => {
  // Create a simple canvas-like representation
  // This creates a basic purple icon with "LU" text
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7C3AED"/>
      <stop offset="100%" style="stop-color:#5B21B6"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="80" fill="url(#bg)"/>
  <g fill="white">
    <polygon points="180,140 220,140 220,320 300,320 300,360 180,360"/>
    <polygon points="256,120 320,200 280,200 280,320 232,320 232,200 192,200"/>
  </g>
  <text x="256" y="440" text-anchor="middle" font-family="Arial,sans-serif" font-size="100" fill="white" font-weight="bold">⚡</text>
</svg>`;
};

sizes.forEach(size => {
  const svgContent = createIconData(size);
  fs.writeFileSync(`icon-${size}x${size}.svg`, svgContent);
  console.log(`Created icon-${size}x${size}.svg`);
});

console.log('SVG icons created. For production, convert to PNG using a tool like sharp or imagemagick.');
