import React, { useState, useEffect } from 'react';
import { X, Building2, Save, AlertCircle } from 'lucide-react';

export const DepartmentModal = ({ isOpen, onClose, onSave, departments }) => {
  const [name, setName] = useState('');
  const [sigla, setSigla] = useState('');
  const [parentId, setParentId] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName('');
    setSigla('');
    setParentId('');
    setError('');
  }, [isOpen]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('El nombre del departamento es obligatorio.');
      return;
    }

    try {
      setSaving(true);
      await onSave({
        name: name.trim(),
        sigla: sigla.trim() ? sigla.trim().toUpperCase() : null,
        parent_department_id: parentId ? parentId : null,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar departamento.');
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
      aria-labelledby="dept-modal-title"
    >
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={20} color="var(--accent)" />
            <h3 id="dept-modal-title" style={{ fontSize: '1.15rem' }}>Nuevo Departamento</h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-icon-only"
            type="button"
            aria-label="Cerrar ventana de departamento"
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

            <div className="form-group">
              <label className="form-label">Nombre del Departamento / Dependencia *</label>
              <input
                type="text"
                className="form-input"
                placeholder="ej. Dirección de Tecnología e Innovación"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Sigla (Opcional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="ej. DTI"
                value={sigla}
                onChange={(e) => setSigla(e.target.value)}
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Departamento Padre (Dependencia Superior)</label>
              <select
                className="form-select"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
              >
                <option value="">-- Sin dependencia superior (Nivel 1 Raíz) --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {'—'.repeat(d.level - 1)} {d.name} {d.sigla ? `(${d.sigla})` : ''} [Nivel {d.level}]
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                El nivel jerárquico se calculará automáticamente según el departamento padre seleccionado.
              </span>
            </div>
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
              <span>{saving ? 'Guardando...' : 'Crear Departamento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
