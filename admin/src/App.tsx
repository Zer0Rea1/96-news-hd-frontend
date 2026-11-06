import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
const Admin = lazy(() => import("./Admin"));
export default function App() {
  return (
    <Suspense
      fallback={
        <div className="loading full-loading" role="status">
          Opening the pressroom…
        </div>
      }
    >
      <Routes>
        <Route path="/admin/*" element={<Admin />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Suspense>
  );
}
