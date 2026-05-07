import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, AlertTriangle, AlertOctagon, Info } from 'lucide-react';
import api from '../utils/api';
import { formatDate } from '../utils/formatters';

export default function Alerts() {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlertas = async () => {
    try {
      const response = await api.get('/alertas');
      setAlertas(response.data.alertas);
    } catch (error) {
      console.error("Erro ao buscar alertas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertas();
  }, []);

  const marcarComoLido = async (id) => {
    try {
      await api.patch(`/alertas/${id}/lido`);
      // Atualizar lista localmente para ser mais rápido
      setAlertas(prev => prev.map(a => a.id === id ? { ...a, lido: true } : a));
    } catch (error) {
      console.error("Erro ao marcar como lido:", error);
    }
  };

  const marcarTodosComoLidos = async () => {
    try {
      await api.patch('/alertas/marcar-todos-lidos');
      setAlertas(prev => prev.map(a => ({ ...a, lido: true })));
    } catch (error) {
      console.error("Erro ao marcar todos como lidos:", error);
    }
  };

  if (loading) {
    return <div className="loading-overlay"><div className="spinner"></div></div>;
  }

  const alertasPendentes = alertas.filter(a => !a.lido);
  const alertasLidos = alertas.filter(a => a.lido);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 page-header-flex">
        <div className="flex items-center gap-3">
          <Bell className="text-accent-primary" size={28} />
          <h1 className="page-title" style={{ marginBottom: 0 }}>Centro de Alertas</h1>
        </div>
        {alertasPendentes.length > 0 && (
          <button 
            onClick={marcarTodosComoLidos}
            className="btn btn-secondary flex items-center gap-2 mobile-full-btn"
          >
            <CheckCheck size={18} /> Marcar todos como lidos
          </button>
        )}
      </div>

      <div className="dashboard-grid">
        <div className="col-span-12">
          {/* Seção de Alertas Ativos */}
          <h3 className="section-subtitle mb-4">Alertas Recentes</h3>
          {alertasPendentes.length > 0 ? (
            <div className="alert-stack">
              {alertasPendentes.map(alerta => (
                <div key={alerta.id} className={`alert-card unread ${alerta.tipo === 'critico' ? 'critical' : 'warning'}`}>
                  <div className="alert-icon">
                    {alerta.tipo === 'critico' ? <AlertOctagon size={24} /> : <AlertTriangle size={24} />}
                  </div>
                  <div className="alert-content">
                    <h4>{alerta.tipo === 'critico' ? 'Limite Excedido!' : 'Aviso de Orçamento'}</h4>
                    <p>{alerta.mensagem}</p>
                    <span className="alert-date">{formatDate(alerta.data_criacao)}</span>
                  </div>
                  <button 
                    className="alert-action"
                    onClick={() => marcarComoLido(alerta.id)}
                    title="Marcar como lido"
                  >
                    <CheckCheck size={20} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-10">
              <div className="flex flex-col items-center gap-3 opacity-50">
                <CheckCheck size={48} className="text-success" />
                <p>Tudo sob controle! Você não tem alertas pendentes.</p>
              </div>
            </div>
          )}

          {/* Seção de Histórico (Alertas Lidos) */}
          {alertasLidos.length > 0 && (
            <div className="mt-10">
              <h3 className="section-subtitle mb-4">Histórico de Alertas</h3>
              <div className="alert-stack">
                {alertasLidos.map(alerta => (
                  <div key={alerta.id} className="alert-card read">
                    <div className="alert-icon">
                      <Info size={20} />
                    </div>
                    <div className="alert-content">
                      <p>{alerta.mensagem}</p>
                      <span className="alert-date">{formatDate(alerta.data_criacao)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .alert-stack {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .alert-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          border-radius: var(--radius-md);
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          transition: all 0.2s ease;
        }
        .alert-card.unread.warning {
          border-left: 4px solid #facc15;
          background: linear-gradient(90deg, rgba(250, 204, 21, 0.05) 0%, transparent 100%);
        }
        .alert-card.unread.critical {
          border-left: 4px solid #ef4444;
          background: linear-gradient(90deg, rgba(239, 68, 68, 0.05) 0%, transparent 100%);
        }
        .alert-card.read {
          opacity: 0.6;
          padding: 0.75rem 1.25rem;
        }
        .alert-icon {
          flex-shrink: 0;
        }
        .alert-card.warning .alert-icon { color: #facc15; }
        .alert-card.critical .alert-icon { color: #ef4444; }
        
        .alert-content {
          flex: 1;
        }
        .alert-content h4 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
        }
        .alert-content p {
          margin: 0.25rem 0;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
        .alert-date {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .alert-action {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .alert-action:hover {
          background-color: rgba(255, 255, 255, 0.05);
          color: var(--accent-primary);
          transform: scale(1.1);
        }
        .section-subtitle {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      `}} />
    </div>
  );
}
