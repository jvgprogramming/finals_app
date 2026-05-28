import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';
import UserMainPage from '../pages/User/UserMainPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/users" replace />}
      />
      <Route
        path="/users"
        element={
          <AppLayout>
            <UserMainPage />
          </AppLayout>
        }
      />
      <Route path="*" element={<Navigate to="/users" replace />} />
    </Routes>
  );
};

export default AppRoutes;
