import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';

// Cada pantalla viaja en su propio archivo: la primera carga en móvil es mínima.
// El <Suspense> que las envuelve vive en AppLayout.
const HomePage = lazy(() => import('./pages/HomePage'));
const ReportFormPage = lazy(() => import('./pages/ReportFormPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const ReportDetailPage = lazy(() => import('./pages/ReportDetailPage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const MyReportsPage = lazy(() => import('./pages/MyReportsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/reportar" element={<Navigate to="/" replace />} />
        <Route path="/reportar/:variant" element={<ReportFormPage />} />
        <Route path="/reportes" element={<ReportsPage />} />
        <Route path="/reportes/:id" element={<ReportDetailPage />} />
        <Route path="/reportes/:id/editar" element={<ReportFormPage />} />
        <Route path="/muro" element={<CommunityPage />} />
        <Route path="/cuenta" element={<AccountPage />} />
        <Route path="/mis-publicaciones" element={<MyReportsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
