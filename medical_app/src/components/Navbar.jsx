import { Link, useLocation } from "react-router-dom";
import { useApp } from "../App";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Doctor", path: "/doctor" },
  { label: "Compounder", path: "/compounder" },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { authRole, logout, userProfile } = useApp();

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
          {!authRole && (
            <Link
              to="/login"
              className="ml-4 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-all shadow-sm"
            >
              Log In
            </Link>
          )}
          {authRole && (
            <div className="ml-4 flex items-center gap-3">
              <Link to="/patient/register" className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-all shadow-sm">
                Book Appointment
              </Link>
              <button onClick={logout} className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-all">
                Logout
              </button>
              <Link to="/profile" className="w-10 h-10 rounded-full bg-slate-200 border-2 border-slate-300 flex items-center justify-center overflow-hidden hover:border-teal-500 transition-colors">
                {userProfile?.profileImage ? (
                  <img src={`http://localhost:5000${userProfile.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                )}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}