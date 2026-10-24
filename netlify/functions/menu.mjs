import { getStore } from "@netlify/blobs";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

export default async (req) => {
  const store = getStore("kitchen");
  if (req.method === "GET") {
    return json((await store.get("menu", { type: "json" })) || null);
  }
  if (req.method === "POST") {
    const pass = process.env.ADMIN_PASSWORD;
    if (!pass || req.headers.get("x-admin-password") !== pass) {
      return json({ error: "Wrong password" }, 401);
    }
    const body = await req.json();
    await store.setJSON("menu", body);
    return json({ ok: true });
  }
  return json({ error: "Method not allowed" }, 405);
};

export const config = { path: "/api/menu" };
