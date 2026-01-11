import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import styles from "./LoginForm.module.scss";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();
  const navigate = useNavigate();

  const DEMO_EMAIL = (import.meta as any).env?.VITE_DEMO_EMAIL;
  const DEMO_PASSWORD = (import.meta as any).env?.VITE_DEMO_PASSWORD;

  const onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setEmail(e.target.value);
  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPassword(e.target.value);

  const submit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await auth.login(email.trim(), password);
      navigate("/");
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const tryDemo = async () => {
    if (!DEMO_EMAIL || !DEMO_PASSWORD) return;
    setLoading(true);
    setError(null);
    try {
      await auth.login(DEMO_EMAIL, DEMO_PASSWORD);
      navigate("/");
    } catch (err: any) {
      setError(err?.message ?? "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${styles.card} auth-card`}
      role="region"
      aria-label="Sign in"
    >
      <div className={styles.brand}>
        <div className={styles.brandLogo} aria-hidden>
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="24" height="24" rx="6" fill="url(#g)" />
            <defs>
              <linearGradient id="g" x1="0" x2="1">
                <stop offset="0" stopColor="#0ea5e9" />
                <stop offset="1" stopColor="#2563eb" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className={styles.brandText}>
          <h2>Admin Console</h2>
          <div className={styles.muted}>Secure access to your dashboard</div>
        </div>
      </div>
      <form onSubmit={submit} className={styles.form} noValidate>
        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            value={email}
            onChange={onEmailChange}
            type="email"
            placeholder="you@company.com"
            required
            autoComplete="email"
          />
        </div>

        <div className={styles.field}>
          <div className={styles.fieldRow}>
            <label className={styles.label}>Password</label>
            <a
              className={`${styles.link} ${styles.muted}`}
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              Forgot?
            </a>
          </div>
          <input
            className={styles.input}
            value={password}
            onChange={onPasswordChange}
            type="password"
            placeholder="Enter your password"
            required
            autoComplete="current-password"
          />
        </div>

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        <div className={styles.actions}>
          <button
            className={`${styles.btn} ${styles.primary}`}
            type="submit"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
          {DEMO_EMAIL && DEMO_PASSWORD && (
            <button
              type="button"
              className={`${styles.btn} ${styles.ghost}`}
              onClick={tryDemo}
              disabled={loading}
            >
              Try demo
            </button>
          )}
        </div>
      </form>

      {auth.user?.demo && (
        <div className={styles.muted} role="status">
          Demo session — some actions are disabled
        </div>
      )}
      <div className={styles.oauthHint}>Or continue with your SSO provider</div>
    </div>
  );
}
