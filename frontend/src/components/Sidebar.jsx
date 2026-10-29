import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, Tag, Bell, LogOut, Landmark } from 'lucide-react';
import api from '../utils/api';

export default function Sidebar() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [alertsCount, setAlertsCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchAlerts = async () => {
      try {
        const response = await api.get('/alertas?lido=false');
        if (isMounted) {
          setAlertsCount(response.data.nao_lidos || 0);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Falha ao carregar os alertas', error);
        }
      }
    };

    fetchAlerts();
    return () => {
      isMounted = false;
    };
  }, []);

  const navItems = [
    { path: '/', label: 'Visão geral', icon: LayoutDashboard },
    { path: '/transactions', label: 'Transações', icon: Receipt },
    { path: '/categories', label: 'Categorias', icon: Tag },
    { path: '/investments', label: 'Investimentos', icon: Landmark },
    { path: '/alerts', label: 'Alertas', icon: Bell, badge: alertsCount },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/logo.png" alt="Logotipo da WiseIA" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
        <span style={{ fontWeight: 'bold' }}>WiseIA</span>
      </div>

      <nav className="sidebar-nav" style={{ flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge > 0 && (
                <span style={{ 
                  backgroundColor: 'var(--danger)', 
                  color: 'white', 
                  fontSize: '0.75rem',
                  padding: '0.1rem 0.5rem',
                  borderRadius: '1rem',
                  fontWeight: 'bold'
                }}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer" style={{ padding: '0 1rem', marginTop: 'auto' }}>
        <div className="user-profile" style={{ 
          padding: '1rem',
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1rem'
        }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{user?.nome}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user?.email}</p>
        </div>
        
        <button 
          onClick={logout} 
          className="nav-item logout-btn" 
          style={{ width: '100%', color: 'var(--danger)' }}
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
