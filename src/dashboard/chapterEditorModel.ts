/**
 * Фрагмент текста главы (ответ бэкенда GET /chapters/:id/editor).
 * bbox — четыре целых: [left, top, right, bottom] в пикселях исходного скана.
 */
export interface ChapterTranslationSlice {
  id: number
  slice_id: number
  type: string
  text: string
  bbox: [number, number, number, number]
  confidence?: number | null
  translated: string
  /** Индекс страницы (0-based), для многостраничного translation_json v2 */
  page_order?: number
}

export interface ChapterEditorPagePayload {
  order_index: number
  storage_key: string
  image_width: number
  image_height: number
  slices: ChapterTranslationSlice[]
}

export interface ChapterEditorApiResponse {
  chapter_number: number
  chapter_title: string | null
  project_id: string | null
  layout?: 'flat' | 'multi'
  storage_key: string | null
  image_width: number | null
  image_height: number | null
  pages?: ChapterEditorPagePayload[]
  slices: ChapterTranslationSlice[]
}

export interface ChapterPreviewPipelineResponse extends ChapterEditorApiResponse {
  ok: boolean
}

export function bboxToPercentStyle(
  bbox: [number, number, number, number],
  naturalWidth: number,
  naturalHeight: number,
): { left: string; top: string; width: string; height: string } {
  const [x1, y1, x2, y2] = bbox
  if (naturalWidth <= 0 || naturalHeight <= 0) {
    return { left: '0%', top: '0%', width: '0%', height: '0%' }
  }
  return {
    left: `${(x1 / naturalWidth) * 100}%`,
    top: `${(y1 / naturalHeight) * 100}%`,
    width: `${((x2 - x1) / naturalWidth) * 100}%`,
    height: `${((y2 - y1) / naturalHeight) * 100}%`,
  }
}

/** Демо-данные для локальной разработки без API */
export function getMockChapterSlices(): ChapterTranslationSlice[] {
  return [
    {
      id: 1,
      slice_id: 1,
      type: 'bubble',
      text: 'THE GATE HAS OPENED.',
      bbox: [48, 90, 320, 160],
      confidence: 0.91,
      translated: 'ВРАТА ОТКРЫЛИСЬ.',
    },
    {
      id: 2,
      slice_id: 2,
      type: 'bubble',
      text: 'E-RANK HUNTERS, STAY BACK!',
      bbox: [360, 40, 280, 120],
      confidence: 0.88,
      translated: 'ОХОТНИКИ E-РАНГА, ДЕРЖИТЕСЬ ПОДАЛЬШЕ!',
    },
    {
      id: 3,
      slice_id: 3,
      type: 'bubble',
      text: 'I CAN HANDLE THIS ALONE.',
      bbox: [52, 280, 400, 200],
      confidence: 0.84,
      translated: 'Я СПРАВЛЮСЬ С ЭТИМ ОДИН.',
    },
    {
      id: 4,
      slice_id: 4,
      type: 'bubble',
      text: 'SHADOW SOLDIERS, RISE.',
      bbox: [80, 520, 360, 180],
      confidence: 0.79,
      translated: 'СОЛДАТЫ ТЕНИ, ПОДНИМАЙТЕСЬ.',
    },
  ]
}
