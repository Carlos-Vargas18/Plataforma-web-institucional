import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Inbox,
  RefreshCw,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Search,
} from 'lucide-react';

/* ==========================================================================
   1. BANNER DE ESTADO (ÉXITO / ERROR / INFO)
   ========================================================================== */
export const StatusBanner: React.FC<{
  error?: string;
  success?: string;
  onClear?: () => void;
  type?: 'success' | 'error' | 'info';
  message?: string;
  onClose?: () => void;
}> = ({ error, success, onClear, type, message, onClose }) => {
  const displayMessage = message || error || success;
  if (!displayMessage) return null;
  const isError = type === 'error' || Boolean(error);
  const isInfo = type === 'info' && !error && !success;
  const handleDismiss = onClose || onClear;

  const palette = isError
    ? {
        bg: 'var(--ec-danger-bg)',
        border: 'var(--ec-danger-border)',
        color: 'var(--ec-danger)',
      }
    : isInfo
      ? {
          bg: 'var(--ec-info-bg)',
          border: 'var(--ec-info-border)',
          color: 'var(--ec-info)',
        }
      : {
          bg: 'var(--ec-success-bg)',
          border: 'var(--ec-success-border)',
          color: 'var(--ec-success)',
        };

  return (
    <div
      role="status"
      className="no-print"
      style={{
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        color: palette.color,
        padding: '0.8rem 1.1rem',
        borderRadius: 'var(--ec-radius-md)',
        marginBottom: '1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.86rem',
        fontWeight: 600,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
        {isError ? (
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
        ) : isInfo ? (
          <Info size={18} style={{ flexShrink: 0 }} />
        ) : (
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
        )}
        <span style={{ lineHeight: 1.4 }}>{displayMessage}</span>
      </div>
      {handleDismiss && (
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Cerrar notificación"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontWeight: 700,
            padding: '0.15rem 0.35rem',
            borderRadius: '6px',
            flexShrink: 0,
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

/* ==========================================================================
   2. ESTADO DE CARGA / VACÍO
   ========================================================================== */
export const EmptyOrLoadingState: React.FC<{
  loading?: boolean;
  emptyMessage?: string;
  message?: string;
  onRetry?: () => void;
}> = ({ loading, emptyMessage, message, onRetry }) => {
  const displayMsg = message || emptyMessage || 'No se encontraron registros en la base de datos.';
  if (loading) {
    return (
      <div style={{ padding: '2.75rem 1.5rem', textAlign: 'center', color: 'var(--ec-text-muted)' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'var(--ec-primary-soft)',
            color: 'var(--ec-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem',
          }}
        >
          <RefreshCw size={20} className="ec-spin" />
        </div>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ec-text-secondary)' }}>
          {message || 'Consultando registros en PostgreSQL...'}
        </div>
      </div>
    );
  }
  return (
    <div style={{ padding: '2.75rem 1.5rem', textAlign: 'center', color: 'var(--ec-text-muted)' }}>
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '14px',
          background: 'var(--ec-surface-low)',
          color: 'var(--ec-text-muted)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.75rem',
        }}
      >
        <Inbox size={22} />
      </div>
      <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.9rem', color: 'var(--ec-text-secondary)', fontWeight: 500 }}>
        {displayMsg}
      </p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-secondary-action" style={{ fontSize: '0.82rem' }}>
          <RefreshCw size={14} /> Actualizar
        </button>
      )}
    </div>
  );
};

/* ==========================================================================
   3. TARJETA KPI ESTILO STITCH
   ========================================================================== */
export interface KpiCardProps {
  icon: React.ReactNode;
  tone?: 'blue' | 'indigo' | 'green' | 'emerald' | 'amber' | 'purple' | 'rose' | 'cyan';
  value: React.ReactNode;
  label: string;
  badge?: string;
  badgeTone?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  footer?: React.ReactNode;
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  icon,
  tone = 'blue',
  value,
  label,
  badge,
  badgeTone = 'neutral',
  footer,
  onClick,
}) => (
  <div
    className="ec-kpi-card"
    onClick={onClick}
    style={onClick ? { cursor: 'pointer' } : undefined}
  >
    <div className="ec-kpi-top">
      <div className={`stat-icon ${tone}`} style={{ width: '42px', height: '42px', borderRadius: '11px' }}>
        {icon}
      </div>
      {badge && (
        <span className={`ec-kpi-badge ${badgeTone === 'neutral' ? '' : badgeTone}`}>
          {badge}
        </span>
      )}
    </div>
    <div>
      <div className="stat-number">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
    {footer && (
      <div
        style={{
          fontSize: '0.76rem',
          color: 'var(--ec-text-muted)',
          borderTop: '1px solid var(--ec-surface-low)',
          paddingTop: '0.55rem',
          fontWeight: 500,
        }}
      >
        {footer}
      </div>
    )}
  </div>
);

/* ==========================================================================
   4. BARRA DE BÚSQUEDA Y FILTROS + PAGINACIÓN REUTILIZABLES
   ========================================================================== */
export const SearchFilterBar: React.FC<{
  search: string;
  onSearchChange: (val: string) => void;
  placeholder?: string;
  children?: React.ReactNode;
}> = ({ search, onSearchChange, placeholder = 'Buscar...', children }) => (
  <div
    style={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '1rem',
    }}
  >
    <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '380px' }}>
      <Search
        size={16}
        style={{
          position: 'absolute',
          left: '0.8rem',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--ec-text-subtle)',
          pointerEvents: 'none',
        }}
      />
      <input
        type="text"
        className="form-input"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        style={{ paddingLeft: '2.35rem' }}
      />
    </div>
    {children}
  </div>
);

export const PaginationBar: React.FC<{
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (nextPage: number) => void;
}> = ({ page, totalPages, totalItems, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '0.9rem 1.25rem',
        borderTop: '1px solid var(--ec-border)',
        background: '#ffffff',
        fontSize: '0.82rem',
        color: 'var(--ec-text-muted)',
      }}
    >
      <span>
        Página <strong>{page}</strong> de <strong>{totalPages}</strong> ({totalItems} registros)
      </span>
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <button
          type="button"
          className="btn-secondary-action"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
        >
          <ChevronLeft size={14} /> Anterior
        </button>
        <button
          type="button"
          className="btn-secondary-action"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
        >
          Siguiente <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

/* ==========================================================================
   5. DASHBOARD SHELL UNIFICADO (SIDEBAR CATEGORIZADA + DRAWER MÓVIL + TOPBAR)
   ========================================================================== */
export interface SidebarNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeTone?: 'default' | 'danger';
  hidden?: boolean;
}

export interface SidebarNavGroup {
  category: string;
  items: SidebarNavItem[];
}

export interface DashboardShellProps {
  portalTitle: string;
  portalSubtitle: string;
  portalBadge?: string;
  navGroups: SidebarNavGroup[];
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  userName?: string;
  userRoleLabel?: string;
  userSubLabel?: string;
  onLogout: () => void;
  headerActions?: React.ReactNode;
  sidebarExtra?: React.ReactNode;
  children: React.ReactNode;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  portalTitle,
  portalSubtitle,
  portalBadge = 'v2.0',
  navGroups,
  activeTab,
  onSelectTab,
  userName = 'Usuario Institucional',
  userRoleLabel = 'Portal Activo',
  userSubLabel,
  onLogout,
  headerActions,
  sidebarExtra,
  children,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || 'EC';

  const activeItemLabel =
    navGroups.flatMap((g) => g.items).find((item) => item.id === activeTab)?.label || 'Panel Principal';

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    setMobileOpen(false);
  };

  return (
    <div className="dashboard-layout">
      <div
        className={`ec-drawer-backdrop ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={`dashboard-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
        aria-label={`Navegación de ${portalTitle}`}
      >
        <div>
          <div className="sidebar-header">
            <div className="brand-wrapper">
              <div className="brand-icon-box">
                <GraduationCap size={20} />
              </div>
              {!collapsed && (
                <div style={{ minWidth: 0 }}>
                  <div className="brand-title">
                    EduConnect <span style={{ fontSize: '0.68rem', opacity: 0.7 }}>{portalBadge}</span>
                  </div>
                  <div className="brand-subtitle">{portalSubtitle}</div>
                </div>
              )}
            </div>

            <button
              type="button"
              className="sidebar-collapse-btn"
              onClick={() => setCollapsed((prev) => !prev)}
              title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
              aria-label={collapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'}
            >
              {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>
          </div>

          {!collapsed && (
            <div className="sidebar-user-mini">
              <div className="sidebar-user-avatar">{initials}</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {userName}
                </div>
                <div
                  style={{
                    color: '#94a3b8',
                    fontSize: '0.72rem',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {userRoleLabel}
                  {userSubLabel ? ` · ${userSubLabel}` : ''}
                </div>
              </div>
            </div>
          )}

          <div className="sidebar-nav-groups">
            {navGroups.map((group) => {
              const visibleItems = group.items.filter((it) => !it.hidden);
              if (visibleItems.length === 0) return null;
              return (
                <div key={group.category}>
                  {!collapsed && <div className="sidebar-group-label">{group.category}</div>}
                  <ul className="sidebar-menu">
                    {visibleItems.map((item) => {
                      const isActive = activeTab === item.id;
                      return (
                        <li
                          key={item.id}
                          className={`sidebar-item ${isActive ? 'active' : ''}`}
                          onClick={() => handleNavClick(item.id)}
                          title={collapsed ? item.label : undefined}
                        >
                          <div className="sidebar-item-left">
                            {item.icon}
                            {!collapsed && <span>{item.label}</span>}
                          </div>
                          {!collapsed && item.badge !== undefined && item.badge !== 0 && item.badge !== '' && (
                            <span
                              className={`sidebar-item-badge ${item.badgeTone === 'danger' ? 'danger' : ''}`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        <div className="sidebar-footer">
          {!collapsed && sidebarExtra}
          {!collapsed && (
            <div className="sidebar-status-pill">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#34d399', fontWeight: 700 }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }} />
                Sistema Activo
              </span>
              <span>TLS / JWT</span>
            </div>
          )}
          <button type="button" className="btn-logout" onClick={onLogout} title="Cerrar sesión">
            <LogOut size={16} />
            {!collapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      <div className="dashboard-main-wrapper">
        <header className="ec-sticky-header no-print">
          <div className="ec-header-left">
            <button
              type="button"
              className="ec-mobile-menu-btn"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Abrir menú de navegación"
            >
              {mobileOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
            <div className="ec-breadcrumb">
              <span>{portalTitle}</span>
              <span>/</span>
              <strong>{activeItemLabel}</strong>
            </div>
          </div>

          <div className="ec-header-right">
            {headerActions}
            <span className="ec-online-pill">
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--ec-success)' }} />
              En línea
            </span>
            <div className="user-profile-badge">
              <div className="user-avatar-circle">{initials}</div>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ec-text)' }}>{userName}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--ec-text-muted)', fontWeight: 600 }}>{userRoleLabel}</div>
              </div>
            </div>
          </div>
        </header>

        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
};
