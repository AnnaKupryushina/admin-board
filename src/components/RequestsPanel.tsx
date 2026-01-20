import React, { useEffect, useState } from "react";
import styles from "./RequestsPanel.module.scss";
import * as requestsService from "../services/requestsService";
import ClientForm from "./ClientForm";
import type { RequestItem } from "../types";

const ASSIGNEES = ["Alice", "Bob", "Clara", "Devon"];

export default function RequestsPanel() {
  const [items, setItems] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 7;

  const load = async () => {
    setLoading(true);
    try {
      setItems(await requestsService.listRequests());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const paged = items.slice(
    (page - 1) * PAGE_SIZE,
    (page - 1) * PAGE_SIZE + PAGE_SIZE
  );

  const onAssign = async (id: string, assignee: string | null) => {
    setItems((s) =>
      s.map((it) =>
        it.id === id
          ? {
              ...it,
              assignee: assignee ?? undefined,
              status: assignee ? "pending" : it.status,
            }
          : it
      )
    );
    try {
      await requestsService.assignRequest(id, assignee);
    } catch (e) {
      load();
    }
  };

  const markDone = async (id: string) => {
    const prev = items;
    setItems((s) =>
      s.map((it) => (it.id === id ? { ...it, status: "done" } : it))
    );
    try {
      await requestsService.updateRequest(id, { status: "done" });
    } catch (e) {
      setItems(prev);
    }
  };

  const onCreate = async (payload: { title: string }) => {
    const item = await requestsService.createRequest({
      clientId: "c1",
      title: payload.title,
      status: "open",
    });
    setItems((s) => [item, ...s]);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.row}>
        <h3>Requests</h3>
        <div style={{ marginLeft: "auto" }}>
          <ClientForm
            onSubmit={async (p) => {
              await onCreate({ title: p.name });
            }}
            label="Create request"
          />
        </div>
      </div>

      <div className={styles.list}>
        {items.length === 0 && (
          <div className={styles.meta}>
            {loading ? "Loading..." : "No requests"}
          </div>
        )}
        {paged.map((it) => (
          <div className={styles.item} key={it.id}>
            <div>
              <div>
                <strong>{it.title}</strong>
              </div>
              <div className={styles.meta}>
                for client {it.clientId} •{" "}
                {new Date(it.createdAt).toLocaleString()}
              </div>
            </div>
            <div className={styles.assign}>
              <select
                className={styles.select}
                value={it.assignee ?? ""}
                onChange={(e) => onAssign(it.id, e.target.value || null)}
              >
                <option value="">Unassigned</option>
                {ASSIGNEES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <div
                className={
                  it.status === "open"
                    ? styles.statusOpen
                    : it.status === "pending"
                    ? styles.statusIn
                    : styles.statusDone
                }
              >
                {it.status}
              </div>
              {it.status !== "done" && (
                <button
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={() => markDone(it.id)}
                >
                  Mark done
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
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
    </div>
  );
}
