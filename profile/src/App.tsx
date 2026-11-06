import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
const Profile = lazy(() => import("./components/Profile"));
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
        <Route path="/p/:id" element={<Profile />} />
        <Route path="*" element={<p className="loading full-loading">Open the profile link printed on your reporter card.</p>} />
      </Routes>
    </Suspense>
  );
}
