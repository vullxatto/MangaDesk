import qrComicBetaUrl from '../assets/fonts/QRComicBeta/QRComicBeta.otf?url'
import ccShakeUrl from '../assets/fonts/CCShake/v_CCShake.ttf?url'
import sochinyalaUrl from '../assets/fonts/Sochinyala/Sochinyala.otf?url'
import mandroidBbUrl from '../assets/fonts/MandroidBB/MandroidBB.ttf?url'

/** Ключи настроек проекта → типы баблов */
export type ProjectFontSettingKey = 'normal' | 'scream' | 'thoughts' | 'native'

/** Id шрифта в API / PSD */
export type ProjectFontId = 'qr_comic_beta' | 'ccshake' | 'sochinyala' | 'mandroid_bb'

export type ProjectFontSettings = Record<ProjectFontSettingKey, ProjectFontId>

export type ProjectFontOption = {
  id: ProjectFontId
  label: string
  cssFamily: string
  fileUrl: string
  downloadName: string
}

export type ProjectFontTypeSlide = {
  settingKey: ProjectFontSettingKey
  label: string
}

export const PROJECT_FONT_PANGRAM =
  'Съешь ещё этих мягких французских булок, да выпей же чаю'

export const PROJECT_FONT_OPTIONS: readonly ProjectFontOption[] = [
  {
    id: 'qr_comic_beta',
    label: 'QR Comic Beta',
    cssFamily: '"QR Comic Beta", sans-serif',
    fileUrl: qrComicBetaUrl,
    downloadName: 'QRComicBeta.otf',
  },
  {
    id: 'ccshake',
    label: 'v_CCShake',
    cssFamily: '"v_CCShake", sans-serif',
    fileUrl: ccShakeUrl,
    downloadName: 'v_CCShake.ttf',
  },
  {
    id: 'sochinyala',
    label: 'Сочиняла',
    cssFamily: '"Sochinyala", cursive',
    fileUrl: sochinyalaUrl,
    downloadName: 'Sochinyala.otf',
  },
  {
    id: 'mandroid_bb',
    label: 'v_MandroidBB',
    cssFamily: '"v_MandroidBB", sans-serif',
    fileUrl: mandroidBbUrl,
    downloadName: 'v_MandroidBB.ttf',
  },
] as const

export const PROJECT_FONT_TYPE_SLIDES: readonly ProjectFontTypeSlide[] = [
  { settingKey: 'normal', label: 'Баббл' },
  { settingKey: 'scream', label: 'Крик' },
  { settingKey: 'thoughts', label: 'Мысль' },
  { settingKey: 'native', label: 'sfx' },
] as const

export const DEFAULT_PROJECT_FONT_SETTINGS: ProjectFontSettings = {
  normal: 'qr_comic_beta',
  scream: 'mandroid_bb',
  thoughts: 'sochinyala',
  native: 'ccshake',
}

const FONT_ID_SET = new Set<string>(PROJECT_FONT_OPTIONS.map((f) => f.id))

export function normalizeProjectFontSettings(raw: unknown): ProjectFontSettings {
  const out: ProjectFontSettings = { ...DEFAULT_PROJECT_FONT_SETTINGS }
  if (!raw || typeof raw !== 'object') return out
  const obj = raw as Record<string, unknown>
  for (const key of Object.keys(DEFAULT_PROJECT_FONT_SETTINGS) as ProjectFontSettingKey[]) {
    const value = String(obj[key] ?? '')
      .trim()
      .toLowerCase()
    if (FONT_ID_SET.has(value)) {
      out[key] = value as ProjectFontId
    }
  }
  return out
}

export function getProjectFontOption(id: ProjectFontId): ProjectFontOption {
  return PROJECT_FONT_OPTIONS.find((f) => f.id === id) ?? PROJECT_FONT_OPTIONS[0]!
}

export function fontFamilyForSetting(
  settings: ProjectFontSettings | null | undefined,
  settingKey: ProjectFontSettingKey,
): string {
  const id = settings?.[settingKey] ?? DEFAULT_PROJECT_FONT_SETTINGS[settingKey]
  return getProjectFontOption(id).cssFamily
}

/** Тип слайса редактора → ключ настройки проекта */
export function sliceTypeToFontSettingKey(type: string | null | undefined): ProjectFontSettingKey {
  const t = String(type || 'bubble').toLowerCase()
  if (t === 'scream') return 'scream'
  if (t === 'thought') return 'thoughts'
  if (t === 'sfx' || t === 'sound') return 'native'
  return 'normal'
}

export function downloadProjectFont(option: ProjectFontOption) {
  const a = document.createElement('a')
  a.href = option.fileUrl
  a.download = option.downloadName
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
}
