import { usePipeline } from '../../context/usePipeline'

function ReviewProcessingSection() {
  const { processingJobs, formatStartedAt } = usePipeline()

  if (processingJobs.length === 0) {
    return null
  }

  return (
    <section className="review-section review-processing-section" aria-labelledby="review-processing-heading">
      <h2 id="review-processing-heading" className="review-section-title">
        Обработка
      </h2>
      <ul className="review-processing-list">
        {processingJobs.map((job) => {
          const pct =
            job.totalChapters > 0
              ? Math.min(100, Math.round((job.current / job.totalChapters) * 100))
              : 0
          const n = Math.min(job.current + 1, job.totalChapters)
          return (
            <li key={job.id} className="review-panel review-processing-card">
              <div className="review-processing-card-head">
                <span className="review-processing-filename">{job.fileName}</span>
                <time className="review-processing-started" dateTime={new Date(job.startedAt).toISOString()}>
                  Начато: {formatStartedAt(job.startedAt)}
                </time>
              </div>
              <div
                className="review-processing-progress-track"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="review-processing-progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <p className="review-processing-counter">
                Глава {n} из {job.totalChapters}
              </p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default ReviewProcessingSection
