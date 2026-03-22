import { Link } from "react-router-dom";

const FOOTER_LINKS = {
  "For Businesses": [
    { label: "Partner with us", to: "/partner" },
    { label: "Pricing", to: "/pricing" },
  ],
  Discover: [
    { label: "Find a cafe", to: "/find-a-cafe" },
    { label: "Find by game", to: "/find-a-game" },
    { label: "How it works", to: "/how-it-works" },
  ],
  Company: [
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#1C1917] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-7 py-14">
        {/* Top — logo + columns */}
        <div className="flex flex-col items-center gap-10">
          {/* Logo + tagline */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Gatore"
                className="w-24 h-12.75 object-contain"
              />
              <div className="flex flex-col items-start gap-1">
                <span className="text-2xl font-bold tracking-widest text-teal-700 uppercase">
                  GATORE
                </span>
                <p className="text-sm text-neutral-400">
                  Find your game and book your table
                </p>
              </div>
            </div>
          </div>

          {/* Link columns — mobile: centered, grouped */}
          <div className="flex justify-center gap-16 sm:hidden">
            <div className="flex flex-col gap-8">
              {(["For Businesses", "Company"] as const).map((section) => (
                <div key={section} className="flex flex-col items-start gap-3">
                  <p className="text-sm font-semibold text-teal-400 tracking-wide">
                    {section}
                  </p>
                  {FOOTER_LINKS[section].map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="text-sm text-neutral-300 hover:text-white transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
            <div className="flex flex-col items-start gap-3">
              <p className="text-sm font-semibold text-teal-400 tracking-wide">
                Discover
              </p>
              {FOOTER_LINKS["Discover"].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm text-neutral-300 hover:text-white transition-colors duration-150"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Link columns — tablet/desktop: flat row, left-aligned */}
          <div className="hidden sm:flex gap-x-20">
            {Object.entries(FOOTER_LINKS).map(([section, links]) => (
              <div key={section} className="flex flex-col items-start gap-3">
                <p className="text-sm font-semibold text-teal-400 tracking-wide">
                  {section}
                </p>
                {links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-sm text-neutral-300 hover:text-white transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <img src="/bgg_logo.png" alt="BGG Powered" />
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-700 mt-12 pt-6">
          <p className="text-center text-xs text-neutral-500">
            © {new Date().getFullYear()} GATORE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
