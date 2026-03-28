import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useBusinessDashboard } from "../../hooks/useBusinessDashboard";

function ReservationsIcon({
  size = 20,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 640 512"
      className={className}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M360 72a40 40 0 1 0-80 0a40 40 0 1 0 80 0M144 208a40 40 0 1 0 0-80a40 40 0 1 0 0 80M32 416c-17.7 0-32 14.3-32 32s14.3 32 32 32h576c17.7 0 32-14.3 32-32s-14.3-32-32-32zm464-208a40 40 0 1 0 0-80a40 40 0 1 0 0 80M200 313.5l26.9 49.9c6.3 11.7 20.8 16 32.5 9.8s16-20.8 9.8-32.5l-36.3-67.5c1.7-1.7 3.2-3.6 4.3-5.8l26.8-49.9V272c0 17.7 14.3 32 32 32h48c17.7 0 32-14.3 32-32v-54.5l26.9 49.9c1.2 2.2 2.6 4.1 4.3 5.8l-36.3 67.5c-6.3 11.7-1.9 26.2 9.8 32.5s26.2 1.9 32.5-9.8l26.8-49.9V352c0 17.7 14.3 32 32 32h48c17.7 0 32-14.3 32-32v-38.5l26.9 49.9c6.3 11.7 20.8 16 32.5 9.8s16-20.8 9.8-32.5l-37.9-70.3c-15.3-28.5-45.1-46.3-77.5-46.3h-19.5c-16.3 0-31.9 4.5-45.4 12.6l-33.6-62.3c-15.3-28.5-45.1-46.3-77.5-46.3h-19.5c-32.4 0-62.1 17.8-77.5 46.3l-33.6 62.3c-13.5-8.1-29.1-12.6-45.4-12.6h-19.5c-32.4 0-62.1 17.8-77.5 46.3l-37.9 70.2c-6.3 11.7-1.9 26.2 9.8 32.5s26.2 1.9 32.5-9.8L88 313.5V352c0 17.7 14.3 32 32 32h48c17.7 0 32-14.3 32-32z"
        strokeWidth="13"
        stroke="currentColor"
      />
    </svg>
  );
}

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  {
    label: "Reservations",
    icon: ReservationsIcon,
    to: "/dashboard/reservations",
  },
  { label: "Settings", icon: Settings, to: "/dashboard/settings" },
];

export default function BusinessSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const { profile } = useBusinessDashboard();

  const businessName = profile?.name || "My Business";
  const logoUrl = profile?.logoUrl;

  return (
    <aside className="flex shrink-0 h-screen sticky top-0">
      {/* ─── Main sidebar ───────────────────────────────────── */}
      <div
        className="flex flex-col h-full transition-all duration-300 ease-in-out overflow-hidden"
        style={{
          width: collapsed ? 72 : 200,
          background: "#115E59",
        }}
      >
        {/* ─── Logo / Business Name ─────────────────────────── */}
        <div className="flex items-center gap-3 px-4 pt-6 pb-5">
          <div className="w-12 h-12 rounded-xl shrink-0 overflow-hidden border border-teal-700/50 shadow-inner">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={businessName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-teal-900 flex items-center justify-center">
                <Building2 size={20} className="text-white" />
              </div>
            )}
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-white text-base font-bold leading-tight truncate">
                {businessName}
              </p>
              <p className="text-white/80 text-xs leading-tight">
                Business Portal
              </p>
            </div>
          )}
        </div>

        {/* ─── Navigation ───────────────────────────────────── */}
        <nav className="flex-1 flex flex-col gap-1 px-3 mt-2">
          {NAV_ITEMS.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg transition-all duration-200 group ${
                  collapsed ? "justify-center px-0 py-3" : "px-3 py-2.5"
                } ${
                  isActive
                    ? "bg-teal-700 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon size={20} className="shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium">{label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ─── Bottom: Logout ───────────────────────────────── */}
        <div className="mt-auto px-3 pb-5">
          <button
            onClick={logout}
            className={`flex items-center gap-3 text-white/70 hover:text-white transition-colors w-full rounded-lg cursor-pointer ${
              collapsed ? "justify-center px-0 py-3" : "px-3 py-2.5"
            }`}
          >
            <LogOut size={20} className="shrink-0" aria-hidden="true" />
            {!collapsed && <span className="text-sm font-medium">Log Out</span>}
          </button>
        </div>
      </div>

      {/* ─── Collapse toggle bar ────────────────────────────── */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="flex items-center justify-center w-4 h-full bg-teal-900 text-white hover:bg-teal-700 transition-colors cursor-pointer"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
