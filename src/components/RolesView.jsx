import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from './EmptyState';
import { 
  ShieldCheck, 
  Key, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  X, 
  Save
} from 'lucide-react';

export const RolesView = () => {
  const { hasPermission } = useAuth();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal para editar permisos de un rol
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermIds, setSelectedPermIds] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [rolesData, permsData] = await Promise.all([
        apiClient('/roles'),
        apiClient('/permissions'),
      ]);
      setRoles(rolesData || []);
      setPermissions(permsData || []);
    } catch (err) {
      setError(err.message || 'Error cargando roles y permisos.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = (role) => {
    setSelectedRole(role);
    // Mapear los códigos de permisos activos a sus IDs
    const activePermIds = permissions
      .filter((p) => role.permissions && role.permissions.includes(p.code))
      .map((p) => p.id);
    setSelectedPermIds(activePermIds);
  };

  const handleTogglePerm = (permId) => {
    setSelectedPermIds((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const handleToggleModule = (moduleName, enable) => {
    const modulePermIds = permissions.filter((p) => p.module === moduleName).map((p) => p.id);
    if (enable) {
      setSelectedPermIds((prev) => Array.from(new Set([...prev, ...modulePermIds])));
    } else {
      setSelectedPermIds((prev) => prev.filter((id) => !modulePermIds.includes(id)));
    }
  };

  const handleSaveRolePermissions = async () => {
    if (!selectedRole) return;
    try {
      setSaving(true);
      setError('');
      await apiClient(`/roles/${selectedRole.name}/permissions`, {
        method: 'PUT',
        body: JSON.stringify({ permission_ids: selectedPermIds }),
      });
      setSuccessMsg(`¡Permisos del rol ${selectedRole.name} actualizados correctamente!`);
      setSelectedRole(null);
      await loadData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Error guardando permisos.');
    } finally {
      setSaving(false);
    }
  };

  // Agrupar permisos por módulo
  const permsByModule = permissions.reduce((acc, p) => {
    const mod = p.module || 'GENERAL';
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(p);
    return acc;
  }, {});

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={26} color="var(--primary)" />
            <span>Matriz de Roles y Permisos RBAC</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Administración de facultades y capacidades de acceso para cada nivel de la municipalidad.
          </p>
        </div>

        <button onClick={loadData} className="btn btn-secondary" title="Recargar">
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          <span>Actualizar</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid de Roles */}
      {loading ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Cargando roles y matriz de permisos...
        </div>
      ) : roles.length === 0 ? (
        <EmptyState
          title="No hay roles definidos"
          description="No se encontraron roles en el sistema."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {roles.map((r) => {
            const isSuperAdmin = r.name === 'ADMIN';
            const permCount = r.permissions ? r.permissions.length : 0;

            return (
              <div
                key={r.name}
                className="glass-card glass-card-interactive"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  gap: '1rem',
                  borderLeft: `4px solid ${isSuperAdmin ? 'var(--gold)' : 'var(--primary)'}`,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>
                      {r.name}
                    </h3>
                    <span className={`badge ${isSuperAdmin ? 'badge-warning' : 'badge-primary'}`}>
                      {permCount} Permisos
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '1rem' }}>
                    {r.description || 'Rol institucional de gestión municipal.'}
                  </p>

                  {/* Resumen de Permisos */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', maxHeight: '90px', overflowY: 'auto' }}>
                    {isSuperAdmin ? (
                      <span className="badge badge-success" style={{ fontSize: '0.725rem' }}>
                        ★ Acceso Total (Superusuario)
                      </span>
                    ) : r.permissions && r.permissions.length > 0 ? (
                      r.permissions.map((pCode) => (
                        <span key={pCode} className="badge badge-sky" style={{ fontSize: '0.7rem' }}>
                          {pCode}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        Sin permisos asignados
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'flex-end' }}>
                  {hasPermission('USUARIO_EDITAR') && (
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                      onClick={() => handleOpenEditModal(r)}
                    >
                      <Edit3 size={15} /> Configurar Permisos
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Configuración de Permisos por Rol */}
      {selectedRole && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && !saving && setSelectedRole(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-content" style={{ maxWidth: '750px', width: '95%' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Key size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.15rem' }}>
                  Configurar Permisos: <span style={{ color: 'var(--primary)' }}>{selectedRole.name}</span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedRole(null)}
                className="btn btn-secondary btn-icon-only"
                disabled={saving}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '68vh', overflowY: 'auto', padding: '1.25rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Marca o desmarca los permisos que deseas otorgar al rol <strong>{selectedRole.name}</strong>. Los funcionarios con este rol heredarán estas facultades automáticamente.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {Object.keys(permsByModule).map((moduleName) => {
                  const modulePerms = permsByModule[moduleName];
                  const allSelected = modulePerms.every((p) => selectedPermIds.includes(p.id));

                  return (
                    <div
                      key={moduleName}
                      style={{
                        background: 'var(--bg-hover)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <strong style={{ fontSize: '0.925rem', color: 'var(--primary)', letterSpacing: '0.5px' }}>
                          MÓDULO {moduleName.toUpperCase()}
                        </strong>

                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                          onClick={() => handleToggleModule(moduleName, !allSelected)}
                        >
                          {allSelected ? 'Desmarcar Todos' : 'Marcar Todos'}
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.65rem' }}>
                        {modulePerms.map((p) => {
                          const isChecked = selectedPermIds.includes(p.id);

                          return (
                            <label
                              key={p.id}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '0.6rem',
                                padding: '0.6rem 0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                background: isChecked ? 'var(--bg-card)' : 'transparent',
                                border: `1px solid ${isChecked ? 'var(--border-focus)' : 'transparent'}`,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleTogglePerm(p.id)}
                                style={{ marginTop: '0.2rem', cursor: 'pointer' }}
                              />
                              <div>
                                <strong style={{ fontSize: '0.85rem', display: 'block', color: 'var(--text-main)' }}>
                                  {p.code}
                                </strong>
                                <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                                  {p.description}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {selectedPermIds.length} permiso(s) seleccionado(s)
              </span>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedRole(null)}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveRolePermissions}
                  disabled={saving}
                >
                  <Save size={16} />
                  <span>{saving ? 'Guardando...' : 'Guardar Permisos'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
