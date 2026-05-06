import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, DollarSign, AlertCircle, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [resumo, setResumo] = useState(null);
  const [gastosCategoria, setGastosCategoria] = useState([]);
  const [transacoes, setTransacoes] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [resumoRes, catRes, transRes, alertasRes] = await Promise.all([
          api.get('/resumo/mensal'),
          api.get('/resumo/por-categoria'),
          api.get('/transacoes?por_pagina=5'),
          api.get('/alertas?lido=false')
        ]);

        setResumo(resumoRes.data);
        setGastosCategoria(catRes.data.categorias);
        setTransacoes(transRes.data.transacoes);
        setAlertas(alertasRes.data.alertas);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="loading-overlay"><div className="spinner"></div></div>;
  }

  const chartData = {
    labels: gastosCategoria.map(c => c.categoria_nome),
    datasets: [
      {
        data: gastosCategoria.map(c => c.total),
        backgroundColor: gastosCategoria.map(c => c.cor),
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: { position: 'right', labels: { color: '#f8fafc' } }
    },
    cutout: '70%',
    maintainAspectRatio: false
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-10" style={{ position: 'relative', minHeight: '60px' }}>
        {/* Logo no canto esquerdo */}
        <img src="/logo.png" alt="SpendWise Logo" style={{ width: '42px', height: '42px', borderRadius: '10px', border: '1px solid var(--accent-primary)' }} />
        
        {/* Nome SpendWise centralizado no meio da tela */}
        <div style={{ 
          position: 'absolute', 
          left: '50%', 
          transform: 'translateX(-50%)',
          textAlign: 'center'
        }}>
          <h1 className="page-title" style={{ marginBottom: 0, fontSize: '2.25rem' }}>SpendWise</h1>
        </div>

        {/* Mês de Referência no canto direito */}
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
          Ref: {resumo?.mes_ref}
        </div>
      </div>

      {alertas.length > 0 && (
        <div className="alert-banner alert-warning">
          <AlertCircle size={24} />
          <div>
            <strong>Atenção!</strong> Você tem {alertas.length} categoria(s) próximas ou acima do limite de gastos. 
            Verifique seus alertas.
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        {/* KPI Cards */}
        <div className="col-span-4 card metric-card clickable-card" onClick={() => navigate('/transactions')}>
          <div className="metric-info">
            <h3>Receitas do Mês</h3>
            <p className="value text-success">{formatCurrency(resumo?.total_receitas || 0)}</p>
          </div>
          <div className="metric-icon income">
            <ArrowUpRight size={24} />
          </div>
        </div>

        <div className="col-span-4 card metric-card clickable-card" onClick={() => navigate('/transactions')}>
          <div className="metric-info">
            <h3>Despesas do Mês</h3>
            <p className="value text-danger">{formatCurrency(resumo?.total_despesas || 0)}</p>
            <div className={`metric-trend ${resumo?.comparativo_mes_anterior?.tendencia === 'alta' ? 'up' : 'down'}`}>
              <span>{resumo?.comparativo_mes_anterior?.variacao_percentual}% vs mês anterior</span>
            </div>
          </div>
          <div className="metric-icon expense">
            <ArrowDownRight size={24} />
          </div>
        </div>

        <div className="col-span-4 card metric-card clickable-card" onClick={() => navigate('/transactions')}>
          <div className="metric-info">
            <h3>Saldo Atual</h3>
            <p className="value">{formatCurrency(resumo?.saldo || 0)}</p>
            <div className="metric-trend neutral">
              <span>Projeção final: {formatCurrency((resumo?.total_receitas || 0) - (resumo?.projecao_mensal_gastos || 0))}</span>
            </div>
          </div>
          <div className="metric-icon balance">
            <DollarSign size={24} />
          </div>
        </div>

        {/* Charts & Lists */}
        <div className="col-span-8 card">
          <h3 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Gastos por Categoria</h3>
          <div style={{ height: '300px' }}>
            {gastosCategoria.length > 0 ? (
              <Doughnut data={chartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center" style={{ height: '100%', color: 'var(--text-muted)' }}>
                Nenhum dado de despesa no mês atual
              </div>
            )}
          </div>
        </div>

        <div className="col-span-4 card">
          <h3 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Últimas Transações</h3>
          <div className="transaction-list">
            {transacoes.length > 0 ? (
              transacoes.map((t) => (
                <div key={t.id} className="transaction-item" style={{ padding: '0.75rem', border: 'none', borderBottom: '1px solid var(--border-color)', borderRadius: 0, backgroundColor: 'transparent' }}>
                  <div className="transaction-details">
                    <div className="transaction-info">
                      <h4 style={{ fontSize: '0.875rem' }}>{t.descricao}</h4>
                      <p style={{ fontSize: '0.75rem' }}>{t.categoria_nome} • {formatDate(t.data)}</p>
                    </div>
                  </div>
                  <div className={`transaction-amount ${t.tipo === 'receita' ? 'income' : ''}`} style={{ fontSize: '1rem' }}>
                    {t.tipo === 'receita' ? '+' : '-'}{formatCurrency(t.valor)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted">Nenhuma transação recente</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
