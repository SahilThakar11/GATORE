import { PageHero } from "../components/PageHero";
import { Link } from "react-router-dom";

const TEAM = [
  {
    name: "Sahil Thakar",
    role: "Team Lead",
    initials: "ST",
  },
  {
    name: "Chloe Feierabend",
    role: "UI/UX Designer",
    initials: "CF",
  },
  {
    name: "Graham Ellacott",
    role: "Core Developer",
    initials: "GE",
  },
  {
    name: "Justin Dookhran",
    role: "Product Strategist",
    initials: "JD",
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
    <div className="bg-[#faf8f4] min-h-screen">
      <PageHero
        eyebrow="Our story"
        title="Built for the love of"
        highlight="the game"
        subtitle="GATORE started with a simple observation — booking a table at a board game café shouldn't be harder than the games themselves."
      />

      {/* Mission */}
      <section className="max-w-4xl mx-auto px-7 py-16">
        <div className="bg-white rounded-2xl border border-gray-100 p-10 flex flex-col gap-5 shadow-sm">
          <span className="text-xs font-semibold tracking-widest uppercase text-teal-600">
            Our mission
          </span>
          <p className="text-2xl font-bold text-gray-900 leading-snug">
            To help Canadian board game cafés build stronger, lasting
            relationships with their communities through better technology.
          </p>
          <p className="text-sm text-gray-500 leading-relaxed">
            Small hospitality businesses deserve the same quality of digital
            tools that large restaurant chains take for granted. GATORE brings
            reservation management, game library cataloging, and customer
            engagement into one accessible platform — purpose-built for the
            unique needs of board game cafés.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white border-t border-b border-gray-100 py-16 px-7">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">
              What we stand for
            </h2>
            <div className="w-10 h-0.5 bg-teal-500 mx-auto mt-3" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VALUES.map(({ title, desc }) => (
              <div
                key={title}
                className="flex gap-4 p-6 rounded-xl border border-warm-300 bg-warm-100 hover:border-teal-200 transition-colors"
              >
                <div className="w-2 shrink-0 rounded-full bg-teal-500 self-stretch" />
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1.5">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-7xl mx-auto px-7 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">The team</h2>
          <div className="w-10 h-0.5 bg-teal-500 mx-auto mt-3" />
          <p className="text-xl font-bold text-neutral-600 mt-3">
            Team Crimson Underline
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {TEAM.map(({ name, role, initials }) => (
            <div
              key={name}
              className="bg-warm-100 rounded-xl border border-warm-300 p-6 flex flex-col items-center gap-3 hover:shadow-md hover:border-teal-200 transition-all"
            >
              <div className="w-14 h-14 rounded-full bg-teal-600 flex items-center justify-center">
                <span className="text-lg font-bold text-white tracking-wide">
                  {initials}
                </span>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-900">{name}</p>
                <p className="text-xs text-teal-600 font-medium mt-0.5">
                  {role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-teal-700 py-14 px-7 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Want to bring your café to GATORE?
        </h2>
        <p className="text-sm text-teal-100 mb-6 max-w-md mx-auto">
          Join the platform built specifically for Canadian board game café
          owners.
        </p>
        <Link
          to="/partner"
          className="inline-block bg-white text-teal-700 hover:bg-teal-50 text-sm font-semibold px-8 py-3 rounded-lg transition-colors duration-150"
        >
          Partner with us
        </Link>
      </section>
    </div>
  );
}
