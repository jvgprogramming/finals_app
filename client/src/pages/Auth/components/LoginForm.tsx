import { useState, type FC, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

const LoginForm: FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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
      const user = await login(username.trim(), password);
      navigate(user.role === 'admin' ? '/admin' : '/users', { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        'Invalid username or password. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {/* Username */}
      <div className="form-group">
        <label className="form-label" htmlFor="username">
          Username
        </label>
        <div className="form-control-icon-wrapper auth-control">
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
        <label className="form-label" htmlFor="password">
          Password
        </label>
        <div className="form-control-icon-wrapper auth-control auth-control-password">
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
            className="auth-password-toggle"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="auth-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <p className="auth-form-note">
        Your session will be restored automatically the next time you visit.
      </p>

      {/* Submit */}
      <button
        type="submit"
        className="btn-primary auth-submit-btn"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span
              className="spinner spinner-sm"
              style={{ borderTopColor: 'white' }}
            />
            Signing In…
          </>
        ) : (
          <>Sign In</>
        )}
      </button>
    </form>
  );
};

export default LoginForm;
