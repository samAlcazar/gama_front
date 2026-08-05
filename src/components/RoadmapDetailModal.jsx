import React, { useState, useEffect } from 'react';
import { FileText, X, Send, Clock, ShieldCheck, CheckCircle2, Archive } from 'lucide-react';
import { getRoadmapById, updateRoadmapStatus } from '../api/roadmaps';
import { DeriveRoadmapModal } from './DeriveRoadmapModal';
import { useAuth } from '../context/AuthContext';

export const RoadmapDetailModal = ({ isOpen, onClose, roadmapID, onRefresh }) => {
  const { hasPermission } = useAuth();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeriveModalOpen, setIsDeriveModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetail = async () => {
    if (!roadmapID) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getRoadmapById(roadmapID);
      setDetail(data);
    } catch (err) {
      setError(err.message || 'Error al cargar detalle del expediente');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && roadmapID) {
      fetchDetail();
    }
  }, [isOpen, roadmapID]);

  if (!isOpen) return null;

  const handleUpdateStatus = async (newStatus) => {
    setActionLoading(true);
    try {
      await updateRoadmapStatus(roadmapID, newStatus);
      await fetchDetail();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Error al actualizar estado del trámite');
    } finally {
      setActionLoading(false);
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'ALTA':
        return 'badge-danger';
      case 'MEDIA':
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'EN_RECORRIDO':
        return 'badge-primary';
      case 'CONCLUIDO':
      case 'RESUELTO':
        return 'badge-success';
      case 'ARCHIVADO':
        return 'badge-secondary';
      default:
        return 'badge-secondary';
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return { date: '-', time: '-' };
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString(),
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const rm = detail?.roadmap;
  const movements = detail?.movements || [];

  return (
    <>
      <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal-content" style={{ maxWidth: '820px', width: '95%' }}>
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <FileText size={24} color="var(--primary)" />
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                  HOJA DE RUTA (INTERNA)
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Gobierno Autónomo Municipal - Expediente {rm?.roadmap_number || ''}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="btn btn-secondary btn-icon-only" type="button">
              <X size={18} />
            </button>
          </div>

          <div className="modal-body" style={{ maxHeight: '78vh', overflowY: 'auto', padding: '1.25rem' }}>
            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                Cargando expediente...
              </div>
            ) : rm ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Cabecera del Formulario Oficial */}
                <div style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>NRO. HOJA DE RUTA</span>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{rm.roadmap_number}</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>GESTIÓN</span>
                      <strong style={{ fontSize: '1rem' }}>{rm.management_year}</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>CÓDIGO TRÁMITE / CITE</span>
                      <strong style={{ fontSize: '1rem' }}>{rm.procedure_code || '-'}</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>FOJAS DEL EXPEDIENTE</span>
                      <strong style={{ fontSize: '1rem' }}>{rm.pages_count} Fojas</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>PRIORIDAD</span>
                      <span className={`badge ${getPriorityBadgeClass(rm.priority)}`}>{rm.priority}</span>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>ESTADO ACTUAL</span>
                      <span className={`badge ${getStatusBadgeClass(rm.status)}`}>{rm.status}</span>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>PROCEDENCIA / DEPENDENCIA DE ORIGEN</span>
                      <span style={{ fontWeight: 600 }}>{rm.origin_department?.name || 'Ventanilla Única'}</span>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>ASUNTO / RESUMEN DEL TRÁMITE</span>
                      <p style={{ fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.4, color: 'var(--text-main)' }}>{rm.subject}</p>
                    </div>

                    {rm.applicant && (
                      <div style={{ background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginTop: '0.3rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                          DATOS DEL INTERESADO / SOLICITANTE
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.875rem' }}>
                          <span><strong>Nombre:</strong> {rm.applicant.full_name}</span>
                          <span><strong>CI / NIT:</strong> {rm.applicant.ci_nit}</span>
                          {rm.applicant.phone && <span><strong>Teléfono:</strong> {rm.applicant.phone}</span>}
                          {rm.applicant.email && <span><strong>Email:</strong> {rm.applicant.email}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Registro de Recorrido del Expediente */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={18} color="var(--primary)" /> REGISTRO DE RECORRIDO DEL EXPEDIENTE
                    </h4>
                    {hasPermission('TRAMITE_DERIVAR') && rm.status === 'EN_RECORRIDO' && (
                      <button className="btn btn-primary" style={{ padding: '0.35rem 0.8rem', fontSize: '0.85rem' }} onClick={() => setIsDeriveModalOpen(true)}>
                        <Send size={15} /> Derivar Expediente
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {movements.map((m) => {
                      const entry = formatDateTime(m.entry_at);
                      const exit = formatDateTime(m.exit_at);

                      return (
                        <div
                          key={m.id}
                          style={{
                            display: 'flex',
                            gap: '1rem',
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderLeft: `4px solid ${m.status === 'DERIVADO' ? 'var(--primary)' : 'var(--gold)'}`,
                          }}
                        >
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: m.status === 'DERIVADO' ? 'var(--primary)' : 'var(--gold)',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '1rem',
                              flexShrink: 0,
                            }}
                          >
                            {m.step_number}
                          </div>

                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                              <div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>ÁREA DE DESTINO</span>
                                <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                                  {m.destination_department?.name} {m.destination_department?.sigla ? `[${m.destination_department.sigla}]` : ''}
                                </strong>
                                {m.assigned_user && (
                                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--primary)' }}>
                                    Asignado a: {m.assigned_user.user_name}
                                  </span>
                                )}
                              </div>

                              <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                                <span className={`badge ${m.status === 'DERIVADO' ? 'badge-success' : 'badge-warning'}`}>
                                  {m.status}
                                </span>
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'var(--bg-hover)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                              <div>
                                <span style={{ color: 'var(--text-muted)' }}>Ingreso: </span>
                                <strong>{entry.date} a las {entry.time}</strong>
                              </div>
                              <div>
                                <span style={{ color: 'var(--text-muted)' }}>Salida: </span>
                                <strong>{m.exit_at ? `${exit.date} a las ${exit.time}` : 'En Proceso'}</strong>
                              </div>
                            </div>

                            {m.instruction && (
                              <div style={{ fontSize: '0.875rem', fontStyle: 'italic', color: 'var(--text-secondary)', background: 'var(--bg-card-hover)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                                <strong>Instrucción / Proveído:</strong> "{m.instruction}"
                              </div>
                            )}

                            {m.signed_user && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                <ShieldCheck size={14} color="var(--success)" />
                                <span>Firmado / Despachado por: <strong>{m.signed_user.user_name}</strong></span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            ) : null}
          </div>

          <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {hasPermission('TRAMITE_RESOLVER') && rm && rm.status === 'EN_RECORRIDO' && (
                <>
                  <button
                    className="btn btn-success"
                    style={{ fontSize: '0.85rem' }}
                    onClick={() => handleUpdateStatus('CONCLUIDO')}
                    disabled={actionLoading}
                  >
                    <CheckCircle2 size={16} /> Concluir Trámite
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: '0.85rem' }}
                    onClick={() => handleUpdateStatus('ARCHIVADO')}
                    disabled={actionLoading}
                  >
                    <Archive size={16} /> Archivar
                  </button>
                </>
              )}
            </div>

            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {isDeriveModalOpen && (
        <DeriveRoadmapModal
          isOpen={isDeriveModalOpen}
          onClose={() => setIsDeriveModalOpen(false)}
          roadmap={rm}
          onDeriveSuccess={() => {
            fetchDetail();
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </>
  );
};
