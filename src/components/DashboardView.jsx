import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Building2, 
  ShieldCheck, 
  Activity, 
  CheckCircle2, 
  Key, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export const DashboardView = ({ setActiveTab }) => {
  const { user, permissions } = useAuth();
  const [stats, setStats] = useState({
    usersCount: 0,
    deptCount: 0,
    rolesCount: 8,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [users, depts] = await Promise.all([
          apiClient('/users').catch(() => []),
          apiClient('/departments').catch(() => []),
        ]);
        setStats({
          usersCount: users.length,
          deptCount: depts.length,
          rolesCount: 8,
        });
      } catch (err) {
        console.error('Error cargando stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>Bienvenido, {user?.user_nick}</span>
          <Sparkles size={22} color="var(--gold)" />
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Panel Principal de Administración del Gobierno Autónomo Municipal GAMA.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-card glass-card-interactive" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div className="stat-icon stat-icon-primary">
            <Users size={26} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Usuarios</span>
              <span className="badge badge-primary" style={{ fontSize: '0.675rem' }}>
                <TrendingUp size={10} /> Activo
              </span>
            </div>
            <h3 style={{ fontSize: '1.8rem', marginTop: '0.1rem' }}>{loading ? '...' : stats.usersCount}</h3>
          </div>
        </div>

        <div className="glass-card glass-card-interactive" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div className="stat-icon stat-icon-sky">
            <Building2 size={26} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Departamentos</span>
              <span className="badge badge-sky" style={{ fontSize: '0.675rem' }}>
                Estructura
              </span>
            </div>
            <h3 style={{ fontSize: '1.8rem', marginTop: '0.1rem' }}>{loading ? '...' : stats.deptCount}</h3>
          </div>
        </div>

        <div className="glass-card glass-card-interactive" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div className="stat-icon stat-icon-success">
            <ShieldCheck size={26} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Roles RBAC</span>
              <span className="badge badge-success" style={{ fontSize: '0.675rem' }}>
                Seguridad
              </span>
            </div>
            <h3 style={{ fontSize: '1.8rem', marginTop: '0.1rem' }}>{stats.rolesCount}</h3>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} color="var(--primary)" />
            <span>Accesos Rápidos</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={() => setActiveTab('users')}
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', padding: '0.85rem 1rem' }}
              type="button"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={16} />
                <span>Administrar Usuarios</span>
              </div>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => setActiveTab('departments')}
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', padding: '0.85rem 1rem' }}
              type="button"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={16} />
                <span>Ver Organigrama de Departamentos</span>
              </div>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Key size={18} color="var(--accent)" />
            <span>Permisos Activos en la Sesión</span>
          </h3>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
            {permissions.length === 0 ? (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Acceso total concedido (Rol Administrador).
              </span>
            ) : (
              permissions.map((p) => (
                <span key={p} className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                  <CheckCircle2 size={12} /> {p}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
