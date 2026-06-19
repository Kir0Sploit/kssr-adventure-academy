"use client";
import { useState } from "react";
import { useProgress } from "@/lib/store";
import { audio } from "@/lib/audio";
import { addChild, type ChildDTO } from "@/lib/account";

const AVATARS = ["🦸", "🦸‍♀️", "🧒", "👧", "🧑‍🚀", "🥷", "🧝", "🦹"];

export default function ProfileSelect({
  accountName,
  plan,
  children,
  onSelect,
  onChildAdded,
  onLogout,
}: {
  accountName: string;
  plan: string;
  children: ChildDTO[];
  onSelect: (child: ChildDTO) => void;
  onChildAdded: (child: ChildDTO) => void;
  onLogout: () => void;
}) {
  const isMs = useProgress((s) => s.locale === "ms");
  const isBundle = plan === "bundle";
  const maxProfiles = isBundle ? 4 : 1;
  const [adding, setAdding] = useState(children.length === 0);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("🦸");
  const [year, setYear] = useState(1);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    if (busy || !name.trim()) return;
    setBusy(true);
    setErr("");
    audio.click();
    const res = await addChild(name.trim(), avatar, year);
    setBusy(false);
    if (res.ok && res.child) {
      onChildAdded(res.child);
      setAdding(false);
      setName("");
    } else {
      setErr(res.error || (isMs ? "Ralat." : "Error."));
    }
  };

  return (
    <main className="min-h-screen p-4 max-w-2xl mx-auto">
      <div className="card p-4 mb-4 flex items-center gap-3">
        <span className="text-3xl">👨‍👩‍👧</span>
        <div className="flex-1">
          <div className="font-display text-violet-700">{isMs ? "Selamat datang" : "Welcome"}, {accountName}!</div>
          <span className="chip inline-block px-2.5 py-0.5 text-xs mt-1" style={isBundle ? { color: "#7c5cff" } : {}}>
            {isBundle ? (isMs ? "🌟 Pakej Lengkap" : "🌟 Complete Bundle") : (isMs ? "Versi Percuma" : "Free Version")}
          </span>
        </div>
        <button className="btn !min-h-0 rounded-2xl px-3 py-2 text-sm" onClick={() => { audio.click(); onLogout(); }}>
          {isMs ? "Log Keluar" : "Log Out"}
        </button>
      </div>

      {!isBundle && (
        <div className="card p-4 mb-4" style={{ borderTop: "4px solid #7c5cff" }}>
          <div className="font-display text-violet-700">{isMs ? "Naik taraf ke Pakej Lengkap" : "Upgrade to the Complete Bundle"}</div>
          <p className="text-soft text-sm mt-1">{isMs ? "Buka semua permainan, soalan tanpa had, lembaran kerja, sijil & sehingga 4 profil anak." : "Unlock all games, unlimited questions, worksheets, certificates & up to 4 child profiles."}</p>
          <p className="text-soft text-xs mt-2">{isMs ? "Akses penuh diberikan melalui e-mel selepas pembayaran disahkan." : "Full access is granted by email once payment is confirmed."}</p>
          <a href="/#pricing" className="btn btn-primary rounded-2xl px-5 py-2.5 font-display mt-3 text-sm inline-block" onClick={() => audio.click()}>
            {isMs ? "Lihat Pakej" : "View Packages"}
          </a>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {children.map((c) => (
          <button key={c.id} className="btn card p-4 text-center" onClick={() => { audio.click(); onSelect(c); }}>
            <div className="text-5xl">{c.avatar}</div>
            <div className="font-display mt-1">{c.name}</div>
            <div className="chip inline-block px-2 py-0.5 text-xs mt-1">{isMs ? "Tahun" : "Year"} {c.year}</div>
          </button>
        ))}
        {!adding && children.length < maxProfiles && (
          <button className="btn card p-4 text-center grid place-items-center text-soft" onClick={() => { audio.click(); setAdding(true); }}>
            <div className="text-4xl">➕</div>
            <div className="font-display mt-1 text-sm">{isMs ? "Tambah Anak" : "Add Child"}</div>
          </button>
        )}
      </div>

      {adding && (
        <div className="card p-5 mt-4 animate-pop">
          <div className="font-display text-lg text-violet-700 mb-2">{isMs ? "Tambah Profil Anak" : "Add Child Profile"}</div>
          <div className="flex flex-wrap gap-2 mb-3">
            {AVATARS.map((a) => (
              <button key={a} className={`btn !min-h-0 text-2xl w-12 h-12 rounded-2xl grid place-items-center ${avatar === a ? "btn-primary scale-110" : ""}`} onClick={() => { audio.click(); setAvatar(a); }}>{a}</button>
            ))}
          </div>
          <input className="w-full rounded-2xl px-4 py-3 bg-slate-50 border-2 border-slate-200 font-bold text-slate-800 mb-3 outline-none focus:border-violet-400"
            placeholder={isMs ? "Nama anak" : "Child's name"} value={name} maxLength={20} onChange={(e) => setName(e.target.value)} />
          <div className="flex flex-wrap gap-2 mb-3">
            {[1, 2, 3, 4, 5, 6].map((y) => (
              <button key={y} className={`btn !min-h-0 rounded-full px-3 py-2 text-sm ${year === y ? "btn-go" : ""}`} onClick={() => { audio.click(); setYear(y); }}>
                {isMs ? "Tahun" : "Year"} {y}
              </button>
            ))}
          </div>
          {err && <div className="text-red-500 text-sm mb-2">{err}</div>}
          <button className="btn btn-primary rounded-2xl px-6 py-3 font-display w-full" disabled={busy} onClick={submit}>
            {busy ? "…" : isMs ? "Simpan" : "Save"}
          </button>
        </div>
      )}
    </main>
  );
}
