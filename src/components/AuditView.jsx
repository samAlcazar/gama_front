import React, { useState } from 'react';
import { apiClient } from '../api/client';
import { ShieldAlert, Play, CheckCircle, AlertTriangle } from 'lucide-react';

export const AuditView = () => {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testAuditEndpoint = async () => {
    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const data = await apiClient('/admin/audit');
      setResponse(data);
    } catch (err) {
      setError(err.message || 'Acceso denegado o error en la petición.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)' }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>Prueba de Control de Acceso por Permisos</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Este módulo llama al endpoint protegido <code>GET /api/v1/admin/audit</code>.
            </p>
          </div>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          El backend en Go verifica mediante el middleware <code>RequirePermission("AUDITORIA_VER")</code> si tu token tiene asignado este permiso específico antes de procesar la solicitud.
        </p>

        <button onClick={testAuditEndpoint} className="btn btn-primary" disabled={loading}>
          <Play size={16} />
          <span>{loading ? 'Consultando...' : 'Ejecutar Consulta a /admin/audit'}</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'flex-start' }}>
          <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Acceso Bloqueado (HTTP 403 / 401)</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {response && (
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', marginBottom: '0.75rem' }}>
            <CheckCircle size={20} />
            <h4 style={{ fontSize: '1.05rem', color: 'var(--success)' }}>Respuesta Exitosa del Servidor (HTTP 200)</h4>
          </div>

          <pre style={{
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            color: '#a7f3d0',
            fontSize: '0.9rem',
            overflowX: 'auto',
          }}>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
