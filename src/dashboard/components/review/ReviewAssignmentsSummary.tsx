import { Check, ChevronLeft, ChevronRight, CloudDownload, RotateCcw, User } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { apiPostJson } from '../../../lib/api'
import { usePipeline } from '../../context/usePipeline'
import type { ChapterRow } from '../../pipelineTypes'
import { formatRuDateTime } from '../../projectDates'
import { canReviewChapters } from '../../teamRoles'
import ChapterReviewModal from '../ChapterReviewModal'
import DashboardDropdown from '../DashboardDropdown'
import TeamInviteModal from '../TeamInviteModal'

function chapterLabel(title: string, number: number) {
  return `${title} № ${number}`
}

function overviewDateLabel(value: string | null | undefined) {
  if (!value) return '—'
  return formatRuDateTime(value)
}

function paginateItems<T>(items: T[], pageIndex: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const safePageIndex = Math.min(pageIndex, totalPages - 1)
  const start = safePageIndex * pageSize

  return {
    items: items.slice(start, start + pageSize),
    totalPages,
    safePageIndex,
  }
}

export default function ReviewAssignmentsSummary({
  pageSize = 4,
  isColumnVisible,
  gridTemplate,
}: {
  pageSize?: number
  isColumnVisible: (id: string) => boolean
  gridTemplate: string
}) {
  const { chapters, teamMembers, assignEditor, reviewChapter, downloadChapterDeliverables } = usePipeline()
  const { teams, currentTeamId } = useAuth()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [rejectChapter, setRejectChapter] = useState<ChapterRow | null>(null)
  const [reviewBusyId, setReviewBusyId] = useState<string | null>(null)
  const [assignMenuKey, setAssignMenuKey] = useState<string | null>(null)
  const [waitingPage, setWaitingPage] = useState(0)
  const [editPage, setEditPage] = useState(0)
  const [reviewPage, setReviewPage] = useState(0)

  const canModerateReview = useMemo(() => {
    const team = teams.find((t) => t.id === currentTeamId)
    return canReviewChapters(team?.role)
  }, [teams, currentTeamId])

  const isPersonalTeam = useMemo(() => {
    const team = teams.find((t) => t.id === currentTeamId)
    return !!team?.is_personal
  }, [teams, currentTeamId])

  const assignOptions = useMemo(
    () => [{ value: '', label: 'Не назначен' }, ...teamMembers.map((member) => ({ value: member.id, label: member.name }))],
    [teamMembers],
  )

  const waitingEditor = useMemo(
    () =>
      chapters
        .filter((chapter) => chapter.statusCode === 'waiting_editor')
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [chapters],
  )

  const inEdit = useMemo(
    () =>
      chapters
        .filter((chapter) => chapter.statusCode === 'edit')
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [chapters],
  )

  const reviewQueue = useMemo(
    () =>
      chapters
        .filter((chapter) => chapter.statusCode === 'review')
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [chapters],
  )

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (!assignMenuKey) return
      const t = e.target as Node
      const trigger = document.querySelector(`[data-review-queue-dd="${CSS.escape(assignMenuKey)}"]`)
      const portalMenu = document.querySelector(`[data-review-queue-portal="${CSS.escape(assignMenuKey)}"]`)
      if (trigger?.contains(t) || portalMenu?.contains(t)) return
      setAssignMenuKey(null)
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setAssignMenuKey(null)
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [assignMenuKey])

  const waitingBoard = paginateItems(waitingEditor, waitingPage, pageSize)
  const editBoard = paginateItems(inEdit, editPage, pageSize)
  const reviewBoard = paginateItems(reviewQueue, reviewPage, pageSize)
  const rowStyle = { gridTemplateColumns: gridTemplate }

  async function openInviteMemberModal() {
    const res = await apiPostJson<{ invite_url: string }>('/team/invites', {})
    setInviteLink(res.invite_url)
    setInviteOpen(true)
  }

  useEffect(() => {
    setWaitingPage((page) => Math.min(page, waitingBoard.totalPages - 1))
  }, [waitingBoard.totalPages])

  useEffect(() => {
    setEditPage((page) => Math.min(page, editBoard.totalPages - 1))
  }, [editBoard.totalPages])

  useEffect(() => {
    setReviewPage((page) => Math.min(page, reviewBoard.totalPages - 1))
  }, [reviewBoard.totalPages])

  return (
    <div className="review-section review-assignments-section">
      <div className="review-assignments-grid">
        <section className="review-assignments-block" aria-labelledby="review-assignments-waiting-heading">
          <div className="review-assignments-head">
            <h3 id="review-assignments-waiting-heading" className="review-assignments-title">
              Ждёт редактора ({waitingEditor.length})
            </h3>
            {waitingBoard.totalPages > 1 ? (
              <div className="review-assignments-pagination review-assignments-pagination--head">
                <button
                  type="button"
                  className="review-queue-clear chapters-page-pagination-btn"
                  onClick={() => setWaitingPage((page) => Math.max(0, page - 1))}
                  disabled={waitingBoard.safePageIndex <= 0}
                  aria-label="Предыдущая страница ожидания редактора"
                >
                  <ChevronLeft size={16} strokeWidth={1.8} aria-hidden />
                </button>
                <span className="review-assignments-page-indicator">
                  {waitingBoard.safePageIndex + 1} / {waitingBoard.totalPages}
                </span>
                <button
                  type="button"
                  className="review-queue-clear chapters-page-pagination-btn"
                  onClick={() => setWaitingPage((page) => Math.min(waitingBoard.totalPages - 1, page + 1))}
                  disabled={waitingBoard.safePageIndex >= waitingBoard.totalPages - 1}
                  aria-label="Следующая страница ожидания редактора"
                >
                  <ChevronRight size={16} strokeWidth={1.8} aria-hidden />
                </button>
              </div>
            ) : null}
          </div>
          <div className="review-assignments-card article-mini-card">
          {waitingEditor.length === 0 ? (
            <p className="review-assignments-empty">Сейчас нет глав, ожидающих назначения редактору.</p>
          ) : (
            <>
              <div className="review-assignments-table">
                <div className="review-assignments-table-head review-assignments-table-head--waiting" style={rowStyle}>
                  {isColumnVisible('title') ? <span>Проект / №</span> : null}
                  {isColumnVisible('createdAt') ? <span>Дата создания</span> : null}
                  {isColumnVisible('updatedAt') ? <span>Дата изменения</span> : null}
                  {isColumnVisible('editor') ? <span>Редактор</span> : null}
                </div>
                <ul className="review-assignments-table-body">
                  {waitingBoard.items.map((chapter) => (
                    <li
                      key={chapter.id}
                      className="review-assignments-table-row review-assignments-table-row--waiting"
                      style={rowStyle}
                    >
                      {isColumnVisible('title') ? (
                        <span className="review-assignments-chapter-name">
                          {chapterLabel(chapter.title, chapter.number)}
                        </span>
                      ) : null}
                      {isColumnVisible('createdAt') ? (
                        <span className="review-assignments-chapter-meta">{overviewDateLabel(chapter.createdAt)}</span>
                      ) : null}
                      {isColumnVisible('updatedAt') ? (
                        <span className="review-assignments-chapter-meta">{overviewDateLabel(chapter.date)}</span>
                      ) : null}
                      {isColumnVisible('editor') ? (
                        <div className="review-assignments-assign chapters-editor">
                          <DashboardDropdown
                            label="Редактор"
                            options={assignOptions}
                            value=""
                            onChange={(value) => {
                              if (!value) return
                              void assignEditor([chapter.id], value)
                            }}
                            ddKey={`overview-assign|${chapter.id}`}
                            openKey={assignMenuKey}
                            onOpenChange={setAssignMenuKey}
                            maxVisibleRows={9}
                            menuPlacement="top"
                            menuAlign="right"
                            footerAction={
                              isPersonalTeam
                                ? undefined
                                : {
                                    label: 'Добавить участника',
                                    icon: <User size={12} strokeWidth={2.5} aria-hidden />,
                                    onClick: () => void openInviteMemberModal(),
                                  }
                            }
                          />
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
          </div>
        </section>

        <section className="review-assignments-block" aria-labelledby="review-assignments-edit-heading">
          <div className="review-assignments-head">
            <h3 id="review-assignments-edit-heading" className="review-assignments-title">
              В редактуре ({inEdit.length})
            </h3>
            {editBoard.totalPages > 1 ? (
              <div className="review-assignments-pagination review-assignments-pagination--head">
                <button
                  type="button"
                  className="review-queue-clear chapters-page-pagination-btn"
                  onClick={() => setEditPage((page) => Math.max(0, page - 1))}
                  disabled={editBoard.safePageIndex <= 0}
                  aria-label="Предыдущая страница редактуры"
                >
                  <ChevronLeft size={16} strokeWidth={1.8} aria-hidden />
                </button>
                <span className="review-assignments-page-indicator">
                  {editBoard.safePageIndex + 1} / {editBoard.totalPages}
                </span>
                <button
                  type="button"
                  className="review-queue-clear chapters-page-pagination-btn"
                  onClick={() => setEditPage((page) => Math.min(editBoard.totalPages - 1, page + 1))}
                  disabled={editBoard.safePageIndex >= editBoard.totalPages - 1}
                  aria-label="Следующая страница редактуры"
                >
                  <ChevronRight size={16} strokeWidth={1.8} aria-hidden />
                </button>
              </div>
            ) : null}
          </div>
          <div className="review-assignments-card article-mini-card">
            {inEdit.length === 0 ? (
              <p className="review-assignments-empty">Сейчас ни одна глава не находится в редактуре.</p>
            ) : (
              <>
                <div className="review-assignments-table">
                <div className="review-assignments-table-head" style={rowStyle}>
                  {isColumnVisible('title') ? <span>Проект / №</span> : null}
                  {isColumnVisible('createdAt') ? <span>Дата создания</span> : null}
                  {isColumnVisible('updatedAt') ? <span>Дата изменения</span> : null}
                  {isColumnVisible('editor') ? <span>Редактор</span> : null}
                </div>
                <ul className="review-assignments-table-body">
                  {editBoard.items.map((chapter) => (
                    <li key={chapter.id} className="review-assignments-table-row" style={rowStyle}>
                      {isColumnVisible('title') ? (
                        <span className="review-assignments-chapter-name">
                          {chapterLabel(chapter.title, chapter.number)}
                        </span>
                      ) : null}
                      {isColumnVisible('createdAt') ? (
                        <span className="review-assignments-chapter-meta">{overviewDateLabel(chapter.createdAt)}</span>
                      ) : null}
                      {isColumnVisible('updatedAt') ? (
                        <span className="review-assignments-chapter-meta">
                          {overviewDateLabel(chapter.assignedAt ?? chapter.date)}
                        </span>
                      ) : null}
                      {isColumnVisible('editor') ? (
                        <span className="review-assignments-review-editor chapters-editor">
                          {chapter.editorId ? (
                            <>
                              <div className="chapters-editor-avatar-wrap">
                                <div className="chapters-editor-avatar">
                                  <img
                                    src={`https://picsum.photos/seed/mangadesk-team-${chapter.editorId}/96/96`}
                                    alt=""
                                    className="chapters-editor-avatar-img"
                                    loading="lazy"
                                    decoding="async"
                                  />
                                </div>
                              </div>
                              <span className="chapters-editor-name">{chapter.editorName ?? '—'}</span>
                            </>
                          ) : (
                            <>
                              <User size={12} strokeWidth={2} aria-hidden />
                              <span className="chapters-editor-name">Без редактора</span>
                            </>
                          )}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="review-assignments-block" aria-labelledby="review-assignments-review-heading">
          <div className="review-assignments-head">
            <h3 id="review-assignments-review-heading" className="review-assignments-title">
              Ожидает проверки ({reviewQueue.length})
            </h3>
            {reviewBoard.totalPages > 1 ? (
              <div className="review-assignments-pagination review-assignments-pagination--head">
                <button
                  type="button"
                  className="review-queue-clear chapters-page-pagination-btn"
                  onClick={() => setReviewPage((page) => Math.max(0, page - 1))}
                  disabled={reviewBoard.safePageIndex <= 0}
                  aria-label="Предыдущая страница проверки"
                >
                  <ChevronLeft size={16} strokeWidth={1.8} aria-hidden />
                </button>
                <span className="review-assignments-page-indicator">
                  {reviewBoard.safePageIndex + 1} / {reviewBoard.totalPages}
                </span>
                <button
                  type="button"
                  className="review-queue-clear chapters-page-pagination-btn"
                  onClick={() => setReviewPage((page) => Math.min(reviewBoard.totalPages - 1, page + 1))}
                  disabled={reviewBoard.safePageIndex >= reviewBoard.totalPages - 1}
                  aria-label="Следующая страница проверки"
                >
                  <ChevronRight size={16} strokeWidth={1.8} aria-hidden />
                </button>
              </div>
            ) : null}
          </div>
          <div className="review-assignments-card article-mini-card">
            {reviewQueue.length === 0 ? (
              <p className="review-assignments-empty">Сейчас нет глав, ожидающих проверки.</p>
            ) : (
              <>
                <div className="review-assignments-table">
                <div className="review-assignments-table-head review-assignments-table-head--review" style={rowStyle}>
                  {isColumnVisible('title') ? <span>Проект / №</span> : null}
                  {isColumnVisible('createdAt') ? <span>Дата создания</span> : null}
                  {isColumnVisible('updatedAt') ? <span>Дата изменения</span> : null}
                  {isColumnVisible('editor') ? <span>Редактор</span> : null}
                </div>
                <ul className="review-assignments-table-body">
                  {reviewBoard.items.map((chapter) => (
                    <li
                      key={chapter.id}
                      className="review-assignments-table-row review-assignments-table-row--review"
                      style={rowStyle}
                    >
                      {isColumnVisible('title') ? (
                        <span className="review-assignments-chapter-name">
                          {chapterLabel(chapter.title, chapter.number)}
                        </span>
                      ) : null}
                      {isColumnVisible('createdAt') ? (
                        <span className="review-assignments-chapter-meta">{overviewDateLabel(chapter.createdAt)}</span>
                      ) : null}
                      {isColumnVisible('updatedAt') ? (
                        <span className="review-assignments-chapter-meta">{overviewDateLabel(chapter.date)}</span>
                      ) : null}
                      {isColumnVisible('editor') ? (
                        <span className="review-assignments-review-editor chapters-editor">
                          {chapter.editorId ? (
                            <>
                              <div className="chapters-editor-avatar-wrap">
                                <div className="chapters-editor-avatar">
                                  <img
                                    src={`https://picsum.photos/seed/mangadesk-team-${chapter.editorId}/96/96`}
                                    alt=""
                                    className="chapters-editor-avatar-img"
                                    loading="lazy"
                                    decoding="async"
                                  />
                                </div>
                              </div>
                              <span className="chapters-editor-name">{chapter.editorName ?? '—'}</span>
                            </>
                          ) : (
                            <>
                              <User size={12} strokeWidth={2} aria-hidden />
                              <span className="chapters-editor-name">Без редактора</span>
                            </>
                          )}
                        </span>
                      ) : null}
                      <span className="review-assignments-actions chapters-actions">
                        <button
                          type="button"
                          className="review-queue-clear"
                          aria-label={`Скачать главу ${chapter.title}, № ${chapter.number}`}
                          title="Скачать"
                          onClick={() => void downloadChapterDeliverables(chapter.id)}
                        >
                          <CloudDownload size={16} strokeWidth={1.8} aria-hidden />
                        </button>
                        {canModerateReview ? (
                          <>
                            <button
                              type="button"
                              className="review-queue-clear chapters-review-approve"
                              aria-label={`Принять главу ${chapter.title}, № ${chapter.number}`}
                              title="Принять"
                              disabled={reviewBusyId === chapter.id}
                              onClick={() => {
                                setReviewBusyId(chapter.id)
                                void reviewChapter(chapter.id, 'approve').finally(() => setReviewBusyId(null))
                              }}
                            >
                              <Check size={16} strokeWidth={2} aria-hidden />
                            </button>
                            <button
                              type="button"
                              className="review-queue-clear chapters-review-reject"
                              aria-label={`Вернуть главу редактору ${chapter.title}, № ${chapter.number}`}
                              title="Вернуть редактору"
                              disabled={reviewBusyId === chapter.id}
                              onClick={() => setRejectChapter(chapter)}
                            >
                              <RotateCcw size={16} strokeWidth={1.8} aria-hidden />
                            </button>
                          </>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
      <ChapterReviewModal
        open={!!rejectChapter}
        chapterLabel={rejectChapter ? `${rejectChapter.title} № ${rejectChapter.number}` : ''}
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
      <TeamInviteModal open={inviteOpen} inviteLink={inviteLink} onClose={() => setInviteOpen(false)} />
    </div>
  )
}
