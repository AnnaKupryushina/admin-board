import React, { useEffect, useState } from "react";
import styles from "./ClientsPanel.module.scss";
import * as clientsService from "../services/clientsService";
import type { Client } from "../types";
import ClientForm from "./ClientForm";

export default function ClientsPanel() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 7;

  const load = async () => {
    setLoading(true);
    try {
      const data = await clientsService.listClients();
      setClients(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // compute pagination
  const totalPages = Math.max(1, Math.ceil(clients.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const paged = clients.slice(start, start + PAGE_SIZE);

  const onCreate = async (payload: Omit<Client, "id" | "createdAt">) => {
    const temp: Client = {
      ...payload,
      id: `temp-${Date.now()}`,
      createdAt: Date.now(),
    };
    setClients((s) => [temp, ...s]);
    setPage(1); // show new item on first page
    try {
      const created = await clientsService.createClient(payload);
      setClients((s) => s.map((c) => (c.id === temp.id ? created : c)));
    } catch (e) {
      setClients((s) => s.filter((c) => c.id !== temp.id));
      throw e;
    }
  };

  const onUpdate = async (id: string, patch: Partial<Client>) => {
    const prev = clients;
    setClients((s) => s.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    try {
      await clientsService.updateClient(id, patch);
    } catch (e) {
      setClients(prev);
      throw e;
    }
  };

  const onDelete = async (id: string) => {
    const prev = clients;
    setClients((s) => s.filter((c) => c.id !== id));
    try {
      await clientsService.removeClient(id);
      // adjust page if needed
      const newTotal = Math.max(1, Math.ceil((prev.length - 1) / PAGE_SIZE));
      setPage((p) => Math.min(p, newTotal));
    } catch (e) {
      setClients(prev);
      throw e;
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.title}>Clients</div>
        <div>
          <ClientForm onSubmit={onCreate} label="Add client" />
        </div>
      </div>

      <div className={styles.list}>
        {clients.length === 0 && (
          <div className={styles.empty}>
            {loading ? "Loading..." : "No clients yet"}
          </div>
        )}
        {paged.map((c) => (
          <div className={styles.item} key={c.id}>
            <div className={styles.itemLeft}>
              <div className={styles.itemName}>{c.name}</div>
              <div className={styles.itemMeta}>
                {c.company} • {c.email}
              </div>
            </div>
            <div className={styles.controls}>
              <button className={styles.btn} onClick={() => setEditing(c)}>
                Edit
              </button>
              <button
                className={`${styles.btn} ${styles.danger}`}
                onClick={() => onDelete(c.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* pagination controls */}
      <div className={styles.pagination}>
        <button
          className={styles.btn}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Prev
        </button>
        <div className={styles.pages}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={`${styles.btn} ${page === i + 1 ? styles.active : ""}`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <button
          className={styles.btn}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>

      {editing && (
        <div>
          <h4>Edit client</h4>
          <ClientForm
            initial={editing}
            label="Save"
            onSubmit={async (payload) => {
              await onUpdate(editing.id, payload);
              setEditing(null);
            }}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}
    </div>
  );
}
