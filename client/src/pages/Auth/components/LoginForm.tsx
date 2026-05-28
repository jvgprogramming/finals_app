import { useState, type FC, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

const LoginForm: FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please fill in both username and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(username.trim(), password);
      navigate('/users');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Invalid username or password. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Username */}
      <div className="form-group">
        <label className="form-label" htmlFor="username">Username</label>
        <div className="form-control-icon-wrapper">
          <span className="form-control-icon">👤</span>
          <input
            id="username"
            type="text"
            className="form-control"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            autoComplete="username"
            minLength={6}
            maxLength={12}
            required
          />
        </div>
      </div>

      {/* Password */}
      <div className="form-group">
        <label className="form-label" htmlFor="password">Password</label>
        <div className="form-control-icon-wrapper" style={{ position: 'relative' }}>
          <span className="form-control-icon">🔒</span>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            className="form-control"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            minLength={6}
            maxLength={12}
            required
            style={{ paddingRight: '44px' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-cocoa)',
              fontSize: '15px',
              padding: 0,
            }}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div
          style={{
            backgroundColor: 'var(--color-danger-light)',
            border: '1px solid rgba(184, 92, 92, 0.2)',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '20px',
            fontSize: '13px',
            color: 'var(--color-danger)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        className="btn-primary"
        disabled={isLoading}
        style={{ marginTop: '4px' }}
      >
        {isLoading ? (
          <>
            <span className="spinner spinner-sm" style={{ borderTopColor: 'white' }} />
            Signing In…
          </>
        ) : (
          <>
            🍰 Sign In to Portal
          </>
        )}
      </button>
    </form>
  );
};

export default LoginForm;
