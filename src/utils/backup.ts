import type { ResumeData } from '../types/resume'
import { normalize } from '../hooks/useResume'
import { fileSlug } from '../export/exporters'

const APP = 'cvmaker'
const VERSION = 1

interface BackupFile {
  app: typeof APP
  version: number
  exportedAt: string
  data: ResumeData
}

/** Downloads everything the user typed (including photo, template and translations) as a JSON file. */
export function downloadBackup(data: ResumeData): string {
  const file: BackupFile = { app: APP, version: VERSION, exportedAt: new Date().toISOString(), data }
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' })
  const name = `${fileSlug(data.personal.fullName).replace(/^curriculo/, 'cvmaker-dados')}.json`
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
  return name
}

/** Parses and validates a backup file. Throws a user-friendly Error when it is not a CVMaker file. */
export function parseBackup(text: string): ResumeData {
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error('O arquivo não é um JSON válido.')
  }
  const obj = json as Partial<BackupFile> & Partial<ResumeData>
  // Accepts the wrapped format and a bare ResumeData object
  const data = obj && obj.app === APP ? obj.data : obj?.personal ? (obj as ResumeData) : undefined
  if (!data || typeof data !== 'object' || !data.personal) {
    throw new Error('Este arquivo não parece ser um backup do CVMaker.')
  }
  return normalize(data)
}
