import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { PressActionButton } from '../../components/PressActionButton'

type ChapterReviewModalProps = {
  open: boolean
  chapterLabel: string
  onClose: () => void
  onConfirm: (comment: string) => void | Promise<void>
  submitting?: boolean
}

export default function ChapterReviewModal({
  open,
  chapterLabel,
  onClose,
  onConfirm,
  submitting = false,
}: ChapterReviewModalProps) {
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (!open) setComment('')
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="team-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="team-modal chapter-review-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="chapter-review-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="chapter-review-modal-title" className="team-modal-title">
          Вернуть редактору
        </h2>
        <p className="chapter-review-modal-subtitle">{chapterLabel}</p>
        <label className="chapter-review-modal-label">
          Комментарий для редактора
          <textarea
            className="chapter-review-modal-textarea"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Что нужно исправить?"
            disabled={submitting}
          />
        </label>
        <div className="chapter-review-modal-actions">
          <PressActionButton buttonClassName="review-queue-submit" onClick={onClose} disabled={submitting}>
            <span>Отмена</span>
          </PressActionButton>
          <PressActionButton
            buttonClassName="review-queue-submit"
            disabled={submitting || !comment.trim()}
            onClick={() => void onConfirm(comment.trim())}
          >
            <span>{submitting ? 'Отправка…' : 'Отправить обратно'}</span>
          </PressActionButton>
        </div>
      </div>
    </div>,
    document.body,
  )
}
