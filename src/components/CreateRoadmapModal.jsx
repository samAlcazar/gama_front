import React, { useState, useEffect } from 'react';
import { FileText, X } from 'lucide-react';
import { createRoadmap } from '../api/roadmaps';
import { getApplicants } from '../api/applicants';
import { apiClient } from '../api/client';

export const CreateRoadmapModal = ({ isOpen, onClose, onSaveSuccess }) => {
  const [applicantTab, setApplicantTab] = useState('existing'); // 'existing' | 'new'

  // Datos de la Hoja de Ruta
  const [procedureCode, setProcedureCode] = useState('');
  const [pagesCount, setPagesCount] = useState(1);
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState('MEDIA');
  const [destinationDeptID, setDestinationDeptID] = useState('');
  const [assignedUserID, setAssignedUserID] = useState('');
  const [instruction, setInstruction] = useState('');

  // Solicitante Existente
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicantID, setSelectedApplicantID] = useState('');

  // Solicitante Nuevo
  const [newApplicantName, setNewApplicantName] = useState('');
  const [newApplicantCiNit, setNewApplicantCiNit] = useState('');
  const [newApplicantEmail, setNewApplicantEmail] = useState('');
  const [newApplicantPhone, setNewApplicantPhone] = useState('');

  // Listas para dropdowns
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setProcedureCode('');
      setPagesCount(1);
      setSubject('');
      setPriority('MEDIA');
      setDestinationDeptID('');
      setAssignedUserID('');
      setInstruction('');

      setSelectedApplicantID('');
      setNewApplicantName('');
      setNewApplicantCiNit('');
      setNewApplicantEmail('');
      setNewApplicantPhone('');

      setError(null);

      // Cargar dependencias y solicitantes
      apiClient('/departments').then(setDepartments).catch(console.error);
      apiClient('/users').then(setUsers).catch(console.error);
      getApplicants().then(setApplicants).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!subject.trim()) {
      setError('El asunto / resumen del trámite es obligatorio.');
      return;
    }

    if (!destinationDeptID) {
      setError('Debe seleccionar el departamento de destino inicial.');
      return;
    }

    if (applicantTab === 'existing' && !selectedApplicantID) {
      setError('Debe seleccionar un solicitante existente o cambiar a "Registrar Nuevo Solicitante".');
      return;
    }

    if (applicantTab === 'new' && (!newApplicantName.trim() || !newApplicantCiNit.trim())) {
      setError('Nombre y C.I./NIT son obligatorios para el nuevo solicitante.');
      return;
    }

    const payload = {
      procedure_code: procedureCode.trim() || null,
      pages_count: parseInt(pagesCount, 10) || 1,
      subject: subject.trim(),
      priority,
      destination_department_id: destinationDeptID,
      assigned_user_id: assignedUserID || null,
      instruction: instruction.trim() || null,
    };

    if (applicantTab === 'existing') {
      payload.applicant_id = selectedApplicantID;
    } else {
      payload.new_applicant = {
        full_name: newApplicantName.trim(),
        ci_nit: newApplicantCiNit.trim(),
        email: newApplicantEmail.trim() || null,
        phone: newApplicantPhone.trim() || null,
      };
    }

    setLoading(true);
    try {
      const created = await createRoadmap(payload);
      if (onSaveSuccess) onSaveSuccess(created);
      onClose();
    } catch (err) {
      setError(err.message || 'Error al crear la Hoja de Ruta');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => !destinationDeptID || u.department_id === destinationDeptID);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && !loading && onClose()}>
      <div className="modal-content" style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <FileText size={22} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Registrar Nueva Hoja de Ruta</h3>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon-only" type="button" disabled={loading}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', maxHeight: '75vh', overflowY: 'auto' }}>
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Selector de Solicitante */}
            <div style={{ background: 'var(--bg-hover)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  Datos del Interesado / Solicitante
                </span>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  <button
                    type="button"
                    className={`btn ${applicantTab === 'existing' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
                    onClick={() => setApplicantTab('existing')}
                  >
                    Existente
                  </button>
                  <button
                    type="button"
                    className={`btn ${applicantTab === 'new' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
                    onClick={() => setApplicantTab('new')}
                  >
                    + Nuevo
                  </button>
                </div>
              </div>

              {applicantTab === 'existing' ? (
                <div className="form-group">
                  <select
                    className="form-control"
                    value={selectedApplicantID}
                    onChange={(e) => setSelectedApplicantID(e.target.value)}
                  >
                    <option value="">-- Seleccionar Solicitante Registrado --</option>
                    {applicants.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.full_name} ({a.ci_nit})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nombre o Razón Social *"
                      value={newApplicantName}
                      onChange={(e) => setNewApplicantName(e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="C.I. o NIT *"
                      value={newApplicantCiNit}
                      onChange={(e) => setNewApplicantCiNit(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Correo electrónico (Opcional)"
                      value={newApplicantEmail}
                      onChange={(e) => setNewApplicantEmail(e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Teléfono / Celular (Opcional)"
                      value={newApplicantPhone}
                      onChange={(e) => setNewApplicantPhone(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Asunto y Datos Principales */}
            <div className="form-group">
              <label className="form-label">
                Asunto / Resumen del Trámite <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Describa brevemente el objeto del trámite o solicitud ingresada..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
              <div className="form-group">
                <label className="form-label">Código Trámite / CITE</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej. TR-2026-88"
                  value={procedureCode}
                  onChange={(e) => setProcedureCode(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fojas del Expediente</label>
                <input
                  type="number"
                  min={1}
                  className="form-control"
                  value={pagesCount}
                  onChange={(e) => setPagesCount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Prioridad</label>
                <select className="form-control" value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="BAJA">Baja</option>
                  <option value="MEDIA">Media</option>
                  <option value="ALTA">Alta</option>
                </select>
              </div>
            </div>

            {/* Derivación Inicial */}
            <div style={{ background: 'var(--bg-hover)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', display: 'block', marginBottom: '0.75rem' }}>
                Paso 1: Destino Inicial e Instrucción
              </span>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Área / Departamento Destino *</label>
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
                    <option value="">-- Sin asignar (A la unidad) --</option>
                    {filteredUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.user_name} ({u.charge || u.user_principal_role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Instrucción / Proveído Inicial</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej. Remítase para informe técnico y evaluación correspondiente..."
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Registrando...' : 'Crear Hoja de Ruta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
