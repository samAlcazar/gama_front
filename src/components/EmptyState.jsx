import React from 'react';
import { SearchX, Inbox } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = SearchX,
  title = 'No se encontraron resultados',
  description = 'Intenta ajustar los filtros de búsqueda o el término ingresado.',
  actionText,
  onAction,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        background: 'transparent',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--bg-hover)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          marginBottom: '1rem',
        }}
      >
        <Icon size={26} />
      </div>

      <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
        {title}
      </h4>

      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '360px', marginBottom: actionText ? '1.25rem' : '0' }}>
        {description}
      </p>

      {actionText && onAction && (
        <button type="button" onClick={onAction} className="btn btn-secondary">
          {actionText}
        </button>
      )}
    </div>
  );
};
