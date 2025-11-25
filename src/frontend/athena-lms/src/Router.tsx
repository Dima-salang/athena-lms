import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import DashboardPage from './pages/DashboardPage';

import App from './App';
import CreateTestPage from './pages/CreateTestPage';
import TestDetailPage from './pages/TestDetailPage';
import AdminPage from './pages/AdminPage';

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
                element: <DashboardPage />,
            },
            {
                path: 'create-test',
                element: <CreateTestPage />,
            },
            {
                path: 'test/:testId',
                element: <TestDetailPage />,
            },
            {
                path: 'admin',
                element: <AdminPage />,
            },
        ],
    },
]);

export default router;
