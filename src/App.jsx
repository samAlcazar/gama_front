import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { UsersView } from './components/UsersView';
import { DepartmentsView } from './components/DepartmentsView';
import { AuditView } from './components/AuditView';
import { InboxView } from './components/InboxView';
import { RoadmapsView } from './components/RoadmapsView';
import { ApplicantsView } from './components/ApplicantsView';

const MainApp = () => {
  const { token, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('gama_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('gama_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  if (loading && !token) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text-secondary)' }}>
        <span>Cargando sistema GAMA...</span>
      </div>
    );
  }

  if (!token) {
    return <LoginPage theme={theme} toggleTheme={toggleTheme} />;
  }

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Resumen General';
      case 'inbox':
        return 'Bandeja de Entrada Activa';
      case 'roadmaps':
        return 'Hojas de Ruta y Trámites';
      case 'applicants':
        return 'Padrón de Solicitantes e Interesados';
      case 'users':
        return 'Administración de Usuarios';
      case 'departments':
        return 'Organigrama y Departamentos';
      case 'audit':
        return 'Prueba de Auditoría';
      default:
        return 'Panel Municipal';
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="main-content">
        <Navbar title={getPageTitle()} theme={theme} toggleTheme={toggleTheme} />

        <main className="content-body page-transition" key={activeTab}>
          {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}
          {activeTab === 'inbox' && <InboxView />}
          {activeTab === 'roadmaps' && <RoadmapsView />}
          {activeTab === 'applicants' && <ApplicantsView />}
          {activeTab === 'users' && <UsersView />}
          {activeTab === 'departments' && <DepartmentsView />}
          {activeTab === 'audit' && <AuditView />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
