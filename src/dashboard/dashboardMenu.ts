export const DASHBOARD_MENU_ITEMS = [
  { key: 'review', label: 'Обзор' },
  { key: 'tasks', label: 'Задачи' },
  { key: 'projects', label: 'Проекты' },
  { key: 'chapters', label: 'Главы' },
  { key: 'team', label: 'Команда' },
  { key: 'statistics', label: 'Статистика' },
  { key: 'settings', label: 'Настройки' },
] as const

export type DashboardPageKey = (typeof DASHBOARD_MENU_ITEMS)[number]['key']

export function dashboardTitleByPage(page: string): string {
  const item = DASHBOARD_MENU_ITEMS.find((i) => i.key === page)
  return item?.label ?? 'Кабинет'
}
