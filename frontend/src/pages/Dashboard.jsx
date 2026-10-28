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
      legend: { position: 'right', labels: { color: '#aaaaaa' } }
    },
    cutout: '70%',
    maintainAspectRatio: false
  };

  return (
    <div className="dashboard-shell">
      <div className="dashboard-header mb-10">
        <div className="dashboard-logo-container">
          <img src="/logo.png" alt="WiseIA" className="dashboard-logo" />
        </div>
        <div className="dashboard-title-container">
          <h1 className="page-title dashboard-title mb-0">WiseIA</h1>
        </div>
        <div className="dashboard-ref">Ref: {resumo?.mes_ref}</div>
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

        <div className="col-span-8 card chart-card">
          <h3 className="panel-title">Gastos por Categoria</h3>
          <div className="chart-wrap">
            {gastosCategoria.length > 0 ? (
              <Doughnut data={chartData} options={chartOptions} />
            ) : (
              <div className="empty-state">Nenhum dado de despesa no mês atual</div>
            )}
          </div>
        </div>

        <div className="col-span-4 card transactions-card">
          <h3 className="panel-title">Últimas Transações</h3>
          <div className="transaction-list">
            {transacoes.length > 0 ? (
              transacoes.map((t) => (
                <div key={t.id} className="transaction-item" style={{ padding: '0.75rem 0', border: 'none', borderBottom: '1px solid var(--color-border)', borderRadius: 0, backgroundColor: 'transparent' }}>
                  <div className="transaction-details">
                    <div className="transaction-info">
                      <h4>{t.descricao}</h4>
                      <p>{t.categoria_nome} • {formatDate(t.data)}</p>
                    </div>
                  </div>
                  <div className={`transaction-amount ${t.tipo === 'receita' ? 'income' : ''}`}>
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
