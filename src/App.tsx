import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import DashboardShell from './components/layout/DashboardShell';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import HabitsPage from './pages/HabitsPage';
import FocusPage from './pages/FocusPage';
import GoalsPage from './pages/GoalsPage';
import CalendarPage from './pages/CalendarPage';
import JournalPage from './pages/JournalPage';
import AnalyticsPage from './pages/AnalyticsPage';

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/80">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <AuthGuard>
              <Routes>
                <Route element={<DashboardShell />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="tasks" element={<TasksPage />} />
                  <Route path="habits" element={<HabitsPage />} />
                  <Route path="focus" element={<FocusPage />} />
                  <Route path="goals" element={<GoalsPage />} />
                  <Route path="calendar" element={<CalendarPage />} />
                  <Route path="journal" element={<JournalPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                </Route>
              </Routes>
            </AuthGuard>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
