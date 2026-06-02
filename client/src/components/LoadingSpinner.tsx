type LoadingSpinnerProps = {
  label?: string;
};

export default function LoadingSpinner({ label = 'Loading…' }: LoadingSpinnerProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        gap: '12px',
        color: 'var(--cocoa)',
      }}
    >
      <div
        className="loading-spinner"
        style={{
          width: 36,
          height: 36,
          border: '3px solid var(--almond)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
        aria-hidden
      />
      <span style={{ fontSize: '14px' }}>{label}</span>
    </div>
  );
}
