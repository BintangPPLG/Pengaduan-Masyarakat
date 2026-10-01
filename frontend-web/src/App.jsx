import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddReport from './pages/AddReport';
import ReportDetail from './pages/ReportDetail';
import AdminModeration from './pages/AdminModeration';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminHome from './pages/SuperAdminHome';
import SuperAdminUsers from './pages/SuperAdminUsers';
import SuperAdminCategories from './pages/SuperAdminCategories';
import Notifications from './pages/Notifications';

function App() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={token ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/laporan/baru" element={<RoleRoute allow={['user']}><AddReport /></RoleRoute>} />
        <Route path="/laporan/:id" element={<ReportDetail />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/admin/moderasi" element={<RoleRoute allow={['admin', 'super_admin']}><AdminModeration /></RoleRoute>} />
        <Route path="/admin/dashboard" element={<RoleRoute allow={['admin', 'super_admin']}><AdminDashboard /></RoleRoute>} />
        <Route path="/superadmin" element={<RoleRoute allow={['super_admin']}><SuperAdminHome /></RoleRoute>} />
        <Route path="/superadmin/users" element={<RoleRoute allow={['super_admin']}><SuperAdminUsers /></RoleRoute>} />
        <Route path="/superadmin/categories" element={<RoleRoute allow={['super_admin']}><SuperAdminCategories /></RoleRoute>} />
      </Route>
      <Route path="*" element={<Navigate to={token ? '/dashboard' : '/'} replace />} />
    </Routes>
  );
}

export default App;
