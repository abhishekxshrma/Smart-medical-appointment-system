import { useState } from "react";
import { AppContext } from "./contextValue";

const DUMMY_PATIENTS = [
  {
    id: 1,
    token: "T-001",
    name: "Priya Sharma",
    age: 34,
    symptoms: "Fever, headache, mild cough",
    status: "completed",
    estimatedTime: "9:00 AM",
    verified: true,
    department: "General Medicine",
    priority: "normal",
  },
  {
    id: 2,
    token: "T-002",
    name: "Rahul Mehta",
    age: 52,
    symptoms: "Chest tightness, shortness of breath",
    status: "in-progress",
    estimatedTime: "9:30 AM",
    verified: true,
    department: "Cardiology",
    priority: "high",
  },
  {
    id: 3,
    token: "T-003",
    name: "Anita Verma",
    age: 28,
    symptoms: "Joint pain, swelling in knees",
    status: "waiting",
    estimatedTime: "10:00 AM",
    verified: true,
    department: "Orthopedics",
    priority: "normal",
  },
  {
    id: 4,
    token: "T-004",
    name: "Suresh Kumar",
    age: 61,
    symptoms: "Blurred vision, frequent urination",
    status: "waiting",
    estimatedTime: "10:30 AM",
    verified: false,
    department: "Endocrinology",
    priority: "high",
  },
  {
    id: 5,
    token: "T-005",
    name: "Meena Patel",
    age: 19,
    symptoms: "Skin rash, itching",
    status: "waiting",
    estimatedTime: "11:00 AM",
    verified: false,
    department: "Dermatology",
    priority: "normal",
  },
];

export function AppProvider({ children }) {
  const [patients, setPatients] = useState(DUMMY_PATIENTS);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [nextToken, setNextToken] = useState(6);

  const addPatient = (formData) => {
    const tokenNum = String(nextToken).padStart(3, "0");
    const newPatient = {
      id: nextToken,
      token: `T-${tokenNum}`,
      name: formData.name,
      age: parseInt(formData.age),
      symptoms: formData.symptoms,
      status: "waiting",
      estimatedTime: calculateETA(nextToken),
      verified: false,
      department: formData.department || "General Medicine",
      priority: formData.priority || "normal",
    };
    setPatients((prev) => [...prev, newPatient]);
    setCurrentPatient(newPatient);
    setNextToken((n) => n + 1);
    return newPatient;
  };

  const updateStatus = (id, status) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
  };

  const verifyPatient = (id) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, verified: true } : p))
    );
  };

  return (
    <AppContext.Provider
      value={{ patients, currentPatient, addPatient, updateStatus, verifyPatient, setCurrentPatient }}
    >
      {children}
    </AppContext.Provider>
  );
}

function calculateETA(tokenNum) {
  const base = 9 * 60;
  const minutes = base + (tokenNum - 1) * 20;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const suffix = h >= 12 ? "PM" : "AM";
  const displayH = h > 12 ? h - 12 : h;
  return `${displayH}:${String(m).padStart(2, "0")} ${suffix}`;
}

