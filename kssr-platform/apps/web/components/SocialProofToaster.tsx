"use client";
import { useEffect, useRef, useState } from "react";
import { useProgress } from "@/lib/store";
import { fetchSocialProof, iconForType, subscribeSocial, type SocialItem } from "@/lib/socialProof";

const VISIBLE_MS = 5000; // within the 4–6s window
const GAP_MS = 1200;
const MIN_REPEAT_GAP_MS = 60000; // never repeat the same text within a minute

export default function SocialProofToaster() {
  const [current, setCurrent] = useState<SocialItem | null>(null);
  const [leaving, setLeaving] = useState(false);
  const queue = useRef<SocialItem[]>([]);
  const recent = useRef<Map<string, number>>(new Map());
  const busy = useRef(false);

  // Collect real, player-driven events.
  useEffect(() => {
    const unsub = subscribeSocial((item) => enqueue(item));
    return unsub;
  }, []);

  // Optional live API source (inert until an endpoint is configured).
  useEffect(() => {
    let stop = false;
    const poll = async () => {
      const payload = await fetchSocialProof();
      if (stop || !payload) return;
      const isMs = useProgress.getState().locale === "ms";
      if (payload.events.length) {
        for (const e of payload.events.slice(0, 6)) {
          enqueue({ id: e.id, text: e.text, icon: iconForType(e.type) });
        }
      } else {
        // No consented customer events → show REAL analytics (only if non-zero).
        const st = payload.stats;
        if (st.gamesThisWeek > 0) {
          enqueue({
            id: `stat-games-${st.gamesThisWeek}`,
            icon: "🎮",
            text: isMs ? `${st.gamesThisWeek} permainan dimainkan minggu ini` : `${st.gamesThisWeek} games played this week`,
          });
        }
        if (st.gamesToday > 0) {
          enqueue({
            id: `stat-today-${st.gamesToday}`,
            icon: "📅",
            text: isMs ? `${st.gamesToday} permainan dimainkan hari ini` : `${st.gamesToday} games played today`,
          });
        }
      }
    };
    void poll();
    const t = window.setInterval(poll, 45000);
    return () => {
      stop = true;
      window.clearInterval(t);
    };
  }, []);

  function enqueue(item: SocialItem) {
    const now = Date.now();
    const last = recent.current.get(item.text);
    if (last && now - last < MIN_REPEAT_GAP_MS) return; // avoid excessive repeats
    if (queue.current.length > 8) return; // cap backlog
    queue.current.push(item);
    pump();
  }

  function pump() {
    if (busy.current) return;
    const next = queue.current.shift();
    if (!next) return;
    busy.current = true;
    recent.current.set(next.text, Date.now());
    setLeaving(false);
    setCurrent(next);
    window.setTimeout(() => setLeaving(true), VISIBLE_MS);
    window.setTimeout(() => {
      setCurrent(null);
      busy.current = false;
      window.setTimeout(pump, GAP_MS);
    }, VISIBLE_MS + 450);
  }

  if (!current) return null;
  return (
    <div
      className={`fixed z-40 bottom-3 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-xs ${leaving ? "sp-out" : "sp-in"}`}
      role="status"
      aria-live="polite"
    >
      <div className="card p-3 flex items-center gap-3 sticker">
        <span className="text-2xl shrink-0">{current.icon}</span>
        <span className="text-sm font-bold leading-snug">{current.text}</span>
      </div>
    </div>
  );
}
