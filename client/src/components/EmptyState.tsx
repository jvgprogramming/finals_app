import type { ReactNode } from 'react';

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '48px 24px',
        backgroundColor: 'var(--velvet-cream)',
        borderRadius: '20px',
        border: '1px solid var(--almond)',
      }}
    >
      {icon ? <div style={{ marginBottom: '12px', opacity: 0.4 }}>{icon}</div> : null}
      <h4 style={{ margin: '0 0 8px', fontSize: '18px' }}>{title}</h4>
      {description ? (
        <p style={{ color: 'var(--cocoa)', marginBottom: action ? '20px' : 0 }}>
          {description}
        </p>
      ) : null}
      {action}
    </div>
  );
}
