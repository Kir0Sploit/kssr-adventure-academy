"use client";
import { useEffect, useState, useCallback } from "react";
import { SUBJECTS } from "@kssr/shared";

type Tab = "overview" | "users" | "payments" | "reviews" | "questions" | "media" | "settings" | "subscribers";

async function jget(url: string) { return (await fetch(url, { cache: "no-store" })).json(); }
async function jsend(url: string, method: string, body: unknown) {
  return (await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) })).json();
}

export default function AdminPage() {
  const [me, setMe] = useState<{ role?: string; name?: string } | null | "loading">("loading");
  const [tab, setTab] = useState<Tab>("overview");

  const loadMe = useCallback(async () => {
    const r = await jget("/api/auth/me");
    setMe(r.account ?? null);
  }, []);
  useEffect(() => { void loadMe(); }, [loadMe]);

  if (me === "loading") return <div className="min-h-screen grid place-items-center font-display">…</div>;

  if (!me) return <Shell><AdminLogin onLoggedIn={loadMe} /></Shell>;

  if (me.role !== "admin") {
    return (
      <Shell>
        <div className="card p-6 max-w-md mx-auto text-center">
          <div className="text-4xl">⛔</div>
          <h1 className="font-display text-xl mt-2">Akses Ditolak</h1>
          <p className="text-soft text-sm mt-1">Akaun ini ({me.name}) bukan admin. Panel ini untuk pentadbir sahaja.</p>
          <button className="btn rounded-2xl px-6 py-3 font-display mt-4" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); loadMe(); }}>Log keluar</button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="font-display text-2xl text-violet-700">🛠️ Admin CMS</h1>
        <div className="flex items-center gap-3">
          <div className="text-sm text-soft">Log masuk sebagai <b>{me.name}</b> · admin</div>
          <button className="btn !min-h-0 rounded-xl px-3 py-2 text-sm" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); loadMe(); }}>Log keluar</button>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap mb-4">
        {(["overview", "users", "payments", "reviews", "questions", "media", "settings", "subscribers"] as Tab[]).map((t) => (
          <button key={t} className={`btn !min-h-0 rounded-2xl px-4 py-2 text-sm font-display ${tab === t ? "btn-primary" : ""}`} onClick={() => setTab(t)}>
            {({ overview: "Ringkasan", users: "Pengguna", payments: "Pembayaran", reviews: "Ulasan", questions: "Soalan", media: "Gambar", settings: "Tetapan", subscribers: "E-mel" } as Record<Tab, string>)[t]}
          </button>
        ))}
      </div>
      {tab === "overview" && <Overview />}
      {tab === "users" && <Users />}
      {tab === "payments" && <Payments />}
      {tab === "reviews" && <Reviews />}
      {tab === "questions" && <Questions />}
      {tab === "media" && <MediaManager />}
      {tab === "settings" && <Settings />}
      {tab === "subscribers" && <Subscribers />}
    </Shell>
  );
}

function AdminLogin({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (busy) return;
    setBusy(true); setErr("");
    const r = await jsend("/api/auth/login", "POST", { email, password });
    setBusy(false);
    if (r.ok) onLoggedIn(); else setErr(r.error || "Log masuk gagal");
  };
  return (
    <div className="card p-6 max-w-md mx-auto">
      <div className="text-center"><div className="text-4xl">🔒</div><h1 className="font-display text-xl mt-2">Log Masuk Admin</h1>
        <p className="text-soft text-sm mt-1">Masukkan e-mel & kata laluan akaun admin.</p></div>
      <div className="space-y-2 mt-4">
        <input className="w-full rounded-2xl px-4 py-3 bg-slate-50 border-2 border-slate-200 font-semibold outline-none focus:border-violet-400" type="email" placeholder="admin@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full rounded-2xl px-4 py-3 bg-slate-50 border-2 border-slate-200 font-semibold outline-none focus:border-violet-400" type="password" placeholder="Kata laluan" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
        <button className="btn btn-primary rounded-2xl px-6 py-3 font-display w-full" disabled={busy} onClick={submit}>{busy ? "…" : "Log Masuk"}</button>
        {err && <div className="text-red-500 text-sm text-center">{err}</div>}
      </div>
      <p className="text-soft text-xs text-center mt-3">Panel pentadbir sahaja. Hanya akaun admin yang dibenarkan log masuk di sini.</p>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen p-4 max-w-4xl mx-auto">{children}</main>;
}

function Overview() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  useEffect(() => { void jget("/api/admin/overview").then((r) => setStats(r.stats)); }, []);
  if (!stats) return <div className="text-soft">…</div>;
  const cards: [string, string][] = [
    ["Akaun", "accounts"], ["Pelanggan Bundle", "bundles"], ["Profil Anak", "children"],
    ["Permainan (minggu)", "playsWeek"], ["Jumlah Permainan", "plays"], ["Langganan E-mel", "subscribers"],
    ["Ulasan", "reviews"], ["Soalan Tersuai", "customQ"],
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map(([label, key]) => (
        <div key={key} className="card p-4 text-center">
          <div className="font-display text-3xl text-violet-700">{stats[key] ?? 0}</div>
          <div className="text-xs text-soft mt-1">{label}</div>
        </div>
      ))}
    </div>
  );
}

interface UserRow { id: string; email: string; name: string; plan: string; role: string; _count: { children: number } }
function Users() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const load = () => jget("/api/admin/users").then((r) => setUsers(r.users ?? []));
  useEffect(() => { void load(); }, []);
  return (
    <div className="card p-3 overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="text-left text-soft"><th className="p-2">E-mel</th><th className="p-2">Pelan</th><th className="p-2">Anak</th><th className="p-2"></th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-slate-100">
              <td className="p-2">{u.email}{u.role === "admin" && <span className="chip ml-1 px-1.5 text-[10px]">admin</span>}</td>
              <td className="p-2"><span className="chip px-2 py-0.5 text-xs" style={u.plan === "bundle" ? { color: "#7c5cff" } : {}}>{u.plan}</span></td>
              <td className="p-2">{u._count.children}</td>
              <td className="p-2 text-right whitespace-nowrap">
                <button className="btn !min-h-0 rounded-lg px-2 py-1 text-xs mr-1" onClick={async () => { await jsend("/api/admin/users", "PATCH", { id: u.id, plan: u.plan === "bundle" ? "free" : "bundle" }); load(); }}>
                  {u.plan === "bundle" ? "→ free" : "→ bundle"}
                </button>
                <button className="btn !min-h-0 rounded-lg px-2 py-1 text-xs text-red-500" onClick={async () => { if (confirm("Padam akaun ini?")) { await jsend("/api/admin/users", "DELETE", { id: u.id }); load(); } }}>Padam</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && <div className="text-soft text-sm p-3">Tiada pengguna.</div>}
    </div>
  );
}

interface ReviewRow { id: string; name: string; place?: string; text: string; rating: number; published: boolean }
function Reviews() {
  const [list, setList] = useState<ReviewRow[]>([]);
  const [f, setF] = useState({ name: "", place: "", text: "", rating: 5 });
  const load = () => jget("/api/admin/reviews").then((r) => setList(r.reviews ?? []));
  useEffect(() => { void load(); }, []);
  return (
    <div className="space-y-3">
      <div className="card p-4">
        <div className="font-display mb-2">Tambah Ulasan Sebenar</div>
        <div className="grid sm:grid-cols-2 gap-2">
          <input className="rounded-xl px-3 py-2 bg-slate-50 border-2 border-slate-200" placeholder="Nama" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <input className="rounded-xl px-3 py-2 bg-slate-50 border-2 border-slate-200" placeholder="Lokasi (cth: Shah Alam)" value={f.place} onChange={(e) => setF({ ...f, place: e.target.value })} />
        </div>
        <textarea className="w-full rounded-xl px-3 py-2 bg-slate-50 border-2 border-slate-200 mt-2" placeholder="Teks ulasan" value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} />
        <div className="flex items-center gap-2 mt-2">
          <label className="text-sm text-soft">Bintang</label>
          <select className="rounded-xl px-2 py-1 bg-slate-50 border-2 border-slate-200" value={f.rating} onChange={(e) => setF({ ...f, rating: Number(e.target.value) })}>{[5, 4, 3, 2, 1].map((n) => <option key={n}>{n}</option>)}</select>
          <button className="btn btn-go rounded-xl px-4 py-2 text-sm font-display ml-auto" onClick={async () => { const r = await jsend("/api/admin/reviews", "POST", f); if (r.ok) { setF({ name: "", place: "", text: "", rating: 5 }); load(); } }}>Simpan</button>
        </div>
      </div>
      {list.map((r) => (
        <div key={r.id} className="card p-3 flex items-start gap-2">
          <div className="flex-1"><div className="font-display text-sm">{r.name} <span className="text-amber-500">{"★".repeat(r.rating)}</span></div><div className="text-xs text-soft">{r.place}</div><div className="text-sm mt-1">{r.text}</div></div>
          <button className="btn !min-h-0 rounded-lg px-2 py-1 text-xs text-red-500" onClick={async () => { await jsend("/api/admin/reviews", "DELETE", { id: r.id }); load(); }}>Padam</button>
        </div>
      ))}
      {list.length === 0 && <div className="text-soft text-sm">Belum ada ulasan. Ulasan yang ditambah akan dipaparkan di halaman utama.</div>}
    </div>
  );
}

interface QRow { id: string; subject: string; year: number; promptEn: string; promptMs: string; options: string }
function Questions() {
  const [list, setList] = useState<QRow[]>([]);
  const [f, setF] = useState({ subject: "math", year: 1, promptEn: "", promptMs: "", o0: "", o1: "", o2: "", correct: 0 });
  const load = () => jget("/api/admin/challenges").then((r) => setList(r.items ?? []));
  useEffect(() => { void load(); }, []);
  const save = async () => {
    const options = [f.o0, f.o1, f.o2].filter((x) => x.trim()).map((label, i) => ({ label, correct: i === f.correct }));
    const r = await jsend("/api/admin/challenges", "POST", { subject: f.subject, year: f.year, promptEn: f.promptEn, promptMs: f.promptMs, options });
    if (r.ok) { setF({ ...f, promptEn: "", promptMs: "", o0: "", o1: "", o2: "", correct: 0 }); load(); }
    else alert(r.error || "Ralat");
  };
  return (
    <div className="space-y-3">
      <div className="card p-4">
        <div className="font-display mb-2">Tambah Soalan Tersuai (muncul dalam permainan)</div>
        <div className="flex gap-2 mb-2">
          <select className="rounded-xl px-2 py-2 bg-slate-50 border-2 border-slate-200" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })}>{SUBJECTS.map((s) => <option key={s.id} value={s.id}>{s.name.ms}</option>)}</select>
          <select className="rounded-xl px-2 py-2 bg-slate-50 border-2 border-slate-200" value={f.year} onChange={(e) => setF({ ...f, year: Number(e.target.value) })}>{[1, 2, 3, 4, 5, 6].map((y) => <option key={y} value={y}>Tahun {y}</option>)}</select>
        </div>
        <input className="w-full rounded-xl px-3 py-2 bg-slate-50 border-2 border-slate-200 mb-2" placeholder="Soalan (English)" value={f.promptEn} onChange={(e) => setF({ ...f, promptEn: e.target.value })} />
        <input className="w-full rounded-xl px-3 py-2 bg-slate-50 border-2 border-slate-200 mb-2" placeholder="Soalan (Bahasa Melayu)" value={f.promptMs} onChange={(e) => setF({ ...f, promptMs: e.target.value })} />
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-2 mb-1">
            <input type="radio" name="correct" checked={f.correct === i} onChange={() => setF({ ...f, correct: i })} />
            <input className="flex-1 rounded-xl px-3 py-2 bg-slate-50 border-2 border-slate-200" placeholder={`Pilihan ${i + 1}${i === 0 ? " (pilih radio = betul)" : ""}`} value={[f.o0, f.o1, f.o2][i] ?? ""} onChange={(e) => setF({ ...f, [`o${i}`]: e.target.value })} />
          </div>
        ))}
        <button className="btn btn-go rounded-xl px-4 py-2 text-sm font-display mt-2" onClick={save}>Simpan Soalan</button>
      </div>
      {list.map((q) => (
        <div key={q.id} className="card p-3 flex items-start gap-2">
          <div className="flex-1"><div className="text-xs text-soft">{q.subject} · Tahun {q.year}</div><div className="text-sm font-bold">{q.promptMs}</div><div className="text-xs text-soft">{(JSON.parse(q.options) as { label: string; correct: boolean }[]).map((o) => o.correct ? `✓${o.label}` : o.label).join(" · ")}</div></div>
          <button className="btn !min-h-0 rounded-lg px-2 py-1 text-xs text-red-500" onClick={async () => { await jsend("/api/admin/challenges", "DELETE", { id: q.id }); load(); }}>Padam</button>
        </div>
      ))}
      {list.length === 0 && <div className="text-soft text-sm">Belum ada soalan tersuai.</div>}
    </div>
  );
}

interface SubRow { id: string; email: string; createdAt: string }
function Subscribers() {
  const [list, setList] = useState<SubRow[]>([]);
  useEffect(() => { void jget("/api/admin/subscribers").then((r) => setList(r.subscribers ?? [])); }, []);
  return (
    <div className="card p-3">
      {list.length === 0 ? <div className="text-soft text-sm p-2">Tiada langganan e-mel.</div> : (
        <ul className="text-sm divide-y divide-slate-100">{list.map((s) => <li key={s.id} className="p-2 flex justify-between"><span>{s.email}</span><span className="text-soft text-xs">{new Date(s.createdAt).toLocaleDateString()}</span></li>)}</ul>
      )}
    </div>
  );
}

interface PayRow { id: string; email: string; name: string; createdAt: string }
function Payments() {
  const [list, setList] = useState<PayRow[]>([]);
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const load = () => jget("/api/admin/grant").then((r) => setList(r.accounts ?? []));
  useEffect(() => { void load(); }, []);
  const grant = async (plan: "free" | "bundle", e?: string) => {
    const target = e ?? email;
    if (!target) return;
    const r = await jsend("/api/admin/grant", "POST", { email: target, plan });
    setMsg(r.ok ? `✓ ${target} → ${plan}` : (r.error || "Ralat"));
    if (r.ok) { setEmail(""); load(); }
  };
  return (
    <div className="space-y-3">
      <div className="card p-4">
        <div className="font-display mb-1">Berikan Akses Bundle (pembayaran manual)</div>
        <p className="text-soft text-xs mb-2">Selepas sahkan pembayaran, masukkan e-mel pelanggan untuk membuka akses penuh.</p>
        <div className="flex gap-2">
          <input className="flex-1 rounded-xl px-3 py-2 bg-slate-50 border-2 border-slate-200" type="email" placeholder="emel@pelanggan.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="btn btn-go rounded-xl px-4 py-2 text-sm font-display" onClick={() => grant("bundle")}>Beri Bundle</button>
        </div>
        {msg && <div className="text-sm mt-2 text-violet-700">{msg}</div>}
      </div>
      <div className="card p-3 overflow-x-auto">
        <div className="font-display text-sm mb-2 px-1">Pelanggan Bundle ({list.length})</div>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-soft"><th className="p-2">E-mel</th><th className="p-2">Nama</th><th className="p-2">Tarikh</th><th className="p-2"></th></tr></thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="p-2">{u.email}</td><td className="p-2">{u.name}</td>
                <td className="p-2 text-soft text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="p-2 text-right"><button className="btn !min-h-0 rounded-lg px-2 py-1 text-xs text-red-500" onClick={() => grant("free", u.email)}>Tarik balik</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <div className="text-soft text-sm p-2">Belum ada pelanggan bundle.</div>}
      </div>
    </div>
  );
}

interface MediaRow { id: string; filename: string; url: string; mimeType: string; size: number }
function MediaManager() {
  const [list, setList] = useState<MediaRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const load = () => jget("/api/admin/media").then((r) => setList(r.media ?? []));
  useEffect(() => { void load(); }, []);
  const upload = async (file: File) => {
    setBusy(true); setErr("");
    const fd = new FormData(); fd.append("file", file);
    const r = await (await fetch("/api/admin/media", { method: "POST", body: fd })).json();
    setBusy(false);
    if (r.ok) load(); else setErr(r.error || "Muat naik gagal");
  };
  return (
    <div className="space-y-3">
      <div className="card p-4">
        <div className="font-display mb-1">Muat Naik Gambar</div>
        <p className="text-soft text-xs mb-2">PNG/JPG/WebP/GIF/SVG, maks 5MB. Salin URL untuk guna sebagai foto ulasan atau galeri.</p>
        <input type="file" accept="image/*" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
        {busy && <div className="text-soft text-sm mt-1">Memuat naik…</div>}
        {err && <div className="text-red-500 text-sm mt-1">{err}</div>}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {list.map((m) => (
          <div key={m.id} className="card p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.url} alt={m.filename} className="w-full h-28 object-cover rounded-xl bg-slate-100" />
            <div className="text-[10px] text-soft truncate mt-1" title={m.url}>{m.url}</div>
            <div className="flex gap-1 mt-1">
              <button className="btn !min-h-0 rounded-lg px-2 py-1 text-[11px] flex-1" onClick={() => navigator.clipboard?.writeText(m.url)}>Salin URL</button>
              <button className="btn !min-h-0 rounded-lg px-2 py-1 text-[11px] text-red-500" onClick={async () => { if (confirm("Padam gambar?")) { await jsend("/api/admin/media", "DELETE", { id: m.id }); load(); } }}>Padam</button>
            </div>
          </div>
        ))}
      </div>
      {list.length === 0 && <div className="text-soft text-sm">Belum ada gambar dimuat naik.</div>}
    </div>
  );
}

/** Convert epoch-ms to a value for <input type="datetime-local"> (local time). */
function toLocalInput(ms: number): string {
  if (!ms) return "";
  const d = new Date(ms - new Date().getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 16);
}
function Settings() {
  const [promo, setPromo] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => { void jget("/api/admin/settings").then((r) => { const v = Number(r.settings?.promoEndsAt || 0); if (v) setPromo(toLocalInput(v)); }); }, []);
  const save = async () => {
    const ms = promo ? new Date(promo).getTime() : 0;
    const r = await jsend("/api/admin/settings", "PUT", { promoEndsAt: String(ms) });
    if (r.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  };
  return (
    <div className="card p-4 max-w-lg">
      <div className="font-display mb-1">Pemasa Promosi</div>
      <p className="text-soft text-xs mb-3">Tetapkan tarikh/masa tamat promosi sebenar. Pemasa di halaman utama akan mengira detik ke masa ini dan hilang bila tamat. Kosongkan untuk menyembunyikan pemasa.</p>
      <div className="flex flex-wrap gap-2 items-center">
        <input type="datetime-local" className="rounded-xl px-3 py-2 bg-slate-50 border-2 border-slate-200" value={promo} onChange={(e) => setPromo(e.target.value)} />
        <button className="btn btn-go rounded-xl px-4 py-2 text-sm font-display" onClick={save}>Simpan</button>
        {promo && <button className="btn !min-h-0 rounded-xl px-3 py-2 text-sm text-red-500" onClick={() => setPromo("")}>Kosongkan</button>}
        {saved && <span className="text-green-600 text-sm">✓ Disimpan</span>}
      </div>
    </div>
  );
}
