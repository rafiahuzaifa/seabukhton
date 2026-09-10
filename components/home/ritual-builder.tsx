"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const options = ["Hydration", "Glow", "Nourishment", "Hair Care", "Daily Wellness"];

type Rec = { id: string; name: string; slug: string; image: string | null; category: string | null; price: number };

export function RitualBuilder() {
  const [active, setActive] = useState<string | null>(null);
  const [results, setResults] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSelect(option: string) {
    setActive(option);
    setLoading(true);
    try {
      const res = await fetch(`/api/recommend?benefit=${encodeURIComponent(option)}`);
      const data = await res.json();
      setResults(data.products ?? []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[2rem] border border-[#eadac2] bg-white p-7 shadow-sm">
      <p className="mb-5 text-lg text-[#4c3d37]">What are you looking for?</p>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => handleSelect(option)}
            className={`rounded-full border px-5 py-3 text-sm transition ${
              active === option
                ? "border-[#b98939] bg-[#f5e7d7] text-[#1b120d]"
                : "border-[#d7c1a2] bg-[#f8f1eb] text-[#2d231d] hover:border-[#b98939] hover:bg-[#f5e7d7]"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {!active ? (
          <p className="text-sm text-[#7a6356] md:col-span-3">Choose a focus above to see a personalized ritual.</p>
        ) : loading ? (
          <p className="text-sm text-[#7a6356] md:col-span-3">Finding your ritual…</p>
        ) : results.length ? (
          results.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="flex items-center gap-4 rounded-[1.4rem] border border-[#e7d9c9] bg-[#faf6f0] p-4 transition hover:border-[#c49242]"
            >
              {product.image ? (
                <Image src={product.image} alt={product.name} width={120} height={120} className="h-20 w-20 rounded-xl object-cover" />
              ) : (
                <div className="h-20 w-20 rounded-xl bg-[#f0e7dc]" />
              )}
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[#72655f]">{product.category}</p>
                <p className="mt-1 font-medium text-[#1b120d]">{product.name}</p>
                <p className="mt-1 text-sm text-[#5d4d45]">Rs. {product.price.toLocaleString()}</p>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-sm text-[#7a6356] md:col-span-3">No matches yet for this focus — explore the full shop instead.</p>
        )}
      </div>
    </div>
  );
}
