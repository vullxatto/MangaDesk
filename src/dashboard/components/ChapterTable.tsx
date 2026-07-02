import { useMemo, useState } from 'react'
import { CloudDownload, Pencil, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { apiPostJson } from '../../lib/api'
import { usePipeline } from '../context/usePipeline'
import type { ChapterRow } from '../pipelineTypes'
import DashboardDropdown from './DashboardDropdown'
import StatusBadge from './StatusBadge'
import TeamInviteModal from './TeamInviteModal'

const STATUS_LABEL = {
  ready: 'ГОТОВО',
  ai: 'ОБРАБОТКА',
  edit: 'РЕДАКТУРА',
  upload: 'ЗАГРУЗКА',
  waiting_editor: 'ЖДЁТ РЕДАКТОРА',
}

function AssignEditorControl({
  assignMenuKey,
  rowId,
  onAssignMenuKey,
  onPick,
  teamMembers,
  isPersonalTeam,
  onOpenInvite,
}: {
  assignMenuKey: string | null
  rowId: string
  onAssignMenuKey: (key: string | null | ((prev: string | null) => string | null)) => void
  onPick: (editorId: string) => void
  teamMembers: { id: string; name: string }[]
  isPersonalTeam: boolean
  onOpenInvite: () => void
}) {
  const options = useMemo(
    () => [{ value: '', label: 'Не назначен' }, ...teamMembers.map((m) => ({ value: m.id, label: m.name }))],
    [teamMembers],
  )

  return (
    <DashboardDropdown
      label="Редактор"
      options={options}
      value=""
      onChange={(value) => {
        if (!value) return
        void onPick(value)
      }}
      ddKey={`chapter-assign|${rowId}`}
      openKey={assignMenuKey}
      onOpenChange={onAssignMenuKey}
      maxVisibleRows={9}
      menuPlacement="top"
      menuAlign="right"
      footerAction={
        isPersonalTeam
          ? undefined
          : {
              label: 'Добавить участника',
              icon: <UserPlus size={12} strokeWidth={2.5} aria-hidden />,
              onClick: onOpenInvite,
            }
      }
    />
  )
}

function ChapterTable({
  rows,
  assignMenuKey,
  onAssignMenuKey: setAssignMenuKey,
  onOpenMetadataModal,
}: {
  rows: ChapterRow[]
  assignMenuKey: string | null
  onAssignMenuKey: (key: string | null | ((prev: string | null) => string | null)) => void
  onOpenMetadataModal: (chapterId: string) => void
}) {
  const { soloMode, assignEditor, selectedWaitingIds, toggleWaitingSelected, teamMembers } = usePipeline()
  const { teams, currentTeamId } = useAuth()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteLink, setInviteLink] = useState('')

  const isPersonalTeam = useMemo(() => {
    const team = teams.find((t) => t.id === currentTeamId)
    return !!team?.is_personal
  }, [teams, currentTeamId])

  async function openInviteMemberModal() {
    const res = await apiPostJson<{ invite_url: string }>('/team/invites', {})
    setInviteLink(res.invite_url)
    setInviteOpen(true)
  }

  return (
    <>
      <div className="chapters-table">
        <div
          className={`chapters-row chapters-head ${soloMode ? 'chapters-row--solo' : 'chapters-row--with-select'}`}
        >
          {!soloMode ? <span className="chapters-select-head" aria-hidden="true" /> : null}
          <span>Проект / №</span>
          <span>Статус</span>
          <span>Перевод</span>
          <span>Дата изменения</span>
          {!soloMode ? <span>Редактор</span> : null}
          <span className="chapters-actions-head" aria-hidden="true" />
        </div>

        {rows.map((row) => {
          const label = STATUS_LABEL[row.statusCode] ?? row.statusCode
          const showCheckbox = !soloMode && row.statusCode === 'waiting_editor'
          const checked = selectedWaitingIds.has(row.id)

          return (
            <div
              key={row.id}
              className={`chapters-row ${soloMode ? 'chapters-row--solo' : 'chapters-row--with-select'}`}
            >
              {!soloMode ? (
                <span className="chapters-select-cell">
                  {showCheckbox ? (
                    <input
                      type="checkbox"
                      className="chapters-select-checkbox"
                      checked={checked}
                      onChange={() => toggleWaitingSelected(row.id)}
                      aria-label={`Выбрать главу № ${row.number}`}
                    />
                  ) : null}
                </span>
              ) : null}
              <span className="chapters-title">
                <span className="chapters-title-main">
                  {row.title} <strong className="chapters-title-number">№ {row.number}</strong>
                </span>
                {row.restoredFromTrash ? <span className="chapters-title-note">(восстановленная)</span> : null}
              </span>
              <span>
                <StatusBadge statusCode={row.statusCode} status={label} />
              </span>
              <span className="chapters-translate">
                <Link
                  className="review-queue-clear projects-link-tag"
                  to={`/dashboard/chapters/${row.id}/edit`}
                >
                  Открыть
                </Link>
              </span>
              <span className="chapters-date">{row.date}</span>
              {!soloMode ? (
                <span className="chapters-editor">
                  {!row.editorId ? (
                    <AssignEditorControl
                      assignMenuKey={assignMenuKey}
                      rowId={row.id}
                      onAssignMenuKey={setAssignMenuKey}
                      onPick={(editorId) => void assignEditor([row.id], editorId)}
                      teamMembers={teamMembers}
                      isPersonalTeam={isPersonalTeam}
                      onOpenInvite={() => void openInviteMemberModal()}
                    />
                  ) : (
                    <>
                      <div className="chapters-editor-avatar-wrap">
                        <div className="chapters-editor-avatar">
                          <img
                            src={`https://picsum.photos/seed/mangadesk-team-${row.editorId}/96/96`}
                            alt=""
                            className="chapters-editor-avatar-img"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      </div>
                      <span className="chapters-editor-name">{row.editorName ?? '—'}</span>
                    </>
                  )}
                </span>
              ) : null}
              <span className="chapters-actions">
                {row.statusCode === 'ready' ? (
                  <button
                    type="button"
                    className="review-queue-clear"
                    aria-label={`Скачать главу ${row.title}, № ${row.number}`}
                  >
                    <CloudDownload size={16} strokeWidth={1.8} aria-hidden />
                  </button>
                ) : null}
                <button
                  type="button"
                  className="review-queue-clear"
                  aria-label={`Изменить проект и номер: ${row.title}, № ${row.number}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onOpenMetadataModal(row.id)
                  }}
                >
                  <Pencil size={16} strokeWidth={1.8} aria-hidden />
                </button>
              </span>
            </div>
          )
        })}
      </div>
      <TeamInviteModal
        open={inviteOpen}
        inviteLink={inviteLink}
        onClose={() => setInviteOpen(false)}
      />
    </>
  )
}

export default ChapterTable
