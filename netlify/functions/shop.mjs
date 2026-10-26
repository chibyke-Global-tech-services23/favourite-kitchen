import { getStore } from "@netlify/blobs";
import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";

const J = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const users = () => getStore("users"), sess = () => getStore("sessions"), orders = () => getStore("orders");
const hash = (p, s) => scryptSync(p, s, 32).toString("hex");
const isAdmin = (req) => process.env.ADMIN_PASSWORD && req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
async function who(req) {
  const t = (req.headers.get("authorization") || "").replace("Bearer ", "");
  return t ? await sess().get(t, { type: "json" }) : null;
}

export default async (req) => {
  const path = new URL(req.url).pathname;

  if (path === "/api/upload" && req.method === "POST") {
    if (!isAdmin(req)) return J({ error: "Wrong password." }, 401);
    const { data } = await req.json();
    if (typeof data !== "string" || !data.startsWith("data:image/") || data.length > 2500000) return J({ error: "Picture is too big or not an image." }, 400);
    const id = "p" + Date.now().toString(36) + randomBytes(3).toString("hex");
    await getStore("images").set(id, data);
    return J({ ok: true, url: "/api/img/" + id });
  }

  if (path === "/api/receipt" && req.method === "POST") {
    const { id, data } = await req.json();
    if (typeof data !== "string" || !data.startsWith("data:image/") || data.length > 2500000) return J({ error: "Picture is too big or not an image." }, 400);
    const o = await orders().get(String(id), { type: "json" });
    if (!o) return J({ error: "Order not found." }, 404);
    const imgId = "p" + randomBytes(12).toString("hex");
    await getStore("images").set(imgId, data);
    o.receipt = "/api/img/" + imgId;
    o.receiptTime = new Date().toISOString();
    await orders().setJSON(o.id, o);
    return J({ ok: true });
  }

  if (path.startsWith("/api/img/") && req.method === "GET") {
    const key = path.slice(9);
    if (!/^p[a-z0-9]+$/.test(key)) return new Response("Not found", { status: 404 });
    const d = await getStore("images").get(key);
    if (!d) return new Response("Not found", { status: 404 });
    const mime = d.slice(5, d.indexOf(";"));
    return new Response(Buffer.from(d.slice(d.indexOf(",") + 1), "base64"), { headers: { "content-type": mime, "cache-control": "public, max-age=86400" } });
  }

  if (path === "/api/auth" && req.method === "POST") {
    const { mode, email, password, name, phone } = await req.json();
    const e = String(email || "").trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(e) || String(password || "").length < 6) return J({ error: "Enter a valid email and a password of 6 or more characters." }, 400);
    let u = await users().get(e, { type: "json" });
    if (mode === "reset") {
      if (!isAdmin(req)) return J({ error: "Wrong password." }, 401);
      if (!u) return J({ error: "No account with that email." }, 404);
      const salt = randomBytes(16).toString("hex");
      u.salt = salt; u.hash = hash(password, salt);
      await users().setJSON(e, u);
      return J({ ok: true });
    }
    if (mode === "reset") {
      if (!isAdmin(req)) return J({ error: "Wrong admin password." }, 401);
      if (!u) return J({ error: "No account with that email." }, 404);
      const salt = randomBytes(16).toString("hex");
      u.salt = salt;
      u.hash = hash(password, salt);
      await users().setJSON(e, u);
      return J({ ok: true });
    }
    if (mode === "signup") {
      if (u) return J({ error: "Account already exists. Please log in." }, 409);
      const salt = randomBytes(16).toString("hex");
      u = { email: e, name: String(name || "").slice(0, 60), phone: String(phone || "").slice(0, 20), salt, hash: hash(password, salt) };
      await users().setJSON(e, u);
    } else if (!u || !timingSafeEqual(Buffer.from(hash(password, u.salt)), Buffer.from(u.hash))) {
      return J({ error: "Wrong email or password." }, 401);
    }
    const token = randomBytes(24).toString("hex");
    await sess().setJSON(token, { email: e, name: u.name, phone: u.phone });
    return J({ token, email: e, name: u.name, phone: u.phone });
  }

  if (path === "/api/orders") {
    if (req.method === "POST") {
      const me = await who(req);
      const b = await req.json();
      const guestOk = !me && b.guest && String(b.phone || "").trim().length >= 7 && String(b.name || "").trim();
      if (!me && !guestOk) return J({ error: "Please enter your name and phone number." }, 401);
      if (!Array.isArray(b.items) || !b.items.length) return J({ error: "Your cart is empty." }, 400);
      const id = "KF" + Date.now().toString(36).toUpperCase();
      const items = b.items.slice(0, 40).map((i) => ({ name: String(i.name).slice(0, 80), price: Number(i.price) || 0, qty: Math.min(50, Number(i.qty) || 1) }));
      const o = { id, email: me ? me.email : "guest", name: me ? me.name : String(b.name).slice(0, 60), phone: String(b.phone || (me && me.phone) || "").slice(0, 20), address: String(b.address || "").slice(0, 300), note: String(b.note || "").slice(0, 300), items, status: "New", time: new Date().toISOString() };
      o.total = items.reduce((s, i) => s + i.price * i.qty, 0);
      await orders().setJSON(id, o);
      return J({ ok: true, id, total: o.total });
    }
    if (req.method === "GET") {
      const me = await who(req);
      if (!isAdmin(req) && !me) return J({ error: "Not allowed." }, 401);
      const { blobs } = await orders().list();
      const all = (await Promise.all(blobs.map((b) => orders().get(b.key, { type: "json" })))).filter(Boolean).sort((a, b) => b.time.localeCompare(a.time));
      return J(isAdmin(req) ? all : all.filter((o) => o.email === me.email));
    }
    if (req.method === "PUT") {
      if (!isAdmin(req)) return J({ error: "Wrong password." }, 401);
      const { id, status } = await req.json();
      const o = await orders().get(String(id), { type: "json" });
      if (!o) return J({ error: "Order not found." }, 404);
      o.status = String(status).slice(0, 20);
      await orders().setJSON(o.id, o);
      return J({ ok: true });
    }
  }

  if (path === "/api/chat" && req.method === "POST") {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return J({ reply: "The assistant is not available right now. Please tap 'Talk to a person'." });
    const { messages, menu } = await req.json();
    const msgs = (messages || []).slice(-10).map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content).slice(0, 500) }));
    const system = "You are the friendly customer service assistant for Favourite Kitchen, a kitchen and bar in Awo-Omamma, Nigeria. Reply briefly in simple English. Only use this information: " + JSON.stringify(menu || {}).slice(0, 3000) + ". Customers order through the website cart and pay by bank transfer, then send the receipt on WhatsApp. Delivery is available. If you do not know something (delivery fee, opening hours, stock, complaints), say so and tell them to tap 'Talk to a person'. Never invent prices.";
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-haiku-5-5", max_tokens: 400, system, messages: msgs }),
    });
    if (!r.ok) return J({ reply: "Sorry, I could not answer just now. Please tap 'Talk to a person'." });
    const d = await r.json();
    return J({ reply: (d.content || []).map((c) => c.text || "").join("") });
  }
  return J({ error: "Not found" }, 404);
};

export const config = { path: ["/api/auth", "/api/orders", "/api/chat", "/api/upload", "/api/receipt", "/api/img/*"] };
