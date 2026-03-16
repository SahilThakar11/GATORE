import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Reservations", icon: UtensilsCrossed, to: "/dashboard/reservations" },
  { label: "Settings", icon: Settings, to: "/dashboard/settings" },
];

export default function BusinessSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  return (
    <aside
      className="relative flex flex-col shrink-0 h-screen sticky top-0 transition-all duration-300 ease-in-out"
      style={{
        width: collapsed ? 72 : 220,
        background: "linear-gradient(180deg, #0a5c47 0%, #0d7065 100%)",
      }}
    >
      {/* ─── Logo / Business Name ───────────────────────────── */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-5">
        <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-6 h-6 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-white text-sm font-bold leading-tight truncate">
              {user?.name || "My Business"}
            </p>
            <p className="text-teal-200/70 text-[11px] leading-tight">
              Business Portal
            </p>
          </div>
        )}
      </div>

      {/* ─── Navigation ─────────────────────────────────────── */}
      <nav className="flex-1 flex flex-col gap-1 px-3 mt-2">
        {NAV_ITEMS.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl transition-all duration-200 group ${
                collapsed ? "justify-center px-0 py-3" : "px-3 py-2.5"
              } ${
                isActive
                  ? "bg-white/15 text-white"
                  : "text-teal-100/80 hover:bg-white/8 hover:text-white"
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

      {/* ─── Collapse Toggle ────────────────────────────────── */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute top-1/2 -translate-y-1/2 -right-3.5 w-7 h-7 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-500 hover:text-teal-700 hover:border-teal-300 transition-colors z-10 cursor-pointer"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* ─── Bottom: Mascot + Logout ────────────────────────── */}
      <div className="mt-auto px-3 pb-5 flex flex-col items-center gap-3">
        {/* Logout */}
        <button
          onClick={logout}
          className={`flex items-center gap-2.5 text-teal-100/70 hover:text-white transition-colors w-full rounded-xl cursor-pointer ${
            collapsed ? "justify-center py-2.5" : "px-3 py-2.5"
          }`}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Log Out</span>}
        </button>
      </div>
    </aside>
  );
}
