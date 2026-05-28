import type { FC, ReactNode } from 'react';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="app-shell">
      <AppSidebar />
      <div className="app-main-area">
        <AppHeader />
        <main className="app-page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
