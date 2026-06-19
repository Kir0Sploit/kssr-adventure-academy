"use client";
import { useState } from "react";

/**
 * Shows an image if it exists at `src`, otherwise a clean "upload here"
 * placeholder. Drop real files into /public at the given path to replace it.
 * (Next image optimization is off, so a plain <img> is correct here.)
 */
export function ImageWithFallback({
  src,
  alt,
  label,
  className = "",
  aspect = "aspect-[4/3]",
}: {
  src: string;
  alt: string;
  label: string;
  className?: string;
  aspect?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className={`${aspect} ${className} rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 grid place-items-center text-center p-3`}>
        <div>
          <div className="text-3xl">🖼️</div>
          <div className="text-xs text-soft mt-1 font-bold">{label}</div>
          <code className="text-[10px] text-soft/80 break-all">{src}</code>
        </div>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} onError={() => setFailed(true)} className={`${aspect} ${className} w-full object-cover rounded-2xl`} />;
}
