import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const ROLE_STORAGE_KEY = "mediqueue_role";

const ROLES = [
  {
    key: "patient",
    label: "Patient",
    badge: "Book Now",
    subtitle: "Book an appointment and track your queue",
    accent: "#0f9f8f",
    accentSoft: "#ecfdf8",
    accentBorder: "#99f6e4",
    icon: (
      <>
        <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
        <path d="M12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z" />
      </>
    ),
  },
  {
    key: "doctor",
    label: "Doctor",
    badge: "Staff",
    subtitle: "Manage patient queue and update consultation status",
    accent: "#2f6ce5",
    accentSoft: "#eff6ff",
    accentBorder: "#bfdbfe",
    icon: (
      <>
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <path d="M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
  },
  {
    key: "compounder",
    label: "Compounder",
    badge: "Staff",
    subtitle: "Verify patients and manage arrival check-in",
    accent: "#7c3aed",
    accentSoft: "#f5f3ff",
    accentBorder: "#ddd6fe",
    icon: (
      <path d="M9 12l2 2 4-4m5.6-4A12 12 0 0 1 12 3 12 12 0 0 1 3.4 6 12 12 0 0 0 3 9c0 5.6 3.8 10.3 9 11.6 5.2-1.3 9-6 9-11.6 0-1-.1-2-.4-3z" />
    ),
  },
];

export default function RoleSelect() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  function handleSelect(roleKey) {
    setSelectedRole(roleKey);
    localStorage.setItem(ROLE_STORAGE_KEY, roleKey);
    window.setTimeout(() => navigate("/login"), 180);
  }

  return (
    <>
      <style>{`
        .role-page {
          min-height: 100vh;
          background: #f6f8fb;
          color: #202938;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 1.5rem;
          font-family: 'DM Sans', sans-serif;
        }
        .role-shell {
          width: min(100%, 118rem);
        }
        .role-heading {
          text-align: center;
          margin-bottom: 3.8rem;
        }
        .role-title {
          color: #2b3545;
          font-size: 1.9rem;
          font-weight: 900;
          letter-spacing: 0;
          margin-bottom: 0.8rem;
        }
        .role-subtitle {
          color: #8a97a8;
          font-size: 1.2rem;
          font-weight: 600;
          letter-spacing: 0.03em;
        }
        .role-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 2.25rem;
        }
        .role-card {
          min-height: 23rem;
          width: 100%;
          border: 2px solid #e1e7ef;
          background: #ffffff;
          border-radius: 8px;
          padding: 2.8rem;
          text-align: left;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
          font-family: inherit;
        }
        .role-card:hover,
        .role-card:focus-visible,
        .role-card.is-selected {
          border-color: var(--role-accent);
          box-shadow: 0 18px 42px rgba(31, 41, 55, 0.08);
          transform: translateY(-3px);
          outline: none;
        }
        .role-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 2.3rem;
        }
        .role-icon {
          width: 5rem;
          height: 5rem;
          border: 2px solid var(--role-border);
          border-radius: 8px;
          background: var(--role-soft);
          color: var(--role-accent);
          display: grid;
          place-items: center;
          flex: 0 0 auto;
        }
        .role-icon svg {
          width: 2rem;
          height: 2rem;
        }
        .role-badge {
          color: var(--role-accent);
          background: var(--role-soft);
          border: 1px solid var(--role-border);
          border-radius: 6px;
          padding: 0.45rem 1rem;
          font-size: 0.95rem;
          font-weight: 900;
          letter-spacing: 0.08em;
        }
        .role-card-title {
          color: #202938;
          font-size: 1.85rem;
          font-weight: 900;
          letter-spacing: 0.04em;
          margin-bottom: 0.75rem;
        }
        .role-card-copy {
          color: #69778b;
          font-size: 1.18rem;
          font-weight: 600;
          line-height: 1.55;
          max-width: 34rem;
        }
        .role-enter {
          color: var(--role-accent);
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
          font-size: 1.05rem;
          font-weight: 900;
          letter-spacing: 0.02em;
          margin-top: 2.5rem;
        }
        .role-enter svg {
          width: 1.15rem;
          height: 1.15rem;
          transition: transform 0.18s ease;
        }
        .role-card:hover .role-enter svg,
        .role-card:focus-visible .role-enter svg {
          transform: translateX(4px);
        }
        @media (max-width: 980px) {
          .role-grid {
            grid-template-columns: 1fr;
          }
          .role-card {
            min-height: 19rem;
          }
        }
        @media (max-width: 560px) {
          .role-page {
            padding: 2.25rem 1rem;
            align-items: flex-start;
          }
          .role-heading {
            margin-bottom: 2rem;
          }
          .role-title {
            font-size: 1.55rem;
          }
          .role-subtitle {
            font-size: 1rem;
          }
          .role-card {
            padding: 1.5rem;
            min-height: 17rem;
          }
          .role-icon {
            width: 4rem;
            height: 4rem;
          }
          .role-card-title {
            font-size: 1.35rem;
          }
          .role-card-copy {
            font-size: 1rem;
          }
        }
      `}</style>

      <main className="role-page">
        <section className="role-shell" aria-labelledby="role-title">
          <div className="role-heading">
            <h1 className="role-title" id="role-title">Select Your Portal</h1>
            <p className="role-subtitle">Choose your role to access the live dashboard</p>
          </div>

          <div className="role-grid">
            {ROLES.map((role) => (
              <button
                key={role.key}
                className={`role-card${selectedRole === role.key ? " is-selected" : ""}`}
                style={{
                  "--role-accent": role.accent,
                  "--role-soft": role.accentSoft,
                  "--role-border": role.accentBorder,
                }}
                onClick={() => handleSelect(role.key)}
                aria-label={`Enter ${role.label} Portal`}
              >
                <div>
                  <div className="role-card-top">
                    <span className="role-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {role.icon}
                      </svg>
                    </span>
                    <span className="role-badge">{role.badge}</span>
                  </div>

                  <h2 className="role-card-title">{role.label} Portal</h2>
                  <p className="role-card-copy">{role.subtitle}</p>
                </div>

                <span className="role-enter">
                  Enter Portal
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
