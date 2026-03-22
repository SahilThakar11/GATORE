import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  LogOut,
  User,
  CalendarDays,
  Menu,
  X,
  UserPlus,
  Building2,
  Search,
  Dices,
} from "lucide-react";
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
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const closeMobile = () => setMobileOpen(false);

  // Focus trap + Escape + initial focus for mobile menu
  useEffect(() => {
    if (!mobileOpen) return;

    const menu = mobileMenuRef.current;
    if (!menu) return;

    // Focus the first focusable element
    const focusable = menu.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length) focusable[0].focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [mobileOpen]);

  return (
    <>
      <header className="w-full bg-teal-50 border-b border-teal-600 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-7 pt-2 pb-2 sm:pb-3 sm:pt-4 lg:pb-4 lg:pt-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className="logo-link flex items-center gap-5 shrink-0"
              onClick={closeMobile}
            >
              <GatoreLogo />
              <span className="text-[18px] sm:text-[24px] font-bold tracking-wide text-teal-800 uppercase">
                Gatore
              </span>
            </Link>

            {/* Nav — desktop */}
            <nav className="hidden lg:flex items-center gap-8">
              <FindCafeDropdown />
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `text-[16px] font-normal transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded ${
                      isActive
                        ? "text-teal-700"
                        : "text-neutral-600 hover:text-teal-700"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Right side — desktop auth */}
            <div className="hidden lg:flex items-center gap-4">
              {isAuthenticated && user ? (
                <UserDropdown userName={user.name} onLogout={auth.logout} />
              ) : (
                <>
                  <button
                    onClick={() => auth.open("signin")}
                    className="text-[16px] font-normal text-neutral-600 hover:text-teal-700 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded"
                  >
                    Sign in
                  </button>
                  <GetStartedDropdown onPersonal={() => auth.open("signup")} />
                </>
              )}
            </div>

            {/* Hamburger — mobile + tablet */}
            <button
              className="lg:hidden p-2 rounded-lg text-neutral-600 hover:text-teal-700 hover:bg-teal-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {mobileOpen ? (
                <X size={22} aria-hidden="true" />
              ) : (
                <Menu size={22} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile + tablet menu */}
        {mobileOpen && (
          <div
            ref={mobileMenuRef}
            id="mobile-menu"
            role="navigation"
            aria-label="Main navigation"
            className="lg:hidden border-t border-teal-200 bg-teal-50 px-4 py-4 flex flex-col gap-1"
          >
            {/* Find a café sub-links */}
            <p className="px-3 pt-1 pb-0.5 text-[13px] font-semibold uppercase tracking-wide text-teal-700">
              Find a café
            </p>
            <NavLink
              to="/find-a-cafe"
              onClick={closeMobile}
              className={({ isActive }) =>
                `block px-5 py-2.5 rounded-lg text-[16px] font-normal transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                  isActive
                    ? "text-teal-700 bg-teal-100"
                    : "text-neutral-600 hover:text-teal-700 hover:bg-teal-100"
                }`
              }
            >
              By name
            </NavLink>
            <NavLink
              to="/find-a-game"
              onClick={closeMobile}
              className={({ isActive }) =>
                `block px-5 py-2.5 rounded-lg text-[16px] font-normal transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                  isActive
                    ? "text-teal-700 bg-teal-100"
                    : "text-neutral-600 hover:text-teal-700 hover:bg-teal-100"
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
                  `block px-3 py-2.5 rounded-lg text-[16px] font-normal transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                    isActive
                      ? "text-teal-700 bg-teal-100"
                      : "text-neutral-600 hover:text-teal-700 hover:bg-teal-100"
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
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[16px] text-neutral-600 hover:text-teal-700 hover:bg-teal-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                  >
                    <CalendarDays size={17} aria-hidden="true" />
                    Reservations
                  </Link>
                  <button
                    onClick={() => {
                      closeMobile();
                      auth.logout();
                    }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[16px] text-red-600 hover:bg-red-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    <LogOut size={17} aria-hidden="true" />
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      closeMobile();
                      auth.open("signin");
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-[16px] font-normal text-neutral-600 hover:text-teal-700 hover:bg-teal-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                  >
                    Sign in
                  </button>
                  <GetStartedDropdown
                    align="left"
                    onPersonal={() => {
                      closeMobile();
                      auth.open("signup");
                    }}
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

function GetStartedDropdown({
  onPersonal,
  align = "right",
}: {
  onPersonal: () => void;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const navigate = useNavigate();

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

  useEffect(() => {
    if (!open) return;
    const focusable = menuRef.current?.querySelectorAll<HTMLElement>("button");
    if (focusable?.length) focusable[0].focus();
    const handleKey = (e: KeyboardEvent) => {
      if (!focusable?.length) return;
      const els = Array.from(focusable);
      const idx = els.indexOf(document.activeElement as HTMLElement);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        els[(idx + 1) % els.length].focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        els[(idx - 1 + els.length) % els.length].focus();
      } else if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const items = [
    {
      icon: <UserPlus size={16} aria-hidden="true" />,
      label: "Personal account",
      sublabel: "Find cafés and book tables",
      onClick: () => {
        setOpen(false);
        onPersonal();
      },
    },
    {
      icon: <Building2 size={16} aria-hidden="true" />,
      label: "Business account",
      sublabel: "List your café on Gatore",
      onClick: () => {
        setOpen(false);
        navigate("/for-cafe-owners");
      },
    },
  ];

  return (
    <div
      ref={ref}
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <SecondaryButton
        label="Get started"
        size="small"
        rightIcon={
          <ChevronDown
            size={14}
            aria-hidden="true"
            style={{
              transition: "transform 200ms",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        }
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      />

      {open && (
        <div
          ref={menuRef}
          role="menu"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            ...(align === "left" ? { left: 0 } : { right: 0 }),
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
              className="bg-transparent hover:bg-[#FEF7F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              <span
                style={{ color: "#57534E", flexShrink: 0, display: "flex" }}
              >
                {item.icon}
              </span>
              <span>
                <span
                  style={{
                    display: "block",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14,
                    fontWeight: 400,
                  }}
                >
                  {item.label}
                </span>
                <span
                  style={{
                    display: "block",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12,
                    fontWeight: 400,
                    color: "#78716C",
                  }}
                >
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
  const menuRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (!open) return;
    const focusable = menuRef.current?.querySelectorAll<HTMLElement>("a");
    if (focusable?.length) focusable[0].focus();
    const handleKey = (e: KeyboardEvent) => {
      if (!focusable?.length) return;
      const els = Array.from(focusable);
      const idx = els.indexOf(document.activeElement as HTMLElement);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        els[(idx + 1) % els.length].focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        els[(idx - 1 + els.length) % els.length].focus();
      } else if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <div ref={ref} className="relative" onMouseEnter={show} onMouseLeave={hide}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`flex items-center gap-1 text-[16px] font-normal transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded ${
          isActive ? "text-teal-700" : "text-neutral-600 hover:text-teal-700"
        }`}
      >
        Find a café
        <ChevronDown
          size={15}
          aria-hidden="true"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute left-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-1 z-50"
          style={{ border: "1px solid #E8D4C4" }}
        >
          <Link
            to="/find-a-cafe"
            role="menuitem"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-teal-50 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
              location.pathname === "/find-a-cafe"
                ? "text-teal-700 font-medium"
                : "text-neutral-700"
            }`}
          >
            <span
              style={{ color: "#57534E", flexShrink: 0, display: "flex" }}
              aria-hidden="true"
            >
              <Search size={16} />
            </span>
            By name
          </Link>
          <Link
            to="/find-a-game"
            role="menuitem"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-teal-50 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
              location.pathname === "/find-a-game"
                ? "text-teal-700 font-medium"
                : "text-neutral-700"
            }`}
          >
            <span
              style={{ color: "#57534E", flexShrink: 0, display: "flex" }}
              aria-hidden="true"
            >
              <Dices size={16} />
            </span>
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
  const menuRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (!open) return;
    const focusable = menuRef.current?.querySelectorAll<HTMLElement>(
      "a, button",
    );
    if (focusable?.length) focusable[0].focus();
    const handleKey = (e: KeyboardEvent) => {
      if (!focusable?.length) return;
      const els = Array.from(focusable);
      const idx = els.indexOf(document.activeElement as HTMLElement);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        els[(idx + 1) % els.length].focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        els[(idx - 1 + els.length) % els.length].focus();
      } else if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <div ref={ref} className="relative" onMouseEnter={show} onMouseLeave={hide}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded"
      >
        <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center shrink-0">
          <User size={16} className="text-white" aria-hidden="true" />
        </div>
        <span className="text-[15px] font-medium text-neutral-700 max-w-35 truncate">
          {userName}
        </span>
        <ChevronDown
          size={15}
          aria-hidden="true"
          className={`text-neutral-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-50"
        >
          <Link
            to="/reservations"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 hover:bg-teal-50 hover:text-teal-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            <CalendarDays size={15} aria-hidden="true" />
            Reservations
          </Link>
          <div className="border-t border-gray-100 my-1" />
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <LogOut size={15} aria-hidden="true" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

function GatoreLogo() {
  return (
    <svg
      viewBox="0 0 364.41 187.02"
      className="w-16 h-8 sm:w-[93px] sm:h-12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Gator body */}
      <path
        fill="#096654"
        d="M314.88,167.06c2.67,6.97,10.66.22,16.53.39,13.02.37,5.74,17.39-6.1,19-75.24.02-150.92.3-225.87.05-25.01-.08-51.26,1.17-76.08.08-5.94-.26-13.6-1.03-19.23-2.27-1.27-1.31-4.73-24.85-4.04-27.08,1.38-4.51,19.55-7.88,20.69-11.37,1.54-4.71-5.71-17.99-1.97-22.92,2.31-3.04,22.28-4.49,27.08-5.42-.34-9.67-1.98-19.34-.55-29.05l49.62-5.38c1.75-1.2,2.49-13.68,3.22-16.78,4.97-20.95,20.16-27.57,39.12-16.85,2.4-2.27,2.78-5.46,4.77-8.26,8.88-12.53,26.98-6.7,31.92,6.28,15.48-7.15,31.92-14.04,46.94-22.43,18.11-10.11,50.4-36.97,70.99-19.03,6.32,5.5,13.89,22.38,8.47,29.49-3.99,5.23-5.21-2.39-11.5,2.51-6.76,5.26-4.41,12.68-8.02,15.99-4.53,4.16-13.5-5.84-20.31-2.35-7.29,3.74-1.36,18.69-8.38,20.7-5.43,1.55-14.81-7.61-21.29-4.34-5.3,2.68-.27,20.31-6.95,22.09-6.15,1.64-22.09-15.3-23.97-3.02-.5,3.24.94,16.03-2.7,17.32-6.95,2.45-18.1-10.98-23.41-7.43-2.52,1.68-2.35,14.39-3.18,17.82-2.77,11.41-17.37-6.69-23.14-6.03-1.81.2-9.53,6.09-12.43,7.46l-11.2,4.28c17.06,1.28,21.42,19.79,31.58,28.93,9.93,8.94,16.77-8.71,25.91-8.96,7.84-.21,8.94,16.21,15.06,17.07,7.6,1.07,12.13-14.15,17.95-14.13,8.41.02,7.59,23.31,18.06,17.15,2.89-1.7,10.31-14.08,13.94-14.08,6.52,0,6.27,18.1,12.22,18.85,8.02,1.01,13.78-15.01,21.57-12.66,5.18,1.57,3.47,21.29,15.45,16.09,3.33-1.45,9.87-10.88,14.26-9.24,0,0,3.37,3.33,4.98,7.52ZM262.22,21.58c0-3.84-3.11-6.95-6.95-6.95s-6.95,3.11-6.95,6.95,3.11,6.95,6.95,6.95,6.95-3.11,6.95-6.95ZM139.91,82.53c1.96-.57,2.56-4,2.63-5.65.63-14.94-21.64-25.92-30.47-11.68-8.96,14.45,6.71,30.31,21.82,25.32l-8.34-3.14c-18.56-16.09,14.77-28.04,14.36-4.85Z"
      />
      <path
        fill="#f2f6f5"
        d="M139.91,82.53c.41-23.2-32.92-11.24-14.36,4.85l8.34,3.14c-15.11,4.99-30.78-10.87-21.82-25.32,8.83-14.24,31.1-3.26,30.47,11.68-.07,1.65-.67,5.08-2.63,5.65Z"
      />
      <circle fill="#f2f6f5" cx="255.27" cy="21.58" r="6.95" />
      {/* Die */}
      <g className="die-group">
        <path fill="#096654" d="M271.9,143.8l-16.48-53.33c-.5-3.1.23-4.63,2.11-6.95,3.65-4.5,10.64-10.57,15.09-14.69,6.07-5.62,12.4-11.39,18.73-16.68,7.06-5.91,13.28-2.14,21.38-.88,10.48,1.63,25.46,2.37,35.15,5.49,2.6.84,2.84,2.8,3.72,5.13,2.18,5.81,4.16,13.08,5.81,19.13,2.22,8.14,5.63,19.65,6.86,27.74.13.87.22,1.84.08,2.7-.31,1.9-9.38,12.91-11.26,15.29-5.88,7.47-14.47,19.34-21.09,25.58-.54.51-2.2,1.86-2.84,1.99-2.03.39-6.17-.19-8.39-.45-16.21-1.88-32.9-6.69-48.85-10.09ZM339.41,56.17l-40.63-5.04c1.25,1.59,3.7,8.31,5.43,8.65l35.19-3.61ZM295.76,51.48c-.9,0-4.99,3.46-6.03,4.29-8.78,7.05-18.08,15.82-26.17,23.72-.97.95-5.17,4.79-5.02,5.84.11.78.55.44,1.01.22.64-.31,1.41-.79,2.08-1.15,13.13-7.13,25.57-15.73,38.76-22.8.91-.98-.28-3.35-.74-4.5-.52-1.31-2.43-5.61-3.89-5.62ZM352.29,102.43c-.1-3.68.14-7.4.02-11.08-.23-7.21-.78-15.76-1.63-22.91-.43-3.63-.28-8.9-4.41-10.08-4.65-1.33-21.44.75-27.17,1.43-4.78.56-9.61,1.34-14.29,2.42,9.49,8.8,19.27,17.43,29.18,25.74,5.95,4.99,11.91,10.12,18.29,14.49ZM300.79,63.81l-24.26,13.36c-2.34,1.63-18.14,10.4-18.29,12.19,9.19,11.74,18.68,23.32,29.08,34l13.47-59.54ZM345.7,100.17c-9.3-8.89-20.58-18.19-30.64-26.3-2.49-2.01-7.91-6.88-10.42-8.09-.49-.23-.82-.51-1.43-.37-5.35,19.49-10.36,39.18-13.68,59.14l60.35-19.72c-1.01-1.86-2.66-3.22-4.17-4.67ZM353.89,73.06c-1.48-.34-.4,1.65-.38,2.6.19,9.1.18,18.2.47,27.3.46,1.52,7.18,5.91,7.96,5.11-1.56-11.92-4.75-23.5-8.05-35ZM278.41,135.98c1.58-1.61,6.91-7.18,7.33-9,.07-.28.16-.51-.03-.78-7.17-9.03-13.98-18.46-21.55-27.17-1.37-1.58-3.06-3.76-4.62-5.04-.45-.37-.65-.98-1.41-.8l14.89,47.47c2.19-1.08,3.74-3.01,5.38-4.68ZM351.48,106.46c-17.14,5.36-34.54,10.31-51.48,16.31-2.6.92-11.67,2.9-8.03,6.39s10.96,7.89,15.29,10.86c2.03,1.39,18.69,12.95,19.63,12.28,5.82-8.85,11.37-17.95,16.35-27.32,1.17-2.2,9.24-17.46,8.24-18.51ZM330.16,151.52c.76.17.95-.43,1.41-.8,6.64-5.47,15.4-19.44,21.14-26.74,1.98-2.53,8.81-9.48,9.48-11.87.29-1.04-2.32-2.45-3.19-2.9-.93-.48-4.24-1.98-5.04-1.48l-23.79,43.79ZM321.71,152.72c-7.63-5.98-15.55-11.81-23.61-17.22-1.76-1.18-8.99-6.45-10.57-5.91-2.83.97-9.49,10.01-12.49,12.08-.18.92.4.5.95.65,15.07,4.08,30.34,7.71,45.72,10.41Z" />
        {/* Pip face — teal-50 */}
        <path fill="#f0fdfa" d="M345.7,100.17c1.51,1.44,3.16,2.81,4.17,4.67l-60.35,19.72c3.32-19.96,8.33-39.65,13.68-59.14.61-.14.95.14,1.43.37,2.51,1.2,7.93,6.08,10.42,8.09,10.06,8.11,21.34,17.41,30.64,26.3Z" />
        {/* Pip shapes + overlays */}
        <path fill="#ffffff" d="M320.01,86.03c-8.63,1.25-4.89,18.29,2.41,19.53,12.25,2.08,7.69-20.99-2.41-19.53ZM308.04,108.07c1.38-4.63,6.82-12.87.68-16.18-5.16-2.78-10.89,1.51-9.53,7.32,3.69.15,2.3-2.2,3.44-4,1.5-2.37,6.06-1.53,6.16,1.77.08,2.71-6.16,14.92-5.58,15.5l12.48-4.25c-.46-4.3-5.07-.68-7.65-.17Z" />
        <path fill="#096654" d="M320.01,86.03c10.1-1.46,14.66,21.61,2.41,19.53-7.3-1.24-11.03-18.28-2.41-19.53ZM319.99,88.83c-4.08,1.21-1.28,13.33,3.16,13.99,7.47,1.1,2.72-15.74-3.16-13.99Z" />
        <path fill="#096654" d="M308.04,108.07c2.58-.51,7.19-4.13,7.65.17l-12.48,4.25c-.58-.58,5.66-12.79,5.58-15.5-.1-3.3-4.66-4.14-6.16-1.77-1.14,1.8.25,4.15-3.44,4-1.36-5.82,4.37-10.1,9.53-7.32,6.14,3.3.7,11.54-.68,16.18Z" />
        <path fill="#ffffff" d="M319.99,88.83c5.88-1.75,10.63,15.09,3.16,13.99-4.44-.66-7.24-12.77-3.16-13.99Z" />
        <path fill="#ffffff" d="M351.48,106.46c1.01,1.05-7.07,16.32-8.24,18.51-4.97,9.37-10.53,18.47-16.35,27.32-.95.67-17.6-10.88-19.63-12.28-4.33-2.97-11.74-7.45-15.29-10.86s5.43-5.47,8.03-6.39c16.94-6,34.34-10.94,51.48-16.31Z" />
        <path fill="#ffffff" d="M300.79,63.81l-13.47,59.54c-10.39-10.68-19.89-22.26-29.08-34,.15-1.78,15.95-10.55,18.29-12.19l24.26-13.36Z" />
        <path fill="#ffffff" d="M352.29,102.43c-6.38-4.38-12.35-9.51-18.29-14.49-9.91-8.31-19.69-16.94-29.18-25.74,4.68-1.07,9.5-1.85,14.29-2.42,5.73-.67,22.52-2.75,27.17-1.43,4.12,1.18,3.98,6.45,4.41,10.08.85,7.15,1.4,15.71,1.63,22.91.12,3.68-.12,7.4-.02,11.08Z" />
        <path fill="#ffffff" d="M278.41,135.98c-1.63,1.67-3.18,3.6-5.38,4.68l-14.89-47.47c.76-.18.95.43,1.41.8,1.55,1.28,3.25,3.47,4.62,5.04,7.57,8.71,14.37,18.14,21.55,27.17.19.27.1.5.03.78-.43,1.82-5.75,7.39-7.33,9Z" />
        <path fill="#ffffff" d="M321.71,152.72c-15.38-2.7-30.65-6.32-45.72-10.41-.54-.15-1.13.28-.95-.65,3.01-2.07,9.66-11.1,12.49-12.08,1.58-.54,8.8,4.73,10.57,5.91,8.06,5.41,15.98,11.25,23.61,17.22Z" />
        <path fill="#ffffff" d="M295.76,51.48c1.46,0,3.37,4.3,3.89,5.62.46,1.15,1.65,3.52.74,4.5-13.19,7.06-25.63,15.67-38.76,22.8-.66.36-1.44.84-2.08,1.15-.46.22-.9.56-1.01-.22-.15-1.05,4.05-4.89,5.02-5.84,8.09-7.89,17.39-16.66,26.17-23.72,1.03-.83,5.13-4.3,6.03-4.29Z" />
        <path fill="#ffffff" d="M330.16,151.52l23.79-43.79c.8-.5,4.11,1,5.04,1.48.88.45,3.49,1.86,3.19,2.9-.68,2.39-7.5,9.35-9.48,11.87-5.74,7.3-14.5,21.27-21.14,26.74-.45.37-.65.98-1.41.8Z" />
        <path fill="#ffffff" d="M339.41,56.17l-35.19,3.61c-1.74-.34-4.18-7.06-5.43-8.65l40.63,5.04Z" />
        <path fill="#ffffff" d="M353.89,73.06c3.3,11.5,6.49,23.08,8.05,35-.79.8-7.5-3.59-7.96-5.11-.29-9.1-.28-18.2-.47-27.3-.02-.95-1.11-2.93.38-2.6Z" />
      </g>
    </svg>
  );
}
