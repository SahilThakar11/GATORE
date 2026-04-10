import { useState, useEffect } from "react";
import { Pencil, Mail, Phone } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/ui/Input";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { SecondaryButton } from "../components/ui/SecondaryButton";
import { GAME_TYPES, GROUP_SIZES, COMPLEXITIES } from "../utils/const";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  gameTypes: string[];
  groupSize: string;
  complexity: string;
}

const GROUP_LABELS: Record<string, string> = {
  any: "Any",
  duo: "Just the two of us",
  small: "3 – 4 players",
  big: "5 or more players",
};

const COMPLEXITY_LABELS: Record<string, string> = {
  any: "Any",
  light: "Light",
  medium: "Medium",
  heavy: "Heavy",
};

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

const PROFILE_EXTRAS_KEY = "profileExtras";

function loadExtras() {
  try {
    const raw = localStorage.getItem(PROFILE_EXTRAS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default function ProfilePage() {
  const { user, accessToken, updateUser } = useAuth();

  const extras = loadExtras();
  const [profile, setProfile] = useState<ProfileData>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: extras.phone ?? "",
    gameTypes: extras.gameTypes ?? [],
    groupSize: extras.groupSize ?? "any",
    complexity: extras.complexity ?? "any",
  });

  // Keep name/email in sync if auth context updates (e.g. after login)
  useEffect(() => {
    setProfile((prev) => ({
      ...prev,
      name: user?.name ?? prev.name,
      email: user?.email ?? prev.email,
    }));
  }, [user?.name, user?.email]);

  const [editingContact, setEditingContact] = useState(false);
  const [editingPrefs, setEditingPrefs] = useState(false);
  const [draft, setDraft] = useState<ProfileData>(profile);
  const [saving, setSaving] = useState(false);

  const startEditContact = () => {
    setDraft(profile);
    setEditingContact(true);
  };

  const startEditPrefs = () => {
    setDraft(profile);
    setEditingPrefs(true);
  };

  const cancelEdit = () => {
    setEditingContact(false);
    setEditingPrefs(false);
  };

  const saveContact = async () => {
    setSaving(true);
    try {
      await fetch("/api/auth/signup/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ email: profile.email, name: draft.name }),
      });
    } catch {}
    // Persist name to AuthContext + localStorage, phone to profileExtras
    updateUser({ name: draft.name });
    const extras = loadExtras();
    localStorage.setItem(
      PROFILE_EXTRAS_KEY,
      JSON.stringify({ ...extras, phone: draft.phone }),
    );
    setProfile((prev) => ({ ...prev, name: draft.name, phone: draft.phone }));
    setSaving(false);
    setEditingContact(false);
  };

  const savePrefs = async () => {
    setSaving(true);
    try {
      await fetch("/api/auth/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          gameTypes: draft.gameTypes,
          groupSize: draft.groupSize,
          complexity: draft.complexity,
        }),
      });
    } catch {}
    // Persist preferences to localStorage
    const extras = loadExtras();
    localStorage.setItem(
      PROFILE_EXTRAS_KEY,
      JSON.stringify({
        ...extras,
        gameTypes: draft.gameTypes,
        groupSize: draft.groupSize,
        complexity: draft.complexity,
      }),
    );
    setProfile((prev) => ({
      ...prev,
      gameTypes: draft.gameTypes,
      groupSize: draft.groupSize,
      complexity: draft.complexity,
    }));
    setSaving(false);
    setEditingPrefs(false);
  };

  const toggleGame = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      gameTypes: prev.gameTypes.includes(id)
        ? prev.gameTypes.filter((g) => g !== id)
        : [...prev.gameTypes, id],
    }));
  };

  const phoneDigits = draft.phone.replace(/\D/g, "");
  const phoneError =
    draft.phone.length > 0 && phoneDigits.length !== 10
      ? "Please enter a valid 10-digit phone number"
      : undefined;

  return (
    <div className="bg-warm-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-7 py-10">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-neutral-800">My Profile</h1>
          <p className="text-sm text-neutral-600 mt-1">
            Manage your account details and game preferences
          </p>
        </div>

        {/* Contact info card */}
        <div className="bg-white border border-warm-300 rounded-xl p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-neutral-600 tracking-wider uppercase">
              Contact Info
            </p>
            {!editingContact && (
              <button
                onClick={startEditContact}
                className="flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:text-teal-800 transition-colors cursor-pointer"
              >
                <Pencil size={13} aria-hidden="true" /> Edit
              </button>
            )}
          </div>

          {editingContact ? (
            <div className="flex flex-col gap-4">
              <Input
                label="Your name"
                type="text"
                value={draft.name}
                onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                placeholder="What should we call you?"
                autoFocus
                disabled={saving}
              />
              <Input
                label={
                  <span>
                    Phone number{" "}
                    <span className="text-neutral-600 font-normal">(optional)</span>
                  </span>
                }
                type="tel"
                value={draft.phone}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, phone: formatPhone(e.target.value) }))
                }
                placeholder="(416) 555-0100"
                error={phoneError}
                disabled={saving}
              />
              <div className="flex gap-3 mt-1">
                <SecondaryButton label="Cancel" onClick={cancelEdit} disabled={saving} />
                <PrimaryButton
                  label={saving ? "Saving..." : "Save changes"}
                  onClick={saveContact}
                  disabled={!draft.name.trim() || !!phoneError || saving}
                  isLoading={saving}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-400 flex items-center justify-center shrink-0">
                <img
                  src="/icons/pawn.svg"
                  alt=""
                  aria-hidden="true"
                  className="w-6 h-6 object-contain"
                  style={{ filter: "brightness(0)" }}
                />
              </div>
              <div>
                <p className="text-base font-bold text-neutral-800">{profile.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Mail size={13} className="text-neutral-500" aria-hidden="true" />
                  <span className="text-sm text-neutral-600">{profile.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Phone size={13} className="text-neutral-500" aria-hidden="true" />
                    <span className="text-sm text-neutral-600">{profile.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Game preferences card */}
        <div className="bg-white border border-warm-300 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-neutral-600 tracking-wider uppercase">
              Game Preferences
            </p>
            {!editingPrefs && (
              <button
                onClick={startEditPrefs}
                className="flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:text-teal-800 transition-colors cursor-pointer"
              >
                <Pencil size={13} aria-hidden="true" /> Edit
              </button>
            )}
          </div>

          {editingPrefs ? (
            <div className="flex flex-col gap-5">
              {/* Game types */}
              <div>
                <p className="text-xs sm:text-sm font-medium text-neutral-800 mb-2">
                  What types of games do you enjoy?
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {GAME_TYPES.map((g) => {
                    const selected = draft.gameTypes.includes(g.id);
                    return (
                      <button
                        key={g.id}
                        onClick={() => toggleGame(g.id)}
                        aria-pressed={selected}
                        className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border text-sm font-normal transition-all cursor-pointer ${
                          selected
                            ? `${g.color} text-neutral-600 hover:opacity-80`
                            : "border-warm-200 bg-white text-neutral-600"
                        }`}
                      >
                        <img
                          src={g.icon}
                          alt=""
                          aria-hidden="true"
                          className="w-6 h-6 object-contain"
                        />
                        <span className="text-xs sm:text-sm">{g.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Group size */}
              <div>
                <p className="text-xs sm:text-sm font-medium text-neutral-800 mb-2">
                  Typical group size?
                </p>
                <div className="grid grid-cols-2 gap-2 bg-warm-200 p-2.5 rounded-xl">
                  {GROUP_SIZES.map((g) => {
                    const selected = draft.groupSize === g.id;
                    return (
                      <button
                        key={g.id}
                        onClick={() => setDraft((p) => ({ ...p, groupSize: g.id }))}
                        aria-pressed={selected}
                        className={`text-left px-6 py-4 rounded-xl border transition-all ${
                          selected
                            ? "bg-teal-700 border-teal-700 text-white"
                            : "bg-white border-warm-300 text-neutral-800 hover:border-neutral-300"
                        }`}
                      >
                        <p className="text-xs sm:text-sm font-semibold">{g.label}</p>
                        <p
                          className={`text-xs mt-0.5 ${
                            selected ? "text-teal-50" : "text-neutral-500"
                          }`}
                        >
                          {g.sublabel}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Complexity */}
              <div>
                <p className="text-xs sm:text-sm font-medium text-neutral-800 mb-2">
                  Preferred complexity?
                </p>
                <div className="flex gap-4 bg-warm-200 p-4 rounded-xl">
                  {COMPLEXITIES.map((c) => {
                    const selected = draft.complexity === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setDraft((p) => ({ ...p, complexity: c.id }))}
                        aria-pressed={selected}
                        className={`flex items-center gap-1.5 px-6 py-4 rounded-lg border text-sm font-medium transition-all w-36.25 ${
                          selected
                            ? "bg-teal-700 border-teal-700 text-white"
                            : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        {c.dots > 0 && (
                          <span className="flex gap-0.5">
                            {[...Array(3)].map((_, i) => (
                              <span
                                key={i}
                                className="w-1.5 h-1.5 rounded-full"
                                style={{
                                  backgroundColor:
                                    i < c.dots
                                      ? selected
                                        ? "#ffffff"
                                        : "#6B4D33"
                                      : selected
                                        ? "#54d8be"
                                        : "#E8D4C4",
                                }}
                              />
                            ))}
                          </span>
                        )}
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3">
                <SecondaryButton label="Cancel" onClick={cancelEdit} disabled={saving} />
                <PrimaryButton
                  label={saving ? "Saving..." : "Save preferences"}
                  onClick={savePrefs}
                  disabled={saving}
                  isLoading={saving}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Game types read-only */}
              {profile.gameTypes.length > 0 ? (
                <div>
                  <p className="text-xs text-neutral-600 mb-2">Types of games</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.gameTypes.map((g) => {
                      const type = GAME_TYPES.find((t) => t.id === g);
                      if (!type) return null;
                      return (
                        <span
                          key={g}
                          className="inline-flex items-center gap-1.5 bg-white border border-warm-300 text-neutral-700 text-sm font-medium px-2.5 py-1 rounded-full"
                        >
                          <img
                            src={type.icon}
                            alt=""
                            aria-hidden="true"
                            className="w-4 h-4 object-contain"
                          />
                          {type.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-neutral-500 italic">
                  No game types selected yet
                </p>
              )}

              <div className="grid grid-cols-2 gap-4 border-t border-warm-300 pt-4">
                <div>
                  <p className="text-xs text-neutral-600">Group size</p>
                  <p className="text-sm font-semibold text-neutral-800 mt-0.5">
                    {GROUP_LABELS[profile.groupSize] || "Any"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-600">Complexity</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {(() => {
                      const c = COMPLEXITIES.find((c) => c.id === profile.complexity);
                      return c && c.dots > 0 ? (
                        <span className="flex gap-0.5">
                          {[...Array(3)].map((_, i) => (
                            <span
                              key={i}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{
                                backgroundColor:
                                  i < c.dots ? "#6B4D33" : "#E8D4C4",
                              }}
                            />
                          ))}
                        </span>
                      ) : null;
                    })()}
                    <p className="text-sm font-semibold text-neutral-800">
                      {COMPLEXITY_LABELS[profile.complexity] || "Any"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
