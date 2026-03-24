import { PageHero } from "../components/PageHero";
import { Link } from "react-router-dom";

const TEAM = [
  {
    name: "Sahil Thakar",
    role: "Team Lead",
    initials: "ST",
    avatarColor: "bg-teal-700",
  },
  {
    name: "Chloe Feierabend",
    role: "UI/UX Designer",
    initials: "CF",
    avatarColor: "bg-warm-700",
  },
  {
    name: "Graham Ellacott",
    role: "Core Developer",
    initials: "GE",
    avatarColor: "bg-stone-600",
  },
  {
    name: "Justin Dookhran",
    role: "Product Strategist",
    initials: "JD",
    avatarColor: "bg-teal-600",
  },
];

const VALUES = [
  {
    title: "Community first",
    desc: "Board game cafés are community anchors. Every feature we build is designed to help them build stronger, lasting relationships with their regulars.",
  },
  {
    title: "Reduce friction",
    desc: "Booking a table and finding a game should be effortless. We obsess over removing every unnecessary step from the customer journey.",
  },
  {
    title: "Built for real cafés",
    desc: "We designed GATORE by talking to actual café owners. Every feature solves a real operational problem — not a hypothetical one.",
  },
  {
    title: "Inclusive by design",
    desc: "From dietary restriction filtering to accessible interfaces, we build for everyone who walks through the door.",
  },
];

export default function About() {
  return (
    <main className="bg-warm-50 min-h-screen">
      <PageHero
        eyebrow="Our story"
        title="Built for the love of"
        highlight="the game"
        subtitle="GATORE started with a simple observation — booking a table at a board game café shouldn't be harder than the games themselves."
      />

      {/* Mission */}
      <section
        aria-labelledby="mission-heading"
        className="max-w-4xl mx-auto px-4 sm:px-7 py-16"
      >
        <div className="bg-white rounded-[8px] border border-warm-300 p-8 sm:p-10 flex flex-col gap-5 shadow-sm">
          <span
            className="text-xs font-semibold tracking-widest uppercase text-teal-700"
            aria-hidden="true"
          >
            Our mission
          </span>
          <h2
            id="mission-heading"
            className="text-2xl font-bold text-gray-900 leading-snug"
          >
            To help Canadian board game cafés build stronger, lasting
            relationships with their communities through better technology.
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Small hospitality businesses deserve the same quality of digital
            tools that large restaurant chains take for granted. GATORE brings
            reservation management, game library cataloging, and customer
            engagement into one accessible platform — purpose-built for the
            unique needs of board game cafés.
          </p>
        </div>
      </section>

      {/* Values */}
      <section
        aria-labelledby="values-heading"
        className="bg-warm-100 border-t border-warm-300 py-16 px-4 sm:px-7"
      >
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <span
              className="text-xs font-semibold tracking-widest uppercase text-teal-700"
              aria-hidden="true"
            >
              Our principles
            </span>
            <h2
              id="values-heading"
              className="text-2xl font-bold text-gray-900 mt-2"
            >
              What we stand for
            </h2>
            <div
              className="w-20 h-1 bg-warm-400 rounded-full mt-3"
              aria-hidden="true"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VALUES.map(({ title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-[8px] border border-warm-300 overflow-hidden"
              >
                <div className="bg-teal-800 px-6 py-4">
                  <h3 className="text-sm font-bold text-white">{title}</h3>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section
        aria-labelledby="team-heading"
        className="max-w-5xl mx-auto px-4 sm:px-7 py-16"
      >
        <div className="mb-6">
          <span
            className="text-xs font-semibold tracking-widest uppercase text-teal-700"
            aria-hidden="true"
          >
            Who we are
          </span>
          <h2
            id="team-heading"
            className="text-2xl font-bold text-gray-900 mt-2"
          >
            The team
          </h2>
          <img
            src="/images/CrimsonUnderlineLogo.svg"
            alt="Team Crimson Underline"
            className="h-14 mt-4 mx-auto"
          />
        </div>

        {/* Org-chart connector — desktop only, decorative */}
        <div className="hidden md:block relative h-10 mb-0" aria-hidden="true">
          <div className="absolute left-1/2 top-0 w-px h-5 bg-warm-500 -translate-x-1/2" />
          <div className="absolute top-5 left-[12.5%] right-[12.5%] h-px bg-warm-500" />
          <div className="absolute left-[12.5%] top-5 w-px h-5 bg-warm-500 -translate-x-1/2" />
          <div className="absolute left-[37.5%] top-5 w-px h-5 bg-warm-500 -translate-x-1/2" />
          <div className="absolute left-[62.5%] top-5 w-px h-5 bg-warm-500 -translate-x-1/2" />
          <div className="absolute left-[87.5%] top-5 w-px h-5 bg-warm-500 -translate-x-1/2" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {TEAM.map(({ name, role, initials, avatarColor }) => (
            <div
              key={name}
              className="bg-white rounded-[8px] border border-warm-300 overflow-hidden"
            >
              <div className="h-2 bg-teal-600 w-full" aria-hidden="true" />
              <div className="p-6 flex flex-col items-center gap-3">
                <div
                  className={`w-14 h-14 rounded-full ${avatarColor} flex items-center justify-center`}
                  aria-hidden="true"
                >
                  <span className="text-lg font-bold text-white tracking-wide">
                    {initials}
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-900">{name}</p>
                  <p className="text-xs text-teal-700 font-medium mt-0.5">
                    {role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        aria-labelledby="cta-heading"
        className="py-14 px-4 sm:px-7 text-center"
        style={{
          background:
            "linear-gradient(135deg, #0f4c3a 0%, #0f766e 50%, #134e4a 100%)",
        }}
      >
        <h2 id="cta-heading" className="text-2xl font-bold text-white mb-2">
          Want to bring your café to GATORE?
        </h2>
        <p className="text-sm text-white mb-6 max-w-md mx-auto">
          Join the platform built specifically for Canadian board game café
          owners.
        </p>
        <Link
          to="/partner"
          className="inline-block bg-white text-teal-700 hover:bg-teal-50 font-semibold rounded-[8px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-teal-800"
          style={{
            fontSize: "16px",
            padding: "12px 24px",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Partner with us
        </Link>
      </section>
    </main>
  );
}
