import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Search, Mail, Phone, CreditCard } from 'lucide-react';
import { getApplicants } from '../api/applicants';
import { ApplicantModal } from './ApplicantModal';
import { EmptyState } from './EmptyState';

export const ApplicantsView = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchApplicants = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getApplicants();
      setApplicants(data || []);
    } catch (err) {
      setError(err.message || 'Error al cargar solicitantes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const filteredApplicants = applicants.filter((a) => {
    const term = searchTerm.toLowerCase();
    return (
      a.full_name?.toLowerCase().includes(term) ||
      a.ci_nit?.toLowerCase().includes(term) ||
      a.email?.toLowerCase().includes(term) ||
      a.phone?.toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
            Padrón de Solicitantes e Interesados
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Registro de personas naturales y jurídicas que realizan trámites en el municipio.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          <span>Nuevo Solicitante</span>
        </button>
      </div>

      <div className="card-custom" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Buscar por Nombre, C.I., NIT, Email o Teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="card-custom" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Cargando solicitantes...
        </div>
      ) : filteredApplicants.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No se encontraron solicitantes"
          message={searchTerm ? 'No hay solicitantes que coincidan con la búsqueda.' : 'Aún no hay solicitantes registrados.'}
          actionText="Registrar Solicitante"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="card-custom" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Solicitante / Razón Social</th>
                  <th>C.I. / NIT</th>
                  <th>Correo Electrónico</th>
                  <th>Teléfono / Celular</th>
                  <th>Fecha Registro</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplicants.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{a.full_name}</td>
                    <td>
                      <span className="badge badge-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CreditCard size={13} /> {a.ci_nit}
                      </span>
                    </td>
                    <td>
                      {a.email ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}>
                          <Mail size={13} color="var(--primary)" /> {a.email}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>-</span>
                      )}
                    </td>
                    <td>
                      {a.phone ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}>
                          <Phone size={13} color="var(--success)" /> {a.phone}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>-</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ApplicantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveSuccess={() => {
          fetchApplicants();
        }}
      />
    </div>
  );
};
