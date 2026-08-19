import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TaskForm from './components/tasks/TaskForm';
import EditTaskForm from './components/tasks/EditTaskForm';
import RegisterPage from './pages/RegisterPage';
import './App.css';

function PrivateRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) return <div>Загрузка...</div>;
    return isAuthenticated ? children : <Navigate to="/login" />;
}

function AppRoutes() {
    const { isAuthenticated } = useAuth();
    
    return (
        <Routes>
            <Route path="/login" element={
                isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />
            } />

            <Route path="/register" element={
                isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />
            } />

            <Route path="/dashboard" element={
                <PrivateRoute>
                    <DashboardPage />
                </PrivateRoute>
            } />
            
            {/* 👇 КОНКРЕТНЫЕ МАРШРУТЫ — ПЕРВЫМИ */}
            <Route path="/tasks/new" element={
                <PrivateRoute>
                    <TaskForm />
                </PrivateRoute>
            } />
            <Route path="/tasks/edit/:id" element={
                <PrivateRoute>
                    <EditTaskForm />
                </PrivateRoute>
            } />
            


            {/* 👇 ОБЩИЙ МАРШРУТ — ПОСЛЕДНИМ */}
            <Route path="/tasks/:taskId" element={
                <PrivateRoute>
                    <DashboardPage />
                </PrivateRoute>
            } />
            
            <Route path="/" element={<Navigate to="/dashboard" />} />

        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;