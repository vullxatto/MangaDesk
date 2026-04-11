import { usePipeline } from '../../context/PipelineContext'

function SettingsPage({ title = 'Настройки' }) {
  const { soloMode, setSoloMode } = usePipeline()

  return (
    <div className="chapters-page projects-page settings-page">
      <div className="dashboard-toolbar projects-page-toolbar">
        <h1>{title}</h1>
      </div>
      <div className="chapters-panel settings-panel">
        <label className="settings-solo-toggle">
          <span className="settings-solo-label">Режим соло-переводчика</span>
          <span className="settings-toggle">
            <input
              type="checkbox"
              className="settings-toggle-input"
              checked={soloMode}
              onChange={(e) => setSoloMode(e.target.checked)}
            />
            <span className="settings-toggle-track" aria-hidden="true">
              <span className="settings-toggle-thumb" />
            </span>
          </span>
        </label>
      </div>
    </div>
  )
}

export default SettingsPage
