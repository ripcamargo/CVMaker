export function patchItem<T extends { id: string }>(list: T[], id: string, patch: Partial<T>): T[] {
  return list.map((i) => (i.id === id ? { ...i, ...patch } : i))
}
export function removeItem<T extends { id: string }>(list: T[], id: string): T[] {
  return list.filter((i) => i.id !== id)
}
export function moveItem<T extends { id: string }>(list: T[], id: string, dir: -1 | 1): T[] {
  const i = list.findIndex((x) => x.id === id)
  const j = i + dir
  if (i < 0 || j < 0 || j >= list.length) return list
  const copy = list.slice()
  ;[copy[i], copy[j]] = [copy[j], copy[i]]
  return copy
}
