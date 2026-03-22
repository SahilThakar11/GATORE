import  { useState } from "react";
import FloorPlan from "../components/business/FloorPlan";

const MockReservations = [
  {
    id: 1,
    customerName: "John Doe",
    date: "Feb 18, 2026",
    time: "7:00 PM",
    table: "Table 5",
    status: "Checked In",
    partySize: 4,
    reservationType: "Online",
    bookingTime: "Feb 16, 2026 at 3:45 PM",
    depositPaid: true,
    email: "john.doe@example.com",
    phone: "555‑123‑4567",
    notes:
      "Birthday celebration – please prepare table with decorations if available",
  },
  {
    id: 2,
    customerName: "Jane Smith",
    date: "Feb 19, 2026",
    time: "6:30 PM",
    table: "Table 12",
    status: "Confirmed",
    partySize: 2,
    reservationType: "Walk-In",
    bookingTime: "Feb 17, 2026 at 1:20 PM",
    depositPaid: false,
    email: "jane.smith@example.com",
    phone: "555‑987‑6543",
    notes: "-",
  },
  {
    id: 3,
    customerName: "Emily Johnson",
    date: "Feb 20, 2026",
    time: "8:00 PM",
    table: "Table 3",
    status: "Cancelled",
    partySize: 6,
    reservationType: "Online",
    bookingTime: "Feb 18, 2026 at 10:15 AM",
    depositPaid: true,
    email: "emily.johnson@example.com",
    phone: "555‑555‑5555",
    notes: "Anniversary celebration – please prepare a special dessert table",
  },
];

const ReservationManagement = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-bold text-3xl">Reservation Management</h1>
        <div className="space-x-2">
          <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg shadow">
            Walk‑In
          </button>
          <button className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow border border-warm-200">
            New Reservation
          </button>
        </div>
      </div>

      <TimelineView />
      <FloorPlanView />

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Upcoming Reservations</h2>
        <div className="space-y-4">
          {MockReservations.map((reservation) => (
            <ReservationCard key={reservation.id} reservation={reservation} />
          ))}
        </div>
      </div>
    </div>
  );
};

const TimelineView = () => {
  // Timeline configuration
  const startHour = 17; // 5:00 PM
  const endHour = 22; // 10:00 PM
  const hourSlots = Array.from(
    { length: endHour - startHour },
    (_, i) => startHour + i,
  );

  // Sample reservations data
  const timelineReservations = [
    {
      id: 1,
      table: "Table 3",
      customerName: "Marcus Johnson",
      partySize: 8,
      startTime: 19.5, // 7:30 PM
      duration: 1.5, // 1.5 hours
      status: "Confirmed",
      badge: "VIP",
    },
    {
      id: 2,
      table: "Table 5",
      customerName: "David Kim",
      partySize: 2,
      startTime: 21,
      duration: 1,
      status: "Checked In",
      badge: null,
    },
    {
      id: 3,
      table: "Table 7",
      customerName: "Jessica Park",
      partySize: 5,
      startTime: 21,
      duration: 1,
      status: "Checked In",
      badge: "WALK-IN",
    },
    {
      id: 4,
      table: "Table 8",
      customerName: "Sarah Chen",
      partySize: 6,
      startTime: 18,
      duration: 1.5,
      status: "Confirmed",
      badge: null,
    },
    {
      id: 5,
      table: "Table 12",
      customerName: "Tyler",
      partySize: 4,
      startTime: 17.5,
      duration: 1.5,
      status: "Checked In",
      badge: null,
    },
    {
      id: 6,
      table: "Table 15",
      customerName: "Emma Rodriguez",
      partySize: 3,
      startTime: 20,
      duration: 1.5,
      status: "Confirmed",
      badge: "WALK-IN",
    },
  ];

  // Get unique tables and sort them
  const tables = Array.from(
    new Set(timelineReservations.map((r) => r.table)),
  ).sort();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-blue-500";
      case "Checked In":
        return "bg-teal-500";
      case "Completed":
        return "bg-purple-500";
      case "Cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getBadgeColor = (badge: string) => {
    if (badge === "VIP") return "bg-yellow-300 text-yellow-900";
    if (badge === "WALK-IN") return "bg-orange-300 text-orange-900";
    return "";
  };

  return (
    <div className="bg-white border border-warm-200 rounded-xl shadow p-6 mb-6 overflow-x-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Timeline View</h3>
          <p className="text-sm text-gray-500">
            Visualize reservation timing and table overlaps
          </p>
        </div>
        <div className="flex space-x-6">
          <LegendItem color="bg-blue-500" label="Confirmed" />
          <LegendItem color="bg-teal-500" label="Checked In" />
          <LegendItem color="bg-purple-500" label="Completed" />
          <LegendItem color="bg-red-500" label="Cancelled" />
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="min-w-max">
        {/* Time Header */}
        <div className="flex">
          <div className="w-24 flex-shrink-0" />
          <div className="flex">
            {hourSlots.map((hour) => (
              <div
                key={hour}
                className="w-32 border-l border-gray-300 px-2 py-2 text-center text-sm font-medium text-gray-700"
              >
                {`${hour % 12 || 12}:00 ${hour >= 12 ? "PM" : "AM"}`}
              </div>
            ))}
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-gray-300">
          {tables.map((table) => {
            const tableReservations = timelineReservations.filter(
              (r) => r.table === table,
            );

            return (
              <div
                key={table}
                className="flex bg-gray-50 hover:bg-gray-100 transition"
              >
                {/* Table Label */}
                <div className="w-24 flex-shrink-0 py-4 px-4 font-medium text-gray-700 text-sm bg-white border-r border-gray-300">
                  {table}
                </div>

                {/* Time Slots */}
                <div className="flex relative">
                  {hourSlots.map((hour, idx) => (
                    <div
                      key={hour}
                      className="w-32 border-l border-gray-300 h-12"
                    />
                  ))}

                  {/* Reservation Blocks */}
                  {tableReservations.map((res) => {
                    const startOffsetPx = (res.startTime - startHour) * 128; // 128px per hour
                    const widthPx = res.duration * 128; // width in pixels

                    return (
                      <div
                        key={res.id}
                        className="absolute top-1 bottom-1 rounded-lg cursor-pointer hover:shadow-lg hover:scale-105 transition-all"
                        style={{
                          left: `${startOffsetPx}px`,
                          width: `${widthPx}px`,
                        }}
                      >
                        <div
                          className={`${getStatusColor(res.status)} text-white rounded-lg px-3 py-1 h-full flex flex-col justify-between`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <p className="font-semibold text-xs">
                                {res.customerName}
                              </p>
                              {res.badge && (
                                <span
                                  className={`${getBadgeColor(res.badge)} text-xs px-1.5 py-0.5 rounded font-semibold whitespace-nowrap`}
                                >
                                  {res.badge}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-3">
                              <p className="text-xs text-gray-100 mt-0.5">
                                🧑‍🤝‍🧑 {res.partySize}
                              </p>
                              <p className="text-xs text-gray-100">
                                🕐 {Math.floor(res.startTime)}:
                                {String((res.startTime % 1) * 60).padStart(
                                  2,
                                  "0",
                                )}{" "}
                                PM
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center space-x-1">
    <span className={`${color} w-3 h-3 rounded-full`} />
    <span className="text-sm text-gray-600">{label}</span>
  </div>
);

const FloorPlanView = () => {
  return (
    <div className="bg-white border border-warm-200 rounded-xl shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Floor Plan View
          </h3>
          <p className="text-sm text-gray-500">
            Manage table layout and real-time status
          </p>
        </div>
        <div className="flex space-x-6">
          <LegendItem color="bg-blue-400" label="Confirmed" />
          <LegendItem color="bg-green-400" label="Checked‑In" />
          <LegendItem color="bg-purple-400" label="Completed" />
          <LegendItem color="bg-red-400" label="Cancelled" />
        </div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <p className="text-sm text-gray-500">Time Filter:</p>
          <select className="border border-warm-200 rounded px-4 py-2 text-sm">
            <option>All Times</option>
            <option>Lunch</option>
            <option>Dinner</option>
          </select>
        </div>
        <div className="space-x-2">
          <button className="text-sm text-teal-600 hover:text-gray-800 px-4 py-2 border rounded border-teal-600">
            Edit Layout
          </button>
          <button className="text-sm text-teal-600 hover:text-gray-800 px-4 py-2 border rounded border-teal-600">
            Export
          </button>
          <button className="text-sm text-teal-600 hover:text-gray-800 px-4 py-2 border rounded border-teal-600">
            Import
          </button>
        </div>
      </div>
      {/* placeholder for floor plan graphic */}
      <FloorPlan />
    </div>
  );
};

const ReservationCard = ({ reservation }: { reservation: any }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleCollapse = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="bg-teal-100 border border-teal-600 rounded-2xl shadow p-6">
      {/* header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <span className="w-3 h-3 bg-green-500 rounded-full mt-1" />
          <div>
            <p className="text-base font-semibold">{reservation.time}</p>
            <p className="text-sm text-gray-600">{reservation.table}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-bold">
              {reservation.customerName.charAt(0)}
            </div>
            <div>
              <p className="font-semibold">{reservation.customerName}</p>
              <p className="text-sm text-gray-600">Catan</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {/* status icons */}
            <button className="text-gray-600 hover:text-gray-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 10-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button className="text-gray-600 hover:text-gray-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6l-4 4V5z" />
              </svg>
            </button>
            <button className="text-gray-600 hover:text-gray-800 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
                <path
                  fillRule="evenodd"
                  d="M5 14a5 5 0 0110 0v1H5v-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs ml-1">{reservation.partySize}</span>
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button className="bg-white border border-gray-300 text-gray-700 text-sm px-3 py-1 rounded-full">
              {reservation.status}
            </button>
            <button className="bg-teal-600 hover:bg-emerald-600 text-white text-sm px-3 py-1 rounded">
              Complete
            </button>
            <button
              className="text-gray-600 hover:text-gray-800"
              onClick={toggleCollapse}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6l-4 4V5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div
        className={`transition-max-height duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-screen" : "max-h-0"}`}
      >
        <hr className="border-gray-400 my-4"></hr>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-2">
              Reservation Details
            </p>
            <div className="space-y-1 text-sm text-gray-700">
              <p>
                <span className="inline-block w-4">📅</span> {reservation.date}
              </p>
              <p>
                <span className="inline-block w-4">⏰</span> {reservation.time}{" "}
                (2 hours)
              </p>
              <p>
                <span className="inline-block w-4">🎲</span> Wingspan
              </p>
            </div>
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Customer History
              </p>
              <p className="text-sm text-gray-700">⏱️ 7 previous visits</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-2">
              Contact Information
            </p>
            <div className="space-y-1 text-sm text-gray-700">
              <p>✉️ {reservation.email}</p>
              <p>📞 {reservation.phone}</p>
            </div>
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Booking Info
              </p>
              <p className="text-sm text-gray-700">ID: {reservation.id}</p>
              <p className="text-sm text-gray-700">
                Type:{" "}
                <span className="text-blue-500">
                  {reservation.reservationType}
                </span>
              </p>
              <p className="text-sm text-gray-700">
                Booked: {reservation.bookingTime}
              </p>
              <p className="text-sm text-green-600">✅ Deposit Paid</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded border border-gray-200 p-4 mt-6">
          <p className="text-sm font-semibold text-gray-600 mb-2">Notes</p>
          <div className="flex justify-between items-start">
            <p className="text-sm text-gray-700">{reservation.notes}</p>
            <div className="flex space-x-2">
              <button className="text-gray-600 hover:text-gray-800">✏️</button>
              <button className="text-red-600 hover:text-red-800">❌</button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <div className="space-x-2">
            <button className="border border-teal-600 text-teal-600 text-sm px-4 py-2 rounded hover:bg-teal-100 bg-white">
              Modify
            </button>
            <button className="border border-teal-600 text-teal-600 text-sm px-4 py-2 rounded hover:bg-teal-100 bg-white">
              Send Reminder
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button className="border border-red-500 text-red-500 text-sm px-4 py-2 rounded hover:bg-red-50 bg-white">
              Cancel
            </button>
            <button className="text-gray-500 hover:text-gray-800">⋮</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ReservationManagement, ReservationCard };
