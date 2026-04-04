function StatusBadge({ statusCode, status }) {
  return <b className={`status-badge status-${statusCode}`}>{status}</b>
}

export default StatusBadge
