import type { jsPDF } from 'jspdf'
import inter400 from '@fontsource/inter/files/inter-latin-400-normal.woff?url'
import inter500 from '@fontsource/inter/files/inter-latin-500-normal.woff?url'
import inter600 from '@fontsource/inter/files/inter-latin-600-normal.woff?url'
import inter700 from '@fontsource/inter/files/inter-latin-700-normal.woff?url'
import open400 from '@fontsource/open-sans/files/open-sans-latin-400-normal.woff?url'
import open600 from '@fontsource/open-sans/files/open-sans-latin-600-normal.woff?url'
import open700 from '@fontsource/open-sans/files/open-sans-latin-700-normal.woff?url'

/** Fonts embedded in the PDF (same files the on-screen document uses). */
const SOURCES: Record<string, Record<number, string>> = {
  inter: { 400: inter400, 500: inter500, 600: inter600, 700: inter700 },
  'open sans': { 400: open400, 600: open600, 700: open700 },
}

export interface FontMetrics {
  /** ascent / descent as fractions of the font size (hhea table) */
  ascent: number
  descent: number
}

interface LoadedFont {
  base64: string
  metrics: FontMetrics
}

const cache = new Map<string, Promise<LoadedFont>>()

/** Picks the font family key ("inter" / "open sans") from a CSS font-family list. */
export function pickFamily(cssFamily: string): string {
  for (const part of cssFamily.split(',')) {
    const name = part.trim().replace(/^['"]|['"]$/g, '').toLowerCase()
    if (SOURCES[name]) return name
  }
  return 'inter'
}

export function pickWeight(family: string, weight: number): number {
  const avail = Object.keys(SOURCES[family]).map(Number)
  return avail.reduce((best, w) => (Math.abs(w - weight) < Math.abs(best - weight) ? w : best), avail[0])
}

/** Registered jsPDF font name for a family + weight. */
export const pdfFontName = (family: string, weight: number) => `${family.replace(/\s+/g, '')}-${weight}`

async function inflate(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new DecompressionStream('deflate'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

/** WOFF 1.0 -> plain TrueType (sfnt), which is what jsPDF can embed. */
async function woffToTtf(buf: ArrayBuffer): Promise<Uint8Array> {
  const src = new DataView(buf)
  if (src.getUint32(0) !== 0x774f4646) throw new Error('Fonte inválida')
  const flavor = src.getUint32(4)
  const numTables = src.getUint16(12)
  const tables: { tag: number; data: Uint8Array; checksum: number }[] = []
  for (let i = 0; i < numTables; i++) {
    const o = 44 + i * 20
    const offset = src.getUint32(o + 4)
    const compLen = src.getUint32(o + 8)
    const origLen = src.getUint32(o + 12)
    const raw = new Uint8Array(buf, offset, compLen)
    tables.push({
      tag: src.getUint32(o),
      checksum: src.getUint32(o + 16),
      data: compLen < origLen ? await inflate(raw) : raw,
    })
  }
  const headerSize = 12 + numTables * 16
  const total = tables.reduce((s, t) => s + ((t.data.length + 3) & ~3), headerSize)
  const out = new Uint8Array(total)
  const dv = new DataView(out.buffer)
  dv.setUint32(0, flavor)
  dv.setUint16(4, numTables)
  const entrySelector = Math.floor(Math.log2(numTables))
  const searchRange = 16 * 2 ** entrySelector
  dv.setUint16(6, searchRange)
  dv.setUint16(8, entrySelector)
  dv.setUint16(10, numTables * 16 - searchRange)
  let pos = headerSize
  tables.forEach((t, i) => {
    const o = 12 + i * 16
    dv.setUint32(o, t.tag)
    dv.setUint32(o + 4, t.checksum)
    dv.setUint32(o + 8, pos)
    dv.setUint32(o + 12, t.data.length)
    out.set(t.data, pos)
    pos += (t.data.length + 3) & ~3
  })
  return out
}

function readMetrics(ttf: Uint8Array): FontMetrics {
  const dv = new DataView(ttf.buffer, ttf.byteOffset, ttf.byteLength)
  const n = dv.getUint16(4)
  let head = 0
  let hhea = 0
  for (let i = 0; i < n; i++) {
    const o = 12 + i * 16
    const tag = String.fromCharCode(ttf[o], ttf[o + 1], ttf[o + 2], ttf[o + 3])
    if (tag === 'head') head = dv.getUint32(o + 8)
    if (tag === 'hhea') hhea = dv.getUint32(o + 8)
  }
  const upm = head ? dv.getUint16(head + 18) : 1000
  return hhea
    ? { ascent: dv.getInt16(hhea + 4) / upm, descent: -dv.getInt16(hhea + 6) / upm }
    : { ascent: 0.95, descent: 0.25 }
}

function toBase64(bytes: Uint8Array): string {
  let s = ''
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(s)
}

function loadFont(family: string, weight: number): Promise<LoadedFont> {
  const key = `${family}-${weight}`
  let p = cache.get(key)
  if (!p) {
    p = (async () => {
      const res = await fetch(SOURCES[family][weight])
      if (!res.ok) throw new Error('Não foi possível carregar a fonte')
      const ttf = await woffToTtf(await res.arrayBuffer())
      return { base64: toBase64(ttf), metrics: readMetrics(ttf) }
    })()
    p.catch(() => cache.delete(key))
    cache.set(key, p)
  }
  return p
}

/** Registers one family/weight on the PDF (once) and returns its jsPDF name and metrics. */
export async function ensureFont(
  pdf: jsPDF,
  registered: Map<string, FontMetrics>,
  family: string,
  weight: number,
): Promise<{ name: string; metrics: FontMetrics }> {
  const name = pdfFontName(family, weight)
  let metrics = registered.get(name)
  if (!metrics) {
    const font = await loadFont(family, weight)
    const file = `${name}.ttf`
    pdf.addFileToVFS(file, font.base64)
    pdf.addFont(file, name, 'normal')
    metrics = font.metrics
    registered.set(name, metrics)
  }
  return { name, metrics }
}
