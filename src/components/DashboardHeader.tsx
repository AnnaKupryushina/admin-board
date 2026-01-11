import React from "react";
import { useAuth } from "../hooks/useAuth";
import styles from "./DashboardHeader.module.scss";

export default function DashboardHeader() {
  const { user, logout } = useAuth();
  const displayName = user?.name ?? user?.email ?? "User";
  const initials = displayName
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <div className={styles.logo}>AP</div>
        <div className={styles.brandText}>Admin Panel</div>
      </div>

      <div className={styles.spacer} />

      <div className={styles.user}>
        <div className={styles.avatar} aria-hidden>
          <div className={styles.avatarInner}>{initials}</div>
        </div>
        <span className={styles.userName} title={displayName}>
          {displayName}
        </span>
        <button
          className={styles.signOut}
          onClick={logout}
          aria-label="Sign out"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
