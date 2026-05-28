import type { FC } from 'react';
import AuthPageLayout from './AuthPageLayout';
import LoginForm from './components/LoginForm';

const LoginPage: FC = () => {
  return (
    <AuthPageLayout>
      <div className="w-full max-w-md rounded-[1.75rem] border border-gray-100 bg-white p-8 shadow-[0_20px_60px_rgba(68,47,32,0.12)]">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-700">
            Welcome back
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-gray-900">
            Sign in to the portal
          </h2>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Use your admin account to manage users and keep the system in sync.
          </p>
        </div>
        <LoginForm />
      </div>
    </AuthPageLayout>
  );
};

export default LoginPage;
