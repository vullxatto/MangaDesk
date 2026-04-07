import { CloudDownload, Pencil } from 'lucide-react'

function ReviewPipelineReadyGrids({ pipelineItems, readyItems }) {
  const pipeEmpty = !pipelineItems?.length
  const readyEmpty = !readyItems?.length

  const rowCount = Math.max(
    Math.ceil((pipelineItems?.length ?? 0) / 3),
    Math.ceil((readyItems?.length ?? 0) / 3),
    1,
  )

  return (
    <div className="review-pipeline-ready-columns">
      <div className="review-sync-head">
        <h2 id="review-pipeline-heading" className="review-section-title">
          В редактуре
        </h2>
        <h2 id="review-ready-heading" className="review-section-title">
          Готово к скачиванию
        </h2>
      </div>
      <div
        className="review-sync-root"
        style={{ '--review-sync-rows': rowCount }}
      >
        <div className="review-panel review-panel--pipeline review-sync-col">
          {pipeEmpty ? (
            <p className="review-empty">Нет глав в редактуре</p>
          ) : (
            <ul className="review-pipeline-list" aria-labelledby="review-pipeline-heading">
              {pipelineItems.map((row) => (
                <li key={row.id} className="review-pipeline-card">
                  <div className="review-pipeline-card-top">
                    <span className="review-pipeline-chapter-badge">№ {row.chapterNumber}</span>
                    <span className="review-pipeline-card-actions">
                      <button type="button" className="review-pipeline-edit-btn" aria-label="Редактировать">
                        <Pencil size={15} strokeWidth={1.8} />
                      </button>
                    </span>
                  </div>
                  <p className="review-pipeline-card-title">{row.projectTitle}</p>
                  <div className="review-pipeline-card-spacer" aria-hidden />
                  <div className="review-pipeline-card-person">
                    <span className="review-pipeline-card-person-name">{row.participantName}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="review-panel review-panel--ready review-sync-col">
          {readyEmpty ? (
            <p className="review-empty">Нет готовых глав</p>
          ) : (
            <ul className="review-ready-list" aria-labelledby="review-ready-heading">
              {readyItems.map((row) => (
                <li key={row.id} className="review-ready-card">
                  <div className="review-ready-card-top">
                    <span className="review-ready-chapter-badge">№ {row.chapterNumber}</span>
                    <time className="review-ready-time" dateTime={row.readyAtIso ?? undefined}>
                      {row.readyAt}
                    </time>
                  </div>
                  <p className="review-ready-card-title">{row.projectTitle}</p>
                  <div className="review-ready-card-spacer" aria-hidden />
                  <button
                    type="button"
                    className="team-card-details-btn review-ready-download"
                    aria-label={`Скачать главу ${row.projectTitle}, № ${row.chapterNumber}`}
                  >
                    <CloudDownload size={16} strokeWidth={2} aria-hidden />
                    <span>Скачать</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReviewPipelineReadyGrids
