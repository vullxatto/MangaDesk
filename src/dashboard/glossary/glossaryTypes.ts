export interface GlossaryEntry {
  id: string
  source: string
  target: string
  chapterId?: string | null
  chapterNumber?: number | null
}
