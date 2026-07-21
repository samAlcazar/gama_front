import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { DepartmentModal } from './DepartmentModal';
import { 
  Building2, 
  Plus, 
  Search, 
  AlertCircle, 
  GitCommit, 
  RefreshCw,
  FolderTree
} from 'lucide-react';

export const DepartmentsView = () => {
  const { hasRole } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiClient('/departments');
      setDepartments(data || []);
    } catch (err) {
      setError(err.message || 'Error cargando departamentos.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDepartment = async (deptForm) => {
    await apiClient('/departments', {
      method: 'POST',
      body: JSON.stringify(deptForm),
    });
    await loadDepartments();
  };

  const deptMap = departments.reduce((acc, d) => {
    acc[d.id] = d;
    return acc;
  }, {});

  const filteredDepts = departments.filter((d) =>
    (d.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.sigla || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Estructura de Departamentos</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Organigrama y dependencias jerárquicas del Municipio GAMA.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={loadDepartments} className="btn btn-secondary" title="Recargar">
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
          </button>

          {hasRole('ADMIN') && (
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
              <Plus size={18} />
              <span>Nuevo Departamento</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Barra de Búsqueda */}
      <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Buscar departamento por Nombre o Sigla..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Lista / Tabla de Departamentos */}
      <div className="table-container glass-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Jerarquía & Nombre</th>
              <th>Sigla</th>
              <th>Nivel</th>
              <th>Dependencia Superior</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  Cargando departamentos...
                </td>
              </tr>
            ) : filteredDepts.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  No se encontraron departamentos.
                </td>
              </tr>
            ) : (
              filteredDepts.map((d) => {
                const parent = d.parent_department_id ? deptMap[d.parent_department_id] : null;
                const indent = (d.level - 1) * 20;

                return (
                  <tr key={d.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: `${indent}px` }}>
                        <FolderTree size={16} color="var(--accent)" />
                        <span style={{ fontWeight: d.level === 1 ? 700 : 500 }}>{d.name}</span>
                      </div>
                    </td>
                    <td>
                      {d.sigla ? (
                        <span className="badge badge-primary">{d.sigla}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: `rgba(99, 102, 241, ${0.1 + d.level * 0.08})`,
                          color: '#fff',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                        }}
                      >
                        Nivel {d.level}
                      </span>
                    </td>
                    <td>
                      {parent ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          <GitCommit size={14} color="var(--text-muted)" />
                          <span>{parent.name}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600 }}>Raíz / Despacho</span>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-success">Activo</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <DepartmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDepartment}
        departments={departments}
      />
    </div>
  );
};
