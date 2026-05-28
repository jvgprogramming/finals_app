import type { FC, ReactNode } from 'react';

interface AuthPageLayoutProps {
  children: ReactNode;
}

const AuthPageLayout: FC<AuthPageLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,248,234,1),_rgba(250,244,236,1)_40%,_rgba(243,235,224,1))] px-4 py-8 text-gray-900">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-2xl ring-1 ring-black/5">
        <div className="hidden flex-1 flex-col justify-between bg-[linear-gradient(160deg,_#5c3b2e,_#8a5a44_55%,_#c78b63)] p-10 text-white lg:flex">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-white/75">
              Nicais Pastry
            </p>
            <h1 className="mt-4 max-w-lg text-5xl font-semibold leading-tight">
              A warmer way to manage your bakery operations.
            </h1>
            <p className="mt-6 max-w-md text-sm leading-6 text-white/80">
              Sign in to keep track of staff, user records, and day-to-day
              administration in one streamlined portal.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm text-white/85">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              Inventory
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              Users
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              Orders
            </div>
          </div>
        </div>
        <div className="flex w-full max-w-xl items-center justify-center p-6 sm:p-10">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthPageLayout;
