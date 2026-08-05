import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Inbox,
  FileText,
  UserCheck,
  Users, 
  Building2, 
  ShieldAlert, 
  LogOut, 
  Building 
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout, hasPermission } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard, perm: null },
    { id: 'inbox', label: 'Bandeja Entrada', icon: Inbox, perm: 'TRAMITE_VER_BANDEJA' },
    { id: 'roadmaps', label: 'Hojas de Ruta', icon: FileText, perm: 'TRAMITE_VER_BANDEJA' },
    { id: 'applicants', label: 'Solicitantes', icon: UserCheck, perm: 'TRAMITE_VER_BANDEJA' },
    { id: 'users', label: 'Usuarios', icon: Users, perm: 'USUARIO_VER' },
    { id: 'departments', label: 'Departamentos', icon: Building2, perm: null },
    { id: 'audit', label: 'Auditoría', icon: ShieldAlert, perm: 'AUDITORIA_VER' },
  ];

  return (
    <aside className="sidebar">
      <div className="brand-header">
        <div className="brand-icon">
          <Building size={20} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="brand-title">GAMA API</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Gestión Municipal</span>
        </div>
      </div>

      <nav className="nav-menu" aria-label="Navegación principal">
        {menuItems.map((item) => {
          if (item.perm && !hasPermission(item.perm)) return null;
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-badge">
          <div className="avatar-circle">
            {user?.user_nick?.substring(0, 2).toUpperCase() || 'US'}
          </div>
          <div className="user-badge-info">
            <span className="user-badge-nick">{user?.user_nick}</span>
            <span className="user-badge-role">{user?.role || 'FUNCIONARIO'}</span>
          </div>
        </div>

        <button
          onClick={logout}
          className="btn btn-secondary btn-icon-only"
          title="Cerrar Sesión"
          type="button"
        >
          <LogOut size={16} style={{ color: 'var(--danger)' }} />
        </button>
      </div>
    </aside>
  );
};
