import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, Sparkles, ArrowRight } from 'lucide-react';

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
          <a href="#">Pricing</a>
          <a href="#">Solutions</a>
          <a href="#">Products</a>
          <a href="#">Inspiration</a>
        </nav>

        <button type="button" className="landing-google-btn">
          <span className="google-dot" aria-hidden="true">G</span>
          Iniciar sesión con Google
        </button>
      </header>

      <main className="landing-hero">
        <div className="landing-copy">
          <h1>Put your world<br />on the map.</h1>
          <p>
            WiseIA turns your financial life into a clear, guided map: goals,
            spending, alerts and investments in one smart dashboard.
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
                placeholder="joao@email.com"
                required
              />
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="123456"
                required
              />
              <button type="submit" className="landing-submit" disabled={isLoading}>
                {isLoading ? (
                  <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></div>
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign In
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="landing-mini-grid">
            <div className="mini-card mini-card--ghost">
              <span className="mini-plus">+</span>
              <p>Start from scratch</p>
            </div>

            <div className="mini-card">
              <span className="mini-badge mini-badge--nav">N</span>
              <p>Start from Notion</p>
            </div>

            <div className="mini-card">
              <span className="mini-badge mini-badge--sheet">▣</span>
              <p>Start from Sheets</p>
            </div>
          </div>

          <div className="demo-note">
            Demo account: joao@email.com / 123456
          </div>
        </div>
      </main>
    </div>
  );
}
