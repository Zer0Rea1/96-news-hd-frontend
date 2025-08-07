import {React, useEffect} from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch } from 'react-redux'
import { authActions } from './store/auth'
import api from "./api/apis";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import NewsPages from "./pages/NewsPages";
import NewPost from "./pages/portal/NewPost";
import PortalLayout from "./layouts/PortalLayout";
import SignUp from "./pages/portal/auth/SignUp";
import Login from "./pages/portal/auth/Login";
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { ProtectedRoute,CheckAdmin } from './components/ProtectedRoute';
import Profile from "./pages/portal/Profile";
import Membership from "./pages/portal/Membership";
import PaymentVerify from "./pages/portal/admin/PaymentVerify";
import Dashboard from "./pages/portal/Dashboard";
import Posts from "./pages/portal/Posts";
import PostPage from "./pages/PostPage";
import NewsPage from "./pages/NewsPages";
import { ToastContainer } from 'react-toastify';
import EditPost from "./pages/portal/EditPost";
import Users from "./pages/portal/admin/Users";
function App() {
  const dispatch = useDispatch();
  
  // useEffect(() => {
  //   const checkAuth = async () => {
  //     try {
  //       const response = await api.get("/api/auth/check-cookie", {
  //         withCredentials: true
  //       });
    
  //       if(response.status === 201){
  //         dispatch(authActions.login());
  //       }
  //     } catch (error) {
  //       console.log("Error checking authentication:", error);
  //     }
  //   };
    
  //   checkAuth();
  // }, [dispatch]);
  
  return (
    <BrowserRouter>

      <AuthProvider>
        <ProfileProvider>
          <Routes>
            {/* Main Pages */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />}/>
              <Route path="/news/:slug" element={<PostPage />} />
              <Route path="/page/:slug" element={<NewsPage />} />

            </Route> 
             
            {/* Portal pages */}
            <Route path="/portal/" element={
              <ProtectedRoute>
                <PortalLayout />
              </ProtectedRoute>
            }>
             
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="new-post" element={<NewPost />} />
              <Route path="posts" element={<Posts />} />
              <Route path="/portal/editpost/:slug" element={<EditPost />} />


              <Route path="membership" element={<Membership />} />
            </Route>

            {/* admin pages */}

            <Route path="/admin/*" element={
              <CheckAdmin>

                <PortalLayout />
              </CheckAdmin>
              
            }>
              <Route path="paymentverify" element={<PaymentVerify />} />
              <Route path="users" element={<Users />} />
              
            </Route>
            
            {/* Auth pages */}
            <Route path="/auth">
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<SignUp />} />
            </Route>
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer position="top-right" autoClose={5000} />
        </ProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;