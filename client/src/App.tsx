import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
import Header from "./components/Header";
import Home from "./pages/Home";
import FindCafe from "./pages/FindCafe";
import HowItWorks from "./pages/HowItWorks";
import FindByGamePage from "./pages/FindGame";
import Footer from "./components/Footer";
import PartnerWithUs from "./pages/PartnerWithUs";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import CafeDetailPage from "./pages/CafeDetailPage";
import { ReservationManagement } from "./pages/ReservationManagement";
import Reservations from "./pages/Reservations";
import Profile from "./pages/Profile";
import BusinessDashboard from "./pages/BusinessDashboard";
import BusinessSettings from "./pages/BusinessSettings";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user } = useAuth();

  // Business users should only see business pages
  const isBusinessUser = user?.role === "business";

  return (
    <div className="min-h-screen bg-white">
      <Routes>
        {/* ── Business dashboard ─────────────── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="business">
              <BusinessDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/reservations"
          element={<ReservationManagement />}
        />
        <Route
          path="/dashboard/settings"
          element={
            <ProtectedRoute requiredRole="business">
              <BusinessSettings />
            </ProtectedRoute>
          }
        />

        {/* ── Public routes — business users get redirected ──────── */}
        <Route
          path="*"
          element={
            isBusinessUser ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <>
                <ScrollToTop />
                <Header />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/find-a-cafe" element={<FindCafe />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/for-cafe-owners" element={<PartnerWithUs />} />
                  <Route path="/find-a-game" element={<FindByGamePage />} />
                  <Route path="/partner" element={<PartnerWithUs />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/cafe/:id" element={<CafeDetailPage />} />
                  <Route
                    path="/reservations"
                    element={
                      <ProtectedRoute>
                        <Reservations />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
                <Footer />
              </>
            )
          }
        />
      </Routes>
    </div>
  );
}
