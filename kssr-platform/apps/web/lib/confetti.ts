"use client";
/** Lightweight DOM confetti — pure CSS particles, no dependencies. */
const COLORS = ["#ff5d8f", "#ffd23f", "#3bd16f", "#3b82f6", "#8b5cf6", "#06b6d4", "#ff8a3d"];

export function confetti(count = 26): void {
  if (typeof document === "undefined") return;
  const root = document.createElement("div");
  root.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden";
  document.body.appendChild(root);

  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    const size = 7 + Math.random() * 8;
    const left = Math.random() * 100;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)]!;
    const dur = 900 + Math.random() * 900;
    const rot = Math.random() * 720 - 360;
    const round = Math.random() < 0.5;
    p.style.cssText = `position:absolute;top:-20px;left:${left}vw;width:${size}px;height:${size}px;background:${color};border-radius:${round ? "50%" : "2px"};opacity:1;will-change:transform,opacity`;
    root.appendChild(p);
    p.animate(
      [
        { transform: "translateY(-10px) rotate(0deg)", opacity: 1 },
        { transform: `translateY(105vh) rotate(${rot}deg)`, opacity: 0.9 },
      ],
      { duration: dur, easing: "cubic-bezier(.2,.6,.4,1)", delay: Math.random() * 200 },
    );
  }
  setTimeout(() => root.remove(), 2200);
}
