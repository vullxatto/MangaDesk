import { useMemo, useState } from 'react'
import { Check, CloudDownload, Pencil, RotateCcw, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { apiPostJson } from '../../lib/api'
import { usePipeline } from '../context/usePipeline'
import { formatRuDateTime } from '../projectDates'
import type { ChapterRow } from '../pipelineTypes'
import ChapterReviewModal from './ChapterReviewModal'
import DashboardDropdown from './DashboardDropdown'
import StatusBadge from './StatusBadge'
import TeamInviteModal from './TeamInviteModal'

const STATUS_LABEL = {
  ready: 'ГОТОВО',
  ai: 'ОБРАБОТКА',
  edit: 'РЕДАКТУРА',
  upload: 'ЗАГРУЗКА',
  waiting_editor: 'ЖДЁТ РЕДАКТОРА',
  review: 'ПРОВЕРКА',
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
  isColumnVisible,
  gridTemplate,
}: {
  rows: ChapterRow[]
  assignMenuKey: string | null
  onAssignMenuKey: (key: string | null | ((prev: string | null) => string | null)) => void
  onOpenMetadataModal: (chapterId: string) => void
  isColumnVisible: (id: string) => boolean
  gridTemplate: string
}) {
  const { soloMode, assignEditor, teamMembers, reviewChapter, downloadChapterDeliverables } = usePipeline()
  const { teams, currentTeamId } = useAuth()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [rejectChapter, setRejectChapter] = useState<ChapterRow | null>(null)
  const [reviewBusyId, setReviewBusyId] = useState<string | null>(null)

  const isPersonalTeam = useMemo(() => {
    const team = teams.find((t) => t.id === currentTeamId)
    return !!team?.is_personal
  }, [teams, currentTeamId])

  const isTeamOwner = useMemo(() => {
    const team = teams.find((t) => t.id === currentTeamId)
    return team?.role === 'owner'
  }, [teams, currentTeamId])

  async function openInviteMemberModal() {
    const res = await apiPostJson<{ invite_url: string }>('/team/invites', {})
    setInviteLink(res.invite_url)
    setInviteOpen(true)
  }

  const rowStyle = { gridTemplateColumns: gridTemplate }

  return (
    <>
      <div className="chapters-table">
        <div className={`chapters-row chapters-head${soloMode ? ' chapters-row--solo' : ''}`} style={rowStyle}>
          {isColumnVisible('title') ? <span>Проект / №</span> : null}
          {isColumnVisible('status') ? <span>Статус</span> : null}
          {isColumnVisible('translate') ? <span>Перевод</span> : null}
          {isColumnVisible('createdAt') ? <span>Дата создания</span> : null}
          {isColumnVisible('updatedAt') ? <span>Дата изменения</span> : null}
          {isColumnVisible('editor') ? <span>Редактор</span> : null}
          <span className="chapters-actions-head" aria-hidden="true" />
        </div>

        {rows.map((row) => {
          const label = STATUS_LABEL[row.statusCode] ?? row.statusCode

          return (
            <div
              key={row.id}
              className={`chapters-row${soloMode ? ' chapters-row--solo' : ''}`}
              style={rowStyle}
            >
              {isColumnVisible('title') ? (
                <span className="chapters-title">
                  <span className="chapters-title-main">
                    {row.title} <strong className="chapters-title-number">№ {row.number}</strong>
                  </span>
                  {row.restoredFromTrash ? <span className="chapters-title-note">(восстановленная)</span> : null}
                </span>
              ) : null}
              {isColumnVisible('status') ? (
                <span>
                  <StatusBadge statusCode={row.statusCode} status={label} />
                </span>
              ) : null}
              {isColumnVisible('translate') ? (
                <span className="chapters-translate">
                  <Link
                    className="review-queue-clear projects-link-tag"
                    to={`/dashboard/chapters/${row.id}/edit`}
                  >
                    Открыть
                  </Link>
                </span>
              ) : null}
              {isColumnVisible('createdAt') ? (
                <span className="chapters-date">{formatRuDateTime(row.createdAt)}</span>
              ) : null}
              {isColumnVisible('updatedAt') ? (
                <span className="chapters-date">{formatRuDateTime(row.updatedAt)}</span>
              ) : null}
              {isColumnVisible('editor') ? (
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
                {row.statusCode === 'ready' || row.statusCode === 'review' ? (
                  <button
                    type="button"
                    className="review-queue-clear"
                    aria-label={`Скачать главу ${row.title}, № ${row.number}`}
                    title="Скачать"
                    onClick={() => void downloadChapterDeliverables(row.id)}
                  >
                    <CloudDownload size={16} strokeWidth={1.8} aria-hidden />
                  </button>
                ) : null}
                {isTeamOwner && row.statusCode === 'review' ? (
                  <>
                    <button
                      type="button"
                      className="review-queue-clear chapters-review-approve"
                      aria-label={`Принять главу ${row.title}, № ${row.number}`}
                      title="Принять"
                      disabled={reviewBusyId === row.id}
                      onClick={() => {
                        setReviewBusyId(row.id)
                        void reviewChapter(row.id, 'approve').finally(() => setReviewBusyId(null))
                      }}
                    >
                      <Check size={16} strokeWidth={2} aria-hidden />
                    </button>
                    <button
                      type="button"
                      className="review-queue-clear chapters-review-reject"
                      aria-label={`Вернуть главу редактору ${row.title}, № ${row.number}`}
                      title="Вернуть редактору"
                      disabled={reviewBusyId === row.id}
                      onClick={() => setRejectChapter(row)}
                    >
                      <RotateCcw size={16} strokeWidth={1.8} aria-hidden />
                    </button>
                  </>
                ) : null}
                <button
                  type="button"
                  className="review-queue-clear"
                  aria-label={`Изменить главу: ${row.title}, № ${row.number}`}
                  title="Изменить главу"
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
      <ChapterReviewModal
        open={!!rejectChapter}
        chapterLabel={
          rejectChapter ? `${rejectChapter.title} № ${rejectChapter.number}` : ''
        }
        onClose={() => setRejectChapter(null)}
        submitting={!!rejectChapter && reviewBusyId === rejectChapter.id}
        onConfirm={async (comment) => {
          if (!rejectChapter) return
          setReviewBusyId(rejectChapter.id)
          try {
            await reviewChapter(rejectChapter.id, 'reject', comment)
            setRejectChapter(null)
          } finally {
            setReviewBusyId(null)
          }
        }}
      />
    </>
  )
}

export default ChapterTable
