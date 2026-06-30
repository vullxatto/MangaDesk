import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react'
import { PressActionButton } from '../../components/PressActionButton'
import { formatApiErrorMessage } from '../../lib/api'

type DashboardLoadErrorProps = {
  message: string
  onRetry: () => void
  onClose: () => void
  retrying?: boolean
}

function formatDashboardError(message: string) {
  const lower = message.toLowerCase()

  if (lower.includes('failed to fetch') || lower.includes('networkerror') || lower.includes('load failed')) {
    return {
      title: 'Нет связи с сервером',
      detail: 'Проверьте подключение к интернету или убедитесь, что сервер запущен.',
      retryable: true,
    }
  }

  return {
    title: 'Ошибка',
    detail: formatApiErrorMessage(message),
    retryable: false,
  }
}

export default function DashboardLoadError({
  message,
  onRetry,
  onClose,
  retrying = false,
}: DashboardLoadErrorProps) {
  const { title, detail, retryable } = formatDashboardError(message)
  const ErrorIcon = retryable ? WifiOff : AlertCircle

  return (
    <div className="dashboard-load-error article-mini-card" role="alert">
      <div className="dashboard-load-error-icon-wrap" aria-hidden>
        <ErrorIcon size={28} strokeWidth={1.75} className="dashboard-load-error-icon" />
      </div>
      <div className="dashboard-load-error-copy">
        <h2 className="dashboard-load-error-title">{title}</h2>
        <p className="dashboard-load-error-detail">{detail}</p>
      </div>
      <PressActionButton
        onClick={retryable ? onRetry : onClose}
        disabled={retryable && retrying}
        buttonClassName="dashboard-load-error-retry"
        aria-label={retryable ? 'Повторить загрузку' : 'Закрыть'}
      >
        {retryable ? (
          <RefreshCw
            size={14}
            strokeWidth={2.25}
            aria-hidden
            className={retrying ? 'dashboard-load-error-spin' : undefined}
          />
        ) : null}
        {retryable ? (retrying ? 'Загрузка…' : 'Повторить') : 'Закрыть'}
      </PressActionButton>
    </div>
  )
}
