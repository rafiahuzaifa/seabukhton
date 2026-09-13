import Image from "next/image";

import { Header } from "@/components/header";
import { getStoryContent } from "@/lib/data/cms";

export default async function StoryPage() {
  const story = await getStoryContent();

  return (
    <>
      <Header />
      <main className="container py-12">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="eyebrow">{story.eyebrow}</p>
            <h1 className="mt-3 text-5xl tracking-[-0.05em] text-[#1b120d]">{story.headline}</h1>
            {story.paragraphs.map((paragraph, i) => (
              <p key={i} className={i === 0 ? "mt-5 text-lg text-[#54453f]" : "mt-4 text-base text-[#5d4d45]"}>
                {paragraph}
              </p>
            ))}
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-[#eadac2] bg-white p-3 shadow-sm">
            <Image src={story.image} alt={story.headline} width={1200} height={1100} className="h-[620px] w-full rounded-[1.5rem] object-cover" />
          </div>
        </div>
      </main>
    </>
  );
}
