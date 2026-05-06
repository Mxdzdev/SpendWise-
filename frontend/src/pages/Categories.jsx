import { useState, useEffect } from 'react';
import { PlusCircle, Edit2, Trash2, ShieldAlert } from 'lucide-react';
import api from '../utils/api';
import { formatCurrency } from '../utils/formatters';

export default function Categories() {
  const [categorias, setCategorias] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'despesa',
    limite_mensal: '',
    cor: '#00e676',
    icone: '💰'
  });

  const fetchData = async () => {
    try {
      const [catRes, resumoRes] = await Promise.all([
        api.get('/categorias'),
        api.get('/resumo/por-categoria')
      ]);
      setCategorias(catRes.data);
      setGastos(resumoRes.data.categorias || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setEditingCat(cat.id);
      setFormData({
        nome: cat.nome,
        tipo: cat.tipo,
        limite_mensal: cat.limite_mensal || '',
        cor: cat.cor || '#00e676',
        icone: cat.icone || '💰'
      });
    } else {
      setEditingCat(null);
      setFormData({ nome: '', tipo: 'despesa', limite_mensal: '', cor: '#00e676', icone: '📦' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (payload.limite_mensal === '') {
        payload.limite_mensal = null;
      } else {
        payload.limite_mensal = parseFloat(payload.limite_mensal);
      }

      if (editingCat) {
        await api.put(`/categorias/${editingCat}`, payload);
      } else {
        await api.post('/categorias', payload);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert("Erro ao salvar a categoria.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza? Isso vai remover a categoria e todas as transações atreladas a ela.')) {
      await api.delete(`/categorias/${id}`);
      fetchData();
    }
  };

  // Merge categories with their current expenses to show a progress bar
  const renderProgressBar = (cat) => {
    if (!cat.limite_mensal || cat.tipo === 'receita') return null;

    const gastoInfo = gastos.find(g => g.categoria_id === cat.id);
    const totalGasto = gastoInfo ? gastoInfo.total : 0;
    const percent = Math.min((totalGasto / cat.limite_mensal) * 100, 100);
    
    let colorClass = 'var(--success)';
    if (percent >= 100) colorClass = 'var(--danger)';
    else if (percent >= 80) colorClass = 'var(--warning)';

    return (
      <div style={{ marginTop: '0.75rem' }}>
        <div className="flex justify-between" style={{ fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
          <span>Gasto: {formatCurrency(totalGasto)}</span>
          <span>Limite: {formatCurrency(cat.limite_mensal)}</span>
        </div>
        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${percent}%`, height: '100%', backgroundColor: colorClass, transition: 'width 0.3s ease' }}></div>
        </div>
        {percent >= 80 && (
          <p className={`mt-4 flex items-center gap-2 ${percent >= 100 ? 'text-danger' : 'text-warning'}`} style={{ fontSize: '0.75rem' }}>
            <ShieldAlert size={14} /> 
            {percent >= 100 ? 'Limite Excedido!' : 'Próximo do Limite (Aviso em 80%)'}
          </p>
        )}
      </div>
    );
  };

  if (loading) return <div className="loading-overlay"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Gerenciar Categorias</h1>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          <PlusCircle size={20} /> Nova Categoria
        </button>
      </div>

      <div className="dashboard-grid">
        {categorias.map(cat => (
          <div key={cat.id} className="col-span-4 card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="category-icon" style={{ backgroundColor: cat.cor + '20', color: cat.cor }}>
                  {cat.icone}
                </span>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{cat.nome}</h3>
                  <span style={{ fontSize: '0.75rem', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{cat.tipo}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleOpenModal(cat)} style={{ color: 'var(--text-secondary)' }}><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(cat.id)} className="text-danger"><Trash2 size={16} /></button>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              {cat.tipo === 'despesa' && cat.limite_mensal ? (
                renderProgressBar(cat)
              ) : (
                <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.75rem' }}>
                  {cat.tipo === 'receita' ? 'Categoria de Receita (Ganhos)' : 'Sem limite mensal configurado'}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="loading-overlay" style={{ alignItems: 'center' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--bg-primary)' }}>
            <h2 className="page-title" style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>
              {editingCat ? 'Editar Categoria' : 'Nova Categoria'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Nome</label>
                <input type="text" required className="input-field" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} placeholder="Ex: Alimentação" />
              </div>
              
              <div className="input-group flex gap-4">
                <div style={{ flex: 1 }}>
                  <label className="input-label">Ícone (Emoji)</label>
                  <input type="text" maxLength={2} className="input-field" value={formData.icone} onChange={e => setFormData({...formData, icone: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="input-label">Cor</label>
                  <input type="color" className="input-field" style={{ padding: '0.25rem', height: '42px' }} value={formData.cor} onChange={e => setFormData({...formData, cor: e.target.value})} />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Tipo</label>
                <select className="input-field" value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})}>
                  <option value="despesa">Despesa</option>
                  <option value="receita">Receita</option>
                </select>
              </div>

              {formData.tipo === 'despesa' && (
                <div className="input-group">
                  <label className="input-label">Limite Mensal de Gastos (R$)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="input-field" 
                    value={formData.limite_mensal} 
                    onChange={e => setFormData({...formData, limite_mensal: e.target.value})} 
                    placeholder="Ex: 800.00 (Opcional)" 
                  />
                  <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                    Ao definir um limite, a IA avisará automaticamente quando você gastar 80% ou ultrapassar esse teto.
                  </p>
                </div>
              )}

              <div className="flex gap-2 mt-4" style={{ justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Categoria</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
