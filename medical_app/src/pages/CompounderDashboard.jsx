import { useState } from "react";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import { useApp } from "../context/useApp";

export default function CompounderDashboard() {
  const { patients, verifyPatient } = useApp();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const verified = patients.filter((p) => p.verified).length;
  const pending = patients.filter((p) => !p.verified).length;
  const highPriority = patients.filter((p) => p.priority === "high").length;

  const filtered = patients.filter((p) => {
    const matchFilter =
      filter === "all" ||
      (filter === "verified" && p.verified) ||
      (filter === "pending" && !p.verified) ||
      (filter === "urgent" && p.priority === "high");
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.token.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-violet-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Compounder Dashboard</h1>
          </div>
          <p className="text-sm text-slate-400 ml-12">Patient verification &amp; arrival management</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Registered"
            value={patients.length}
            color="teal"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          />
          <StatCard
            label="Verified"
            value={verified}
            color="emerald"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard
            label="Pending Verification"
            value={pending}
            color="amber"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard
            label="High Priority"
            value={highPriority}
            color="rose"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
          />
        </div>

        {/* Pending Alert */}
        {pending > 0 && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
            <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-amber-700 font-medium">
              <span className="font-bold">{pending} patient{pending > 1 ? "s" : ""}</span> pending verification. Please verify their arrival before they proceed.
            </p>
          </div>
        )}

        {/* Patient Cards */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {[
                { key: "all", label: "All" },
                { key: "pending", label: "Pending" },
                { key: "verified", label: "Verified" },
                { key: "urgent", label: "Urgent" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filter === f.key
                      ? "bg-slate-800 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Search patient or token..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-300 w-full sm:w-56"
            />
          </div>

          {/* Cards Grid */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.length === 0 ? (
              <div className="col-span-3 py-12 text-center text-slate-400">
                <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                No patients found
              </div>
            ) : (
              filtered.map((p) => (
                <PatientCard key={p.id} patient={p} onVerify={() => verifyPatient(p.id)} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PatientCard({ patient: p, onVerify }) {
  return (
    <div className={`rounded-xl border-2 p-5 transition-all ${
      p.verified
        ? "border-emerald-200 bg-emerald-50"
        : p.priority === "high"
          ? "border-rose-200 bg-rose-50"
          : "border-slate-200 bg-white hover:border-slate-300"
    }`}>
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-slate-800">{p.token}</span>
          {p.priority === "high" && (
            <span className="text-xs font-bold text-rose-600 bg-rose-100 border border-rose-200 px-1.5 py-0.5 rounded">
              URGENT
            </span>
          )}
        </div>
        {p.verified ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-full">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            Verified
          </span>
        ) : (
          <span className="text-xs font-semibold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-1 rounded-full">
            Pending
          </span>
        )}
      </div>

      {/* Details */}
      <p className="font-bold text-slate-800 text-base mb-0.5">{p.name}</p>
      <p className="text-xs text-slate-500 mb-1">{p.age} yrs · {p.department}</p>
      <p className="text-xs text-slate-400 mb-4 line-clamp-2">{p.symptoms}</p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">ETA: {p.estimatedTime}</span>
        {!p.verified && (
          <button
            onClick={onVerify}
            className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg transition-all"
          >
            Verify Arrival
          </button>
        )}
      </div>
    </div>
  );
}
