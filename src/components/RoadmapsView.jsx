import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Eye, Send } from 'lucide-react';
import { getRoadmaps } from '../api/roadmaps';
import { CreateRoadmapModal } from './CreateRoadmapModal';
import { DeriveRoadmapModal } from './DeriveRoadmapModal';
import { RoadmapDetailModal } from './RoadmapDetailModal';
import { EmptyState } from './EmptyState';
import { useAuth } from '../context/AuthContext';

export const RoadmapsView = () => {
  const { hasPermission } = useAuth();
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRoadmapForDetail, setSelectedRoadmapForDetail] = useState(null);
  const [selectedRoadmapForDerive, setSelectedRoadmapForDerive] = useState(null);

  const fetchRoadmaps = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRoadmaps();
      setRoadmaps(data || []);
    } catch (err) {
      setError(err.message || 'Error al cargar Hojas de Ruta');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const filteredRoadmaps = roadmaps.filter((r) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      r.roadmap_number?.toLowerCase().includes(term) ||
      r.subject?.toLowerCase().includes(term) ||
      r.procedure_code?.toLowerCase().includes(term) ||
      r.applicant?.full_name?.toLowerCase().includes(term) ||
      r.applicant?.ci_nit?.toLowerCase().includes(term);

    const matchesPriority = priorityFilter === 'ALL' || r.priority === priorityFilter;
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const getPriorityBadgeClass = (p) => {
    switch (p) {
      case 'ALTA': return 'badge-danger';
      case 'MEDIA': return 'badge-warning';
      default: return 'badge-secondary';
    }
  };

  const getStatusBadgeClass = (s) => {
    switch (s) {
      case 'EN_RECORRIDO': return 'badge-primary';
      case 'CONCLUIDO':
      case 'RESUELTO': return 'badge-success';
      case 'ARCHIVADO': return 'badge-secondary';
      default: return 'badge-secondary';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
            Hojas de Ruta y Trámites
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Gestión, registro y seguimiento de expedientes municipales.
          </p>
        </div>

        {hasPermission('TRAMITE_CREAR') && (
          <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={18} />
            <span>Nueva Hoja de Ruta</span>
          </button>
        )}
      </div>

      {/* Buscador y Filtros */}
      <div className="card-custom" style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Buscar por Nro HR (HR-0001/2026), Asunto, C.I./NIT o Solicitante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select className="form-control" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={{ width: 'auto' }}>
            <option value="ALL">Todas las prioridades</option>
            <option value="ALTA">Alta</option>
            <option value="MEDIA">Media</option>
            <option value="BAJA">Baja</option>
          </select>

          <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 'auto' }}>
            <option value="ALL">Todos los estados</option>
            <option value="EN_RECORRIDO">En Recorrido</option>
            <option value="CONCLUIDO">Concluido</option>
            <option value="ARCHIVADO">Archivado</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="card-custom" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Cargando Hojas de Ruta...
        </div>
      ) : filteredRoadmaps.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No se encontraron Hojas de Ruta"
          message={searchTerm ? 'No hay trámites que coincidan con la búsqueda.' : 'Aún no se han registrado Hojas de Ruta.'}
          actionText={hasPermission('TRAMITE_CREAR') ? 'Crear Hoja de Ruta' : null}
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="card-custom" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Nro. Hoja de Ruta</th>
                  <th>Solicitante</th>
                  <th>Asunto / Resumen</th>
                  <th>Procedencia</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoadmaps.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong style={{ color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>{r.roadmap_number}</strong>
                      {r.procedure_code && (
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {r.procedure_code} ({r.pages_count} fojas)
                        </span>
                      )}
                    </td>
                    <td>
                      {r.applicant ? (
                        <div>
                          <span style={{ fontWeight: 600, display: 'block' }}>{r.applicant.full_name}</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>CI/NIT: {r.applicant.ci_nit}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>-</span>
                      )}
                    </td>
                    <td style={{ maxWidth: '280px' }}>
                      <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: '0.875rem', lineHeight: 1.3 }}>
                        {r.subject}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {r.origin_department?.name || 'Ventanilla Única'}
                    </td>
                    <td>
                      <span className={`badge ${getPriorityBadgeClass(r.priority)}`}>{r.priority}</span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(r.status)}`}>{r.status}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          className="btn btn-secondary btn-icon-only"
                          title="Ver Expediente Completo"
                          onClick={() => setSelectedRoadmapForDetail(r.id)}
                        >
                          <Eye size={16} />
                        </button>
                        {hasPermission('TRAMITE_DERIVAR') && r.status === 'EN_RECORRIDO' && (
                          <button
                            className="btn btn-primary btn-icon-only"
                            title="Derivar Trámite"
                            onClick={() => setSelectedRoadmapForDerive(r)}
                          >
                            <Send size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modales */}
      <CreateRoadmapModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSaveSuccess={() => {
          fetchRoadmaps();
        }}
      />

      {selectedRoadmapForDetail && (
        <RoadmapDetailModal
          isOpen={Boolean(selectedRoadmapForDetail)}
          onClose={() => setSelectedRoadmapForDetail(null)}
          roadmapID={selectedRoadmapForDetail}
          onRefresh={fetchRoadmaps}
        />
      )}

      {selectedRoadmapForDerive && (
        <DeriveRoadmapModal
          isOpen={Boolean(selectedRoadmapForDerive)}
          onClose={() => setSelectedRoadmapForDerive(null)}
          roadmap={selectedRoadmapForDerive}
          onDeriveSuccess={() => {
            fetchRoadmaps();
          }}
        />
      )}
    </div>
  );
};
