export default function Error({ message, onRetry }) {
  return (
    <div className="error-container">
      <div className="error-card">
        <h2>Error</h2>
        <p>{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="btn-primary">
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
