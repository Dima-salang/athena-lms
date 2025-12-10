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
import TeacherAssignmentManagementPage from './pages/TeacherAssignmentManagementPage';
import UserManagementPage from './pages/UserManagementPage';
import ProtectedRoute from './components/ProtectedRoute';
import TakeTestPage from './pages/TakeTestPage';



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
                    <ProtectedRoute allowedRoles={['ROLE_TEACHER']}>
                        <DashboardPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'student-dashboard',
                element: (
                    <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
                        <StudentDashboardPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'student/test/:testId',
                element: (
                    <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
                        <TakeTestPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'create-test',
                element: (
                    <ProtectedRoute allowedRoles={['ROLE_TEACHER']}>
                        <CreateTestPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'test/:testId',
                element: (
                    <ProtectedRoute allowedRoles={['ROLE_TEACHER']}>
                        <TestDetailPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'test/:testId/edit',
                element: (
                    <ProtectedRoute allowedRoles={['ROLE_TEACHER']}>
                        <TestEditorPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'admin',
                element: (
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                        <AdminPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'admin/sections',
                element: (
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                        <SectionManagementPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'admin/subjects',
                element: (
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                        <SubjectManagementPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'admin/teacher-assignments',
                element: (
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                        <TeacherAssignmentManagementPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'admin/users',
                element: (
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                        <UserManagementPage />
                    </ProtectedRoute>
                ),
            },
        ],
    },
]);

export default router;
