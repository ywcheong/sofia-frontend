import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header, Sidebar } from '@/components/layout';
import { usePhase } from '@/hooks/usePhase';
import { UsersPage } from '@/pages/UsersPage';
import { RegistrationsPage } from '@/pages/RegistrationsPage';
import { GlossaryPage } from '@/pages/GlossaryPage';
import { GlossaryAutoMapPage } from '@/pages/GlossaryAutoMapPage';
import { LoginPage } from '@/pages/LoginPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { TasksPage } from '@/pages/TasksPage';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      onError: (error) => {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      },
    },
  },
});

function AppLayout() {
  const { user, logout } = useAuth();
  const { currentPhase } = usePhase();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLogout={handleLogout}
      />
      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header
          currentPhase={currentPhase ?? 'DEACTIVATION'}
          user={user ? {
            studentNumber: user.userStudentNumber,
            studentName: user.userStudentName,
            role: 'ADMIN',
          } : undefined}
          onLogout={handleLogout}
        />
        <main className="content-area">
          <Routes>
            <Route path="/" element={<TasksPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/registrations" element={<RegistrationsPage />} />
            <Route path="/glossary" element={<GlossaryPage />} />
            <Route path="/translator" element={<GlossaryAutoMapPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={true}
          closeOnClick={true}
          pauseOnHover={true}
          pauseOnFocusLoss={false}
          theme="light"
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
