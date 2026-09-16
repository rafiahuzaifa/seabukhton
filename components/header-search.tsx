"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";

type SearchResult = { id: string; name: string; slug: string; image: string | null; price: number; category: string | null };

const POPULAR = ["Radiance Serum", "Sea Buckthorn Oil", "Powder", "Hair Oil", "Bundles"];

export function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("herbova_search_history");
      if (stored) setHistory(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.products ?? []);
      } catch {
        setResults([]);
      }
    }, 220);
    return () => clearTimeout(timeout);
  }, [query]);

  function commitSearch(term: string) {
    if (!term.trim()) return;
    const next = [term, ...history.filter((h) => h !== term)].slice(0, 6);
    setHistory(next);
    try {
      localStorage.setItem("herbova_search_history", JSON.stringify(next));
    } catch {
      // ignore
    }
    setOpen(false);
    router.push(`/shop?q=${encodeURIComponent(term)}`);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        aria-label="Search"
        onClick={() => setOpen((v) => !v)}
        className="hidden rounded-full border border-[#dcc7ad] p-2.5 text-[#1b120d] transition hover:border-[#c49242] md:inline-flex"
      >
        <Search size={18} />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute right-0 top-full z-50 mt-3 w-[22rem] rounded-[1.5rem] border border-[#e6d8c8] bg-white p-4 shadow-xl"
          >
            <div className="flex items-center gap-2 rounded-full border border-[#dcc7ad] bg-[#faf7f3] px-4 py-2.5">
              <Search size={15} className="text-[#7a6356]" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitSearch(query);
                }}
                placeholder="Search products…"
                className="w-full bg-transparent text-sm text-[#1b120d] outline-none"
              />
              {query ? (
                <button aria-label="Clear" onClick={() => setQuery("")}>
                  <X size={14} className="text-[#7a6356]" />
                </button>
              ) : null}
            </div>

            <div className="mt-4 max-h-96 overflow-y-auto">
              {query.trim() ? (
                results.length ? (
                  <ul className="space-y-2">
                    {results.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/product/${p.slug}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-[#faf6f0]"
                        >
                          {p.image ? (
                            <Image src={p.image} alt={p.name} width={44} height={44} className="h-11 w-11 rounded-lg object-cover" />
                          ) : (
                            <div className="h-11 w-11 rounded-lg bg-[#f0e7dc]" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-[#1b120d]">{p.name}</p>
                            <p className="text-xs text-[#7a6356]">{p.category ?? ""}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-2 py-6 text-center text-sm text-[#7a6356]">
                    No results. Try{" "}
                    {POPULAR.slice(0, 3).map((term, i) => (
                      <span key={term}>
                        <button className="underline underline-offset-2" onClick={() => setQuery(term)}>
                          {term}
                        </button>
                        {i < 2 ? ", " : ""}
                      </span>
                    ))}
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  {history.length ? (
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.14em] text-[#9c8a7d]">Recent searches</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {history.map((term) => (
                          <button
                            key={term}
                            onClick={() => commitSearch(term)}
                            className="rounded-full border border-[#e6d8c8] px-3 py-1.5 text-xs text-[#4f3e36] hover:border-[#c49242]"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-[#9c8a7d]">Popular searches</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {POPULAR.map((term) => (
                        <button
                          key={term}
                          onClick={() => commitSearch(term)}
                          className="rounded-full bg-[#faf3e9] px-3 py-1.5 text-xs text-[#4f3e36] hover:bg-[#f2e6d5]"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
