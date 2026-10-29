import { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Landmark, TrendingUp, CheckCircle2, Info, Bot } from 'lucide-react';
import api from '../utils/api';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function Investments() {
  const [investimentos, setInvestimentos] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    banco: '',
    tipo: 'CDB',
    valor: '',
    data: new Date().toISOString().split('T')[0]
  });

  const tiposDisponiveis = [
    'CDB / Renda Fixa',
    'Tesouro Direto',
    'Ações',
    'Fundos Imobiliários (FIIs)',
    'Criptomoedas',
    'Poupança',
    'Outros'
  ];

  const [saldo, setSaldo] = useState(0);
  const [adviceStep, setAdviceStep] = useState(1); // 1: Initial, 2: Calculated, 3: Success
  const [calcValue, setCalcValue] = useState(0);
  const [calcPercent, setCalcPercent] = useState(0);

  const fetchData = async () => {
    try {
      const [invRes, summaryRes] = await Promise.all([
        api.get('/investimentos'),
        api.get('/resumo/mensal')
      ]);
      setInvestimentos(invRes.data.investimentos);
      setTotal(invRes.data.total);
      setSaldo(summaryRes.data.saldo_geral);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePercentageClick = (p) => {
    const value = (saldo * p) / 100;
    setCalcValue(value > 0 ? value : 0);
    setCalcPercent(p);
    setAdviceStep(2);
    setFormData({ ...formData, valor: value.toFixed(2), banco: '' });
  };

  const handleQuickInvest = async () => {
    if (!formData.banco) {
      alert("Por favor, digite o nome do banco ou corretora.");
      return;
    }
    try {
      await api.post('/investimentos', { ...formData, valor: parseFloat(formData.valor) });
      setAdviceStep(3);
      fetchData();
      setTimeout(() => setAdviceStep(1), 3000);
    } catch (error) {
      alert("Erro ao salvar investimento.");
    }
  };

  const handleOpenModal = () => {
    setFormData({ banco: '', tipo: 'CDB / Renda Fixa', valor: '', data: new Date().toISOString().split('T')[0] });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/investimentos', { ...formData, valor: parseFloat(formData.valor) });
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert("Erro ao salvar o investimento.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esse investimento do histórico?')) {
      await api.delete(`/investimentos/${id}`);
      fetchData();
    }
  };

  if (loading) return <div className="loading-overlay"><div className="spinner"></div></div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8 page-header-flex">
        <div className="flex items-center gap-3">
          <Landmark className="text-accent-primary" size={32} />
          <h1 className="page-title" style={{ marginBottom: 0 }}>Carteira de Investimentos</h1>
        </div>
        <button onClick={handleOpenModal} className="btn btn-primary mobile-full-btn">
          <PlusCircle size={20} /> Novo Investimento
        </button>
      </div>

      {/* Patrimônio total */}
      <div className="card mb-8" style={{ 
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--color-primary-light) 100%)',
        padding: '2.5rem',
        border: '1px solid var(--color-border)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="flex justify-between items-center relative z-10 hero-flex">
          <div>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', fontWeight: 500, marginBottom: '0.5rem' }}>Patrimônio Total Investido</h3>
            <p className="value hero-value" style={{ color: 'var(--accent-primary)', fontWeight: 800, letterSpacing: '-1px' }}>
              {formatCurrency(total)}
            </p>
          </div>
          <div className="flex flex-col items-end hero-icon-container">
            <div style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--accent-primary)', padding: '1rem', borderRadius: '1rem' }}>
              <TrendingUp size={48} />
            </div>
          </div>
        </div>
        {/* Subtle background pattern */}
        <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.05 }}>
          <Landmark size={200} />
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Row 1: Consultor Inteligente (Centralizado e Horizontal) */}
        <div className="col-span-12">
          <div className="card mb-8" style={{ border: '1px solid var(--border-color)', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Bot className="text-accent-primary" size={20} />
              <h3 style={{ fontWeight: 600, fontSize: '1rem' }}>Consultor WiseIA</h3>
            </div>
            
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '200px' }}>
              {/* Mensagem do Bot 1 */}
              <div className="flex gap-3">
                <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--color-primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', flexShrink: 0 }}>
                  <Bot size={18} style={{ margin: 'auto' }} />
                </div>
                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.75rem 1rem', borderRadius: '0 1rem 1rem 1rem', border: '1px solid var(--border-color)', maxWidth: '80%' }}>
                  <p style={{ fontSize: '0.875rem', margin: 0 }}>
                    Olá! Analisei suas finanças. Você tem <strong className="text-success">{formatCurrency(saldo)}</strong> de saldo disponível este mês.
                  </p>
                  <p style={{ fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>
                    Quanto você gostaria de separar para investir hoje? Escolha uma porcentagem:
                  </p>
                </div>
              </div>

              {/* Opções / Respostas do Usuário (Botões) */}
              {adviceStep === 1 && (
                <div className="flex flex-wrap gap-2 chat-options">
                  {[5, 10, 20, 50].map(p => (
                    <button 
                      key={p} 
                      onClick={() => handlePercentageClick(p)}
                      className="btn btn-secondary" 
                      style={{ fontSize: '0.8125rem', padding: '0.4rem 1rem', borderRadius: '2rem', backgroundColor: 'transparent', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }}
                    >
                      Investir {p}%
                    </button>
                  ))}
                </div>
              )}

              {/* Mensagem do Bot 2 (Resultado e Tipo) */}
              {adviceStep >= 2 && (
                <>
                  <div className="flex gap-3 justify-end">
                    <div style={{ backgroundColor: 'var(--accent-primary)', color: '#fff', padding: '0.75rem 1rem', borderRadius: '1rem 0 1rem 1rem', maxWidth: '80%', fontSize: '0.875rem', fontWeight: 600 }}>
                      Quero investir {calcPercent}%!
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--color-primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', flexShrink: 0 }}>
                      <Bot size={18} style={{ margin: 'auto' }} />
                    </div>
                    <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.75rem 1rem', borderRadius: '0 1rem 1rem 1rem', border: '1px solid var(--border-color)', maxWidth: '80%' }}>
                      <p style={{ fontSize: '0.875rem', margin: 0 }}>
                        Excelente! Isso dá <strong className="text-success">{formatCurrency(calcValue)}</strong>. 
                      </p>
                      <p style={{ fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>
                        Qual o <strong>tipo</strong> desse investimento?
                      </p>
                    </div>
                  </div>

                  {adviceStep === 2 && (
                    <div className="flex flex-wrap gap-2 chat-options">
                      {tiposDisponiveis.map(t => (
                        <button 
                          key={t} 
                          onClick={() => {
                            setFormData({...formData, tipo: t});
                            setAdviceStep(4); // Nova etapa para o Banco
                          }}
                          className="btn btn-secondary" 
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem', borderRadius: '2rem', border: '1px solid var(--border-color)' }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Mensagem do Bot 3 (Tipo selecionado e Banco) */}
              {adviceStep >= 4 && (
                <>
                  <div className="flex gap-3 justify-end">
                    <div style={{ backgroundColor: 'var(--accent-primary)', color: '#fff', padding: '0.75rem 1rem', borderRadius: '1rem 0 1rem 1rem', maxWidth: '80%', fontSize: '0.875rem', fontWeight: 600 }}>
                      Será em {formData.tipo}.
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--color-primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', flexShrink: 0 }}>
                      <Bot size={18} style={{ margin: 'auto' }} />
                    </div>
                    <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.75rem 1rem', borderRadius: '0 1rem 1rem 1rem', border: '1px solid var(--border-color)', maxWidth: '80%' }}>
                      <p style={{ fontSize: '0.875rem', margin: 0 }}>
                        Perfeito. Para finalizar, em qual <strong>banco ou corretora</strong> você vai investir?
                      </p>
                      {adviceStep === 4 && (
                        <div className="mt-4 flex gap-2">
                          <input 
                            type="text" 
                            className="input-field" 
                            placeholder="Ex: XP, BTG, Nubank..."
                            value={formData.banco}
                            onChange={e => setFormData({...formData, banco: e.target.value})}
                            style={{ marginBottom: 0, flex: 1 }}
                            autoFocus
                          />
                          <button onClick={handleQuickInvest} className="btn btn-primary">Confirmar</button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {adviceStep === 3 && (
                <div className="flex gap-3">
                  <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--color-primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', flexShrink: 0 }}>
                    <Bot size={18} style={{ margin: 'auto' }} />
                  </div>
                  <div style={{ backgroundColor: 'var(--color-primary-light)', padding: '0.75rem 1rem', borderRadius: '0 1rem 1rem 1rem', border: '1px solid var(--accent-primary)', maxWidth: '80%' }}>
                    <div className="flex items-center gap-2 text-success" style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      <CheckCircle2 size={16} /> Tudo pronto! Seu investimento foi registrado.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Carteira de investimentos e dicas */}
        <div className="col-span-8">
          <div className="card h-full">
            <div className="mb-6">
              <h3 style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: '0.5rem' }}>Minhas Posições</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Você possui <strong className="text-primary">{investimentos.length}</strong> ativos registrados na sua carteira.
              </p>
            </div>
            
            {investimentos.length > 0 ? (
              <div className="transaction-list border-t border-white/5 pt-4">
                {investimentos.map(inv => (
                  <div key={inv.id} className="transaction-item" style={{ padding: '1.25rem 0', borderBottom: '1px solid var(--border-color)' }}>
                    <div className="transaction-details">
                      <div className="category-icon" style={{ backgroundColor: 'var(--color-background-soft)', width: '52px', height: '52px' }}>
                        <Landmark size={24} className="text-accent-primary" />
                      </div>
                      <div className="transaction-info">
                        <h4 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{inv.banco}</h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{inv.tipo} • Aplicado em {formatDate(inv.data)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 transaction-actions">
                      <span className="transaction-amount" style={{ color: 'var(--accent-primary)', fontSize: '1.25rem', fontWeight: 700 }}>
                        {formatCurrency(inv.valor)}
                      </span>
                      <button onClick={() => handleDelete(inv.id)} className="text-danger hover:opacity-70 transition-opacity p-2" title="Excluir investimento" aria-label="Excluir investimento">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-black/10 rounded-2xl border border-dashed border-white/5 mt-4">
                <TrendingUp size={64} className="mx-auto mb-4" style={{ opacity: 0.1 }} />
                <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>Sua carteira está vazia no momento.</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Use o consultor acima para realizar seu primeiro aporte.</p>
              </div>
            )}
          </div>
        </div>

        {/* Lado Direito da Row 2: Dica e Meta */}
        <div className="col-span-4 flex flex-col gap-6">
          <div className="card" style={{ background: 'linear-gradient(to bottom right, var(--bg-secondary), transparent)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--accent-primary)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                <Info size={18} />
              </div>
              <h4 style={{ fontWeight: 600 }}>Dica de Estratégia</h4>
            </div>
            <p style={{ fontSize: '0.935rem', color: 'var(--text-secondary)', lineHeight: '1.6', fontStyle: 'italic' }}>
              "O melhor momento para plantar uma árvore foi há 20 anos. O segundo melhor momento é agora." 
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '1rem', borderTop: '1px solid var(--border-color)', pt: '1rem' }}>
              Mantenha a constância nos aportes para ver o poder dos juros compostos.
            </p>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="loading-overlay" style={{ alignItems: 'center' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--bg-primary)' }}>
            <h2 className="page-title" style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Novo Aporte</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Banco / Corretora</label>
                <input 
                  type="text" 
                  required 
                  className="input-field" 
                  value={formData.banco} 
                  onChange={e => setFormData({...formData, banco: e.target.value})} 
                  placeholder="Ex: Nubank, XP, Itaú" 
                />
              </div>

              <div className="input-group">
                <label className="input-label">Tipo de Investimento</label>
                <select 
                  className="input-field" 
                  value={formData.tipo} 
                  onChange={e => setFormData({...formData, tipo: e.target.value})}
                >
                  {tiposDisponiveis.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Valor do Aporte (R$)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  required 
                  className="input-field" 
                  value={formData.valor} 
                  onChange={e => setFormData({...formData, valor: e.target.value})} 
                  placeholder="0.00" 
                />
              </div>

              <div className="input-group">
                <label className="input-label">Data</label>
                <input 
                  type="date" 
                  required 
                  className="input-field" 
                  value={formData.data} 
                  onChange={e => setFormData({...formData, data: e.target.value})} 
                />
              </div>

              <div className="flex gap-2 mt-4" style={{ justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Investimento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
