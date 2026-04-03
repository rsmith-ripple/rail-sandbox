export default function StatusBadge({ status }) {
  if (!status) return null;

  const statusLower = status.toLowerCase();
  const statusMap = {
    pending: 'status-pending',
    approved: 'status-approved',
    completed: 'status-completed',
    failed: 'status-failed',
    active: 'status-active',
  };

  const statusClass = statusMap[statusLower] || 'status-pending';

  return <span className={`status-badge ${statusClass}`}>{status}</span>;
}
