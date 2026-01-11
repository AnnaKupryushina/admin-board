import type { Client } from "../types";

const seed: Client[] = [
  {
    id: "c1",
    name: "Acme Corp",
    email: "contact@acme.com",
    company: "Acme",
    status: "active",
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
  },
  {
    id: "c2",
    name: "Globex",
    email: "hello@globex.com",
    company: "Globex",
    status: "prospect",
    createdAt: Date.now() - 1000 * 60 * 60 * 36,
  },
  {
    id: "c3",
    name: "Soylent",
    email: "contact@soylent.com",
    company: "Soylent",
    status: "inactive",
    createdAt: Date.now() - 1000 * 60 * 60 * 72,
  },
];

let clients = [...seed];

function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function listClients(): Promise<Client[]> {
  await delay(250);
  return clients.slice().sort((a, b) => b.createdAt - a.createdAt);
}

export async function createClient(
  data: Omit<Client, "id" | "createdAt">
): Promise<Client> {
  await delay(250);
  const newClient: Client = {
    ...data,
    id: `c${Math.floor(Math.random() * 100000)}`,
    createdAt: Date.now(),
  };
  clients = [newClient, ...clients];
  return newClient;
}

export async function updateClient(
  id: string,
  patch: Partial<Client>
): Promise<Client> {
  await delay(200);
  clients = clients.map((c) => (c.id === id ? { ...c, ...patch } : c));
  const found = clients.find((c) => c.id === id)!;
  return found;
}

export async function removeClient(id: string): Promise<void> {
  await delay(150);
  clients = clients.filter((c) => c.id !== id);
}
