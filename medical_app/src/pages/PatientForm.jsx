import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useApp } from "../context/useApp";

const DEPARTMENTS = [
  "General Medicine", "Cardiology", "Orthopedics", "Dermatology",
  "Endocrinology", "Neurology", "Pediatrics", "ENT",
];

function inputCls(error) {
  return `w-full px-4 py-2.5 rounded-xl border ${
    error ? "border-rose-400 focus:ring-rose-300" : "border-slate-300 focus:ring-teal-300"
  } text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 transition-all`;
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
}

export default function PatientForm() {
  const navigate = useNavigate();
  const { addPatient } = useApp();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "", age: "", symptoms: "", department: "General Medicine", priority: "normal",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.age || isNaN(form.age) || +form.age < 1 || +form.age > 120)
      e.age = "Enter a valid age (1-120)";
    if (!form.symptoms.trim()) e.symptoms = "Please describe your symptoms";
    return e;
  };

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const handleNext = () => {
    if (step === 1) {
      const e = validate();
      if (Object.keys(e).length) { setErrors(e); return; }
    }
    setStep((s) => s + 1);
  };

  const handleSubmit = () => {
    addPatient(form);
    setSubmitted(true);
    setTimeout(() => navigate("/patient/dashboard"), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-1">Book Appointment</h1>
          <p className="text-slate-500 text-sm">Fill in your details and we will assign you a queue token</p>
        </div>

        <div className="flex items-center gap-2 mb-8">
          {["Personal Info", "Department & Priority", "Confirm"].map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                step > i + 1 ? "bg-teal-600 border-teal-600 text-white"
                : step === i + 1 ? "border-teal-600 text-teal-600"
                : "border-slate-300 text-slate-400"
              }`}>
                {step > i + 1 ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${step === i + 1 ? "text-slate-700" : "text-slate-400"}`}>
                {label}
              </span>
              {i < 2 && <div className={`flex-1 h-0.5 rounded ${step > i + 1 ? "bg-teal-500" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-8">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Appointment Booked!</h3>
                <p className="text-slate-500 text-sm">Redirecting to your dashboard...</p>
              </div>
            ) : step === 1 ? (
              <div className="space-y-5">
                <h2 className="font-bold text-slate-700 text-lg">Personal Information</h2>
                <Field label="Full Name" error={errors.name}>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={inputCls(errors.name)}
                  />
                </Field>
                <Field label="Age" error={errors.age}>
                  <input
                    type="number"
                    placeholder="e.g. 34"
                    value={form.age}
                    onChange={(e) => handleChange("age", e.target.value)}
                    className={inputCls(errors.age)}
                  />
                </Field>
                <Field label="Describe Your Symptoms" error={errors.symptoms}>
                  <textarea
                    rows={4}
                    placeholder="Briefly describe what you are experiencing..."
                    value={form.symptoms}
                    onChange={(e) => handleChange("symptoms", e.target.value)}
                    className={`${inputCls(errors.symptoms)} resize-none`}
                  />
                </Field>
              </div>
            ) : step === 2 ? (
              <div className="space-y-5">
                <h2 className="font-bold text-slate-700 text-lg">Department and Priority</h2>
                <Field label="Select Department">
                  <select
                    value={form.department}
                    onChange={(e) => handleChange("department", e.target.value)}
                    className={inputCls(null)}
                  >
                    {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </Field>
                <Field label="Priority Level">
                  <div className="grid grid-cols-2 gap-3">
                    {["normal", "high"].map((p) => (
                      <button
                        key={p}
                        onClick={() => handleChange("priority", p)}
                        className={`py-3 rounded-xl border-2 font-semibold text-sm capitalize transition-all ${
                          form.priority === p
                            ? p === "high"
                              ? "border-rose-500 bg-rose-50 text-rose-700"
                              : "border-teal-500 bg-teal-50 text-teal-700"
                            : "border-slate-200 text-slate-500 hover:border-slate-300"
                        }`}
                      >
                        {p === "high" ? "High Priority" : "Normal"}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="font-bold text-slate-700 text-lg">Confirm Details</h2>
                <div className="bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-200 overflow-hidden">
                  {[
                    { label: "Name", value: form.name },
                    { label: "Age", value: `${form.age} years` },
                    { label: "Department", value: form.department },
                    { label: "Priority", value: form.priority === "high" ? "High Priority" : "Normal" },
                    { label: "Symptoms", value: form.symptoms },
                  ].map((r) => (
                    <div key={r.label} className="flex gap-4 px-4 py-3">
                      <span className="text-sm text-slate-500 font-medium w-28 shrink-0">{r.label}</span>
                      <span className="text-sm text-slate-800 font-semibold">{r.value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  By confirming, you agree that all information provided is accurate.
                </p>
              </div>
            )}
          </div>

          {!submitted && (
            <div className="border-t border-slate-100 px-8 py-5 bg-slate-50 flex justify-between">
              {step > 1 ? (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-sm font-semibold hover:bg-slate-100 transition-all"
                >
                  Back
                </button>
              ) : <div />}
              {step < 3 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-all shadow-sm"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-all shadow-sm"
                >
                  Confirm and Book
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
