import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { buildXmp, type PdfMetadata } from './metadata'
import { ensureFont, pickFamily, pickWeight, type FontMetrics } from './fonts'

const A4_W_MM = 210
const A4_H_MM = 297

function exportRoot(): HTMLElement {
  const el = document.getElementById('cv-export-root')
  if (!el) throw new Error('Documento não encontrado')
  return el
}

function pageElements(): HTMLElement[] {
  return Array.from(exportRoot().querySelectorAll<HTMLElement>('.cv-page'))
}

export function fileSlug(name: string): string {
  const slug = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `curriculo${slug ? '-' + slug : ''}`
}

/**
 * Wide letter-spacing (e.g. spaced-out uppercase headings) makes parsers read "R E S U M O".
 * Such text stays painted in the image and gets a clean, un-spaced invisible text copy instead.
 */
function isSpaced(cs: CSSStyleDeclaration): boolean {
  const ls = cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing) || 0
  return ls / (parseFloat(cs.fontSize) || 12) >= 0.04
}

/**
 * Renders a page to a canvas. With `hideText` the glyphs are made transparent,
 * leaving only backgrounds, lines, icons and photos (the text is drawn as real
 * vector text in the PDF afterwards).
 */
async function renderPage(page: HTMLElement, scale: number, hideText = false): Promise<HTMLCanvasElement> {
  return html2canvas(page, {
    scale,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
    // The export root is parked off-screen; bring the clone into view for rendering.
    onclone: (doc) => {
      const root = doc.getElementById('cv-export-root')
      if (root) {
        root.style.position = 'absolute'
        root.style.left = '0'
        root.style.top = '0'
      }
      if (!hideText || !root) return
      const win = doc.defaultView!
      // icons use currentColor: pin their colour before hiding the text
      root.querySelectorAll<SVGElement>('svg').forEach((svg) => {
        svg.style.color = win.getComputedStyle(svg).color
      })
      const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT)
      const holders = new Set<HTMLElement>()
      let n: Node | null
      while ((n = walker.nextNode())) {
        if (n.textContent?.trim() && n.parentElement && !(n.parentElement instanceof SVGElement) && !isSpaced(win.getComputedStyle(n.parentElement))) {
          holders.add(n.parentElement)
        }
      }
      holders.forEach((el) => el.style.setProperty('color', 'transparent', 'important'))
    },
  })
}

/* ------------------------------------------------------------------ */
/* Vector text layer                                                   */
/* ------------------------------------------------------------------ */

// Characters present in the embedded (latin) font subset.
const EXTRA_GLYPHS = new Set([0x131, 0x152, 0x153, 0x2bb, 0x2bc, 0x2c6, 0x2da, 0x2dc, 0x2074, 0x20ac, 0x2122, 0x2191, 0x2193, 0x2212, 0x2215])
const FALLBACK: Record<string, string> = { ł: 'l', Ł: 'L', đ: 'd', Đ: 'D', ø: 'o', Ø: 'O', ő: 'o', Ő: 'O', ű: 'u', Ű: 'U', ħ: 'h', ı: 'i' }

const supported = (c: number) => c <= 0xff || (c >= 0x2000 && c <= 0x206f) || EXTRA_GLYPHS.has(c)

/** Makes a string safe for the embedded font; collects characters that cannot be represented. */
function sanitize(text: string, dropped: Set<string>): string {
  let out = ''
  for (const ch of text.normalize('NFC')) {
    const c = ch.codePointAt(0)!
    if (c === 0xa0 || c === 0x202f) out += ' '
    else if (c < 0x20 || c === 0xad || (c >= 0x200b && c <= 0x200f) || c === 0xfeff) continue
    else if (supported(c)) out += ch
    else if (FALLBACK[ch]) out += FALLBACK[ch]
    else {
      const base = ch.normalize('NFD').replace(/[̀-ͯ]/g, '')
      if (base && [...base].every((b) => supported(b.codePointAt(0)!))) out += base
      else dropped.add(ch)
    }
  }
  return out
}

interface Rgb { r: number; g: number; b: number }

function parseColor(css: string): (Rgb & { a: number }) | null {
  const m = css.match(/rgba?\(([^)]+)\)/)
  if (!m) return null
  const [r, g, b, a] = m[1].split(/[,/\s]+/).filter(Boolean).map(Number)
  return { r, g, b, a: a ?? 1 }
}

/** Product of the opacity of an element and its ancestors (up to `stop`). */
function effectiveOpacity(el: Element, stop: Element): number {
  let o = 1
  for (let e: Element | null = el; e && e !== stop.parentElement; e = e.parentElement) {
    o *= parseFloat(getComputedStyle(e).opacity || '1')
  }
  return o
}

interface WordOp {
  kind: 'word'
  text: string
  x: number // px, page-relative
  top: number
  height: number
  family: string
  weight: number
  size: number // px
  letterSpacing: number // px
  /** painted in the image already: emit as invisible text */
  invisible: boolean
  color: Rgb
  opacity: number
}
interface BulletOp { kind: 'bullet'; x: number; y: number; r: number; color: Rgb; opacity: number }
interface LinkOp { kind: 'link'; x: number; y: number; w: number; h: number; url: string }
type Op = WordOp | BulletOp | LinkOp

function applyTransform(text: string, transform: string): string {
  if (transform === 'uppercase') return text.toLocaleUpperCase()
  if (transform === 'lowercase') return text.toLocaleLowerCase()
  return text
}

/** Walks the page DOM and records every word, bullet and link with its position, in reading order. */
function collectOps(page: HTMLElement, dropped: Set<string>): Op[] {
  const clip = page.querySelector<HTMLElement>('.cv-clip')
  if (!clip) return []
  const pageRect = page.getBoundingClientRect()
  const clipRect = clip.getBoundingClientRect()
  const ops: Op[] = []
  const range = document.createRange()
  const inClip = (r: DOMRect) => r.height > 0 && r.bottom > clipRect.top + 1 && r.top < clipRect.bottom - 1

  const walker = document.createTreeWalker(clip, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT)
  let node: Node | null
  while ((node = walker.nextNode())) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement
      const cs = getComputedStyle(el)
      if (el.tagName === 'LI' && cs.display === 'list-item' && cs.listStyleType !== 'none') {
        const first = el.firstChild
        const textNode = first && first.nodeType === Node.TEXT_NODE ? first : el.querySelector('*')?.firstChild
        if (textNode && textNode.textContent?.trim()) {
          range.selectNodeContents(textNode)
          const r = range.getClientRects()[0]
          const c = parseColor(cs.color)
          if (r && c && inClip(r)) {
            const fs = parseFloat(cs.fontSize)
            ops.push({
              kind: 'bullet',
              x: r.left - pageRect.left - fs * 0.62,
              y: r.top - pageRect.top + r.height / 2,
              r: fs * 0.16,
              color: c,
              opacity: effectiveOpacity(el, clip) * c.a,
            })
          }
        }
      }
      if (el.tagName === 'A' && el.getAttribute('href')) {
        range.selectNodeContents(el)
        for (const r of Array.from(range.getClientRects())) {
          if (inClip(r)) {
            ops.push({ kind: 'link', x: r.left - pageRect.left, y: r.top - pageRect.top, w: r.width, h: r.height, url: (el as HTMLAnchorElement).href })
          }
        }
      }
      continue
    }

    const text = node.textContent ?? ''
    const parent = node.parentElement
    if (!text.trim() || !parent || parent instanceof SVGElement) continue
    const cs = getComputedStyle(parent)
    if (cs.visibility === 'hidden') continue
    const color = parseColor(cs.color)
    if (!color) continue
    const size = parseFloat(cs.fontSize)
    const family = pickFamily(cs.fontFamily)
    const weight = pickWeight(family, parseInt(cs.fontWeight, 10) || 400)
    const spaced = isSpaced(cs)
    const ls = cs.letterSpacing === 'normal' || spaced ? 0 : parseFloat(cs.letterSpacing) || 0
    const opacity = effectiveOpacity(parent, clip) * color.a

    const re = /\S+/g
    let m: RegExpExecArray | null
    while ((m = re.exec(text))) {
      range.setStart(node, m.index)
      range.setEnd(node, m.index + m[0].length)
      const r = range.getBoundingClientRect()
      if (!inClip(r)) continue
      const word = sanitize(applyTransform(m[0], cs.textTransform), dropped)
      if (!word) continue
      ops.push({
        kind: 'word',
        text: word,
        x: r.left - pageRect.left,
        top: r.top - pageRect.top,
        height: r.height,
        family,
        weight,
        size,
        letterSpacing: ls,
        invisible: spaced,
        color,
        opacity,
      })
    }
  }
  return ops
}

/**
 * Draws the page text as real, selectable vector text using the embedded fonts, plus bullets
 * and clickable links. Words are emitted in reading (DOM) order, each followed by a space so
 * that parsers which simply concatenate text still see separate words.
 */
async function addTextLayer(
  pdf: jsPDF,
  page: HTMLElement,
  fonts: Map<string, FontMetrics>,
  dropped: Set<string>,
): Promise<void> {
  const ops = collectOps(page, dropped)
  const pageRect = page.getBoundingClientRect()
  const k = A4_W_MM / pageRect.width // px -> mm
  const ptPerPx = k * (72 / 25.4)

  let opacity = 1
  const setOpacity = (o: number) => {
    const v = Math.max(0, Math.min(1, o))
    if (Math.abs(v - opacity) < 0.001) return
    opacity = v
    // GState is a constructor at runtime, but typed as a method
    const GState = pdf.GState as unknown as new (p: { opacity: number; 'stroke-opacity': number }) => unknown
    pdf.setGState(new GState({ opacity: v, 'stroke-opacity': v }))
  }

  for (const op of ops) {
    if (op.kind === 'word') {
      const { name, metrics } = await ensureFont(pdf, fonts, op.family, op.weight)
      pdf.setFont(name, 'normal')
      pdf.setFontSize(op.size * ptPerPx)
      pdf.setTextColor(op.color.r, op.color.g, op.color.b)
      setOpacity(op.opacity)
      const content = (metrics.ascent + metrics.descent) * op.size
      const baseline = op.top + (op.height - content) / 2 + metrics.ascent * op.size
      const opts: { charSpace?: number; renderingMode?: 'invisible' } = {}
      if (op.letterSpacing) opts.charSpace = op.letterSpacing * k
      if (op.invisible) opts.renderingMode = 'invisible'
      pdf.text(`${op.text} `, op.x * k, baseline * k, opts)
    } else if (op.kind === 'bullet') {
      pdf.setFillColor(op.color.r, op.color.g, op.color.b)
      setOpacity(op.opacity)
      pdf.circle(op.x * k, op.y * k, op.r * k, 'F')
    } else {
      pdf.link(op.x * k, op.y * k, op.w * k, op.h * k, { url: op.url })
    }
  }
  setOpacity(1)
}

/** Exports the resume as an A4 PDF with real (vector) text. Returns characters that could not be embedded. */
export async function exportPdf(filename: string, meta?: PdfMetadata): Promise<string[]> {
  const pages = pageElements()
  if (!pages.length) throw new Error('Nada para exportar')
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true })
  const fonts = new Map<string, FontMetrics>()
  const dropped = new Set<string>()
  for (let i = 0; i < pages.length; i++) {
    const canvas = await renderPage(pages[i], 2.5, true)
    if (i > 0) pdf.addPage('a4', 'portrait')
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, A4_W_MM, A4_H_MM, undefined, 'FAST')
    await addTextLayer(pdf, pages[i], fonts, dropped)
  }
  pdf.setProperties({
    title: meta?.title || filename,
    author: meta?.author,
    subject: meta?.subject,
    keywords: meta?.keywords,
    creator: meta?.creator ?? 'CVMaker',
  })
  pdf.setCreationDate(new Date())
  if (meta) {
    pdf.setLanguage(meta.lang)
    pdf.addMetadata(buildXmp(meta), true)
    pdf.viewerPreferences({ DisplayDocTitle: true })
  }
  pdf.save(`${filename}.pdf`)
  return [...dropped]
}

export async function exportPng(filename: string): Promise<void> {
  const pages = pageElements()
  if (!pages.length) throw new Error('Nada para exportar')
  const canvases: HTMLCanvasElement[] = []
  for (const p of pages) canvases.push(await renderPage(p, 2.5))

  // Multiple pages are stacked in a single tall image.
  const gap = pages.length > 1 ? 24 : 0
  const w = canvases[0].width
  const h = canvases.reduce((sum, c) => sum + c.height, 0) + gap * (canvases.length - 1)
  const out = document.createElement('canvas')
  out.width = w
  out.height = h
  const ctx = out.getContext('2d')!
  ctx.fillStyle = '#e5e7eb'
  ctx.fillRect(0, 0, w, h)
  let y = 0
  for (const c of canvases) {
    ctx.drawImage(c, 0, y)
    y += c.height + gap
  }
  const blob = await new Promise<Blob>((resolve, reject) =>
    out.toBlob((b) => (b ? resolve(b) : reject(new Error('Falha ao gerar imagem'))), 'image/png'),
  )
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.png`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export function printResume(): void {
  window.print()
}
