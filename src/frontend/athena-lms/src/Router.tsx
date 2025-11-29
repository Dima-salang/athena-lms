import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import DashboardPage from './pages/DashboardPage';
import StudentDashboardPage from './pages/StudentDashboardPage';

import App from './App';
import CreateTestPage from './pages/CreateTestPage';
import TestDetailPage from './pages/TestDetailPage';
import TestEditorPage from './pages/TestEditorPage';
import AdminPage from './pages/AdminPage';
import SectionManagementPage from './pages/SectionManagementPage';
import SubjectManagementPage from './pages/SubjectManagementPage';
import ProtectedRoute from './components/ProtectedRoute';



const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                index: true,
                element: <Navigate to="/login" replace />,
            },
            {
                path: 'login',
                element: <LoginPage />,
            },
            {
                path: 'register',
                element: <RegistrationPage />,
            },
            {
                path: 'dashboard',
                element: (
                    <ProtectedRoute allowedRoles={['TEACHER']}>
                        <DashboardPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'student-dashboard',
                element: (
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                        <StudentDashboardPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'create-test',
                element: (
                    <ProtectedRoute allowedRoles={['TEACHER']}>
                        <CreateTestPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'test/:testId',
                element: (
                    <ProtectedRoute allowedRoles={['TEACHER']}>
                        <TestDetailPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'test/:testId/edit',
                element: (
                    <ProtectedRoute allowedRoles={['TEACHER']}>
                        <TestEditorPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'admin',
                element: (
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'admin/sections',
                element: (
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                        <SectionManagementPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'admin/subjects',
                element: (
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                        <SubjectManagementPage />
                    </ProtectedRoute>
                ),
            },
        ],
    },
]);

export default router;
