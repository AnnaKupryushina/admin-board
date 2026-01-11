const API_BASE =
  (import.meta as any).env?.VITE_API_BASE ?? "http://localhost:4000";

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const text = await res.text();
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    throw new Error(`Invalid JSON response from server: ${text}`);
  }

  if (!res.ok) {
    const message = data?.message || data?.error || "Invalid credentials";
    throw new Error(message);
  }

  if (!data?.token) throw new Error("Authentication failed: missing token");

  localStorage.setItem("token", data.token);
  const user = data.user || null;
  if (data.demo) (user as any).demo = true;
  return user;
}
