import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Doctor", path: "/doctor" },
  { label: "Compounder", path: "/compounder" },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="font-bold text-slate-800 text-lg tracking-tight">MediQueue</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname === l.path
                  ? "bg-teal-50 text-teal-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/patient/register"
            className="ml-4 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-all shadow-sm"
          >
            Book Appointment
          </Link>
        </div>
      </div>
    </nav>
  );
}