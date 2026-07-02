"use client";

import { useMemo, useState } from "react";
import { Check, Search, Type } from "lucide-react";
import { FONT_CATALOG, type FontEntry } from "@/lib/font-catalog";
import { cn } from "@/lib/utils";

interface FontPickerProps {
  value: string | undefined;
  onChange: (fontFamily: string | undefined) => void;
}

export function FontPicker({ value, onChange }: FontPickerProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FONT_CATALOG;
    return FONT_CATALOG.filter((f) => f.name.toLowerCase().includes(q) || f.category.includes(q));
  }, [query]);

  const grouped = useMemo(() => {
    const map = new Map<string, FontEntry[]>();
    filtered.forEach((f) => {
      if (!map.has(f.category)) map.set(f.category, []);
      map.get(f.category)!.push(f);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="space-y-2 w-full">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search fonts…"
          className="w-full h-8 pl-8 pr-2 text-xs rounded-md bg-zinc-900/50 border border-white/10 outline-none focus:border-white/30 text-white"
          autoFocus // Bagus untuk UX agar langsung bisa ngetik saat popover terbuka
        />
      </div>

      <div className="max-h-[200px] overflow-y-auto -mx-1 px-1 space-y-2 scrollbar-none">
        {grouped.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">No fonts match "{query}"</div>
        ) : (
          grouped.map(([category, fonts]) => (
            <div key={category} className="space-y-0.5">
              <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70 px-1.5 pt-1">{category}</div>
              {fonts.map((f) => {
                const isActive = value === f.name;
                return (
                  <button key={f.name} onClick={() => onChange(f.name)} className={cn("w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors text-left", isActive ? "bg-white/10" : "hover:bg-white/5")}>
                    <div className={cn("flex items-center justify-center size-6 rounded shrink-0 text-[10px]", isActive ? "bg-white text-zinc-900" : "bg-white/5 text-muted-foreground")}>
                      {isActive ? <Check className="size-3" /> : <Type className="size-3" />}
                    </div>
                    <span className={cn("text-sm leading-none truncate text-white", f.className)}>{f.name}</span>
                    {value === undefined && f.name === "Inter" && <span className="ml-auto text-[9px] text-muted-foreground/60 uppercase tracking-wider">Default</span>}
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
