import React, { useState, useEffect, useMemo } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { DepartmentModal } from './DepartmentModal';
import { ConfirmModal } from './ConfirmModal';
import { EmptyState } from './EmptyState';
import { 
  Building2, 
  Plus, 
  Search, 
  AlertCircle, 
  GitCommit, 
  RefreshCw,
  Folder,
  FolderOpen,
  FileText,
  ChevronRight,
  ChevronDown,
  ChevronsDown,
  ChevronsUp,
  Edit3,
  Trash2,
  FolderPlus
} from 'lucide-react';

export const DepartmentsView = () => {
  const { hasRole } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  
  // Estado para acordeón / listas desplegables (IDs de nodos expandidos)
  const [expandedIds, setExpandedIds] = useState(new Set());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [initialParentId, setInitialParentId] = useState('');
  const [confirmState, setConfirmState] = useState({ isOpen: false, dept: null, loading: false });

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiClient('/departments');
      const depts = data || [];
      setDepartments(depts);

      // Por defecto, expandir los niveles superiores (Nivel 1 y 2) para facilitar la navegación
      const initialExpanded = new Set(
        depts
          .filter((d) => !d.parent_department_id || d.level <= 2)
          .map((d) => d.id)
      );
      setExpandedIds(initialExpanded);
    } catch (err) {
      setError(err.message || 'Error cargando departamentos.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRootDepartment = () => {
    setEditingDepartment(null);
    setInitialParentId('');
    setIsModalOpen(true);
  };

  const handleCreateChildDepartment = (parentDept) => {
    setEditingDepartment(null);
    setInitialParentId(parentDept.id);
    setIsModalOpen(true);
    // Asegurar que el padre esté expandido
    setExpandedIds((prev) => new Set([...prev, parentDept.id]));
  };

  const handleEditDepartment = (dept) => {
    setEditingDepartment(dept);
    setInitialParentId(dept.parent_department_id || '');
    setIsModalOpen(true);
  };

  const handleSaveDepartment = async (deptForm, isEdit) => {
    if (isEdit) {
      await apiClient(`/departments/${deptForm.id}`, {
        method: 'PUT',
        body: JSON.stringify(deptForm),
      });
    } else {
      await apiClient('/departments', {
        method: 'POST',
        body: JSON.stringify(deptForm),
      });
      if (deptForm.parent_department_id) {
        setExpandedIds((prev) => new Set([...prev, deptForm.parent_department_id]));
      }
    }
    await loadDepartments();
  };

  const handleOpenDeleteModal = (dept) => {
    setConfirmState({ isOpen: true, dept, loading: false });
  };

  const handleConfirmDelete = async () => {
    if (!confirmState.dept) return;
    try {
      setConfirmState((prev) => ({ ...prev, loading: true }));
      await apiClient(`/departments/${confirmState.dept.id}`, { method: 'DELETE' });
      setConfirmState({ isOpen: false, dept: null, loading: false });
      await loadDepartments();
    } catch (err) {
      setError(err.message || 'Error eliminando departamento.');
      setConfirmState({ isOpen: false, dept: null, loading: false });
    }
  };

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    const allParentIds = departments.map((d) => d.id);
    setExpandedIds(new Set(allParentIds));
  };

  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  const deptMap = useMemo(() => {
    return departments.reduce((acc, d) => {
      acc[d.id] = d;
      return acc;
    }, {});
  }, [departments]);

  // Construir árbol con hijos asociados
  const { treeRoots, totalWithChildren } = useMemo(() => {
    const itemMap = {};
    departments.forEach((d) => {
      itemMap[d.id] = { ...d, children: [] };
    });

    const roots = [];
    let countWithChildren = 0;

    departments.forEach((d) => {
      if (d.parent_department_id && itemMap[d.parent_department_id]) {
        itemMap[d.parent_department_id].children.push(itemMap[d.id]);
      } else {
        roots.push(itemMap[d.id]);
      }
    });

    Object.values(itemMap).forEach((node) => {
      if (node.children.length > 0) countWithChildren++;
    });

    return { treeRoots: roots, totalWithChildren: countWithChildren };
  }, [departments]);

  // Aplanar el árbol considerando el estado de expansión o el filtro de búsqueda
  const visibleRows = useMemo(() => {
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      return departments.filter(
        (d) => (d.name || '').toLowerCase().includes(q) || (d.sigla || '').toLowerCase().includes(q)
      );
    }

    const rows = [];
    const walk = (node) => {
      const isExpanded = expandedIds.has(node.id);
      const hasChildren = node.children && node.children.length > 0;
      rows.push({
        ...node,
        hasChildren,
        isExpanded,
        childrenCount: node.children ? node.children.length : 0,
      });

      if (hasChildren && isExpanded) {
        node.children.forEach(walk);
      }
    };

    treeRoots.forEach(walk);
    return rows;
  }, [search, departments, treeRoots, expandedIds]);

  return (
    <div>
      {/* Header principal */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={24} color="var(--primary)" />
            <span>Estructura y Organigrama de Departamentos</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Organigrama desplegable en árbol jerárquico del Municipio GAMA.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button onClick={loadDepartments} className="btn btn-secondary" title="Recargar departamentos">
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            <span>Recargar</span>
          </button>

          {hasRole('ADMIN') && (
            <button onClick={handleCreateRootDepartment} className="btn btn-primary">
              <Plus size={18} />
              <span>Nuevo Departamento Raíz</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Barra de Búsqueda y Controles del Árbol Desplegable */}
      <div className="glass-card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ flex: '1 1 300px', position: 'relative' }}>
          <Search size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem', fontSize: '0.875rem' }}
            placeholder="Buscar por Nombre o Sigla en todo el organigrama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar departamento por nombre o sigla"
          />
        </div>

        {!search && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleExpandAll}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.8rem' }}
              title="Desplegar todas las ramas del organigrama"
              type="button"
            >
              <ChevronsDown size={15} />
              <span>Expandir Todo</span>
            </button>

            <button
              onClick={handleCollapseAll}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.8rem' }}
              title="Colapsar ramas para ver solo departamentos principales"
              type="button"
            >
              <ChevronsUp size={15} />
              <span>Colapsar Todo</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabla Desplegable en Árbol */}
      <div className="table-container glass-card">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '45%' }}>Jerarquía & Nombre de la Dependencia</th>
              <th>Sigla</th>
              <th>Nivel</th>
              <th>Dependencia Superior</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  <RefreshCw size={24} className="spin" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
                  <span>Cargando organigrama municipal...</span>
                </td>
              </tr>
            ) : visibleRows.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '1.5rem' }}>
                  <EmptyState
                    title="No se encontraron departamentos"
                    description={search ? "Ninguna dependencia coincide con el término de búsqueda." : "No existen departamentos registrados aún en el organigrama."}
                    actionText={search ? "Limpiar Búsqueda" : undefined}
                    onAction={search ? () => setSearch('') : undefined}
                  />
                </td>
              </tr>
            ) : (
              visibleRows.map((d) => {
                const parent = d.parent_department_id ? deptMap[d.parent_department_id] : null;
                const indent = Math.max(0, (d.level - 1) * 26);
                const hasChildren = d.hasChildren || (departments.some((child) => child.parent_department_id === d.id));
                const isExpanded = search ? true : expandedIds.has(d.id);
                const childCount = d.childrenCount !== undefined 
                  ? d.childrenCount 
                  : departments.filter((c) => c.parent_department_id === d.id).length;

                return (
                  <tr 
                    key={d.id} 
                    style={{ 
                      backgroundColor: d.level === 1 ? 'rgba(99, 102, 241, 0.04)' : 'transparent',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    {/* Columna con Desplegable Interactivo */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', paddingLeft: `${indent}px` }}>
                        {/* Botón de flecha / chevron para expandir o colapsar */}
                        {hasChildren && !search ? (
                          <button
                            type="button"
                            onClick={() => toggleExpand(d.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--primary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '2px',
                              borderRadius: '4px',
                              marginRight: '2px',
                            }}
                            title={isExpanded ? "Colapsar subdependencias" : "Desplegar subdependencias"}
                          >
                            {isExpanded ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                          </button>
                        ) : (
                          <span style={{ width: 21, display: 'inline-block' }} />
                        )}

                        {/* Icono de Carpeta / Archivo según su estado */}
                        {hasChildren ? (
                          isExpanded ? (
                            <FolderOpen size={18} color="var(--accent)" style={{ flexShrink: 0 }} />
                          ) : (
                            <Folder size={18} color="var(--accent)" style={{ flexShrink: 0 }} />
                          )
                        ) : (
                          <FileText size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                        )}

                        {/* Nombre del Departamento con Click para desplegar */}
                        <span 
                          onClick={() => hasChildren && !search && toggleExpand(d.id)}
                          style={{ 
                            fontWeight: d.level === 1 ? 700 : d.level === 2 ? 600 : 500,
                            color: d.level === 1 ? 'var(--text-main)' : 'inherit',
                            cursor: hasChildren && !search ? 'pointer' : 'default',
                            fontSize: '0.9rem'
                          }}
                        >
                          {d.name}
                        </span>

                        {/* Badge de cantidad de subdependencias si las tiene */}
                        {childCount > 0 && !search && (
                          <span 
                            className="badge" 
                            style={{ 
                              fontSize: '0.7rem', 
                              padding: '0.15rem 0.45rem', 
                              backgroundColor: isExpanded ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-hover)',
                              color: isExpanded ? 'var(--primary)' : 'var(--text-muted)',
                              marginLeft: '0.35rem'
                            }}
                          >
                            {childCount} {childCount === 1 ? 'subdependencia' : 'subdependencias'}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Sigla */}
                    <td>
                      {d.sigla ? (
                        <span className="badge badge-primary">{d.sigla}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>

                    {/* Nivel */}
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: `rgba(99, 102, 241, ${0.1 + d.level * 0.08})`,
                          color: '#fff',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                          fontSize: '0.75rem'
                        }}
                      >
                        Nivel {d.level}
                      </span>
                    </td>

                    {/* Dependencia Superior */}
                    <td>
                      {parent ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                          <GitCommit size={14} color="var(--text-muted)" />
                          <span>{parent.name} {parent.sigla ? `(${parent.sigla})` : ''}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--accent)', fontSize: '0.78rem', fontWeight: 600 }}>
                          ★ Raíz / Despacho
                        </span>
                      )}
                    </td>

                    {/* Estado */}
                    <td>
                      <span className="badge badge-success">Activo</span>
                    </td>

                    {/* Acciones */}
                    <td style={{ textAlign: 'right' }}>
                      {hasRole('ADMIN') && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.35rem' }}>
                          <button
                            onClick={() => handleCreateChildDepartment(d)}
                            className="btn btn-secondary btn-icon-only"
                            title={`Añadir subdependencia bajo "${d.name}"`}
                            style={{ padding: '0.35rem' }}
                          >
                            <FolderPlus size={15} color="var(--primary)" />
                          </button>

                          <button
                            onClick={() => handleEditDepartment(d)}
                            className="btn btn-secondary btn-icon-only"
                            title="Editar Departamento"
                            style={{ padding: '0.35rem' }}
                          >
                            <Edit3 size={15} color="var(--accent)" />
                          </button>

                          <button
                            onClick={() => handleOpenDeleteModal(d)}
                            className="btn btn-secondary btn-icon-only"
                            title="Eliminar Departamento"
                            style={{ padding: '0.35rem' }}
                          >
                            <Trash2 size={15} color="var(--danger)" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <DepartmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDepartment}
        editingDepartment={editingDepartment}
        initialParentId={initialParentId}
        departments={departments}
      />

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ isOpen: false, dept: null, loading: false })}
        onConfirm={handleConfirmDelete}
        title="Eliminar Departamento"
        message={`¿Estás seguro de eliminar el departamento "${confirmState.dept?.name}"? Esta acción removerá el departamento de la estructura del organigrama.`}
        confirmText="Eliminar"
        isDanger={true}
        loading={confirmState.loading}
      />
    </div>
  );
};
