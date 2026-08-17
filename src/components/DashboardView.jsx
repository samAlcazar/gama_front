import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { getRoadmaps, getInbox } from '../api/roadmaps';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Building2, 
  FileText,
  Inbox,
  ShieldCheck, 
  Activity, 
  CheckCircle2, 
  Key, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  UserCheck,
  RefreshCw
} from 'lucide-react';

export const DashboardView = ({ setActiveTab }) => {
  const { user, permissions } = useAuth();
  const [stats, setStats] = useState({
    usersCount: 0,
    deptCount: 0,
    roadmapsCount: 0,
    inboxCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [users, depts, roadmaps, inbox] = await Promise.all([
        apiClient('/users').catch((err) => { console.error('Error cargando usuarios:', err); return []; }),
        apiClient('/departments').catch((err) => { console.error('Error cargando departamentos:', err); return []; }),
        getRoadmaps().catch((err) => { console.error('Error cargando hojas de ruta:', err); return []; }),
        getInbox().catch((err) => { console.error('Error cargando bandeja:', err); return []; }),
      ]);
      setStats({
        usersCount: Array.isArray(users) ? users.length : 0,
        deptCount: Array.isArray(depts) ? depts.length : 0,
        roadmapsCount: Array.isArray(roadmaps) ? roadmaps.length : 0,
        inboxCount: Array.isArray(inbox) ? inbox.length : 0,
      });
    } catch (err) {
      console.error('Error cargando stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Bienvenido, {user?.user_nick}</span>
            <Sparkles size={22} color="var(--gold)" />
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Sistema Municipal de Trámites y Hojas de Ruta - GAMA.
          </p>
        </div>

        <button onClick={fetchStats} className="btn btn-secondary" title="Recargar métricas">
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          <span>Actualizar Datos</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-card glass-card-interactive" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => setActiveTab('inbox')}>
          <div className="stat-icon stat-icon-primary">
            <Inbox size={26} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>En Bandeja</span>
              <span className="badge badge-danger" style={{ fontSize: '0.675rem' }}>Pendientes</span>
            </div>
            <h3 style={{ fontSize: '1.8rem', marginTop: '0.1rem' }}>{loading ? '...' : stats.inboxCount}</h3>
          </div>
        </div>

        <div className="glass-card glass-card-interactive" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => setActiveTab('roadmaps')}>
          <div className="stat-icon stat-icon-sky">
            <FileText size={26} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Hojas de Ruta</span>
              <span className="badge badge-primary" style={{ fontSize: '0.675rem' }}>Trámites</span>
            </div>
            <h3 style={{ fontSize: '1.8rem', marginTop: '0.1rem' }}>{loading ? '...' : stats.roadmapsCount}</h3>
          </div>
        </div>

        <div className="glass-card glass-card-interactive" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => setActiveTab('users')}>
          <div className="stat-icon stat-icon-success">
            <Users size={26} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Usuarios</span>
              <span className="badge badge-success" style={{ fontSize: '0.675rem' }}>Activos</span>
            </div>
            <h3 style={{ fontSize: '1.8rem', marginTop: '0.1rem' }}>{loading ? '...' : stats.usersCount}</h3>
          </div>
        </div>

        <div className="glass-card glass-card-interactive" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => setActiveTab('departments')}>
          <div className="stat-icon stat-icon-warning">
            <Building2 size={26} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Departamentos</span>
              <span className="badge badge-warning" style={{ fontSize: '0.675rem' }}>Estructura</span>
            </div>
            <h3 style={{ fontSize: '1.8rem', marginTop: '0.1rem' }}>{loading ? '...' : stats.deptCount}</h3>
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
              onClick={() => setActiveTab('inbox')}
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', padding: '0.85rem 1rem' }}
              type="button"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Inbox size={16} color="var(--primary)" />
                <span>Atender Bandeja de Entrada</span>
              </div>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => setActiveTab('roadmaps')}
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', padding: '0.85rem 1rem' }}
              type="button"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={16} />
                <span>Gestionar Hojas de Ruta</span>
              </div>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => setActiveTab('applicants')}
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', padding: '0.85rem 1rem' }}
              type="button"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCheck size={16} />
                <span>Padrón de Solicitantes</span>
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
