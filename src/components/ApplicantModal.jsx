import React, { useState, useEffect } from 'react';
import { UserCheck, X } from 'lucide-react';
import { createApplicant } from '../api/applicants';

export const ApplicantModal = ({ isOpen, onClose, onSaveSuccess }) => {
  const [fullName, setFullName] = useState('');
  const [ciNit, setCiNit] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setFullName('');
      setCiNit('');
      setEmail('');
      setPhone('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !ciNit.trim()) {
      setError('Nombre/Razón Social y C.I./NIT son obligatorios.');
      return;
    }

    setLoading(true);
    try {
      const newApplicant = await createApplicant({
        full_name: fullName.trim(),
        ci_nit: ciNit.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
      });

      if (onSaveSuccess) onSaveSuccess(newApplicant);
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar el solicitante');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && !loading && onClose()}>
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <UserCheck size={22} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Registrar Nuevo Solicitante</h3>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon-only" type="button" disabled={loading}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="form-group">
              <label className="form-label" htmlFor="applicant-name">
                Nombre Completo o Razón Social <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="applicant-name"
                type="text"
                className="form-control"
                placeholder="Ej. Juan Pérez Mamani o Empresa S.R.L."
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="applicant-cinit">
                Cédula de Identidad (C.I.) o NIT <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="applicant-cinit"
                type="text"
                className="form-control"
                placeholder="Ej. 6189020 o 10293847012"
                value={ciNit}
                onChange={(e) => setCiNit(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="applicant-email">
                  Correo Electrónico
                </label>
                <input
                  id="applicant-email"
                  type="email"
                  className="form-control"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="applicant-phone">
                  Teléfono / Celular
                </label>
                <input
                  id="applicant-phone"
                  type="text"
                  className="form-control"
                  placeholder="+591 71234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Registrar Solicitante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
