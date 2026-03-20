import { useAuth } from "../context/AuthContext";

export default function BusinessDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4]">
      {/* ── Top bar ────────────────────────────────────────────── */}
      <div
        className="py-12 px-6 text-center"
        style={{
          background:
            "linear-gradient(135deg, #0f4c3a 0%, #0f766e 50%, #134e4a 100%)",
        }}
      >
        <h1 className="text-3xl font-black text-white">Business Dashboard</h1>
        <p className="text-teal-200 text-sm mt-2">
          Welcome back, {user?.name || "Partner"}
        </p>
      </div>

      {/* ── Content placeholder ─────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-5">
            <span className="text-2xl">🚧</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            To be Implemented
          </h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            Your business dashboard is being built. You'll be able to manage
            reservations, update your game library, view analytics, and more —
            all from right here.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <div className="bg-[#faf8f4] border border-gray-100 rounded-xl px-5 py-3 text-left">
              <p className="text-xs text-gray-400">Signed in as</p>
              <p className="text-sm font-bold text-gray-800 mt-0.5">
                {user?.email}
              </p>
              <p className="text-xs text-teal-700 font-semibold mt-0.5 uppercase tracking-wide">
                {user?.role}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-6 text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
