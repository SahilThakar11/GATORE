import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import FindCafe from "./pages/FindCafe";
import HowItWorks from "./pages/HowItWorks";
import ForCafeOwners from "./pages/ForCafeOwners";
import FindGame from "./pages/FindGame";

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/find-a-cafe" element={<FindCafe />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/for-cafe-owners" element={<ForCafeOwners />} />
        <Route path="/find-a-game" element={<FindGame />} />
      </Routes>
    </div>
  );
}
