"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { Banner } from "@prisma/client";

import {
  createBannerAction,
  deleteBannerAction,
  toggleBannerAction,
  updateAnnouncementAction,
  updateHeroAction,
  updateHomepageExtrasAction,
  updateNavigationAction,
  updateStoryAction,
} from "@/lib/actions/admin/cms";
import type { HeroContent, HomepageExtras, NavItem, StoryContent } from "@/lib/data/cms";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";

const inputClass = "w-full rounded-xl border border-[#dcc7ad] bg-[#faf7f3] px-3.5 py-2.5 text-sm text-[#1b120d] outline-none focus:border-[#c49242]";
const labelClass = "block text-xs uppercase tracking-[0.1em] text-[#8a7469] mb-1.5";

export function HeroEditor({ hero }: { hero: HeroContent }) {
  const [form, setForm] = useState({
    eyebrow: hero.eyebrow,
    headline: hero.headline,
    description: hero.description,
    primaryLabel: hero.primaryCta.label,
    primaryHref: hero.primaryCta.href,
    secondaryLabel: hero.secondaryCta.label,
    secondaryHref: hero.secondaryCta.href,
    image: hero.image,
    featuredProductSlug: hero.featuredProductSlug ?? "",
  });
  const [pending, startTransition] = useTransition();
  const { push } = useToast();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateHeroAction(form);
      if (result.success) {
        push("Hero section updated", "success");
        router.refresh();
      } else {
        push(result.error ?? "Something went wrong.", "error");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-[1.5rem] border border-[#eadac2] bg-white p-6 md:grid-cols-2">
      <div><label className={labelClass}>Eyebrow</label><input value={form.eyebrow} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} className={inputClass} /></div>
      <div><label className={labelClass}>Featured product slug</label><input value={form.featuredProductSlug} onChange={(e) => setForm({ ...form, featuredProductSlug: e.target.value })} className={inputClass} /></div>
      <div className="md:col-span-2"><label className={labelClass}>Headline</label><input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} className={inputClass} /></div>
      <div className="md:col-span-2"><label className={labelClass}>Description</label><textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} /></div>
      <div><label className={labelClass}>Primary button label</label><input value={form.primaryLabel} onChange={(e) => setForm({ ...form, primaryLabel: e.target.value })} className={inputClass} /></div>
      <div><label className={labelClass}>Primary button link</label><input value={form.primaryHref} onChange={(e) => setForm({ ...form, primaryHref: e.target.value })} className={inputClass} /></div>
      <div><label className={labelClass}>Secondary button label</label><input value={form.secondaryLabel} onChange={(e) => setForm({ ...form, secondaryLabel: e.target.value })} className={inputClass} /></div>
      <div><label className={labelClass}>Secondary button link</label><input value={form.secondaryHref} onChange={(e) => setForm({ ...form, secondaryHref: e.target.value })} className={inputClass} /></div>
      <div className="md:col-span-2"><label className={labelClass}>Background image URL</label><input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className={inputClass} /></div>
      <div className="md:col-span-2">
        <Button type="submit" disabled={pending} className="rounded-full px-5 py-2.5 text-[11px] tracking-[0.12em]">
          {pending ? "Saving…" : "Save hero section"}
        </Button>
      </div>
    </form>
  );
}

export function AnnouncementEditor({ text, isActive }: { text: string; isActive: boolean }) {
  const [value, setValue] = useState(text);
  const [active, setActive] = useState(isActive);
  const [pending, startTransition] = useTransition();
  const { push } = useToast();
  const router = useRouter();

  return (
    <div className="rounded-[1.5rem] border border-[#eadac2] bg-white p-6">
      <label className={labelClass}>Announcement bar text</label>
      <input value={value} onChange={(e) => setValue(e.target.value)} className={inputClass} />
      <label className="mt-3 flex items-center gap-2 text-sm text-[#4f3e36]">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Active
      </label>
      <Button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await updateAnnouncementAction(value, active);
            push("Announcement updated", "success");
            router.refresh();
          })
        }
        className="mt-3 rounded-full px-5 py-2.5 text-[11px] tracking-[0.12em]"
      >
        Save
      </Button>
    </div>
  );
}

export function BannerManager({ banners }: { banners: Banner[] }) {
  const [form, setForm] = useState({ title: "", subtitle: "", image: "", link: "" });
  const [pending, startTransition] = useTransition();
  const { push } = useToast();
  const router = useRouter();

  return (
    <div className="space-y-4">
      {banners.map((banner) => (
        <div key={banner.id} className="flex items-center justify-between rounded-[1.25rem] border border-[#eadac2] bg-white px-4 py-3">
          <div>
            <p className="font-medium text-[#1b120d]">{banner.title}</p>
            <p className="text-xs text-[#8a7469]">{banner.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={pending}
              onClick={() => startTransition(async () => { await toggleBannerAction(banner.id); router.refresh(); })}
              className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.1em] ${banner.isActive ? "bg-[#eaf3e6] text-[#3e5c37]" : "bg-[#f1ecec] text-[#6a5a55]"}`}
            >
              {banner.isActive ? "Active" : "Inactive"}
            </button>
            <button
              disabled={pending}
              onClick={() => startTransition(async () => { await deleteBannerAction(banner.id); router.refresh(); })}
              className="rounded-full border border-[#dcc7ad] p-1.5 text-[#a4372e]"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      ))}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            const result = await createBannerAction(form);
            if (result.success) {
              push("Banner created", "success");
              setForm({ title: "", subtitle: "", image: "", link: "" });
              router.refresh();
            } else {
              push(result.error ?? "Something went wrong.", "error");
            }
          });
        }}
        className="grid gap-3 rounded-[1.5rem] border border-[#eadac2] bg-[#faf6f1] p-5 md:grid-cols-2"
      >
        <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
        <input placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className={inputClass} />
        <input required placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className={inputClass} />
        <input placeholder="Link (optional)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className={inputClass} />
        <Button type="submit" disabled={pending} className="md:col-span-2 rounded-full px-5 py-2.5 text-[11px] tracking-[0.12em]">
          Add banner
        </Button>
      </form>
    </div>
  );
}

export function NavigationEditor({ items: initialItems }: { items: NavItem[] }) {
  const [items, setItems] = useState<NavItem[]>(initialItems);
  const [pending, startTransition] = useTransition();
  const { push } = useToast();
  const router = useRouter();

  function update(index: number, patch: Partial<NavItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function move(index: number, direction: -1 | 1) {
    setItems((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateNavigationAction({ items });
      if (result.success) {
        push("Navigation updated", "success");
        router.refresh();
      } else {
        push(result.error ?? "Something went wrong.", "error");
      }
    });
  }

  return (
    <div className="rounded-[1.5rem] border border-[#eadac2] bg-white p-6">
      <p className="text-sm text-[#7a6356]">These links drive the header navigation and mobile menu, in this order.</p>
      <div className="mt-4 space-y-2">
        {items.map((item, i) => {
          const active = item.active !== false;
          return (
            <div key={i} className={`flex items-center gap-2 rounded-xl border border-[#eadac2] p-2.5 ${active ? "bg-[#faf6f1]" : "bg-[#f1ecec] opacity-70"}`}>
              <input value={item.label} onChange={(e) => update(i, { label: e.target.value })} placeholder="Label" className={`flex-1 ${inputClass}`} />
              <input value={item.href} onChange={(e) => update(i, { href: e.target.value })} placeholder="/link" className={`flex-1 ${inputClass}`} />
              <button
                type="button"
                onClick={() => update(i, { active: !active })}
                className={`rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] ${active ? "bg-[#eaf3e6] text-[#3e5c37]" : "bg-[#f1ecec] text-[#6a5a55]"}`}
              >
                {active ? "On" : "Off"}
              </button>
              <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="rounded-full border border-[#dcc7ad] p-1.5 text-[#4f3e36] disabled:opacity-30">
                <ArrowUp size={13} />
              </button>
              <button type="button" disabled={i === items.length - 1} onClick={() => move(i, 1)} className="rounded-full border border-[#dcc7ad] p-1.5 text-[#4f3e36] disabled:opacity-30">
                <ArrowDown size={13} />
              </button>
              <button type="button" onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))} className="rounded-full border border-[#dcc7ad] p-1.5 text-[#a4372e]">
                <Trash2 size={13} />
              </button>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setItems((prev) => [...prev, { label: "New link", href: "/", active: true }])}
          className="gap-2 rounded-full px-4 py-2.5 text-[10px] tracking-[0.1em]"
        >
          <Plus size={13} /> Add link
        </Button>
        <Button type="button" disabled={pending} onClick={handleSave} className="rounded-full px-5 py-2.5 text-[11px] tracking-[0.12em]">
          {pending ? "Saving…" : "Save navigation"}
        </Button>
      </div>
    </div>
  );
}

export function StoryEditor({ story }: { story: StoryContent }) {
  const [form, setForm] = useState({
    eyebrow: story.eyebrow,
    headline: story.headline,
    image: story.image,
    paragraphsText: story.paragraphs.join("\n\n"),
  });
  const [pending, startTransition] = useTransition();
  const { push } = useToast();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const paragraphs = form.paragraphsText.split("\n\n").map((p) => p.trim()).filter(Boolean);
    startTransition(async () => {
      const result = await updateStoryAction({ eyebrow: form.eyebrow, headline: form.headline, image: form.image, paragraphs });
      if (result.success) {
        push("Our Story page updated", "success");
        router.refresh();
      } else {
        push(result.error ?? "Something went wrong.", "error");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-[1.5rem] border border-[#eadac2] bg-white p-6 md:grid-cols-2">
      <div><label className={labelClass}>Eyebrow</label><input value={form.eyebrow} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} className={inputClass} /></div>
      <div><label className={labelClass}>Headline</label><input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} className={inputClass} /></div>
      <div className="md:col-span-2"><label className={labelClass}>Image URL</label><input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className={inputClass} /></div>
      <div className="md:col-span-2">
        <label className={labelClass}>Paragraphs (blank line between each)</label>
        <textarea rows={6} value={form.paragraphsText} onChange={(e) => setForm({ ...form, paragraphsText: e.target.value })} className={inputClass} />
      </div>
      <div className="md:col-span-2">
        <Button type="submit" disabled={pending} className="rounded-full px-5 py-2.5 text-[11px] tracking-[0.12em]">
          {pending ? "Saving…" : "Save Our Story page"}
        </Button>
      </div>
    </form>
  );
}

export function HomepageExtrasEditor({ extras }: { extras: HomepageExtras }) {
  const [pillarsText, setPillarsText] = useState(extras.trustPillars.join("\n"));
  const [berry, setBerry] = useState({
    eyebrow: extras.goldenBerry.eyebrow,
    headline: extras.goldenBerry.headline,
    paragraphsText: extras.goldenBerry.paragraphs.join("\n\n"),
    image: extras.goldenBerry.image,
    ctaLabel: extras.goldenBerry.ctaLabel,
    ctaHref: extras.goldenBerry.ctaHref,
  });
  const [routine, setRoutine] = useState({
    eyebrow: extras.skincareRoutine.eyebrow,
    headline: extras.skincareRoutine.headline,
    steps: extras.skincareRoutine.steps,
  });
  const [journey, setJourney] = useState({
    eyebrow: extras.journey.eyebrow,
    headline: extras.journey.headline,
    steps: extras.journey.steps,
  });
  const [pending, startTransition] = useTransition();
  const { push } = useToast();
  const router = useRouter();

  function handleSave() {
    const payload: HomepageExtras = {
      trustPillars: pillarsText.split("\n").map((s) => s.trim()).filter(Boolean),
      goldenBerry: {
        eyebrow: berry.eyebrow,
        headline: berry.headline,
        paragraphs: berry.paragraphsText.split("\n\n").map((p) => p.trim()).filter(Boolean),
        image: berry.image,
        ctaLabel: berry.ctaLabel,
        ctaHref: berry.ctaHref,
      },
      skincareRoutine: routine,
      journey,
    };
    startTransition(async () => {
      const result = await updateHomepageExtrasAction(payload);
      if (result.success) {
        push("Homepage sections updated", "success");
        router.refresh();
      } else {
        push(result.error ?? "Something went wrong.", "error");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[1.5rem] border border-[#eadac2] bg-white p-6">
        <p className="text-sm font-medium text-[#1b120d]">Trust badges (one per line)</p>
        <textarea rows={5} value={pillarsText} onChange={(e) => setPillarsText(e.target.value)} className={`mt-3 ${inputClass}`} />
      </div>

      <div className="rounded-[1.5rem] border border-[#eadac2] bg-white p-6">
        <p className="text-sm font-medium text-[#1b120d]">"Meet the Golden Berry" section</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input value={berry.eyebrow} onChange={(e) => setBerry({ ...berry, eyebrow: e.target.value })} placeholder="Eyebrow" className={inputClass} />
          <input value={berry.headline} onChange={(e) => setBerry({ ...berry, headline: e.target.value })} placeholder="Headline" className={inputClass} />
          <input value={berry.ctaLabel} onChange={(e) => setBerry({ ...berry, ctaLabel: e.target.value })} placeholder="Button label" className={inputClass} />
          <input value={berry.ctaHref} onChange={(e) => setBerry({ ...berry, ctaHref: e.target.value })} placeholder="Button link" className={inputClass} />
          <input value={berry.image} onChange={(e) => setBerry({ ...berry, image: e.target.value })} placeholder="Image URL" className={`md:col-span-2 ${inputClass}`} />
          <textarea
            rows={4}
            value={berry.paragraphsText}
            onChange={(e) => setBerry({ ...berry, paragraphsText: e.target.value })}
            placeholder="Paragraphs (blank line between each)"
            className={`md:col-span-2 ${inputClass}`}
          />
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-[#eadac2] bg-white p-6">
        <p className="text-sm font-medium text-[#1b120d]">Skincare routine section</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input value={routine.eyebrow} onChange={(e) => setRoutine({ ...routine, eyebrow: e.target.value })} placeholder="Eyebrow" className={inputClass} />
          <input value={routine.headline} onChange={(e) => setRoutine({ ...routine, headline: e.target.value })} placeholder="Headline" className={inputClass} />
        </div>
        <div className="mt-3 space-y-2">
          {routine.steps.map((s, i) => (
            <div key={i} className="grid gap-2 rounded-xl border border-[#eadac2] bg-[#faf6f1] p-2.5 md:grid-cols-[1fr_1fr_auto]">
              <input
                value={s.step}
                onChange={(e) => setRoutine({ ...routine, steps: routine.steps.map((r, idx) => (idx === i ? { ...r, step: e.target.value } : r)) })}
                placeholder="Step name"
                className={inputClass}
              />
              <input
                value={s.product}
                onChange={(e) => setRoutine({ ...routine, steps: routine.steps.map((r, idx) => (idx === i ? { ...r, product: e.target.value } : r)) })}
                placeholder="Product"
                className={inputClass}
              />
              <button type="button" onClick={() => setRoutine({ ...routine, steps: routine.steps.filter((_, idx) => idx !== i) })} className="rounded-xl border border-[#eadac2] px-3 text-[#a4372e]">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setRoutine({ ...routine, steps: [...routine.steps, { step: "", product: "" }] })}
          className="mt-3 gap-2 rounded-full px-4 py-2.5 text-[10px] tracking-[0.1em]"
        >
          <Plus size={13} /> Add step
        </Button>
      </div>

      <div className="rounded-[1.5rem] border border-[#eadac2] bg-white p-6">
        <p className="text-sm font-medium text-[#1b120d]">"From berry to bottle" journey section</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input value={journey.eyebrow} onChange={(e) => setJourney({ ...journey, eyebrow: e.target.value })} placeholder="Eyebrow" className={inputClass} />
          <input value={journey.headline} onChange={(e) => setJourney({ ...journey, headline: e.target.value })} placeholder="Headline" className={inputClass} />
        </div>
        <div className="mt-3 space-y-2">
          {journey.steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2 rounded-xl border border-[#eadac2] bg-[#faf6f1] p-2.5">
              <input
                value={step}
                onChange={(e) => setJourney({ ...journey, steps: journey.steps.map((s, idx) => (idx === i ? e.target.value : s)) })}
                className={`flex-1 ${inputClass}`}
              />
              <button
                type="button"
                disabled={i === 0}
                onClick={() => {
                  const next = [...journey.steps];
                  [next[i - 1], next[i]] = [next[i], next[i - 1]];
                  setJourney({ ...journey, steps: next });
                }}
                className="rounded-full border border-[#dcc7ad] p-1.5 text-[#4f3e36] disabled:opacity-30"
              >
                <ArrowUp size={13} />
              </button>
              <button
                type="button"
                disabled={i === journey.steps.length - 1}
                onClick={() => {
                  const next = [...journey.steps];
                  [next[i + 1], next[i]] = [next[i], next[i + 1]];
                  setJourney({ ...journey, steps: next });
                }}
                className="rounded-full border border-[#dcc7ad] p-1.5 text-[#4f3e36] disabled:opacity-30"
              >
                <ArrowDown size={13} />
              </button>
              <button type="button" onClick={() => setJourney({ ...journey, steps: journey.steps.filter((_, idx) => idx !== i) })} className="rounded-full border border-[#dcc7ad] p-1.5 text-[#a4372e]">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setJourney({ ...journey, steps: [...journey.steps, "New step"] })}
          className="mt-3 gap-2 rounded-full px-4 py-2.5 text-[10px] tracking-[0.1em]"
        >
          <Plus size={13} /> Add step
        </Button>
      </div>

      <Button type="button" disabled={pending} onClick={handleSave} className="rounded-full px-6 py-3 text-[11px] tracking-[0.12em]">
        {pending ? "Saving…" : "Save homepage sections"}
      </Button>
    </div>
  );
}
