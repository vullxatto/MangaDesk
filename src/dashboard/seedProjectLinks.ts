import type { ProjectLink } from './projectLinks'

/** Ссылки по умолчанию для проектов из api/seed.sql (пока нет API ссылок). */
export const SEED_PROJECT_LINKS: Record<string, ProjectLink[]> = {
  'd0000001-0001-0001-0001-000000000001': [
    { label: 'ReManga', href: 'https://remanga.org/manga/solo-leveling' },
    { label: 'MangaLib', href: 'https://mangalib.me/solo-leveling' },
  ],
  'd0000002-0001-0001-0001-000000000002': [
    { label: 'ReManga', href: 'https://remanga.org/manga/omniscient-readers-viewpoint' },
  ],
  'd0000003-0001-0001-0001-000000000003': [
    { label: 'ReManga', href: 'https://remanga.org/manga/tower-of-god' },
    { label: 'Telegram', href: 'https://t.me/towerofgod_ru' },
  ],
  'd0000004-0001-0001-0001-000000000004': [
    { label: 'ReManga', href: 'https://remanga.org/manga/jujutsu-kaisen' },
  ],
  'd0000005-0001-0001-0001-000000000005': [
    { label: 'ReManga', href: 'https://remanga.org/manga/one-punch-man' },
  ],
  'd0000006-0001-0001-0001-000000000006': [
    { label: 'ReManga', href: 'https://remanga.org/manga/kimetsu-no-yaiba' },
  ],
  'd0000007-0001-0001-0001-000000000007': [
    { label: 'ReManga', href: 'https://remanga.org/manga/blue-lock' },
  ],
  'd0000008-0001-0001-0001-000000000008': [
    { label: 'ReManga', href: 'https://remanga.org/manga/spy-x-family' },
    { label: 'MangaLib', href: 'https://mangalib.me/spy-x-family' },
  ],
  'd0000009-0001-0001-0001-000000000009': [
    { label: 'ReManga', href: 'https://remanga.org/manga/bleach' },
  ],
  'd0000010-0001-0001-0001-000000000010': [
    { label: 'ReManga', href: 'https://remanga.org/manga/mashle' },
  ],
  'd0000011-0001-0001-0001-000000000011': [
    { label: 'ReManga', href: 'https://remanga.org/manga/naruto' },
    { label: 'MangaLib', href: 'https://mangalib.me/naruto' },
  ],
  'd0000012-0001-0001-0001-000000000012': [
    { label: 'ReManga', href: 'https://remanga.org/manga/mushoku-tensei' },
  ],
  'd0000013-0001-0001-0001-000000000013': [
    { label: 'ReManga', href: 'https://remanga.org/manga/dandadan' },
  ],
  'd0000014-0001-0001-0001-000000000014': [
    { label: 'ReManga', href: 'https://remanga.org/manga/kaiju-no-8' },
  ],
  'd0000015-0001-0001-0001-000000000015': [
    { label: 'ReManga', href: 'https://remanga.org/manga/slime-taoshite' },
  ],
}

export const SEED_PROJECT_IDS = Object.keys(SEED_PROJECT_LINKS)
