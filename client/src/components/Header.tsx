import { Link, NavLink } from "react-router-dom";
import { ChevronDown, LogOut, User, CalendarDays } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { NAV_LINKS } from "../utils/const";
import { AuthModal } from "./auth/AuthModal";
import { useAuthModal } from "../hooks/useAuthModal";
import { useAuth } from "../context/AuthContext";

export default function Header() {
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
                <UserDropdown userName={user.name} onLogout={auth.logout} />
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

function UserDropdown({
  userName,
  onLogout,
}: {
  userName: string;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = () => {
    clearTimeout(timeout.current);
    setOpen(true);
  };
  const hide = () => {
    timeout.current = setTimeout(() => setOpen(false), 150);
  };

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative" onMouseEnter={show} onMouseLeave={hide}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 cursor-pointer group"
      >
        <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center shrink-0">
          <User size={16} className="text-white" />
        </div>
        <span className="text-[15px] font-medium text-neutral-700 max-w-35 truncate">
          {userName}
        </span>
        <ChevronDown
          size={15}
          className={`text-neutral-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-50">
          <Link
            to="/reservations"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
          >
            <CalendarDays size={15} />
            Reservations
          </Link>
          <div className="border-t border-gray-100 my-1" />
          <button
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut size={15} />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

function GatoreLogo() {
  return <img src="/logo.png" alt="Gatore Logo" className="w-23.25 h-12" />;
}
