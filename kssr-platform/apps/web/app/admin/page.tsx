"use client";
import { useEffect, useState, useCallback } from "react";
import { SUBJECTS } from "@kssr/shared";

type Tab = "overview" | "users" | "reviews" | "questions" | "subscribers";

async function jget(url: string) { return (await fetch(url, { cache: "no-store" })).json(); }
async function jsend(url: string, method: string, body: unknown) {
  return (await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) })).json();
}

export default function AdminPage() {
  const [me, setMe] = useState<{ role?: string; name?: string } | null | "loading">("loading");
  const [code, setCode] = useState("");
  const [claimErr, setClaimErr] = useState("");
  const [tab, setTab] = useState<Tab>("overview");

  const loadMe = useCallback(async () => {
    const r = await jget("/api/auth/me");
    setMe(r.account ?? null);
  }, []);
  useEffect(() => { void loadMe(); }, [loadMe]);

  if (me === "loading") return <div className="min-h-screen grid place-items-center font-display">…</div>;

  if (!me) {
    return (
      <Shell>
        <div className="card p-6 max-w-md mx-auto text-center">
          <div className="text-4xl">🔒</div>
          <h1 className="font-display text-xl mt-2">Admin</h1>
          <p className="text-soft text-sm mt-1">Sila log masuk sebagai ibu bapa dahulu di halaman utama, kemudian kembali ke /admin.</p>
          <a href="/" className="btn btn-primary rounded-2xl px-6 py-3 font-display inline-block mt-4">Ke Halaman Utama</a>
        </div>
      </Shell>
    );
  }

  if (me.role !== "admin") {
    return (
      <Shell>
        <div className="card p-6 max-w-md mx-auto text-center">
          <div className="text-4xl">🛡️</div>
          <h1 className="font-display text-xl mt-2">Naik taraf ke Admin</h1>
          <p className="text-soft text-sm mt-1">Masukkan kod persediaan admin untuk akaun ini ({me.name}).</p>
          <div className="flex gap-2 mt-4">
            <input className="flex-1 rounded-2xl px-4 py-3 bg-slate-50 border-2 border-slate-200 font-bold outline-none focus:border-violet-400" placeholder="Kod persediaan" value={code} onChange={(e) => setCode(e.target.value)} />
            <button className="btn btn-go rounded-2xl px-5 py-3 font-display" onClick={async () => {
              const r = await jsend("/api/admin/claim", "POST", { code });
              if (r.ok) loadMe(); else setClaimErr(r.error || "Kod tidak sah");
            }}>Sahkan</button>
          </div>
          {claimErr && <div className="text-red-500 text-sm mt-2">{claimErr}</div>}
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="font-display text-2xl text-violet-700">🛠️ Admin CMS</h1>
        <div className="text-sm text-soft">Log masuk sebagai <b>{me.name}</b> · admin</div>
      </div>
      <div className="flex gap-2 flex-wrap mb-4">
        {(["overview", "users", "reviews", "questions", "subscribers"] as Tab[]).map((t) => (
          <button key={t} className={`btn !min-h-0 rounded-2xl px-4 py-2 text-sm font-display ${tab === t ? "btn-primary" : ""}`} onClick={() => setTab(t)}>
            {({ overview: "Ringkasan", users: "Pengguna", reviews: "Ulasan", questions: "Soalan", subscribers: "E-mel" } as Record<Tab, string>)[t]}
          </button>
        ))}
      </div>
      {tab === "overview" && <Overview />}
      {tab === "users" && <Users />}
      {tab === "reviews" && <Reviews />}
      {tab === "questions" && <Questions />}
      {tab === "subscribers" && <Subscribers />}
    </Shell>
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
