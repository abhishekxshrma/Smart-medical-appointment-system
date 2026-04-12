import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const portals = [
  {
    title: "Patient",
    subtitle: "Book an appointment & track your queue",
    path: "/patient/register",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    color: "teal",
    badge: "Book Now",
  },
  {
    title: "Doctor",
    subtitle: "Manage patient queue & update consultation status",
    path: "/doctor",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    color: "blue",
    badge: "Staff",
  },
  {
    title: "Compounder",
    subtitle: "Verify patients & manage arrival check-in",
    path: "/compounder",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    color: "violet",
    badge: "Staff",
  },
];

const colorMap = {
  teal: {
    card: "hover:border-teal-400 hover:shadow-teal-100",
    icon: "bg-teal-50 text-teal-600 border-teal-100",
    badge: "bg-teal-100 text-teal-700",
    btn: "bg-teal-600 hover:bg-teal-700",
    arrow: "text-teal-500 group-hover:text-teal-600",
  },
  blue: {
    card: "hover:border-blue-400 hover:shadow-blue-100",
    icon: "bg-blue-50 text-blue-600 border-blue-100",
    badge: "bg-blue-100 text-blue-700",
    btn: "bg-blue-600 hover:bg-blue-700",
    arrow: "text-blue-500 group-hover:text-blue-600",
  },
  violet: {
    card: "hover:border-violet-400 hover:shadow-violet-100",
    icon: "bg-violet-50 text-violet-600 border-violet-100",
    badge: "bg-violet-100 text-violet-700",
    btn: "bg-violet-600 hover:bg-violet-700",
    arrow: "text-violet-500 group-hover:text-violet-600",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden bg-white border-b border-slate-200">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-teal-50 opacity-60" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-blue-50 opacity-40" />
        </div>
        <div className="max-w-7xl mx-auto px-6 py-20 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            System Online — 5 Patients in Queue
          </div>
          <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Smart Medical<br />
            <span className="text-teal-600">Appointment System</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto mb-10">
            A unified digital platform for patients, doctors, and staff — streamlining hospital queues with real-time tracking and smart scheduling.
          </p>
          <Link
            to="/patient/register"
            className="inline-flex items-center gap-2 bg-teal-600 text-white px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-teal-700 transition-all shadow-md shadow-teal-200"
          >
            Book an Appointment
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Portal Cards */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-xl font-bold text-slate-700 text-center mb-2">Select Your Portal</h2>
        <p className="text-sm text-slate-400 text-center mb-10">Choose the role to access your dashboard</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {portals.map((p) => {
            const c = colorMap[p.color];
            return (
              <Link
                key={p.title}
                to={p.path}
                className={`group bg-white border-2 border-slate-200 rounded-2xl p-7 flex flex-col gap-5 transition-all duration-200 hover:shadow-xl ${c.card}`}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center border-2 ${c.icon}`}>
                    {p.icon}
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.badge}`}>
                    {p.badge}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-1">{p.title} Portal</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{p.subtitle}</p>
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold mt-auto ${c.arrow} transition-transform group-hover:translate-x-1`}>
                  Enter Portal
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Stats Strip */}
      <div className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: "Patients Today", value: "47" },
            { label: "Avg. Wait Time", value: "18 min" },
            { label: "Doctors On Duty", value: "6" },
            { label: "Departments", value: "12" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold text-slate-800">{s.value}</p>
              <p className="text-sm text-slate-400 font-medium mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="text-center py-6 text-xs text-slate-400">
        © 2026 MediQueue · Smart Appointment Management
      </footer>
    </div>
  );
}