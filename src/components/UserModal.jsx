import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, AlertCircle } from 'lucide-react';

const ROLES = [
  { value: 'ADMIN', label: 'ADMIN - Administrador del Sistema' },
  { value: 'ALCALDE', label: 'ALCALDE - Máxima Autoridad' },
  { value: 'SECRETARIO_GENERAL', label: 'SECRETARIO_GENERAL - Segundo al Mando' },
  { value: 'SECRETARIO_MUNICIPAL', label: 'SECRETARIO_MUNICIPAL - Cabeza de Secretaría' },
  { value: 'DIRECTOR', label: 'DIRECTOR - Director de Área' },
  { value: 'SECRETARIO', label: 'SECRETARIO - Gestión Hojas de Ruta' },
  { value: 'ASISTENTE', label: 'ASISTENTE - Ventanilla Única' },
  { value: 'TECNICO', label: 'TECNICO - Funcionario Operativo' },
];

export const UserModal = ({ isOpen, onClose, onSave, editingUser, departments }) => {
  const [formData, setFormData] = useState({
    user_name: '',
    user_ci: '',
    user_email: '',
    user_phone: '',
    department_id: '',
    charge: '',
    user_nick: '',
    password: '',
    user_principal_role: 'TECNICO',
    active: true,
    requires_password_change: true,
  });

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingUser) {
      setFormData({
        id: editingUser.id,
        user_name: editingUser.user_name || '',
        user_ci: editingUser.user_ci || '',
        user_email: editingUser.user_email || '',
        user_phone: editingUser.user_phone || '',
        department_id: editingUser.department_id || '',
        charge: editingUser.charge || '',
        user_nick: editingUser.user_nick || '',
        password: '', // Dejar en blanco en edición a menos que cambie
        user_principal_role: editingUser.user_principal_role || 'TECNICO',
        active: editingUser.active ?? true,
        requires_password_change: editingUser.requires_password_change ?? false,
      });
    } else {
      setFormData({
        user_name: '',
        user_ci: '',
        user_email: '',
        user_phone: '',
        department_id: departments[0]?.id || '',
        charge: '',
        user_nick: '',
        password: '',
        user_principal_role: 'TECNICO',
        active: true,
        requires_password_change: true,
      });
    }
    setError('');
  }, [editingUser, isOpen, departments]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !saving) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, saving]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.user_name || !formData.user_ci || !formData.user_nick) {
      setError('Por favor completa los campos obligatorios (Nombre, CI y Nick).');
      return;
    }

    if (!editingUser && !formData.password) {
      setError('La contraseña es obligatoria para nuevos usuarios.');
      return;
    }

    try {
      setSaving(true);
      await onSave(formData, !!editingUser);
      onClose();
    } catch (err) {
      setError(err.message || 'Error guardando usuario.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-modal-title"
    >
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={20} color="var(--primary)" />
            <h3 id="user-modal-title" style={{ fontSize: '1.15rem' }}>
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-icon-only"
            type="button"
            aria-label="Cerrar ventana de usuario"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Nombre Completo *</label>
                <input
                  type="text"
                  name="user_name"
                  className="form-input"
                  placeholder="ej. Juan Pérez"
                  value={formData.user_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cédula de Identidad (CI) *</label>
                <input
                  type="text"
                  name="user_ci"
                  className="form-input"
                  placeholder="ej. 6189020"
                  value={formData.user_ci}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Usuario / Nick (Login) *</label>
                <input
                  type="text"
                  name="user_nick"
                  className="form-input"
                  placeholder="ej. jperez"
                  value={formData.user_nick}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  {editingUser ? 'Contraseña (dejar en blanco para no cambiar)' : 'Contraseña *'}
                </label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required={!editingUser}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Departamento / Dependencia (Opcional para Admin)</label>
              <select
                name="department_id"
                className="form-select"
                value={formData.department_id}
                onChange={handleChange}
              >
                <option value="">-- Sin Departamento (Administración Global) --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {'—'.repeat(d.level - 1)} {d.name} {d.sigla ? `(${d.sigla})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Rol Principal *</label>
                <select
                  name="user_principal_role"
                  className="form-select"
                  value={formData.user_principal_role}
                  onChange={handleChange}
                  required
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Cargo / Función</label>
                <input
                  type="text"
                  name="charge"
                  className="form-input"
                  placeholder="ej. Asistente de Despacho"
                  value={formData.charge}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Correo Electrónico</label>
                <input
                  type="email"
                  name="user_email"
                  className="form-input"
                  placeholder="juan.perez@municipio.gob.bo"
                  value={formData.user_email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Teléfono / Celular</label>
                <input
                  type="text"
                  name="user_phone"
                  className="form-input"
                  placeholder="+591 71234567"
                  value={formData.user_phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {editingUser && (
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleChange}
                  />
                  <span>Usuario Activo</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    name="requires_password_change"
                    checked={formData.requires_password_change}
                    onChange={handleChange}
                  />
                  <span>Forzar cambio de contraseña</span>
                </label>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              <Save size={16} />
              <span>{saving ? 'Guardando...' : editingUser ? 'Actualizar' : 'Crear Usuario'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
