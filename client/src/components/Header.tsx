import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { NAV_LINKS } from "../utils/const";
import { AuthModal } from "./auth/AuthModal";
import { useAuthModal } from "../hooks/useAuthModal";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const navigate = useNavigate();
  const auth = useAuthModal();
  const { user, isAuthenticated } = useAuth();

  return (
    <>
      <header className="w-full bg-teal-50 border-b border-teal-600 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-7 pb-4 pt-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-5 shrink-0">
              <GatoreLogo />
              <span className="text-[24px] font-bold tracking-wide text-teal-800 uppercase">
                Gatore
              </span>
            </Link>

            {/* Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `text-[16px] font-normal transition-colors duration-150 ${
                      isActive
                        ? "text-teal-600"
                        : "text-neutral-600 hover:text-teal-600"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Right side — auth aware */}
            <div className="flex items-center gap-4">
              {isAuthenticated && user ? (
                // ─── Authenticated ───────────────────────────────────────
                <>
                  {/* User avatar + name */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center shrink-0">
                      <User size={16} className="text-white" />
                    </div>
                    <span className="text-[15px] font-medium text-neutral-700 max-w-[140px] truncate">
                      {user.name}
                    </span>
                  </div>

                  {/* Logout button */}
                  <button
                    onClick={auth.logout}
                    title="Log out"
                    className="flex items-center gap-1.5 text-[15px] font-normal text-red-300 hover:text-red-500 transition-colors duration-150 cursor-pointer"
                  >
                    <LogOut size={17} />
                  </button>
                </>
              ) : (
                // ─── Unauthenticated ─────────────────────────────────────
                <>
                  <button
                    onClick={() => auth.open("signin")}
                    className="text-[16px] font-normal text-neutral-600 hover:text-teal-600 transition-colors duration-150 cursor-pointer"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => auth.open("signup")}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-[16px] font-normal px-2.5 py-2 rounded-lg transition-colors duration-150 cursor-pointer"
                  >
                    Get started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal isOpen={auth.isOpen} onClose={auth.close} auth={auth} />
    </>
  );
}

function GatoreLogo() {
  return <img src="/logo.png" alt="Gatore Logo" className="w-23.25 h-12" />;
}
