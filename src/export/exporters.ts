import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

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

async function renderPage(page: HTMLElement, scale: number): Promise<HTMLCanvasElement> {
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
    },
  })
}

const latin1 = (s: string) =>
  s
    .replace(/[•·▪●]/g, '-')
    .replace(/[–—]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^ -ÿ]/g, '')

/**
 * Adds an invisible text layer on top of the page image so the PDF stays
 * searchable / selectable and readable by ATS parsers, while looking identical.
 */
function addTextLayer(pdf: jsPDF, page: HTMLElement) {
  const clip = page.querySelector<HTMLElement>('.cv-clip')
  if (!clip) return
  const pageRect = page.getBoundingClientRect()
  const clipRect = clip.getBoundingClientRect()
  const kx = A4_W_MM / pageRect.width
  const ky = A4_H_MM / pageRect.height

  const walker = document.createTreeWalker(clip, NodeFilter.SHOW_TEXT)
  const range = document.createRange()
  let node: Node | null
  while ((node = walker.nextNode())) {
    const text = node.textContent ?? ''
    if (!text.trim()) continue
    // group words by visual line
    const lines: { y: number; x: number; text: string[] }[] = []
    const re = /\S+/g
    let m: RegExpExecArray | null
    while ((m = re.exec(text))) {
      range.setStart(node, m.index)
      range.setEnd(node, m.index + m[0].length)
      const r = range.getBoundingClientRect()
      if (r.height === 0 || r.bottom <= clipRect.top + 1 || r.top >= clipRect.bottom - 1) continue
      const last = lines[lines.length - 1]
      if (last && Math.abs(last.y - r.bottom) < 3) last.text.push(m[0])
      else lines.push({ y: r.bottom, x: r.left, text: [m[0]] })
    }
    for (const l of lines) {
      const s = latin1(l.text.join(' '))
      if (!s) continue
      pdf.text(s, (l.x - pageRect.left) * kx, (l.y - pageRect.top - 2) * ky, { renderingMode: 'invisible' })
    }
  }
}

export async function exportPdf(filename: string): Promise<void> {
  const pages = pageElements()
  if (!pages.length) throw new Error('Nada para exportar')
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true })
  pdf.setFontSize(10)
  for (let i = 0; i < pages.length; i++) {
    const canvas = await renderPage(pages[i], 2.5)
    if (i > 0) pdf.addPage('a4', 'portrait')
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, A4_W_MM, A4_H_MM, undefined, 'FAST')
    addTextLayer(pdf, pages[i])
  }
  pdf.setProperties({ title: filename, creator: 'CVMaker' })
  pdf.save(`${filename}.pdf`)
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
