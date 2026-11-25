// Generates PWA icons (PNG) into public/icons/. Run: node scripts/gen-icons.mjs
import { writeFileSync, mkdirSync } from 'node:fs'
import { deflateSync } from 'node:zlib'
import path from 'node:path'

const dir = path.resolve(process.cwd(), 'public/icons')
mkdirSync(dir, { recursive: true })

function crc32(buf) {
  if (!crc32.table) {
    crc32.table = new Uint32Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      crc32.table[n] = c >>> 0
    }
  }
  let c = 0xffffffff
  for (const b of buf) c = crc32.table[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([len, body, crc])
}

function makePng(size, rgba) {
  const raw = Buffer.alloc(size * (1 + size * 4))
  for (let y = 0; y < size; y++) {
    const row = y * (1 + size * 4)
    raw[row] = 0
    for (let x = 0; x < size; x++) {
      const i = row + 1 + x * 4
      raw[i] = rgba[0]
      raw[i + 1] = rgba[1]
      raw[i + 2] = rgba[2]
      raw[i + 3] = rgba[3]
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  const idat = deflateSync(raw)
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const primary = [29, 78, 216, 255] // #1d4ed8
writeFileSync(path.join(dir, 'icon-192.png'), makePng(192, primary))
writeFileSync(path.join(dir, 'icon-512.png'), makePng(512, primary))
writeFileSync(path.join(dir, 'apple-touch-icon-180.png'), makePng(180, primary))
console.log('Icons written to', dir)
