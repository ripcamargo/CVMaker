/** A4 at 96dpi */
export const PAGE_W = 794
export const PAGE_H = 1123
/** Vertical page margin (top and bottom) */
export const PAGE_MARGIN_Y = 44
/** Content height available per page */
export const USABLE_H = PAGE_H - PAGE_MARGIN_Y * 2

export interface Paginated {
  html: string
  pages: number
}

/**
 * Block-aware pagination. The resume is laid out as one continuous column.
 * Every element marked [data-block] is kept whole: if it would straddle a page
 * boundary it is pushed (via padding-top) to the start of the next page.
 * Section headings live inside the first block of their section, so a title can
 * never be left alone at the bottom of a page.
 */
export function paginate(root: HTMLElement): Paginated {
  const blocks = Array.from(root.querySelectorAll<HTMLElement>('[data-block]'))
  blocks.forEach((b) => (b.style.paddingTop = ''))

  const rootTop = () => root.getBoundingClientRect().top
  for (const block of blocks) {
    const r = block.getBoundingClientRect()
    const top = r.top - rootTop()
    const height = r.height
    const page = Math.floor((top + 0.01) / USABLE_H)
    const pageEnd = (page + 1) * USABLE_H
    if (top + height > pageEnd + 0.5 && height <= USABLE_H && top > page * USABLE_H + 0.5) {
      block.style.paddingTop = `${Math.ceil(pageEnd - top)}px`
    }
  }

  const total = root.getBoundingClientRect().height
  const pages = Math.max(1, Math.ceil((total - 0.5) / USABLE_H))
  return { html: root.innerHTML, pages }
}
