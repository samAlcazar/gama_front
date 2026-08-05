import React, { useState, useEffect } from 'react';
import { Inbox, Eye, Send, Search, Clock } from 'lucide-react';
import { getInbox } from '../api/roadmaps';
import { RoadmapDetailModal } from './RoadmapDetailModal';
import { DeriveRoadmapModal } from './DeriveRoadmapModal';
import { EmptyState } from './EmptyState';
import { useAuth } from '../context/AuthContext';

export const InboxView = () => {
  const { hasPermission } = useAuth();
  const [inboxItems, setInboxItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedRoadmapForDetail, setSelectedRoadmapForDetail] = useState(null);
  const [selectedRoadmapForDerive, setSelectedRoadmapForDerive] = useState(null);

  const fetchInbox = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInbox();
      setInboxItems(data || []);
    } catch (err) {
      setError(err.message || 'Error al cargar la bandeja de entrada');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  const filteredItems = inboxItems.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.roadmap_number?.toLowerCase().includes(term) ||
      item.subject?.toLowerCase().includes(term) ||
      item.applicant_name?.toLowerCase().includes(term) ||
      item.procedure_code?.toLowerCase().includes(term)
    );
  });

  const getPriorityBadgeClass = (p) => {
    switch (p) {
      case 'ALTA': return 'badge-danger';
      case 'MEDIA': return 'badge-warning';
      default: return 'badge-secondary';
    }
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diffMs = new Date() - new Date(dateStr);
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Hace unos minutos';
    if (diffHours < 24) return `Hace ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays} día(s)`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Inbox size={24} color="var(--primary)" /> Bandeja de Entrada Activa
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Expedientes pendientes recepcionados en su unidad o asignados a su puesto.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={fetchInbox}>
          Actualizar Bandeja
        </button>
      </div>

      <div className="card-custom" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Buscar por Nro HR, Asunto, Solicitante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="card-custom" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Cargando bandeja de entrada...
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Bandeja de Entrada Limpia"
          message={searchTerm ? 'No hay expedientes pendientes que coincidan con la búsqueda.' : 'No existen expedientes pendientes de atención en su unidad.'}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {filteredItems.map((item) => (
            <div
              key={item.movement_id}
              className="card-custom page-transition"
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                gap: '1rem',
                borderLeft: `4px solid ${item.priority === 'ALTA' ? 'var(--danger)' : 'var(--primary)'}`,
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>
                    {item.roadmap_number}
                  </span>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <span className={`badge ${getPriorityBadgeClass(item.priority)}`}>{item.priority}</span>
                    <span className="badge badge-primary">Paso {item.step_number}</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.925rem', fontWeight: 500, lineHeight: 1.45, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
                  {item.subject}
                </p>

                {item.applicant_name && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    <strong>Solicitante:</strong> {item.applicant_name}
                  </div>
                )}

                {item.instruction && (
                  <div style={{ background: 'var(--bg-hover)', padding: '0.65rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                    <strong>Instrucción:</strong> "{item.instruction}"
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={13} /> {getTimeAgo(item.entry_at)}
                </span>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    className="btn btn-secondary btn-icon-only"
                    title="Ver Expediente Completo"
                    onClick={() => setSelectedRoadmapForDetail(item.roadmap_id)}
                  >
                    <Eye size={16} />
                  </button>
                  {hasPermission('TRAMITE_DERIVAR') && (
                    <button
                      className="btn btn-primary"
                      style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
                      onClick={() => setSelectedRoadmapForDerive({ id: item.roadmap_id, roadmap_number: item.roadmap_number, subject: item.subject })}
                    >
                      <Send size={14} /> Derivar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedRoadmapForDetail && (
        <RoadmapDetailModal
          isOpen={Boolean(selectedRoadmapForDetail)}
          onClose={() => setSelectedRoadmapForDetail(null)}
          roadmapID={selectedRoadmapForDetail}
          onRefresh={fetchInbox}
        />
      )}

      {selectedRoadmapForDerive && (
        <DeriveRoadmapModal
          isOpen={Boolean(selectedRoadmapForDerive)}
          onClose={() => setSelectedRoadmapForDerive(null)}
          roadmap={selectedRoadmapForDerive}
          onDeriveSuccess={() => {
            fetchInbox();
          }}
        />
      )}
    </div>
  );
};
