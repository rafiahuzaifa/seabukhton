import { AnnouncementEditor, BannerManager, HeroEditor, HomepageExtrasEditor, NavigationEditor, StoryEditor } from "@/components/admin/cms-editors";
import { getAllNavigationItems, getAnnouncementBar, getHeroSection, getHomepageExtras, getStoryContent } from "@/lib/data/cms";
import { prisma } from "@/lib/prisma";

export default async function AdminCmsPage() {
  const [hero, announcement, banners, navigation, story, extras] = await Promise.all([
    getHeroSection(),
    prisma.homepageSection.findUnique({ where: { name: "announcement" } }),
    prisma.banner.findMany({ orderBy: { createdAt: "desc" } }),
    getAllNavigationItems(),
    getStoryContent(),
    getHomepageExtras(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Content</p>
        <h1 className="mt-2 text-4xl tracking-[-0.04em] text-[#1b120d]">CMS</h1>
      </div>

      <section>
        <h2 className="mb-3 text-xl font-medium text-[#1b120d]">Navigation menu</h2>
        <NavigationEditor items={navigation} />
      </section>

      <section>
        <h2 className="mb-3 text-xl font-medium text-[#1b120d]">Homepage hero</h2>
        <HeroEditor hero={hero} />
      </section>

      <section>
        <h2 className="mb-3 text-xl font-medium text-[#1b120d]">Announcement bar</h2>
        <AnnouncementEditor text={(announcement?.content as { text?: string })?.text ?? ""} isActive={announcement?.isActive ?? false} />
      </section>

      <section>
        <h2 className="mb-3 text-xl font-medium text-[#1b120d]">Promotional banners</h2>
        <BannerManager banners={banners} />
      </section>

      <section>
        <h2 className="mb-3 text-xl font-medium text-[#1b120d]">Homepage sections</h2>
        <p className="mb-3 text-sm text-[#7a6356]">Trust badges, the Golden Berry story block, the skincare routine, and the "From berry to bottle" journey.</p>
        <HomepageExtrasEditor extras={extras} />
      </section>

      <section>
        <h2 className="mb-3 text-xl font-medium text-[#1b120d]">Our Story page</h2>
        <StoryEditor story={story} />
      </section>
    </div>
  );
}
