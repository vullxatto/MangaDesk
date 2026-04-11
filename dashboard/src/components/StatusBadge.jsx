function badgeModifier(statusCode) {
  if (statusCode === 'waiting_editor') return 'waiting'
  return statusCode
}

function StatusBadge({ statusCode, status }) {
  return <b className={`status-badge status-${badgeModifier(statusCode)}`}>{status}</b>
}

export default StatusBadge
