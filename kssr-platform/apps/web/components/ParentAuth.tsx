"use client";
import { useState } from "react";
import { useProgress } from "@/lib/store";
import { audio } from "@/lib/audio";
import { login, register, type AccountDTO, type ChildDTO } from "@/lib/account";

export default function ParentAuth({
  onAuthed,
  onBack,
}: {
  onAuthed: (account: AccountDTO, children: ChildDTO[]) => void;
  onBack: () => void;
}) {
  const isMs = useProgress((s) => s.locale === "ms");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setErr("");
    audio.click();
    const res = mode === "register" ? await register(email, password, name) : await login(email, password);
    setBusy(false);
    if (!res.ok || !res.account) {
      setErr(res.error || (isMs ? "Ralat. Cuba lagi." : "Error. Try again."));
      return;
    }
    // load children
    const me = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" }).then((r) => r.json());
    onAuthed(res.account, me.children ?? []);
  };

  return (
    <main className="min-h-screen grid place-items-center p-4">
      <div className="card p-6 sm:p-8 w-full max-w-md animate-pop">
        <div className="text-center text-5xl animate-bobble">👨‍👩‍👧</div>
        <h1 className="font-display text-2xl text-center text-violet-700 mt-2">
          {isMs ? "Akaun Ibu Bapa" : "Parent Account"}
        </h1>
        <p className="text-soft text-center text-sm mb-4">
          {isMs ? "Simpan kemajuan setiap anak & pantau prestasi." : "Save each child's progress & track results."}
        </p>

        <div className="flex gap-2 mb-4">
          <button className={`btn !min-h-0 rounded-2xl px-4 py-2 flex-1 font-display ${mode === "login" ? "btn-sky" : ""}`} onClick={() => { audio.click(); setMode("login"); setErr(""); }}>
            {isMs ? "Log Masuk" : "Log In"}
          </button>
          <button className={`btn !min-h-0 rounded-2xl px-4 py-2 flex-1 font-display ${mode === "register" ? "btn-go" : ""}`} onClick={() => { audio.click(); setMode("register"); setErr(""); }}>
            {isMs ? "Daftar" : "Sign Up"}
          </button>
        </div>

        {mode === "register" && (
          <input className="w-full rounded-2xl px-4 py-3 bg-amber-50 border-[3px] border-amber-200 font-bold text-violet-800 mb-3 outline-none focus:border-amber-400"
            placeholder={isMs ? "Nama anda" : "Your name"} value={name} maxLength={40} onChange={(e) => setName(e.target.value)} />
        )}
        <input className="w-full rounded-2xl px-4 py-3 bg-amber-50 border-[3px] border-amber-200 font-bold text-violet-800 mb-3 outline-none focus:border-amber-400"
          type="email" placeholder="E-mel" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full rounded-2xl px-4 py-3 bg-amber-50 border-[3px] border-amber-200 font-bold text-violet-800 mb-3 outline-none focus:border-amber-400"
          type="password" placeholder={isMs ? "Kata laluan (min 6)" : "Password (min 6)"} value={password}
          onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />

        {err && <div className="text-sm font-bold text-red-500 mb-2 text-center">{err}</div>}

        <button className="btn btn-primary rounded-2xl px-6 py-4 font-display text-lg w-full" disabled={busy} onClick={submit}>
          {busy ? "…" : mode === "register" ? (isMs ? "Daftar Akaun" : "Create Account") : (isMs ? "Log Masuk" : "Log In")}
        </button>
        <button className="btn rounded-2xl px-6 py-2 w-full mt-2 text-sm" onClick={() => { audio.click(); onBack(); }}>
          ← {isMs ? "Kembali" : "Back"}
        </button>
        <p className="text-[11px] text-soft text-center mt-3">
          {isMs ? "Data anak disimpan dengan selamat. Mematuhi PDPA." : "Children's data is stored securely. PDPA-compliant."}
        </p>
      </div>
    </main>
  );
}
