import { useState } from "react";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import StatCard from "../components/StatCard";
import { useApp } from "../context/useApp";

const STATUS_CYCLE = { waiting: "in-progress", "in-progress": "completed", completed: "waiting" };
const STATUS_BTN_LABEL = { waiting: "Start Consultation", "in-progress": "Mark Complete", completed: "Reopen" };
const STATUS_BTN_COLOR = {
  waiting: "bg-blue-600 hover:bg-blue-700 text-white",
  "in-progress": "bg-emerald-600 hover:bg-emerald-700 text-white",
  completed: "bg-slate-200 hover:bg-slate-300 text-slate-700",
};

export default function DoctorDashboard() {
  const { patients, updateStatus } = useApp();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const waiting = patients.filter((p) => p.status === "waiting").length;
  const inProgress = patients.filter((p) => p.status === "in-progress").length;
  const completed = patients.filter((p) => p.status === "completed").length;

  const filtered = patients.filter((p) => {
    const matchFilter = filter === "all" || p.status === filter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
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
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Doctor Dashboard</h1>
          </div>
          <p className="text-sm text-slate-400 ml-12">Dr. Anil Kapoor · General Medicine & Cardiology</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Patients"
            value={patients.length}
            color="teal"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          />
          <StatCard
            label="Waiting"
            value={waiting}
            color="amber"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard
            label="In Progress"
            value={inProgress}
            color="blue"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
          />
          <StatCard
            label="Completed"
            value={completed}
            color="emerald"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </div>

        {/* Filters & Search */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {[
                { key: "all", label: "All" },
                { key: "waiting", label: "Waiting" },
                { key: "in-progress", label: "In Progress" },
                { key: "completed", label: "Completed" },
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
              placeholder="Search by name or token..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-300 w-full sm:w-56"
            />
          </div>

          {/* Patient Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Token</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Department</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Symptoms</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                      No patients match the selected filter
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id} className={`hover:bg-slate-50 transition-colors ${p.priority === "high" ? "border-l-2 border-l-rose-400" : ""}`}>
                      <td className="px-6 py-4">
                        <span className="font-black text-slate-700">{p.token}</span>
                        {p.priority === "high" && (
                          <span className="ml-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                            Urgent
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">{p.name}</p>
                        <p className="text-xs text-slate-400">{p.age} yrs · {p.estimatedTime}</p>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell text-slate-600">{p.department}</td>
                      <td className="px-6 py-4 hidden lg:table-cell text-slate-500 max-w-xs truncate">{p.symptoms}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => updateStatus(p.id, STATUS_CYCLE[p.status])}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${STATUS_BTN_COLOR[p.status]}`}
                        >
                          {STATUS_BTN_LABEL[p.status]}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
