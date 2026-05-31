import type { FC } from 'react';
import AuthPageLayout from './AuthPageLayout';
import LoginForm from './components/LoginForm';

const LoginPage: FC = () => {
  return (
    <AuthPageLayout>
      <section className="auth-card">
        <div className="auth-card-header">
          <p className="auth-card-kicker">Welcome back</p>
          <h2 className="auth-card-title">Sign in to the portal</h2>
          <p className="auth-card-subtitle">
            Sign in with your account and the app will take you to the matching
            user or admin portal.
          </p>
          <div className="auth-card-pills">
            <span>Single sign-in</span>
            <span>Role-aware routing</span>
            <span>Secure session restore</span>
          </div>
        </div>
        <LoginForm />
      </section>
    </AuthPageLayout>
  );
};

export default LoginPage;
