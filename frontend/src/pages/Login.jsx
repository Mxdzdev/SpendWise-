import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('joao@email.com');
  const [senha, setSenha] = useState('123456');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, senha);

    if (!result.success) {
      setError(result.error);
      setIsLoading(false);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="auth-container landing-shell">
      <header className="landing-topbar">
        <div className="brand-mark">W</div>

        <nav className="landing-nav" aria-label="Navegação principal">
          <a href="#">Preços</a>
          <a href="#">Soluções</a>
          <a href="#">Recursos</a>
          <a href="#">Inspiração</a>
        </nav>

        <button type="button" className="landing-google-btn">
          <span className="google-dot" aria-hidden="true">G</span>
          Entrar com o Google
        </button>
      </header>

      <main className="landing-hero">
        <div className="landing-copy">
          <h1>Seu mundo financeiro<br />no mapa.</h1>
          <p>
            A WiseIA organiza sua vida financeira em um só lugar: metas,
            despesas, alertas e investimentos em um painel inteligente.
          </p>

          {error && (
            <div className="landing-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="landing-form">
            <div className="landing-input-wrap">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail"
                aria-label="E-mail"
                required
              />
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Senha"
                aria-label="Senha"
                required
              />
              <button type="submit" className="landing-submit" disabled={isLoading}>
                {isLoading ? (
                  <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></div>
                ) : (
                  <>
                    <LogIn size={18} />
                    Entrar
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="landing-mini-grid">
            <div className="mini-card mini-card--ghost">
              <span className="mini-plus">+</span>
              <p>Começar do zero</p>
            </div>

            <div className="mini-card">
              <span className="mini-badge mini-badge--nav">N</span>
              <p>Importar do Notion</p>
            </div>

            <div className="mini-card">
              <span className="mini-badge mini-badge--sheet">▣</span>
              <p>Importar do Planilhas</p>
            </div>
          </div>

          <div className="demo-note">
            Acesso de demonstração: joao@email.com / 123456
          </div>
        </div>
      </main>
    </div>
  );
}
