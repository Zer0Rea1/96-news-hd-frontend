import { Provider } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import store from './store';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import PortalLayout from './layouts/PortalLayout';
import Dashboard from './pages/portal/Dashboard';
import Profile from './pages/portal/Profile';
import NewPost from './pages/portal/NewPost';
import Posts from './pages/portal/Posts';
import EditPost from './pages/portal/EditPost';
import Membership from './pages/portal/Membership';
import Login from './pages/portal/auth/Login';
import SignUp from './pages/portal/auth/SignUp';

export default function ReporterApp({ area = 'portal' }) {
  return <Provider store={store}><AuthProvider><ProfileProvider>
    <Routes>
      {area === 'portal' ? <Route element={<ProtectedRoute><PortalLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/portal/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="new-post" element={<NewPost />} />
        <Route path="posts" element={<Posts />} />
        <Route path="editpost/:slug" element={<EditPost />} />
        <Route path="membership" element={<Membership />} />
      </Route> : <>
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<SignUp />} />
      </>}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <ToastContainer position="top-right" autoClose={5000} />
  </ProfileProvider></AuthProvider></Provider>;
}
