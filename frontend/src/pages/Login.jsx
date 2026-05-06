import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Wallet, LogIn } from 'lucide-react';
import classNames from 'classnames';

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
    <div className="auth-container">
      <div className="auth-card card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <img src="/logo.png" alt="SpendWise Logo" style={{ width: '90px', height: '90px', borderRadius: '20px', border: '1px solid var(--accent-primary)' }} />
          </div>
          <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>SpendWise</h1>
          <p className="text-secondary">Gerencie limites e alcance suas metas financeiras</p>
        </div>

        {error && (
          <div className="alert-banner alert-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="joao@email.com"
              required
            />
          </div>

          <div className="input-group" style={{ marginBottom: '2rem' }}>
            <label className="input-label">Password</label>
            <input
              type="password"
              className="input-field"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="123456"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
            ) : (
              <>
                <LogIn size={20} />
                Sign In
              </>
            )}
          </button>
        </form>
        
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <p className="text-secondary">Demo account: joao@email.com / 123456</p>
        </div>
      </div>
    </div>
  );
}
