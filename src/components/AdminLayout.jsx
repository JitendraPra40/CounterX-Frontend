import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Utensils, PackageOpen, ListOrdered, CreditCard, PieChart, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { to: '/admin/menu', label: 'Menu', icon: <Utensils size={20} /> },
  { to: '/admin/inventory', label: 'Inventory', icon: <PackageOpen size={20} /> },
  { to: '/admin/orders', label: 'Orders', icon: <ListOrdered size={20} /> },
  { to: '/admin/payments', label: 'Payments', icon: <CreditCard size={20} /> },
  { to: '/admin/reports', label: 'Reports', icon: <PieChart size={20} /> },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark"><Utensils size={24} /></span>
          <div>
            <strong style={{ fontSize: '1.2rem', display: 'block' }}>Restaurant</strong>
            <small>Management System</small>
          </div>
        </div>
        <nav className="nav-list" aria-label="Admin navigation">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Admin Console</p>
            <h1>Overview</h1>
          </div>
          <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="user-chip">
              <span>{user?.username?.slice(0, 1).toUpperCase() || 'A'}</span>
              <div>
                <strong>{user?.username || 'admin'}</strong>
                <small>{user?.role || 'ADMIN'}</small>
              </div>
            </div>
            <button className="ghost-button" type="button" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
