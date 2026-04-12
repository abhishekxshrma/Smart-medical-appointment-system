import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import { useApp } from "../context/useApp";

export default function PatientDashboard() {
  const { patients, currentPatient } = useApp();
  const [now, setNow] = useState(new Date());

  // Use currentPatient or fallback to first waiting patient
  const patient = currentPatient || patients.find((p) => p.status === "waiting") || patients[0];

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const waitingBefore = patients.filter(
    (p) => p.status === "waiting" && p.id < patient?.id
  ).length;

  const queueList = patients.filter((p) => p.status !== "completed");

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">My Appointment</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {now.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <Link
            to="/patient/register"
            className="text-sm font-semibold text-teal-600 border border-teal-200 bg-teal-50 px-4 py-2 rounded-lg hover:bg-teal-100 transition-all"
          >
            + New Appointment
          </Link>
        </div>

        {patient ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Token Card */}
            <div className="md:col-span-1 bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg shadow-teal-200 flex flex-col items-center justify-center text-center">
              <p className="text-teal-200 text-xs font-semibold tracking-widest uppercase mb-3">Your Token</p>
              <div className="text-6xl font-black tracking-tight mb-1">{patient.token}</div>
              <div className="mt-4">
                <StatusBadge status={patient.status} />
              </div>
              <p className="text-teal-200 text-xs mt-4">Keep this token for reference</p>
            </div>

            {/* Details */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Appointment Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Patient Name", value: patient.name },
                    { label: "Age", value: `${patient.age} years` },
                    { label: "Department", value: patient.department },
                    { label: "Priority", value: patient.priority === "high" ? "High Priority" : "Normal" },
                    { label: "Estimated Time", value: patient.estimatedTime },
                    { label: "Patients Ahead", value: waitingBefore },
                  ].map((r) => (
                    <div key={r.label}>
                      <p className="text-xs text-slate-400 font-medium mb-0.5">{r.label}</p>
                      <p className="text-sm font-bold text-slate-800">{r.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Reported Symptoms</h3>
                <p className="text-sm text-slate-700 leading-relaxed">{patient.symptoms}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center mb-8">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-slate-600 font-semibold">No active appointment</p>
            <p className="text-slate-400 text-sm mt-1">Book an appointment to see your queue status</p>
            <Link to="/patient/register" className="inline-block mt-4 px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition-all">
              Book Now
            </Link>
          </div>
        )}

        {/* Live Queue */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-700">Live Queue</h3>
            <span className="text-xs text-slate-400">{queueList.length} patients remaining</span>
          </div>
          <div className="divide-y divide-slate-100">
            {queueList.length === 0 ? (
              <div className="px-6 py-8 text-center text-slate-400 text-sm">Queue is empty</div>
            ) : (
              queueList.map((p) => (
                <div
                  key={p.id}
                  className={`px-6 py-4 flex items-center justify-between ${
                    p.id === patient?.id ? "bg-teal-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-black ${p.id === patient?.id ? "text-teal-600" : "text-slate-400"}`}>
                      {p.token}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {p.id === patient?.id ? `${p.name} (You)` : p.name}
                      </p>
                      <p className="text-xs text-slate-400">{p.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-400 hidden sm:block">{p.estimatedTime}</span>
                    <StatusBadge status={p.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
