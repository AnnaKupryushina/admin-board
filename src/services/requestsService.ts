import type { RequestItem } from "../types";

let requests: RequestItem[] = [
  {
    id: "r1",
    clientId: "c1",
    title: "Set up billing",
    status: "open",
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
  },
  {
    id: "r2",
    clientId: "c2",
    title: "Integrate SSO",
    status: "pending",
    assignee: "Alice",
    createdAt: Date.now() - 1000 * 60 * 60 * 26,
  },
  {
    id: "r3",
    clientId: "c1",
    title: "Data export",
    status: "open",
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
  },
];

function delay(ms = 200) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function listRequests(): Promise<RequestItem[]> {
  await delay(250);
  return requests.slice().sort((a, b) => b.createdAt - a.createdAt);
}

export async function createRequest(
  payload: Omit<RequestItem, "id" | "createdAt">
): Promise<RequestItem> {
  await delay(200);
  const item: RequestItem = {
    ...payload,
    id: `r${Math.floor(Math.random() * 100000)}`,
    createdAt: Date.now(),
  };
  requests = [item, ...requests];
  return item;
}

export async function updateRequest(
  id: string,
  patch: Partial<RequestItem>
): Promise<RequestItem> {
  await delay(150);
  requests = requests.map((r) => (r.id === id ? { ...r, ...patch } : r));
  return requests.find((r) => r.id === id)!;
}

export async function assignRequest(
  id: string,
  assignee: string | null
): Promise<RequestItem> {
  await delay(120);
  requests = requests.map((r) =>
    r.id === id
      ? {
          ...r,
          assignee: assignee ?? undefined,
          status: assignee ? "pending" : r.status,
        }
      : r
  );
  return requests.find((r) => r.id === id)!;
}
