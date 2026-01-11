import React, { useState } from "react";
import styles from "./ClientForm.module.scss";
import type { Client } from "../types";

type Payload = {
  name: string;
  email?: string;
  company?: string;
  status?: Client["status"];
};

type Props = {
  initial?: Client | null;
  onSubmit: (payload: Payload) => Promise<any> | any;
  onCancel?: () => void;
  label?: string;
};

export default function ClientForm({
  initial = null,
  onSubmit,
  onCancel,
  label = "Add",
}: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [loading, setLoading] = useState(false);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim() || undefined,
        company: company.trim() || undefined,
      });
      setName("");
      setEmail("");
      setCompany("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <input
        className={styles.input}
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className={styles.input}
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className={styles.input}
        placeholder="Company"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />
      <button className={styles.submit} type="submit" disabled={loading}>
        {loading ? "Saving..." : label}
      </button>
      {onCancel && (
        <button type="button" className={styles.cancel} onClick={onCancel}>
          Cancel
        </button>
      )}
    </form>
  );
}
