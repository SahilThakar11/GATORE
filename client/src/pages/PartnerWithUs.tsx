import { Link } from "react-router-dom";
import { PageHero } from "../components/PageHero";
import {
  CalendarCheck,
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart2,
  Bell,
  ChevronRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: CalendarCheck,
    title: "Reservation Management",
    desc: "Let customers book tables online 24/7. View the day's reservations at a glance and prepare games before guests arrive.",
  },
  {
    icon: BookOpen,
    title: "Game Library Catalog",
    desc: "Digitize your entire collection. Track availability, condition, and popularity. Flag games for repair or retirement with one click.",
  },
  {
    icon: LayoutDashboard,
    title: "Staff Dashboard",
    desc: "Manage table status, game checkouts and returns, and scheduling conflicts — all from one unified dashboard.",
  },
  {
    icon: Users,
    title: "Customer Profiles",
    desc: "Build lasting relationships. View visit history, game preferences, and dietary restrictions to personalize every visit.",
  },
  {
    icon: BarChart2,
    title: "Analytics & Insights",
    desc: "See which games are most popular, track play frequency, and make smarter purchasing decisions backed by real data.",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    desc: "Automated reminders sent to customers before their reservation. Staff alerts for upcoming bookings and potential conflicts.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Apply online",
    desc: "Fill out a short form about your café — location, size, and current setup.",
  },
  {
    number: "02",
    title: "Onboarding call",
    desc: "A member of our team walks you through setup and imports your game catalog.",
  },
  {
    number: "03",
    title: "Go live",
    desc: "Your café appears on GATORE. Customers can find you and start booking immediately.",
  },
];

export default function PartnerWithUs() {
  return (
    <div className="bg-[#faf8f4] min-h-screen">
      <PageHero
        eyebrow="For café owners"
        title="Grow your café with"
        highlight="GATORE"
        subtitle="Everything you need to manage reservations, track your game library, and build a loyal community — purpose-built for board game cafés."
      />

      {/* Features grid */}
      <section className="max-w-7xl mx-auto px-7 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">
            Everything your café needs
          </h2>
          <div className="w-10 h-0.5 bg-teal-500 mx-auto mt-3" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md hover:border-teal-200 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center mb-4">
                <Icon size={20} className="text-teal-600" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1.5">
                {title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works for owners */}
      <section className="bg-white border-t border-b border-gray-100 py-16 px-7">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">How it works</h2>
            <div className="w-10 h-0.5 bg-teal-500 mx-auto mt-3" />
          </div>
          <div className="flex flex-col md:flex-row gap-8">
            {STEPS.map(({ number, title, desc }) => (
              <div
                key={number}
                className="flex-1 flex flex-col items-center text-center gap-3"
              >
                <span className="text-4xl font-black text-teal-100 leading-none">
                  {number}
                </span>
                <h3 className="text-base font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-7 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Ready to bring your café online?
        </h2>
        <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
          Join the growing network of Canadian board game cafés using GATORE to
          delight their customers.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/pricing"
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-8 py-3 rounded-lg transition-colors duration-150 flex items-center gap-2"
          >
            View pricing <ChevronRight size={16} />
          </Link>
          <Link
            to="/contact"
            className="border border-gray-300 text-gray-700 hover:border-teal-400 hover:text-teal-700 text-sm font-semibold px-8 py-3 rounded-lg transition-colors duration-150"
          >
            Get in touch
          </Link>
        </div>
      </section>
    </div>
  );
}
