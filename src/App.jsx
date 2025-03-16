import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import NewsPages from "./pages/NewsPages";
import NewPost from "./pages/portal/NewPost";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />}/>
          <Route path="/news/:slug" element={<NewsPages />} />
          <Route path="/newpost" element={<NewPost />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
