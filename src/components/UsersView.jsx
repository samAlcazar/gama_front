import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { UserModal } from './UserModal';
import { ConfirmModal } from './ConfirmModal';
import { EmptyState } from './EmptyState';
import { 
  UserPlus, 
  Search, 
  Filter, 
  Edit3, 
  UserX, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Building,
  RefreshCw
} from 'lucide-react';

export const UsersView = () => {
  const { hasPermission } = useAuth();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [confirmState, setConfirmState] = useState({ isOpen: false, user: null, loading: false });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [usersData, deptsData] = await Promise.all([
        apiClient('/users'),
        apiClient('/departments'),
      ]);
      setUsers(usersData || []);
      setDepartments(deptsData || []);
    } catch (err) {
      setError(err.message || 'Error cargando datos de usuarios.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (userForm, isEdit) => {
    if (isEdit) {
      await apiClient(`/users/${userForm.id}`, {
        method: 'PUT',
        body: JSON.stringify(userForm),
      });
    } else {
      await apiClient('/users', {
        method: 'POST',
        body: JSON.stringify(userForm),
      });
    }
    await loadData();
  };

  const handleOpenDeactivateModal = (u) => {
    setConfirmState({ isOpen: true, user: u, loading: false });
  };

  const handleConfirmDeactivate = async () => {
    if (!confirmState.user) return;
    try {
      setConfirmState((prev) => ({ ...prev, loading: true }));
      await apiClient(`/users/${confirmState.user.id}`, { method: 'DELETE' });
      setConfirmState({ isOpen: false, user: null, loading: false });
      await loadData();
    } catch (err) {
      setError(err.message || 'Error desactivando usuario.');
      setConfirmState({ isOpen: false, user: null, loading: false });
    }
  };

  // Map de departamento por ID
  const deptMap = departments.reduce((acc, d) => {
    acc[d.id] = d;
    return acc;
  }, {});

  // Filtrado de usuarios
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      (u.user_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.user_ci || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.user_nick || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.charge || '').toLowerCase().includes(search.toLowerCase());

    const matchesRole = !roleFilter || u.user_principal_role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Gestión de Usuarios</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Listado y administración de funcionarios del Municipio GAMA.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={loadData} className="btn btn-secondary" title="Recargar">
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
          </button>

          {hasPermission('USUARIO_CREAR') && (
            <button onClick={handleCreateUser} className="btn btn-primary">
              <UserPlus size={18} />
              <span>Nuevo Usuario</span>
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

      {/* Barra de Filtros */}
      <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Buscar por Nombre, CI, Nick o Cargo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar usuarios por nombre, CI, nick o cargo"
          />
        </div>

        <div style={{ width: '220px', position: 'relative' }}>
          <Filter size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <select
            className="form-select"
            style={{ paddingLeft: '2.5rem' }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            aria-label="Filtrar usuarios por rol"
          >
            <option value="">Todos los Roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="ALCALDE">ALCALDE</option>
            <option value="SECRETARIO_GENERAL">SECRETARIO_GENERAL</option>
            <option value="SECRETARIO_MUNICIPAL">SECRETARIO_MUNICIPAL</option>
            <option value="DIRECTOR">DIRECTOR</option>
            <option value="SECRETARIO">SECRETARIO</option>
            <option value="ASISTENTE">ASISTENTE</option>
            <option value="TECNICO">TECNICO</option>
          </select>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="table-container glass-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Usuario / Funcionario</th>
              <th>Cédula (CI)</th>
              <th>Departamento</th>
              <th>Cargo</th>
              <th>Rol Principal</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  Cargando funcionarios...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '1rem' }}>
                  <EmptyState
                    title="No se encontraron funcionarios"
                    description={search || roleFilter ? "Ningún usuario coincide con los criterios de búsqueda o filtro aplicados." : "No existen funcionarios registrados en el sistema."}
                    actionText={search || roleFilter ? "Limpiar Filtros" : undefined}
                    onAction={search || roleFilter ? () => { setSearch(''); setRoleFilter(''); } : undefined}
                  />
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const dept = deptMap[u.department_id];
                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{u.user_name}</span>
                        <span style={{ fontSize: '0.775rem', color: 'var(--accent)' }}>@{u.user_nick}</span>
                      </div>
                    </td>
                    <td>{u.user_ci}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                        <Building size={14} color="var(--text-muted)" />
                        <span>{dept ? dept.name : (u.user_principal_role === 'ADMIN' ? 'Administración Global' : 'Sin Depto')}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {u.charge || '—'}
                    </td>
                    <td>
                      <span className="badge badge-primary">{u.user_principal_role}</span>
                    </td>
                    <td>
                      {u.active ? (
                        <span className="badge badge-success">
                          <CheckCircle size={12} /> Activo
                        </span>
                      ) : (
                        <span className="badge badge-danger">
                          <XCircle size={12} /> Inactivo
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                        {hasPermission('USUARIO_EDITAR') && (
                          <button
                            onClick={() => handleEditUser(u)}
                            className="btn btn-secondary btn-icon-only"
                            title="Editar Usuario"
                          >
                            <Edit3 size={15} color="var(--accent)" />
                          </button>
                        )}

                        {hasPermission('USUARIO_DESACTIVAR') && u.active && (
                          <button
                            onClick={() => handleOpenDeactivateModal(u)}
                            className="btn btn-danger btn-icon-only"
                            title="Dar de Baja"
                            aria-label={`Dar de baja al usuario ${u.user_name}`}
                          >
                            <UserX size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        editingUser={editingUser}
        departments={departments}
      />

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ isOpen: false, user: null, loading: false })}
        onConfirm={handleConfirmDeactivate}
        title="Dar de Baja a Funcionario"
        message={`¿Estás seguro de desactivar la cuenta del funcionario "${confirmState.user?.user_name}" (@${confirmState.user?.user_nick})?`}
        confirmText="Dar de baja"
        cancelText="Cancelar"
        isDanger={true}
        loading={confirmState.loading}
      />
    </div>
  );
};
