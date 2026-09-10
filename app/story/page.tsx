import Image from "next/image";

import { Header } from "@/components/header";

export default function StoryPage() {
  return (
    <>
      <Header />
      <main className="container py-12">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="eyebrow">Our story</p>
            <h1 className="mt-3 text-5xl tracking-[-0.05em] text-[#1b120d]">Rooted in the Himalayas</h1>
            <p className="mt-5 text-lg text-[#54453f]">
              BERRIVA brings together the richness of sea buckthorn and the calm discipline of modern botanical skincare.
            </p>
            <p className="mt-4 text-base text-[#5d4d45]">
              We work with nature-inspired formulations that respect the power of the berry while creating elevated routines for skin, body, and daily wellness.
            </p>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-[#eadac2] bg-white p-3 shadow-sm">
            <Image src="https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=1200&q=80" alt="Himalayan berry landscape" width={1200} height={1100} className="h-[620px] w-full rounded-[1.5rem] object-cover" />
          </div>
        </div>
      </main>
    </>
  );
}
