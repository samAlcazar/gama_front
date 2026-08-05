import React, { useState, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import { deriveRoadmap } from '../api/roadmaps';
import { apiClient } from '../api/client';

export const DeriveRoadmapModal = ({ isOpen, onClose, roadmap, onDeriveSuccess }) => {
  const [destinationDeptID, setDestinationDeptID] = useState('');
  const [assignedUserID, setAssignedUserID] = useState('');
  const [instruction, setInstruction] = useState('');

  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setDestinationDeptID('');
      setAssignedUserID('');
      setInstruction('');
      setError(null);

      apiClient('/departments').then(setDepartments).catch(console.error);
      apiClient('/users').then(setUsers).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen || !roadmap) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!destinationDeptID) {
      setError('Debe seleccionar el departamento de destino.');
      return;
    }

    setLoading(true);
    try {
      const newMovement = await deriveRoadmap(roadmap.id, {
        destination_department_id: destinationDeptID,
        assigned_user_id: assignedUserID || null,
        instruction: instruction.trim() || null,
      });

      if (onDeriveSuccess) onDeriveSuccess(newMovement);
      onClose();
    } catch (err) {
      setError(err.message || 'Error al derivar la Hoja de Ruta');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => !destinationDeptID || u.department_id === destinationDeptID);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && !loading && onClose()}>
      <div className="modal-content" style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Send size={22} color="var(--primary)" />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Derivar Hoja de Ruta</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {roadmap.roadmap_number} - {roadmap.subject?.substring(0, 45)}...
              </span>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon-only" type="button" disabled={loading}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="form-group">
              <label className="form-label">Área / Departamento Destino <span style={{ color: 'var(--danger)' }}>*</span></label>
              <select
                className="form-control"
                value={destinationDeptID}
                onChange={(e) => {
                  setDestinationDeptID(e.target.value);
                  setAssignedUserID('');
                }}
                required
              >
                <option value="">-- Seleccionar Área Destino --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.sigla ? `[${d.sigla}] ` : ''}{d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Funcionario Asignado (Opcional)</label>
              <select
                className="form-control"
                value={assignedUserID}
                onChange={(e) => setAssignedUserID(e.target.value)}
              >
                <option value="">-- Sin asignar (A toda la unidad) --</option>
                {filteredUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.user_name} ({u.charge || u.user_principal_role})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Instrucción / Proveído de Derivación</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Escriba la instrucción, resolución o pase para la siguiente unidad..."
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Derivando...' : 'Confirmar Derivación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
