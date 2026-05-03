import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ROLE_STORAGE_KEY } from "./RoleSelect";
import { api, apiFetch } from "../App";

const ROLE_REDIRECT = {
  patient: "/patient",
  doctor: "/doctor",
  compounder: "/compounder",
};

const ROLE_META = {
  patient: {
    label: "Patient",
    accent: "#0f9f8f",
    accentSoft: "#ecfdf8",
    accentBorder: "#99f6e4",
    placeholder: "your.email@example.com",
  },
  doctor: {
    label: "Doctor",
    accent: "#2f6ce5",
    accentSoft: "#eff6ff",
    accentBorder: "#bfdbfe",
    placeholder: "doctor@hospital.com",
  },
  compounder: {
    label: "Compounder",
    accent: "#7c3aed",
    accentSoft: "#f5f3ff",
    accentBorder: "#ddd6fe",
    placeholder: "staff@hospital.com",
  },
};

const AUTH_STORAGE_KEY = "mediqueue_auth_role";

export default function Login() {
  const navigate = useNavigate();
  const storedRole = localStorage.getItem(ROLE_STORAGE_KEY);
  const role = storedRole && ROLE_REDIRECT[storedRole] ? storedRole : null;
  const authRole = localStorage.getItem(AUTH_STORAGE_KEY);
  const meta = role ? ROLE_META[role] : null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!role) navigate("/", { replace: true });
    if (authRole && ROLE_REDIRECT[authRole]) {
      navigate(ROLE_REDIRECT[authRole], { replace: true });
    }
  }, [authRole, navigate, role]);

  if (!meta) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please provide both email and password.");
      return;
    }

    setLoading(true);
    try {
      const result = await api.login({ email: email.trim(), password });
      
      // Ensure the user is logging into the correct portal
      if (result.user.role !== role) {
        throw new Error(`Role mismatch. This email is registered as a ${result.user.role}.`);
      }

      // Save auth tokens
      localStorage.setItem("mediqueue_token", result.token);
      localStorage.setItem(AUTH_STORAGE_KEY, result.user.role);
      
      const redirect = ROLE_REDIRECT[result.user.role] || "/home";

      // Navigate to respective dashboard
      navigate(redirect);
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  function handleChangeRole() {
    localStorage.removeItem(ROLE_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem("mediqueue_token");
    navigate("/");
  }

  return (
    <>
      <style>{`
        .login-page {
          min-height: 100vh;
          background: #f6f8fb;
          color: #202938;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 1.5rem;
          font-family: 'DM Sans', sans-serif;
        }
        .login-shell {
          width: min(100%, 34rem);
        }
        .login-heading {
          text-align: center;
          margin-bottom: 2rem;
        }
        .login-title {
          color: #2b3545;
          font-size: 1.9rem;
          font-weight: 900;
          letter-spacing: 0;
          margin-bottom: 0.65rem;
        }
        .login-subtitle {
          color: #8a97a8;
          font-size: 1.05rem;
          font-weight: 600;
          letter-spacing: 0.02em;
        }
        .login-card {
          background: #ffffff;
          border: 2px solid #e1e7ef;
          border-radius: 8px;
          padding: 2.25rem;
          box-shadow: 0 18px 42px rgba(31, 41, 55, 0.06);
        }
        .login-role-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.75rem;
        }
        .login-role-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--login-accent);
          background: var(--login-soft);
          border: 1px solid var(--login-border);
          border-radius: 6px;
          padding: 0.5rem 0.9rem;
          font-size: 0.9rem;
          font-weight: 900;
          letter-spacing: 0.05em;
        }
        .login-dot {
          width: 0.45rem;
          height: 0.45rem;
          border-radius: 50%;
          background: var(--login-accent);
        }
        .login-change {
          border: 1px solid #dbe3ec;
          background: #fff;
          color: #69778b;
          border-radius: 6px;
          padding: 0.55rem 0.85rem;
          font: inherit;
          font-size: 0.85rem;
          font-weight: 800;
          cursor: pointer;
        }
        .login-change:hover,
        .login-change:focus-visible {
          color: var(--login-accent);
          border-color: var(--login-border);
          outline: none;
        }
        .login-field {
          margin-bottom: 1.1rem;
        }
        .login-label {
          display: block;
          color: #4b586a;
          font-size: 0.9rem;
          font-weight: 800;
          margin-bottom: 0.45rem;
        }
        .login-input-wrap {
          position: relative;
        }
        .login-input {
          width: 100%;
          border: 2px solid #e1e7ef;
          background: #ffffff;
          color: #202938;
          border-radius: 8px;
          padding: 0.9rem 1rem;
          font: inherit;
          font-size: 1rem;
          font-weight: 600;
          outline: none;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }
        .login-input::placeholder {
          color: #9aa6b6;
        }
        .login-input:focus {
          border-color: var(--login-accent);
          box-shadow: 0 0 0 4px color-mix(in srgb, var(--login-accent) 14%, transparent);
        }
        .login-input.has-toggle {
          padding-right: 3.4rem;
        }
        .login-eye {
          position: absolute;
          top: 50%;
          right: 0.75rem;
          transform: translateY(-50%);
          width: 2.2rem;
          height: 2.2rem;
          border: 0;
          border-radius: 6px;
          background: transparent;
          color: #69778b;
          display: grid;
          place-items: center;
          cursor: pointer;
        }
        .login-eye:hover,
        .login-eye:focus-visible {
          background: #f3f6fa;
          color: var(--login-accent);
          outline: none;
        }
        .login-demo {
          color: #69778b;
          background: #f6f8fb;
          border: 1px solid #e1e7ef;
          border-radius: 8px;
          padding: 0.85rem 1rem;
          font-size: 0.9rem;
          font-weight: 700;
          margin-bottom: 1.1rem;
        }
        .login-demo strong {
          color: #202938;
        }
        .login-error {
          color: #b42318;
          background: #fff3f0;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 0.85rem 1rem;
          font-size: 0.9rem;
          font-weight: 700;
          margin-bottom: 1.1rem;
        }
        .login-submit {
          width: 100%;
          border: 0;
          border-radius: 8px;
          background: var(--login-accent);
          color: #ffffff;
          padding: 0.95rem 1rem;
          font: inherit;
          font-size: 1rem;
          font-weight: 900;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.65rem;
          transition: filter 0.18s ease, transform 0.18s ease;
        }
        .login-submit:hover:not(:disabled),
        .login-submit:focus-visible:not(:disabled) {
          filter: brightness(0.95);
          transform: translateY(-1px);
          outline: none;
        }
        .login-submit:disabled {
          cursor: wait;
          opacity: 0.75;
        }
        .login-spinner {
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255,255,255,0.45);
          border-top-color: #fff;
          border-radius: 50%;
          animation: loginSpin 0.7s linear infinite;
        }
        @keyframes loginSpin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 560px) {
          .login-page {
            align-items: flex-start;
            padding: 2.25rem 1rem;
          }
          .login-card {
            padding: 1.5rem;
          }
          .login-role-row {
            align-items: flex-start;
            flex-direction: column;
          }
          .login-title {
            font-size: 1.55rem;
          }
        }
      `}</style>

      <main className="login-page">
        <section className="login-shell" aria-labelledby="login-title">
          <div className="login-heading">
            <h1 className="login-title" id="login-title">Welcome Back</h1>
            <p className="login-subtitle">Sign in to access your live dashboard</p>
          </div>

          <div
            className="login-card"
            style={{
              "--login-accent": meta.accent,
              "--login-soft": meta.accentSoft,
              "--login-border": meta.accentBorder,
            }}
          >
            <div className="login-role-row">
              <span className="login-role-badge">
                <span className="login-dot" />
                {meta.label} Portal
              </span>
              <button className="login-change" type="button" onClick={handleChangeRole}>
                Change Role
              </button>
            </div>

            {error && <div className="login-error">{error}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="login-field">
                <label className="login-label" htmlFor="login-username">Email Address</label>
                <input
                  id="login-username"
                  className="login-input"
                  type="email"
                  value={email}
                  placeholder={meta.placeholder}
                  autoComplete="username"
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  autoFocus
                />
              </div>

              <div className="login-field">
                <label className="login-label" htmlFor="login-password">Password</label>
                <div className="login-input-wrap">
                  <input
                    id="login-password"
                    className="login-input has-toggle"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    placeholder="password123"
                    autoComplete="current-password"
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError("");
                    }}
                  />
                  <button
                    className="login-eye"
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      {showPassword ? (
                        <>
                          <path d="M17.9 17.9A10.1 10.1 0 0 1 12 20C5 20 1 12 1 12a18.5 18.5 0 0 1 5.1-5.9" />
                          <path d="M9.9 4.2A9.1 9.1 0 0 1 12 4c7 0 11 8 11 8a18.4 18.4 0 0 1-2.2 3.2" />
                          <path d="M14.1 14.1a3 3 0 0 1-4.2-4.2" />
                          <path d="M1 1l22 22" />
                        </>
                      ) : (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              <button className="login-submit" type="submit" disabled={loading}>
                {loading && <span className="login-spinner" />}
                {loading ? "Signing in..." : `Sign in as ${meta.label}`}
              </button>

              <div style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.95rem" }}>
                <span style={{ color: "#64748b" }}>Don't have an account? </span>
                <Link to="/signup" style={{ color: "var(--login-accent)", fontWeight: "bold", textDecoration: "none" }}>Sign up</Link>
              </div>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
