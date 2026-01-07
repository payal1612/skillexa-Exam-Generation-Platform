import { useState } from 'react';
import MainDashboard from './components/MainDashboard';
import UserDashboard from './components/UserDashboard';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  const [currentPage, setCurrentPage] = useState('main-dashboard');

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        {currentPage === 'main-dashboard' && <MainDashboard />}
        {currentPage === 'user-dashboard' && <UserDashboard />}
        {currentPage === 'login' && <LoginPage onSuccess={() => setCurrentPage('main-dashboard')} />}
        {currentPage === 'register' && <RegisterPage onSuccess={() => setCurrentPage('main-dashboard')} />}
      </div>
    </AuthProvider>
  );
}
