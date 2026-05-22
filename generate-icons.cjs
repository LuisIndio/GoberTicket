// Generates minimal valid PNG icons for the PWA manifest.
// Uses only Node.js built-ins (zlib, crypto, fs). No external deps.
const zlib = require('zlib')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

function crc32(buf) {
  const table = (() => {
    const t = new Uint32Array(256)
    for (let i = 0; i < 256; i++) {
      let c = i
      for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      t[i] = c
    }
    return t
  })()
  let crc = 0xffffffff
  for (const byte of buf) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii')
  const lenBuf = Buffer.alloc(4)
  lenBuf.writeUInt32BE(data.length, 0)
  const crcInput = Buffer.concat([typeBytes, data])
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(crcInput), 0)
  return Buffer.concat([lenBuf, typeBytes, data, crcBuf])
}

function createIconPNG(size) {
  // Draw a simple green rounded-square ticket icon
  const pixels = Buffer.alloc(size * size * 3)

  const cx = size / 2, cy = size / 2
  const radius = size * 0.44   // outer rounded rect radius
  const innerR = size * 0.36

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 3
      const dx = Math.abs(x - cx), dy = Math.abs(y - cy)

      // Background: #051a08
      let r = 5, g = 26, b = 8

      // Rounded rect bounds with corner radius
      const corner = size * 0.18
      const inRect = (
        dx <= size * 0.44 && dy <= size * 0.44 &&
        !(dx > size * 0.44 - corner && dy > size * 0.44 - corner &&
          Math.hypot(dx - (size * 0.44 - corner), dy - (size * 0.44 - corner)) > corner)
      )

      if (inRect) {
        // Card background: #0a3015
        r = 10; g = 48; b = 21

        // Green accent bar at top
        if (y > size * 0.2 && y < size * 0.28 && x > size * 0.2 && x < size * 0.8) {
          r = 34; g = 197; b = 94
        }
        // Text lines
        else if (
          (y > size * 0.33 && y < size * 0.38 && x > size * 0.2 && x < size * 0.7) ||
          (y > size * 0.42 && y < size * 0.47 && x > size * 0.2 && x < size * 0.75) ||
          (y > size * 0.51 && y < size * 0.56 && x > size * 0.2 && x < size * 0.65)
        ) {
          r = 74; g = 222; b = 128;
          // alpha-blend at 50%
          r = Math.round(r * 0.5 + 10 * 0.5)
          g = Math.round(g * 0.5 + 48 * 0.5)
          b = Math.round(b * 0.5 + 21 * 0.5)
        }
        // Badge button
        else if (y > size * 0.63 && y < size * 0.72 && x > size * 0.2 && x < size * 0.42) {
          r = 22; g = 163; b = 74
        }
      }

      pixels[idx] = r
      pixels[idx + 1] = g
      pixels[idx + 2] = b
    }
  }

  // Build PNG scanlines (filter byte 0 = None per row)
  const scanlines = Buffer.alloc(size * (1 + size * 3))
  for (let y = 0; y < size; y++) {
    scanlines[y * (1 + size * 3)] = 0  // filter type None
    pixels.copy(scanlines, y * (1 + size * 3) + 1, y * size * 3, (y + 1) * size * 3)
  }

  const compressed = zlib.deflateSync(scanlines, { level: 9 })

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(size, 0)
  ihdrData.writeUInt32BE(size, 4)
  ihdrData.writeUInt8(8, 8)   // bit depth
  ihdrData.writeUInt8(2, 9)   // color type: RGB
  ihdrData.writeUInt8(0, 10)  // compression
  ihdrData.writeUInt8(0, 11)  // filter
  ihdrData.writeUInt8(0, 12)  // interlace

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdrData),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const outDir = path.join(__dirname, 'public', 'icons')
for (const size of [192, 512]) {
  const png = createIconPNG(size)
  const outPath = path.join(outDir, `icon-${size}.png`)
  fs.writeFileSync(outPath, png)
  console.log(`Created ${outPath} (${png.length} bytes)`)
}
