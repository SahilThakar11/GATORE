import { Routes, Route } from "react-router-dom";
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

export default function App() {
  return (
    <div className="min-h-screen bg-white">
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
      </Routes>
      <Footer />
    </div>
  );
}
