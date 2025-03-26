import {React, useEffect} from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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

function App() {
  const dispatch = useDispatch();
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get("/api/auth/check-cookie", {
          withCredentials: true
        });
    
        if(response.status === 201){
          dispatch(authActions.login());
        }
      } catch (error) {
        console.log("Error checking authentication:", error);
      }
    };
    
    checkAuth();
  }, [dispatch]);
  
  return (
    <Router>
      <Routes>
        {/* Main Pages */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />}/>
          <Route path="/news/:slug" element={<NewsPages />} />
          <Route path="/newpost" element={<NewPost />} />
        </Route>
        {/* portal pages */}
        <Route path="/portal" element={<PortalLayout/>}>
          
        </Route>
        {/* auth pages */}
        <Route path="/auth" >
          <Route path="signup" element={<SignUp />} />
          <Route path="login" element={<Login />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;