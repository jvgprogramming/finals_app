import { useState, type FC, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import {
  UserIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

type Props = {
  onSuccess?: (user: any) => void;
};

const LoginForm: FC<Props> = ({ onSuccess }) => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      if (isRegister) {
        if (!firstName.trim() || !lastName.trim()) {
          setError('Please provide your full name.');
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setIsLoading(false);
          return;
        }
        const registeredUser = await register({
          username: username.trim(),
          password,
          password_confirmation: confirmPassword,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        });
        const pending = localStorage.getItem('pendingCheckout');
        if (onSuccess) {
          onSuccess(registeredUser);
          return;
        }
        if (pending && registeredUser.role === 'user') {
          localStorage.removeItem('pendingCheckout');
          localStorage.setItem('openCheckout', '1');
          navigate('/', { replace: true });
        } else {
          navigate(registeredUser.role === 'admin' ? '/admin' : '/', {
            replace: true,
          });
        }
        return;
      }

      const user = await login(username.trim(), password);
      const pending = localStorage.getItem('pendingCheckout');
      if (onSuccess) {
        // parent will handle navigation/modal closing and checkout resume
        onSuccess(user);
        return;
      }

      if (pending && user.role === 'user') {
        localStorage.removeItem('pendingCheckout');
        localStorage.setItem('openCheckout', '1');
        navigate('/', { replace: true });
      } else {
        navigate(user.role === 'admin' ? '/admin' : '/', { replace: true });
      }
    } catch (err: any) {
      const validationErrors = err?.response?.data?.errors;
      const msg =
        err?.response?.data?.message ??
        (validationErrors
          ? Object.values(validationErrors).flat().join(' ')
          : 'Invalid username or password. Please try again.');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
        <button
          type="button"
          onClick={() => setIsRegister(false)}
          className={`btn-sm ${!isRegister ? 'active' : ''}`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setIsRegister(true)}
          className={`btn-sm ${isRegister ? 'active' : ''}`}
        >
          Create Account
        </button>
      </div>
      {isRegister ? (
        <>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First name</label>
              <input
                type="text"
                className="form-control"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last name</label>
              <input
                type="text"
                className="form-control"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
        </>
      ) : null}
      {/* Username */}
      <div className="form-group">
        <label className="form-label" htmlFor="username">
          Username
        </label>
        <div className="form-control-icon-wrapper auth-control">
          <UserIcon style={{ width: 18, height: 18 }} className="form-control-icon" aria-hidden />
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
          <LockClosedIcon style={{ width: 18, height: 18 }} className="form-control-icon" aria-hidden />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            className="form-control"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
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
            {showPassword ? <EyeSlashIcon style={{ width: 18, height: 18 }} aria-hidden /> : <EyeIcon style={{ width: 18, height: 18 }} aria-hidden />}
          </button>
        </div>
      </div>

      {isRegister && (
        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            className="form-control"
            placeholder="Repeat password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            maxLength={12}
            required={isRegister}
          />
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="auth-error">
          <ExclamationTriangleIcon style={{ width: 18, height: 18 }} aria-hidden />
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
              {isRegister ? 'Creating Account…' : 'Signing In…'}
            </>
          ) : isRegister ? (
            <>Create Account</>
          ) : (
            <>Sign In</>
          )}
      </button>
    </form>
  );
};

export default LoginForm;
