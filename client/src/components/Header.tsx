import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, User, CalendarDays, Menu, X, UserPlus, Building2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { NAV_LINKS } from "../utils/const";
import { AuthModal } from "./auth/AuthModal";
import { useAuthModal } from "../hooks/useAuthModal";
import { useAuth } from "../context/AuthContext";
import { PrimaryButton } from "./ui/PrimaryButton";
import { SecondaryButton } from "./ui/SecondaryButton";

export default function Header() {
  const auth = useAuthModal();
  const { user, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <header className="w-full bg-teal-50 border-b border-teal-600 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-7 pb-4 pt-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-5 shrink-0" onClick={closeMobile}>
              <GatoreLogo />
              <span className="text-[18px] sm:text-[24px] font-bold tracking-wide text-teal-800 uppercase">
                Gatore
              </span>
            </Link>

            {/* Nav — desktop */}
            <nav className="hidden md:flex items-center gap-8">
              <FindCafeDropdown />
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

            {/* Right side — desktop auth */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated && user ? (
                <UserDropdown userName={user.name} onLogout={auth.logout} />
              ) : (
                <>
                  <button
                    onClick={() => auth.open("signin")}
                    className="text-[16px] font-normal text-neutral-600 hover:text-teal-600 transition-colors duration-150 cursor-pointer"
                  >
                    Sign in
                  </button>
                  <GetStartedDropdown onPersonal={() => auth.open("signup")} />
                </>
              )}
            </div>

            {/* Hamburger — mobile only */}
            <button
              className="md:hidden p-2 rounded-lg text-neutral-600 hover:text-teal-600 hover:bg-teal-100 transition-colors cursor-pointer"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-teal-200 bg-teal-50 px-4 py-4 flex flex-col gap-1">
            {/* Find a café sub-links */}
            <p className="px-3 pt-1 pb-0.5 text-[13px] font-semibold uppercase tracking-wide text-teal-700">
              Find a café
            </p>
            <NavLink
              to="/find-a-cafe"
              onClick={closeMobile}
              className={({ isActive }) =>
                `block px-5 py-2.5 rounded-lg text-[16px] font-normal transition-colors duration-150 ${
                  isActive
                    ? "text-teal-600 bg-teal-100"
                    : "text-neutral-600 hover:text-teal-600 hover:bg-teal-100"
                }`
              }
            >
              By name
            </NavLink>
            <NavLink
              to="/find-a-game"
              onClick={closeMobile}
              className={({ isActive }) =>
                `block px-5 py-2.5 rounded-lg text-[16px] font-normal transition-colors duration-150 ${
                  isActive
                    ? "text-teal-600 bg-teal-100"
                    : "text-neutral-600 hover:text-teal-600 hover:bg-teal-100"
                }`
              }
            >
              By game
            </NavLink>
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={closeMobile}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-lg text-[16px] font-normal transition-colors duration-150 ${
                    isActive
                      ? "text-teal-600 bg-teal-100"
                      : "text-neutral-600 hover:text-teal-600 hover:bg-teal-100"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <div className="border-t border-teal-200 mt-2 pt-3 flex flex-col gap-2">
              {isAuthenticated && user ? (
                <>
                  <Link
                    to="/reservations"
                    onClick={closeMobile}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[16px] text-neutral-600 hover:text-teal-600 hover:bg-teal-100 transition-colors"
                  >
                    <CalendarDays size={17} />
                    Reservations
                  </Link>
                  <button
                    onClick={() => { closeMobile(); auth.logout(); }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[16px] text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut size={17} />
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { closeMobile(); auth.open("signin"); }}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-[16px] font-normal text-neutral-600 hover:text-teal-600 hover:bg-teal-100 transition-colors cursor-pointer"
                  >
                    Sign in
                  </button>
                  <GetStartedDropdown
                    onPersonal={() => { closeMobile(); auth.open("signup"); }}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <AuthModal isOpen={auth.isOpen} onClose={auth.close} auth={auth} />
    </>
  );
}

// ── Get started dropdown ──────────────────────────────────────────────────────

function GetStartedDropdown({ onPersonal }: { onPersonal: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const navigate = useNavigate();

  const show = () => { clearTimeout(timeout.current); setOpen(true); };
  const hide = () => { timeout.current = setTimeout(() => setOpen(false), 150); };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const focusable = menuRef.current?.querySelectorAll<HTMLElement>("button");
    if (focusable?.length) focusable[0].focus();
    const handleKey = (e: KeyboardEvent) => {
      if (!focusable?.length) return;
      const els = Array.from(focusable);
      const idx = els.indexOf(document.activeElement as HTMLElement);
      if (e.key === "ArrowDown") { e.preventDefault(); els[(idx + 1) % els.length].focus(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); els[(idx - 1 + els.length) % els.length].focus(); }
      else if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const items = [
    {
      icon: <UserPlus size={16} />,
      label: "Personal account",
      sublabel: "Find cafés and book tables",
      onClick: () => { setOpen(false); onPersonal(); },
    },
    {
      icon: <Building2 size={16} />,
      label: "Business account",
      sublabel: "List your café on Gatore",
      onClick: () => { setOpen(false); navigate("/for-cafe-owners"); },
    },
  ];

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }} onMouseEnter={show} onMouseLeave={hide}>
      <SecondaryButton
        label="Get started"
        size="small"
        rightIcon={
          <ChevronDown
            size={14}
            style={{
              transition: "transform 200ms",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        }
        onClick={() => setOpen((v) => !v)}
      />

      {open && (
        <div
          ref={menuRef}
          role="menu"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            backgroundColor: "#FFFFFF",
            borderRadius: 8,
            border: "1px solid #E8D4C4",
            boxShadow: "0 4px 12px 0 rgba(0,0,0,0.10)",
            minWidth: 220,
            padding: "4px 0",
            zIndex: 50,
          }}
        >
          {items.map((item) => (
            <button
              key={item.label}
              role="menuitem"
              onClick={item.onClick}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 16px",
                cursor: "pointer",
                border: "none",
                textAlign: "left",
                transition: "background 150ms",
                color: "#292524",
              }}
              className="bg-transparent hover:bg-[#FEF7F0]"
            >
              <span style={{ color: "#57534E", flexShrink: 0, display: "flex" }}>
                {item.icon}
              </span>
              <span>
                <span style={{ display: "block", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 400 }}>
                  {item.label}
                </span>
                <span style={{ display: "block", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 400, color: "#78716C" }}>
                  {item.sublabel}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FindCafeDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const location = useLocation();

  const isActive =
    location.pathname === "/find-a-cafe" ||
    location.pathname === "/find-a-game";

  const show = () => {
    clearTimeout(timeout.current);
    setOpen(true);
  };
  const hide = () => {
    timeout.current = setTimeout(() => setOpen(false), 150);
  };

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
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 text-[16px] font-normal transition-colors duration-150 cursor-pointer ${
          isActive ? "text-teal-600" : "text-neutral-600 hover:text-teal-600"
        }`}
      >
        Find a café
        <ChevronDown
          size={15}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-50">
          <Link
            to="/find-a-cafe"
            onClick={() => setOpen(false)}
            className={`block px-4 py-2.5 text-sm transition-colors hover:bg-teal-50 hover:text-teal-700 ${
              location.pathname === "/find-a-cafe"
                ? "text-teal-600 font-medium"
                : "text-neutral-700"
            }`}
          >
            By name
          </Link>
          <Link
            to="/find-a-game"
            onClick={() => setOpen(false)}
            className={`block px-4 py-2.5 text-sm transition-colors hover:bg-teal-50 hover:text-teal-700 ${
              location.pathname === "/find-a-game"
                ? "text-teal-600 font-medium"
                : "text-neutral-700"
            }`}
          >
            By game
          </Link>
        </div>
      )}
    </div>
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
  return <img src="/logo.png" alt="Gatore Logo" className="w-16 h-8 sm:w-23.25 sm:h-12" />;
}
