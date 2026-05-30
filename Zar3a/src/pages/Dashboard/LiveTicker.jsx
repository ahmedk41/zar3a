import { useEffect, useRef } from "react";

const TICKER_ITEMS = [
  { label: "Wheat",     change: "+2.3%", price: "EGP 13,450/t", up: true,  icon: "🌾" },
  { label: "Cotton",    change: "+0.8%", price: "EGP 45,200/t", up: true,  icon: "☁️" },
  { label: "Sugarcane", change: "−1.1%", price: "EGP 1,480/t",  up: false, icon: "🎋" },
  { label: "Tomato",    change: "+4.5%", price: "EGP 6,300/t",  up: true,  icon: "🍅" },
  { label: "Citrus",    change: "−0.6%", price: "EGP 9,800/t",  up: false, icon: "🍊" },
  { label: "Onion",     change: "+1.2%", price: "EGP 3,200/t",  up: true,  icon: "🧅" },
];

export default function LiveTicker() {
  const scrollRef = useRef(null);

  // Pause on hover
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const pause = () => (el.style.animationPlayState = "paused");
    const play  = () => (el.style.animationPlayState = "running");
    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", play);
    return () => {
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", play);
    };
  }, []);

  // Duplicate items so the loop is seamless
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="flex items-center gap-3 bg-slate-900 dark:bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 overflow-hidden">
      {/* LIVE badge */}
      <div className="flex items-center gap-1.5 shrink-0 font-mono text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
        </span>
        LIVE
      </div>
      {/* Separator */}
      <div className="w-px h-4 bg-slate-700 shrink-0" />
      {/* Scrolling strip */}
      <div className="flex-1 overflow-hidden">
        <div
          ref={scrollRef}
          className="flex gap-6 whitespace-nowrap animate-ticker"
        >
          {items.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 font-mono text-[11px] text-slate-300"
            >
              <span>{item.icon}</span>
              <span className="font-bold text-white">{item.label}</span>
              <span className={item.up ? "text-emerald-400" : "text-red-400"}>
                {item.change}
              </span>
              <span className="text-slate-500">{item.price}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
