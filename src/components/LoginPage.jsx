import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, LogIn, AlertCircle, ShieldCheck, Sun, Moon } from 'lucide-react';

export const LoginPage = ({ theme, toggleTheme }) => {
  const { login, loading } = useAuth();
  const [nick, setNick] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!nick || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }

    const result = await login(nick, password);
    if (!result.success) {
      setError(result.error || 'Credenciales inválidas o error de conexión con la API.');
    }
  };

  const handleQuickSeed = (userNick) => {
    setNick(userNick);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="login-container">
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
        <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          type="button"
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          <span>{theme === 'light' ? 'Tema Oscuro' : 'Tema Claro'}</span>
        </button>
      </div>

      <div className="glass-card login-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: 'var(--primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              marginBottom: '1rem',
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>GAMA Municipio</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Sistema de Gestión Municipal y Hojas de Ruta
          </p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Usuario / Nick</label>
            <div style={{ position: 'relative' }}>
              <User
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="ej. saalcazar"
                value={nick}
                onChange={(e) => setNick(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.75rem' }}
          >
            {loading ? (
              <span>Cargando...</span>
            ) : (
              <>
                <LogIn size={18} />
                <span>Iniciar Sesión</span>
              </>
            )}
          </button>
        </form>

        <div className="quick-seeds">
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              marginBottom: '0.75rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Acceso Rápido con Usuarios Semilla:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            <button
              type="button"
              className="seed-chip"
              onClick={() => handleQuickSeed('saalcazar')}
            >
              👑 Admin (saalcazar)
            </button>
            <button
              type="button"
              className="seed-chip"
              onClick={() => handleQuickSeed('alcalde')}
            >
              🏛️ Alcalde
            </button>
            <button
              type="button"
              className="seed-chip"
              onClick={() => handleQuickSeed('secgeneral')}
            >
              📜 Sec. General
            </button>
            <button
              type="button"
              className="seed-chip"
              onClick={() => handleQuickSeed('mcondori')}
            >
              🚪 Ventanilla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
