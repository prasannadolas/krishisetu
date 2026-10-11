const fs = require('fs');
const path = require('path');

// Create SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="80" fill="#15803d"/>
  <rect x="80" y="80" width="352" height="352" rx="60" fill="#166534" opacity="0.4"/>
  <g transform="translate(256, 256)">
    <rect x="-10" y="-20" width="20" height="100" rx="10" fill="white"/>
    <path d="M0,-20 Q40,-60 60,-40 Q40,-10 0,-20 Z" fill="#86efac"/>
    <path d="M0,-30 Q-40,-70 -60,-50 Q-40,-15 0,-30 Z" fill="#4ade80"/>
    <path d="M0,-50 Q10,-90 30,-80 Q20,-55 0,-50 Z" fill="#a7f3d0"/>
    <ellipse cx="0" cy="85" rx="50" ry="8" fill="rgba(0,0,0,0.2)"/>
  </g>
</svg>`;

const publicDir = path.join(__dirname, '..', 'public');
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);
console.log('icon.svg created');

// Create a minimal valid 192x192 PNG using raw bytes
// This creates a solid green 1x1 pixel that scales
function createMinimalPNG(width, height, r, g, b) {
  const zlib = require('zlib');
  
  // Build raw pixel data (RGBA)
  const channels = 4;
  const rowSize = width * channels;
  const rawData = Buffer.alloc((rowSize + 1) * height);
  
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowSize + 1);
    rawData[rowOffset] = 0; // filter type: None
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * channels;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = 255; // alpha
    }
  }
  
  const compressed = zlib.deflateSync(rawData);
  
  function crc32(buf) {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c;
    }
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) {
      crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }
  
  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuffer = Buffer.from(type, 'ascii');
    const crcData = Buffer.concat([typeBuffer, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(crcData), 0);
    return Buffer.concat([len, typeBuffer, data, crc]);
  }
  
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 6;  // color type: RGBA
  ihdrData[10] = 0; // compression method
  ihdrData[11] = 0; // filter method
  ihdrData[12] = 0; // interlace method
  
  // IDAT chunk
  const idatData = compressed;
  
  // IEND chunk
  const iendData = Buffer.alloc(0);
  
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdrData),
    chunk('IDAT', idatData),
    chunk('IEND', iendData)
  ]);
}

// Create 192x192 icon (emerald green #15803d = rgb(21, 128, 61))
const png192 = createMinimalPNG(192, 192, 21, 128, 61);
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), png192);
console.log('icon-192.png created');

// Create 512x512 icon
const png512 = createMinimalPNG(512, 512, 21, 128, 61);
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), png512);
console.log('icon-512.png created');

// Create favicon.ico (16x16 ICO with PNG data)
const favicon16 = createMinimalPNG(16, 16, 21, 128, 61);
const icoHeader = Buffer.alloc(22 + favicon16.length);
// ICO header
icoHeader.writeUInt16LE(0, 0);   // reserved
icoHeader.writeUInt16LE(1, 2);   // type: 1 = ICO
icoHeader.writeUInt16LE(1, 4);   // count: 1 image
// Image directory entry
icoHeader[6] = 16;   // width
icoHeader[7] = 16;   // height
icoHeader[8] = 0;    // color count
icoHeader[9] = 0;    // reserved
icoHeader.writeUInt16LE(1, 10);  // planes
icoHeader.writeUInt16LE(32, 12); // bit count
icoHeader.writeUInt32LE(favicon16.length, 14); // image size
icoHeader.writeUInt32LE(22, 18); // image offset (after header)
favicon16.copy(icoHeader, 22);

fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoHeader);
console.log('favicon.ico created');

console.log('All icons generated successfully!');
