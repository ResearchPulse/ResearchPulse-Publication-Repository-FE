export const API_PENDING_MESSAGE = 'API nghiệp vụ chưa được triển khai ở Public BE. FE đã sẵn sàng theo contract; cần bổ sung API để kích hoạt tính năng.';

export function ApiPendingState({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? 'preprint-api-pending preprint-api-pending--compact' : 'preprint-api-pending'} role="status">
      <strong>API cần bổ sung</strong>
      <span>{API_PENDING_MESSAGE}</span>
    </div>
  );
}

export default ApiPendingState;
