import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, CheckCircle2, Sun, Moon } from 'lucide-react';

export const Navbar = ({ title, theme, toggleTheme }) => {
  const { user } = useAuth();

  return (
    <header className="top-navbar">
      <h2 className="page-title">{title}</h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          title={`Cambiar a tema ${theme === 'light' ? 'oscuro' : 'claro'}`}
          type="button"
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          <span>{theme === 'light' ? 'Oscuro' : 'Claro'}</span>
        </button>

        <div className="badge badge-primary" style={{ padding: '0.4rem 0.85rem' }}>
          <Shield size={14} />
          <span>Rol: {user?.role || user?.user_principal_role || 'FUNCIONARIO'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--success)' }}>
          <CheckCircle2 size={15} />
          <span>API En Línea</span>
        </div>
      </div>
    </header>
  );
};
