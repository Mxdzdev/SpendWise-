import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Send, Edit2, Trash2, PlusCircle, CheckCircle2, Bot } from 'lucide-react';
import api from '../utils/api';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function Transactions() {
  const { user } = useAuth();
  const [transacoes, setTransacoes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'bot', text: 'Olá! Sou seu assistente. Me conte o que você gastou. Exemplo: "Gastei 45 no ifood" ou "Recebi 1500 de salário".', type: 'text' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    descricao: '', valor: '', tipo: 'despesa', categoria_id: '', data: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    try {
      const [transRes, catRes] = await Promise.all([
        api.get('/transacoes?por_pagina=50'),
        api.get('/categorias')
      ]);
      setTransacoes(transRes.data.transacoes);
      setCategorias(catRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setInputValue('');
    
    // Add user message to chat
    setChatMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userText, type: 'text' }]);

    // Smart Parser for the text
    await processSmartAdd(userText);
  };

  const processSmartAdd = async (text) => {
    const textLower = text.toLowerCase();
    
    // Default assumptions
    let tipo = 'despesa';
    if (textLower.includes('recebi') || textLower.includes('ganhei') || textLower.includes('salário') || 
        textLower.includes('vendi') || textLower.includes('freela') || textLower.includes('job') || 
        textLower.includes('serviço') || textLower.includes('pagamento')) {
      tipo = 'receita';
    }

    // Extract value using regex (matches patterns like 50, 50.00, 50,00, R$ 50)
    const valueMatch = text.match(/(?:r\$\s*)?(\d+[\.,]?\d*)/i);
    let valor = 0;
    if (valueMatch) {
      valor = parseFloat(valueMatch[1].replace(',', '.'));
    }

    // Attempt to figure out description/category
    let descricao = text;
    let categoriaMatched = null;

    if (valor > 0) {
      // Find a matching category
      const activeCategories = categorias.filter(c => c.tipo === tipo);
      
      for (const cat of activeCategories) {
        if (textLower.includes(cat.nome.toLowerCase())) {
          categoriaMatched = cat;
          break;
        }
      }

      // If no category matched but we have common words
      if (!categoriaMatched) {
        const keywordsToCategory = {
          'ifood': 'Alimentação', 'padaria': 'Alimentação', 'supermercado': 'Alimentação', 'lanche': 'Alimentação',
          'uber': 'Transporte', 'gasolina': 'Transporte', 'ônibus': 'Transporte', 'estacionamento': 'Transporte',
          'cinema': 'Lazer', 'bar': 'Lazer', 'festa': 'Lazer',
          'farmácia': 'Saúde', 'remédio': 'Saúde', 'médico': 'Saúde',
          'aluguel': 'Moradia', 'luz': 'Moradia', 'água': 'Moradia',
          'salário': 'Salário', 'pagamento': 'Salário', 'mensal': 'Salário',
          'freela': 'Freelancer', 'job': 'Freelancer', 'extra': 'Freelancer', 'projeto': 'Freelancer', 'serviço': 'Freelancer'
        };

        for (const [key, catName] of Object.entries(keywordsToCategory)) {
          if (textLower.includes(key)) {
            const found = activeCategories.find(c => c.nome === catName);
            if (found) { categoriaMatched = found; break; }
          }
        }
      }

      // Fallback category
      if (!categoriaMatched && activeCategories.length > 0) {
        categoriaMatched = activeCategories[0];
      }

      // Format description: remove "gastei X em"
      descricao = text.replace(/(gastei|paguei|recebi|ganhei)\s*(r\$)?\s*\d+[\.,]?\d*\s*(com|no|na|em|de)?/i, '').trim();
      if (!descricao) descricao = categoriaMatched ? categoriaMatched.nome : 'Transação Rápida';
      
      // Create via API
      try {
        const payload = {
          descricao: descricao.charAt(0).toUpperCase() + descricao.slice(1),
          valor: valor,
          tipo: tipo,
          categoria_id: categoriaMatched.id,
          data: new Date().toISOString().split('T')[0]
        };

        const response = await api.post('/transacoes', payload);
        
        // Add success message to chat
        setChatMessages(prev => [...prev, { 
          id: Date.now() + 1, 
          sender: 'bot', 
          type: 'success',
          text: `Registrado: ${formatCurrency(valor)} em ${categoriaMatched.nome}.`,
          data: response.data.transacao
        }]);

        // If alert
        if (response.data.alerta) {
           setChatMessages(prev => [...prev, { 
            id: Date.now() + 2, 
            sender: 'bot', 
            type: 'alert',
            text: `⚠️ Alerta: A categoria ${categoriaMatched.nome} atingiu ${response.data.alerta.percentual}% do limite!`,
          }]);
        }

        fetchData();
        return;
      } catch (error) {
         setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: 'Ops, não consegui salvar a transação. Verifique os dados.', type: 'error' }]);
         return;
      }
    }

    // Could not understand
    setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: 'Não entendi o valor. Tente dizer "Gastei 20 no ifood".', type: 'text' }]);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Excluir esta transação?')) {
      await api.delete(`/transacoes/${id}`);
      fetchData();
    }
  };

  const handleEdit = (transacao) => {
    setEditingTransaction(transacao.id);
    setFormData({
      descricao: transacao.descricao,
      valor: transacao.valor,
      tipo: transacao.tipo,
      categoria_id: transacao.categoria_id,
      data: transacao.data
    });
    setShowModal(true);
  };

  const handleOpenModal = () => {
    setEditingTransaction(null);
    setFormData({ descricao: '', valor: '', tipo: 'despesa', categoria_id: categorias[0]?.id || '', data: new Date().toISOString().split('T')[0] });
    setShowModal(true);
  };

  const handleSubmitModal = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, valor: parseFloat(formData.valor) };
      if (editingTransaction) {
        await api.put(`/transacoes/${editingTransaction}`, payload);
      } else {
        await api.post('/transacoes', payload);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert("Erro ao salvar transação");
    }
  };

  if (loading) return <div className="loading-overlay"><div className="spinner"></div></div>;

  return (
    <div className="dashboard-grid h-full" style={{ height: 'calc(100vh - 4rem)' }}>
      {/* Transaction List Panel */}
      <div className="col-span-8 card flex flex-col" style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="page-title" style={{ marginBottom: 0 }}>Histórico</h2>
          <button onClick={handleOpenModal} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            <PlusCircle size={16} /> Nova Manual
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }} className="transaction-list">
          {transacoes.map((t) => (
            <div key={t.id} className="transaction-item" style={{ padding: '1rem' }}>
              <div className="transaction-details flex-1">
                <div className="transaction-info">
                  <h4>{t.descricao}</h4>
                  <p>{t.categoria_nome} • {formatDate(t.data)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`transaction-amount ${t.tipo === 'receita' ? 'income' : ''}`} style={{ fontSize: '1rem', minWidth: '100px', textAlign: 'right' }}>
                  {t.tipo === 'receita' ? '+' : '-'}{formatCurrency(t.valor)}
                </span>
                <button onClick={() => handleEdit(t)} style={{ color: 'var(--text-secondary)' }}><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(t.id)} className="text-danger"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Assistant / Chat Panel */}
      <div className="col-span-4 card flex flex-col" style={{ height: '100%', padding: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)' }} className="flex items-center gap-2">
          <Bot className="text-accent-primary" />
          <h3 style={{ fontWeight: 600 }}>Registro Inteligente</h3>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {chatMessages.map(msg => (
            <div key={msg.id} style={{ 
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              backgroundColor: msg.sender === 'user' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
              color: msg.sender === 'user' ? '#fff' : 'var(--text-primary)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              borderBottomRightRadius: msg.sender === 'user' ? 0 : 'var(--radius-md)',
              borderBottomLeftRadius: msg.sender === 'bot' ? 0 : 'var(--radius-md)',
              border: msg.sender === 'bot' ? '1px solid var(--border-color)' : 'none',
              fontSize: '0.875rem'
            }}>
              {msg.type === 'success' && <CheckCircle2 size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} className="text-success" />}
              {msg.type === 'alert' && <span style={{ marginRight: '4px' }}>⚠️</span>}
              {msg.text}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSendMessage} style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', borderBottomLeftRadius: 'var(--radius-lg)', borderBottomRightRadius: 'var(--radius-lg)' }}>
          <div className="flex gap-2">
            <input 
              type="text" 
              className="input-field" 
              placeholder="Digite: Gastei 20 no cinema" 
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              style={{ marginBottom: 0 }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 1rem' }}>
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>

      {/* Manual Add/Edit Modal */}
      {showModal && (
        <div className="loading-overlay" style={{ alignItems: 'center' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--bg-primary)' }}>
            <h2 className="page-title" style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>
              {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
            </h2>
            <form onSubmit={handleSubmitModal}>
              <div className="input-group">
                <label className="input-label">Tipo</label>
                <select className="input-field" value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})}>
                  <option value="despesa">Despesa</option>
                  <option value="receita">Receita</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Valor (R$)</label>
                <input type="number" step="0.01" required className="input-field" value={formData.valor} onChange={e => setFormData({...formData, valor: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Descrição</label>
                <input type="text" required className="input-field" value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Categoria</label>
                <select required className="input-field" value={formData.categoria_id} onChange={e => setFormData({...formData, categoria_id: e.target.value})}>
                  <option value="">Selecione...</option>
                  {categorias.filter(c => c.tipo === formData.tipo).map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Data</label>
                <input type="date" required className="input-field" value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} />
              </div>
              <div className="flex gap-2 mt-4" style={{ justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
