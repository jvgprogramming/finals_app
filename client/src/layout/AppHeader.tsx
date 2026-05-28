import type { FC } from 'react';

const AppHeader: FC = () => {
  return (
    <header className="glass-header">
      <div className="header-left">
        <div>
          <p className="header-page-title">Management Portal</p>
          <p className="header-page-subtitle">User & Administration Hub</p>
        </div>
      </div>

      <div className="header-right">
        <div className="header-avatar" title="Frontend preview">
          FH
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
