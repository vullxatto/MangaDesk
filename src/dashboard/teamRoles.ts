export type EditableTeamRole = 'member' | 'reviewer'

export const EDITABLE_MEMBER_ROLE_OPTIONS = [
  { value: 'member', label: 'Редактор' },
  { value: 'reviewer', label: 'Проверяющий' },
] as const

export function teamRoleLabel(role?: string | null): string {
  if (role === 'owner') return 'Владелец'
  if (role === 'reviewer') return 'Проверяющий'
  if (role === 'member') return 'Редактор'
  return 'Участник'
}

export function canManageTeamMembers(role?: string | null): boolean {
  return role === 'owner'
}

export function canReviewChapters(role?: string | null): boolean {
  return role === 'owner' || role === 'reviewer'
}

export function isEditableMemberRole(role?: string | null): role is EditableTeamRole {
  return role === 'member' || role === 'reviewer'
}
