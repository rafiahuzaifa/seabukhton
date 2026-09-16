import bcrypt from "bcryptjs";

import { prisma } from "../lib/prisma";

const img = (id: string, w = 1000) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const IMAGES = {
  berries: img("1471193945509-9ad0617afabf"),
  berriesClose: img("1522335789203-aabd1fc54bc9"),
  himalaya: img("1490645935967-10de6ba17061"),
  oilBottle: img("1617897903246-719242758050"),
  oilTexture: img("1556228578-8c89e6adf883"),
  powder: img("1515377905703-c4788e51af15"),
  powderJar: img("1502741338009-cac2772e18bc"),
  faceWash: img("1556228720-195a672e8a03"),
  cream: img("1571781926291-c477ebfd024b"),
  bundle: img("1524504388940-b1c1722653e1"),
  serumDropper: img("1500530855697-b586d89ba3ee"),
  haircare: img("1521590832167-7bcbfaa6381f"),
  spa: img("1544005313-94ddf0286df2"),
  botanicals: img("1487412720507-e7ab37603c6f"),
  avatar1: img("1494790108377-be9c29b29330", 300),
  avatar2: img("1487412720507-e7ab37603c6f", 300),
  avatar3: img("1544005313-94ddf0286df2", 300),
};

async function main() {
  console.log("Seeding HERBOVA...");

  // --- Users -----------------------------------------------------------
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@herbova.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Herbova@Admin123";

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Herbova Admin",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { email: "staff@herbova.com" },
    update: {},
    create: {
      name: "Herbova Staff",
      email: "staff@herbova.com",
      passwordHash: await bcrypt.hash("Staff@12345", 12),
      role: "STAFF",
      emailVerified: new Date(),
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@herbova.com" },
    update: {},
    create: {
      name: "Amara Khan",
      email: "customer@herbova.com",
      passwordHash: await bcrypt.hash("Customer@123", 12),
      role: "CUSTOMER",
      emailVerified: new Date(),
      loyaltyPoints: 240,
    },
  });

  // --- Categories --------------------------------------------------------
  const categoryDefs = [
    { name: "Skincare", slug: "skincare", description: "Face wash, serums, oils, moisturizers and creams.", image: IMAGES.faceWash },
    { name: "Wellness", slug: "wellness", description: "Powder, berries, juice, tea, pulp and other wellness products.", image: IMAGES.powder },
    { name: "Haircare", slug: "haircare", description: "Shampoo, conditioner, hair oil, scalp serum and hair treatments.", image: IMAGES.haircare },
    { name: "Oils", slug: "oils", description: "Sea Buckthorn berry oil, seed oil and facial oils.", image: IMAGES.oilBottle },
    { name: "Bundles", slug: "bundles", description: "Premium curated product collections.", image: IMAGES.bundle },
  ];
  const categories: Record<string, Awaited<ReturnType<typeof prisma.category.upsert>>> = {};
  for (const c of categoryDefs) {
    categories[c.slug] = await prisma.category.upsert({ where: { slug: c.slug }, update: c, create: c });
  }

  // --- Collections ---------------------------------------------------
  const collectionDefs = [
    { name: "Bestsellers", slug: "bestsellers", description: "Our most-loved rituals, chosen by the community.", image: IMAGES.oilBottle },
    { name: "New Arrivals", slug: "new-arrivals", description: "Freshly formulated additions to the HERBOVA line.", image: IMAGES.serumDropper },
    { name: "Himalayan Origins", slug: "himalayan-origins", description: "Sourced from the high-altitude sea buckthorn groves of the Himalayas.", image: IMAGES.himalaya },
  ];
  const collections: Record<string, Awaited<ReturnType<typeof prisma.collection.upsert>>> = {};
  for (const c of collectionDefs) {
    collections[c.slug] = await prisma.collection.upsert({ where: { slug: c.slug }, update: c, create: c });
  }

  // --- Ingredients -------------------------------------------------------
  const ingredientDefs = [
    { name: "Omega 3", slug: "omega-3", description: "A foundational plant lipid that supports the skin barrier and everyday nourishment." },
    { name: "Omega 6", slug: "omega-6", description: "Helps support skin comfort, softness, and a smooth-feeling finish." },
    { name: "Omega 7", slug: "omega-7", description: "A distinctive berry lipid commonly associated with conditioning and moisture support." },
    { name: "Omega 9", slug: "omega-9", description: "Helps support a cushiony, supple feel in skincare and wellness formulas." },
    { name: "Vitamin E", slug: "vitamin-e", description: "Recognized for helping protect skin from environmental stress and support a healthy-looking glow." },
    { name: "Carotenoids", slug: "carotenoids", description: "Naturally vibrant plant compounds that contribute to the berry's golden, antioxidant-rich profile." },
    { name: "Flavonoids", slug: "flavonoids", description: "Plant compounds valued for their antioxidant qualities and botanical richness." },
  ];
  const ingredients: Record<string, Awaited<ReturnType<typeof prisma.ingredient.upsert>>> = {};
  for (const i of ingredientDefs) {
    ingredients[i.slug] = await prisma.ingredient.upsert({ where: { slug: i.slug }, update: i, create: i });
  }

  // --- Products ------------------------------------------------------
  type ProductSeed = {
    name: string; slug: string; categorySlug: string; collectionSlug?: string;
    shortDescription: string; description: string; price: number; salePrice?: number;
    sku: string; stock: number; images: string[]; productType: string; benefit: string;
    skinConcern?: string; format: string; isFeatured?: boolean; isNew?: boolean;
    ingredientNotes: string; usageInstructions: string; rating: number; reviewCount: number;
    variants?: { name: string; sku: string; price: number; salePrice?: number; stock: number }[];
    ingredientSlugs: string[];
  };

  const productDefs: ProductSeed[] = [
    {
      name: "Pure Sea Buckthorn Oil", slug: "pure-sea-buckthorn-oil", categorySlug: "oils", collectionSlug: "bestsellers",
      shortDescription: "Cold-pressed berry oil for skin nourishment and vitality.",
      description: "A deeply restorative facial oil infused with Himalayan sea buckthorn for a fresh, healthy glow and soft daily moisture.",
      price: 2100, salePrice: 1890, sku: "SBO-001", stock: 48, images: [IMAGES.oilBottle, IMAGES.oilTexture, IMAGES.berriesClose],
      productType: "Facial Oil", benefit: "Glow", skinConcern: "Dryness", format: "30 ml", isFeatured: true,
      ingredientNotes: "Cold-pressed sea buckthorn berry oil with naturally occurring omega fatty acids and carotenoids.",
      usageInstructions: "Warm 2-3 drops between palms and press into cleansed skin morning and night.",
      rating: 4.9, reviewCount: 184,
      variants: [
        { name: "30 ml", sku: "SBO-001-30", price: 2100, salePrice: 1890, stock: 30 },
        { name: "50 ml", sku: "SBO-001-50", price: 3200, salePrice: 2890, stock: 18 },
      ],
      ingredientSlugs: ["omega-7", "omega-3", "vitamin-e", "carotenoids"],
    },
    {
      name: "Sea Buckthorn Seed Oil", slug: "sea-buckthorn-seed-oil", categorySlug: "oils",
      shortDescription: "A lighter, fast-absorbing seed oil for daily conditioning.",
      description: "Pressed from the seed rather than the berry, this lighter oil absorbs quickly while still delivering the botanical richness sea buckthorn is known for.",
      price: 1950, sku: "SSO-001", stock: 26, images: [IMAGES.oilTexture, IMAGES.oilBottle],
      productType: "Facial Oil", benefit: "Nourishment", skinConcern: "Dullness", format: "30 ml",
      ingredientNotes: "Sea buckthorn seed oil rich in omega 3 and omega 6 fatty acids.",
      usageInstructions: "Apply a few drops as the last step of your evening routine.",
      rating: 4.7, reviewCount: 63,
      ingredientSlugs: ["omega-3", "omega-6", "vitamin-e"],
    },
    {
      name: "Radiance Serum", slug: "sea-buckthorn-radiance-serum", categorySlug: "skincare", collectionSlug: "bestsellers",
      shortDescription: "A brightening serum that supports soft, luminous skin.",
      description: "Lightweight and replenishing, this serum helps reveal a fresh-looking complexion with a smoothing, luminous finish.",
      price: 2600, salePrice: 2350, sku: "RS-001", stock: 52, images: [IMAGES.serumDropper, IMAGES.berriesClose, IMAGES.cream],
      productType: "Serum", benefit: "Glow", skinConcern: "Dullness", format: "30 ml", isFeatured: true,
      ingredientNotes: "A blend of sea buckthorn extract, vitamin E and naturally occurring flavonoids.",
      usageInstructions: "Press 2-3 drops into skin after cleansing, before moisturizer.",
      rating: 5, reviewCount: 122,
      variants: [
        { name: "15 ml", sku: "RS-001-15", price: 1600, stock: 20 },
        { name: "30 ml", sku: "RS-001-30", price: 2600, salePrice: 2350, stock: 32 },
      ],
      ingredientSlugs: ["vitamin-e", "flavonoids", "carotenoids"],
    },
    {
      name: "Vitamin C + Sea Buckthorn Serum", slug: "vitamin-c-sea-buckthorn-serum", categorySlug: "skincare",
      shortDescription: "A brightening daily duo for an even, radiant-looking tone.",
      description: "Vitamin C meets sea buckthorn botanicals in a silky serum designed to support an even, radiant-looking complexion over time.",
      price: 2850, sku: "VCS-001", stock: 21, images: [IMAGES.serumDropper, IMAGES.faceWash],
      productType: "Serum", benefit: "Glow", skinConcern: "Uneven tone", format: "30 ml", isNew: true,
      ingredientNotes: "Vitamin C paired with sea buckthorn flavonoids and carotenoids.",
      usageInstructions: "Use in the morning before sunscreen for best results.",
      rating: 4.8, reviewCount: 39,
      ingredientSlugs: ["flavonoids", "carotenoids", "vitamin-e"],
    },
    {
      name: "Sea Buckthorn Face Wash", slug: "sea-buckthorn-face-wash", categorySlug: "skincare",
      shortDescription: "A gentle cleanser for fresh, balanced skin.",
      description: "This creamy face wash lathers into a soft cushion while helping remove daily buildup without stripping the skin.",
      price: 1700, sku: "SBF-001", stock: 64, images: [IMAGES.faceWash, IMAGES.berriesClose],
      productType: "Cleanser", benefit: "Hydration", skinConcern: "Sensitivity", format: "120 ml",
      ingredientNotes: "Gentle, sulfate-conscious formula with sea buckthorn extract.",
      usageInstructions: "Massage onto damp skin morning and night, then rinse.",
      rating: 4.7, reviewCount: 88,
      ingredientSlugs: ["omega-6", "vitamin-e"],
    },
    {
      name: "Hydrating Serum", slug: "hydrating-serum", categorySlug: "skincare",
      shortDescription: "A moisture-locking serum for a plump, dewy finish.",
      description: "A humectant-rich serum that helps skin feel cushioned and hydrated throughout the day.",
      price: 2400, sku: "HYS-001", stock: 30, images: [IMAGES.serumDropper, IMAGES.cream],
      productType: "Serum", benefit: "Hydration", skinConcern: "Dryness", format: "30 ml",
      ingredientNotes: "Sea buckthorn botanicals combined with a lightweight hydrating base.",
      usageInstructions: "Apply to damp skin and follow with a moisturizer to seal in hydration.",
      rating: 4.8, reviewCount: 54,
      ingredientSlugs: ["omega-9", "vitamin-e"],
    },
    {
      name: "Day Cream", slug: "sea-buckthorn-day-cream", categorySlug: "skincare",
      shortDescription: "A lightweight daily moisturizer with a soft satin finish.",
      description: "A comfortable, non-greasy day cream that layers beautifully under makeup or SPF.",
      price: 2200, sku: "DC-001", stock: 33, images: [IMAGES.cream, IMAGES.faceWash],
      productType: "Moisturizer", benefit: "Hydration", skinConcern: "Dryness", format: "50 ml",
      ingredientNotes: "Sea buckthorn oil blended with omega-rich plant emollients.",
      usageInstructions: "Apply generously each morning after serum.",
      rating: 4.6, reviewCount: 41,
      ingredientSlugs: ["omega-9", "omega-6"],
    },
    {
      name: "Night Cream", slug: "sea-buckthorn-night-cream", categorySlug: "skincare",
      shortDescription: "A rich overnight cream for restorative comfort.",
      description: "A deeply nourishing night cream formulated to support skin's natural overnight recovery.",
      price: 2450, sku: "NC-001", stock: 27, images: [IMAGES.cream, IMAGES.berriesClose],
      productType: "Moisturizer", benefit: "Nourishment", skinConcern: "Dryness", format: "50 ml",
      ingredientNotes: "A richer concentration of sea buckthorn oil, vitamin E and carotenoids.",
      usageInstructions: "Apply as the final step of your evening ritual.",
      rating: 4.8, reviewCount: 47,
      ingredientSlugs: ["vitamin-e", "carotenoids", "omega-9"],
    },
    {
      name: "Nourishing Lip Balm", slug: "sea-buckthorn-lip-balm", categorySlug: "skincare",
      shortDescription: "A softening balm for comfortable, conditioned lips.",
      description: "A pocket-sized balm with a golden tint and a soft, cushiony melt.",
      price: 950, sku: "LB-001", stock: 80, images: [IMAGES.botanicals, IMAGES.cream],
      productType: "Lip Care", benefit: "Nourishment", skinConcern: "Dryness", format: "8 g",
      ingredientNotes: "Sea buckthorn oil with a nourishing botanical butter base.",
      usageInstructions: "Apply throughout the day as needed.",
      rating: 4.9, reviewCount: 76,
      ingredientSlugs: ["omega-7", "vitamin-e"],
    },
    {
      name: "Body Butter", slug: "sea-buckthorn-body-butter", categorySlug: "skincare",
      shortDescription: "A whipped, deeply conditioning body butter.",
      description: "A luxuriously whipped butter that melts into skin, leaving a soft, satin-smooth finish.",
      price: 2900, sku: "BB-001", stock: 22, images: [IMAGES.cream, IMAGES.spa],
      productType: "Body Care", benefit: "Nourishment", skinConcern: "Dryness", format: "200 g",
      ingredientNotes: "Sea buckthorn oil blended with rich botanical butters.",
      usageInstructions: "Massage into skin after bathing while skin is slightly damp.",
      rating: 4.8, reviewCount: 35,
      ingredientSlugs: ["omega-9", "omega-7"],
    },
    {
      name: "Sea Buckthorn Powder", slug: "sea-buckthorn-powder", categorySlug: "wellness", collectionSlug: "bestsellers",
      shortDescription: "A nutrient-rich daily botanical blend for wellness rituals.",
      description: "This vibrant powder brings the mountain berry into your everyday routine with a smooth, naturally fruity finish.",
      price: 1800, salePrice: 1600, sku: "SBP-001", stock: 40, images: [IMAGES.powder, IMAGES.powderJar, IMAGES.himalaya],
      productType: "Powder", benefit: "Nourishment", skinConcern: "Daily wellness", format: "100 g", isNew: true, isFeatured: true,
      ingredientNotes: "100% dried, milled sea buckthorn berry.",
      usageInstructions: "Stir a teaspoon into water, smoothies or your favorite recipe daily.",
      rating: 4.8, reviewCount: 96,
      variants: [
        { name: "100 g", sku: "SBP-001-100", price: 1800, salePrice: 1600, stock: 26 },
        { name: "250 g", sku: "SBP-001-250", price: 3600, salePrice: 3200, stock: 14 },
      ],
      ingredientSlugs: ["carotenoids", "flavonoids", "vitamin-e"],
    },
    {
      name: "Dried Sea Buckthorn Berries", slug: "dried-sea-buckthorn-berries", categorySlug: "wellness",
      shortDescription: "Sun-dried whole berries for snacking and infusions.",
      description: "Whole, naturally sun-dried sea buckthorn berries with a distinctive golden-orange hue.",
      price: 1400, sku: "DSB-001", stock: 35, images: [IMAGES.berries, IMAGES.himalaya],
      productType: "Dried Fruit", benefit: "Daily Wellness", skinConcern: "Daily wellness", format: "150 g",
      ingredientNotes: "Whole dried sea buckthorn berries.",
      usageInstructions: "Enjoy as a snack, or steep in hot water for a natural infusion.",
      rating: 4.6, reviewCount: 28,
      ingredientSlugs: ["carotenoids", "flavonoids"],
    },
    {
      name: "Sea Buckthorn Pulp", slug: "sea-buckthorn-pulp", categorySlug: "wellness",
      shortDescription: "A concentrated berry pulp for culinary and wellness use.",
      description: "A rich, spoonable pulp made from pressed sea buckthorn berries.",
      price: 1650, sku: "SBPL-001", stock: 24, images: [IMAGES.powderJar, IMAGES.berries],
      productType: "Pulp", benefit: "Daily Wellness", skinConcern: "Daily wellness", format: "200 g",
      ingredientNotes: "Pressed sea buckthorn berry pulp.",
      usageInstructions: "Stir into yogurt, oats or beverages.",
      rating: 4.5, reviewCount: 19,
      ingredientSlugs: ["carotenoids", "omega-7"],
    },
    {
      name: "Sea Buckthorn Juice", slug: "sea-buckthorn-juice", categorySlug: "wellness",
      shortDescription: "A tangy, cold-pressed daily wellness shot.",
      description: "A vibrant, cold-pressed juice concentrate to add to water or drink as a daily shot.",
      price: 1950, sku: "SBJ-001", stock: 30, images: [IMAGES.himalaya, IMAGES.berries],
      productType: "Juice", benefit: "Daily Wellness", skinConcern: "Daily wellness", format: "500 ml",
      ingredientNotes: "Cold-pressed sea buckthorn berry juice concentrate.",
      usageInstructions: "Dilute one part juice with three parts water, or take as a daily shot.",
      rating: 4.7, reviewCount: 33,
      ingredientSlugs: ["flavonoids", "carotenoids"],
    },
    {
      name: "Sea Buckthorn Tea", slug: "sea-buckthorn-tea", categorySlug: "wellness",
      shortDescription: "A comforting botanical tea blend.",
      description: "A soothing blend of dried sea buckthorn berries and complementary botanicals.",
      price: 1500, sku: "SBT-001", stock: 45, images: [IMAGES.botanicals, IMAGES.powder],
      productType: "Tea", benefit: "Daily Wellness", skinConcern: "Daily wellness", format: "20 sachets",
      ingredientNotes: "Dried sea buckthorn berries with a light botanical tea blend.",
      usageInstructions: "Steep one sachet in hot water for 4-5 minutes.",
      rating: 4.6, reviewCount: 22,
      ingredientSlugs: ["flavonoids"],
    },
    {
      name: "Sea Buckthorn Jam", slug: "sea-buckthorn-jam", categorySlug: "wellness",
      shortDescription: "A small-batch preserve with a distinctive golden tang.",
      description: "A naturally tart, small-batch preserve made from ripe sea buckthorn berries.",
      price: 1200, sku: "SBJM-001", stock: 38, images: [IMAGES.powderJar, IMAGES.berries],
      productType: "Preserve", benefit: "Daily Wellness", skinConcern: "Daily wellness", format: "250 g",
      ingredientNotes: "Sea buckthorn berries and natural sweeteners.",
      usageInstructions: "Enjoy with toast, yogurt or as a glaze.",
      rating: 4.5, reviewCount: 17,
      ingredientSlugs: ["carotenoids"],
    },
    {
      name: "Sea Buckthorn Shampoo", slug: "sea-buckthorn-shampoo", categorySlug: "haircare",
      shortDescription: "A gentle, clarifying shampoo for everyday use.",
      description: "A gentle shampoo that cleanses while helping hair feel soft and conditioned.",
      price: 1850, sku: "SH-001", stock: 41, images: [IMAGES.haircare, IMAGES.spa],
      productType: "Shampoo", benefit: "Hair Care", skinConcern: "Scalp balance", format: "250 ml",
      ingredientNotes: "Sea buckthorn extract in a gentle, everyday cleansing base.",
      usageInstructions: "Lather into wet hair, leave for a minute, then rinse thoroughly.",
      rating: 4.6, reviewCount: 44,
      ingredientSlugs: ["omega-6", "vitamin-e"],
    },
    {
      name: "Sea Buckthorn Conditioner", slug: "sea-buckthorn-conditioner", categorySlug: "haircare",
      shortDescription: "A smoothing conditioner for soft, manageable hair.",
      description: "A rich conditioner that helps detangle and soften hair from root to tip.",
      price: 1900, sku: "CN-001", stock: 37, images: [IMAGES.haircare, IMAGES.cream],
      productType: "Conditioner", benefit: "Hair Care", skinConcern: "Frizz", format: "250 ml",
      ingredientNotes: "Sea buckthorn oil combined with conditioning botanicals.",
      usageInstructions: "Apply to mid-lengths and ends after shampooing, rinse after 2-3 minutes.",
      rating: 4.7, reviewCount: 31,
      ingredientSlugs: ["omega-9", "vitamin-e"],
    },
    {
      name: "Sea Buckthorn Hair Oil", slug: "sea-buckthorn-hair-oil", categorySlug: "haircare",
      shortDescription: "A lightweight oil for shine and softness.",
      description: "A fast-absorbing hair oil that adds shine without weighing hair down.",
      price: 2100, sku: "HO-001", stock: 26, images: [IMAGES.oilBottle, IMAGES.haircare],
      productType: "Hair Oil", benefit: "Hair Care", skinConcern: "Dullness", format: "100 ml",
      ingredientNotes: "Sea buckthorn oil blended with lightweight carrier oils.",
      usageInstructions: "Apply a few drops through mid-lengths and ends, or use as a pre-wash treatment.",
      rating: 4.7, reviewCount: 25,
      ingredientSlugs: ["omega-7", "omega-9"],
    },
    {
      name: "Scalp Serum", slug: "sea-buckthorn-scalp-serum", categorySlug: "haircare",
      shortDescription: "A soothing serum for scalp comfort and balance.",
      description: "A lightweight leave-in serum designed to support a comfortable, balanced-feeling scalp.",
      price: 2300, sku: "SS-001", stock: 18, images: [IMAGES.haircare, IMAGES.serumDropper],
      productType: "Scalp Care", benefit: "Hair Care", skinConcern: "Scalp balance", format: "50 ml",
      ingredientNotes: "Sea buckthorn extract with a soothing botanical base.",
      usageInstructions: "Apply directly to the scalp and massage gently; do not rinse.",
      rating: 4.5, reviewCount: 14,
      ingredientSlugs: ["omega-6", "flavonoids"],
    },
    // Bundles
    {
      name: "Glow Ritual", slug: "glow-ritual-bundle", categorySlug: "bundles",
      shortDescription: "Radiance Serum, Pure Berry Oil and Day Cream, together.",
      description: "A curated three-step ritual for a luminous, well-nourished complexion — pairing our Radiance Serum, Pure Sea Buckthorn Oil and Day Cream.",
      price: 6200, salePrice: 5590, sku: "BND-GLOW", stock: 20, images: [IMAGES.bundle, IMAGES.serumDropper],
      productType: "Bundle", benefit: "Glow", format: "3-piece ritual", isFeatured: true,
      ingredientNotes: "Includes Radiance Serum, Pure Sea Buckthorn Oil and Day Cream.",
      usageInstructions: "Layer serum, then oil, then cream as part of your daily routine.",
      rating: 4.9, reviewCount: 41,
      ingredientSlugs: ["flavonoids", "omega-7", "vitamin-e"],
    },
    {
      name: "Daily Wellness Kit", slug: "daily-wellness-kit", categorySlug: "bundles",
      shortDescription: "A ritual designed for everyday balance and vitality.",
      description: "Contains a curated selection of wellness essentials — powder, tea and dried berries — for a clean, nourishing everyday routine.",
      price: 5400, salePrice: 4890, sku: "BND-DWK", stock: 18, images: [IMAGES.bundle, IMAGES.powder, IMAGES.himalaya],
      productType: "Bundle", benefit: "Daily Wellness", format: "Complete ritual", isFeatured: true,
      ingredientNotes: "Includes Sea Buckthorn Powder, Tea and Dried Berries.",
      usageInstructions: "Enjoy the powder daily, sip the tea, and snack on dried berries.",
      rating: 4.9, reviewCount: 71,
      ingredientSlugs: ["carotenoids", "flavonoids"],
    },
    {
      name: "Himalayan Essentials", slug: "himalayan-essentials-bundle", categorySlug: "bundles", collectionSlug: "himalayan-origins",
      shortDescription: "A signature edit of our most iconic Himalayan formulas.",
      description: "The definitive HERBOVA introduction — Pure Sea Buckthorn Oil, Powder and Face Wash in one giftable edit.",
      price: 5600, sku: "BND-HIM", stock: 15, images: [IMAGES.himalaya, IMAGES.bundle],
      productType: "Bundle", benefit: "Nourishment", format: "3-piece edit",
      ingredientNotes: "Includes Pure Sea Buckthorn Oil, Sea Buckthorn Powder and Face Wash.",
      usageInstructions: "A complete introduction to the HERBOVA ritual.",
      rating: 4.8, reviewCount: 26,
      ingredientSlugs: ["omega-7", "carotenoids"],
    },
    {
      name: "Skin Ritual", slug: "skin-ritual-bundle", categorySlug: "bundles",
      shortDescription: "Cleanse, treat and hydrate in one elevated set.",
      description: "Face Wash, Radiance Serum and Night Cream — a complete skin ritual for morning and night.",
      price: 6500, salePrice: 5990, sku: "BND-SKIN", stock: 16, images: [IMAGES.bundle, IMAGES.cream],
      productType: "Bundle", benefit: "Glow", format: "3-piece ritual",
      ingredientNotes: "Includes Face Wash, Radiance Serum and Night Cream.",
      usageInstructions: "Cleanse, treat with serum, then seal with night cream.",
      rating: 4.8, reviewCount: 32,
      ingredientSlugs: ["vitamin-e", "flavonoids"],
    },
    {
      name: "Hair & Scalp Ritual", slug: "hair-scalp-ritual-bundle", categorySlug: "bundles",
      shortDescription: "Shampoo, Hair Oil and Scalp Serum for complete hair care.",
      description: "A complete hair ritual pairing our Shampoo, Hair Oil and Scalp Serum.",
      price: 5800, sku: "BND-HAIR", stock: 14, images: [IMAGES.haircare, IMAGES.bundle],
      productType: "Bundle", benefit: "Hair Care", format: "3-piece ritual",
      ingredientNotes: "Includes Shampoo, Hair Oil and Scalp Serum.",
      usageInstructions: "Cleanse, treat the scalp, then finish with hair oil.",
      rating: 4.7, reviewCount: 18,
      ingredientSlugs: ["omega-9", "omega-6"],
    },
    {
      name: "Starter Kit", slug: "starter-kit-bundle", categorySlug: "bundles",
      shortDescription: "A gentle first introduction to HERBOVA essentials.",
      description: "Travel-friendly sizes of our best-loved Face Wash, Serum and Oil — perfect for a first ritual.",
      price: 3400, sku: "BND-START", stock: 30, images: [IMAGES.bundle, IMAGES.faceWash],
      productType: "Bundle", benefit: "Glow", format: "Travel sizes", isNew: true,
      ingredientNotes: "Includes travel sizes of Face Wash, Radiance Serum and Berry Oil.",
      usageInstructions: "A gentle way to trial the full HERBOVA ritual.",
      rating: 4.6, reviewCount: 12,
      ingredientSlugs: ["vitamin-e"],
    },
    {
      name: "Gift Box", slug: "gift-box-bundle", categorySlug: "bundles",
      shortDescription: "A beautifully boxed edit, ready to gift.",
      description: "Our most giftable edit, presented in signature HERBOVA packaging — ideal for any wellness-minded occasion.",
      price: 7200, sku: "BND-GIFT", stock: 12, images: [IMAGES.bundle, IMAGES.spa],
      productType: "Bundle", benefit: "Nourishment", format: "Gift edition",
      ingredientNotes: "Includes Radiance Serum, Pure Sea Buckthorn Oil, Body Butter and Lip Balm.",
      usageInstructions: "A complete, ready-to-gift wellness edit.",
      rating: 5, reviewCount: 9,
      ingredientSlugs: ["omega-7", "vitamin-e", "carotenoids"],
    },
  ];

  const productRecords: Record<string, Awaited<ReturnType<typeof prisma.product.upsert>>> = {};

  for (const p of productDefs) {
    const category = categories[p.categorySlug];
    const collection = p.collectionSlug ? collections[p.collectionSlug] : null;

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        shortDescription: p.shortDescription,
        description: p.description,
        seoTitle: `${p.name} | HERBOVA`,
        seoDescription: p.shortDescription,
        featuredImage: p.images[0],
        categoryId: category.id,
        collectionId: collection?.id,
        price: p.price,
        salePrice: p.salePrice,
        sku: p.sku,
        stock: p.stock,
        rating: p.rating,
        reviewCount: p.reviewCount,
        isFeatured: p.isFeatured ?? false,
        isNew: p.isNew ?? false,
        productType: p.productType,
        skinConcern: p.skinConcern,
        benefit: p.benefit,
        format: p.format,
        ingredientNotes: p.ingredientNotes,
        usageInstructions: p.usageInstructions,
        images: {
          create: p.images.map((url, index) => ({ url, isPrimary: index === 0, alt: p.name })),
        },
        variants: p.variants
          ? { create: p.variants.map((v) => ({ name: v.name, sku: v.sku, price: v.price, salePrice: v.salePrice, stock: v.stock })) }
          : undefined,
        ingredients: {
          create: p.ingredientSlugs.map((slug) => ({ ingredientId: ingredients[slug].id })),
        },
        faqs: {
          create: [
            { question: "How often should I use this?", answer: "Most customers use this daily as part of their morning or evening ritual — see the How To Use section for specifics." },
            { question: "Is this suitable for sensitive skin?", answer: "Our formulas are designed to be gentle, but we always recommend a patch test before first use." },
          ],
        },
      },
    });
    productRecords[p.slug] = product;
  }

  // --- Reviews -------------------------------------------------------
  const reviewSeed = [
    { productSlug: "sea-buckthorn-radiance-serum", name: "Maira A.", rating: 5, content: "Beautiful texture, delicate finish, and my skin feels noticeably brighter and calmer after a few weeks." },
    { productSlug: "pure-sea-buckthorn-oil", name: "Sana K.", rating: 5, content: "The glow is real without feeling heavy. It sits beautifully under makeup and leaves my skin soft." },
    { productSlug: "daily-wellness-kit", name: "Hafsa N.", rating: 5, content: "Luxury packaging, effective ingredients, and a routine I actually enjoy sticking to every morning." },
  ];
  for (const r of reviewSeed) {
    const product = productRecords[r.productSlug];
    const existing = await prisma.review.findFirst({ where: { productId: product.id, userId: customer.id } });
    if (!existing) {
      await prisma.review.create({
        data: {
          userId: customer.id,
          productId: product.id,
          rating: r.rating,
          title: r.name,
          content: r.content,
          verified: true,
          approved: true,
          featured: true,
        },
      });
    }
  }

  // --- Blog ------------------------------------------------------------
  const blogCategory = await prisma.blogCategory.upsert({
    where: { slug: "journal" },
    update: {},
    create: { name: "Journal", slug: "journal" },
  });

  const posts = [
    { title: "What Is Sea Buckthorn?", slug: "what-is-sea-buckthorn", excerpt: "Learn about this vibrant Himalayan berry and why it has become a staple in modern wellness rituals.", image: IMAGES.berries, content: "Sea buckthorn is a hardy, thorned shrub native to high-altitude regions across Asia and Europe, prized for its small, vivid orange berries. For centuries it has held a place in traditional wellness practices across the Himalayan region, valued for its distinctive botanical profile and resilience in harsh mountain climates.\n\nToday, sea buckthorn is recognized in modern clean beauty and wellness for its naturally occurring oils, carotenoids and flavonoids. At HERBOVA, we work directly with growers in the Himalayas to bring this golden berry into thoughtfully formulated skincare, haircare and wellness products." },
    { title: "Sea Buckthorn Oil vs Seed Oil", slug: "sea-buckthorn-oil-vs-seed-oil", excerpt: "An easy guide to understanding the difference between berry oil and seed oil in beauty routines.", image: IMAGES.oilBottle, content: "Sea buckthorn produces two distinct oils, each pressed from a different part of the berry. Berry oil is extracted from the fleshy pulp and carries the plant's signature deep orange hue, while seed oil is pressed from the small seeds inside and tends to be lighter in both texture and color.\n\nBerry oil is often chosen for richer, more nourishing formulations, while seed oil's lighter profile makes it a popular choice for fast-absorbing daily use. Both share the same botanical origin, simply offering a different sensorial experience." },
    { title: "How to Use Sea Buckthorn Powder", slug: "how-to-use-sea-buckthorn-powder", excerpt: "Simple ways to integrate this nutrient-rich ingredient into your everyday and wellness routine.", image: IMAGES.powder, content: "Sea buckthorn powder is one of the most versatile ways to bring this berry into your daily routine. Its naturally tart, fruity flavor blends easily into smoothies, water, oats or your favorite recipes.\n\nMany of our customers stir a teaspoon into their morning routine as a simple, consistent ritual. Because it's a whole, milled ingredient, there's no need to overthink it — a little goes a long way." },
    { title: "Sea Buckthorn Skincare Routine", slug: "sea-buckthorn-skincare-routine", excerpt: "A simple, four-step ritual built around cleanse, treat, hydrate and nourish.", image: IMAGES.faceWash, content: "Building a consistent skincare ritual doesn't need to be complicated. We recommend a simple four-step approach: cleanse to remove the day, treat with a targeted serum, hydrate to replenish moisture, and nourish to seal it all in.\n\nEach step can be built around sea buckthorn-based formulas suited to your skin's needs, creating a routine that feels intentional without being overwhelming." },
    { title: "Natural Beauty and Botanical Ingredients", slug: "natural-beauty-and-botanical-ingredients", excerpt: "A closer look at why botanical, naturally-inspired formulation matters in modern beauty.", image: IMAGES.botanicals, content: "Clean, botanical beauty is about more than a trend — it's a return to thoughtfully sourced ingredients with a clear provenance. Naturally-inspired formulation asks a simple question: what does this ingredient actually do, and where does it come from?\n\nAt HERBOVA, every formula starts with the sea buckthorn berry itself, supported by complementary botanicals chosen for how they work together, not just how they sound on a label." },
    { title: "From Himalayan Berry to Modern Wellness", slug: "from-himalayan-berry-to-modern-wellness", excerpt: "Tracing the journey of sea buckthorn from mountain harvest to your daily ritual.", image: IMAGES.himalaya, content: "Every HERBOVA product begins its journey high in the Himalayas, where sea buckthorn grows wild in harsh, high-altitude conditions. From harvest to selection, processing, formulation, packaging and delivery, we've built a supply chain that respects both the berry and the communities who grow it.\n\nThe result is a modern wellness and beauty line rooted in a genuinely traditional ingredient." },
  ];

  for (const post of posts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        featureImage: post.image,
        categoryId: blogCategory.id,
        published: true,
        authorName: "The HERBOVA Team",
        seoTitle: `${post.title} | HERBOVA Journal`,
        seoDescription: post.excerpt,
      },
    });
  }

  // --- Banners & homepage CMS content -----------------------------------
  await prisma.banner.upsert({
    where: { id: "hero-banner" },
    update: {},
    create: {
      id: "hero-banner",
      title: "Nature's Golden Berry. Reimagined.",
      subtitle: "Premium Sea Buckthorn wellness and skincare, thoughtfully crafted from nature.",
      image: IMAGES.berries,
      link: "/shop",
      isActive: true,
    },
  });

  await prisma.homepageSection.upsert({
    where: { name: "hero" },
    update: {},
    create: {
      name: "hero",
      type: "hero",
      isActive: true,
      content: {
        eyebrow: "The Golden Berry of Wellness",
        headline: "Nature's Golden Berry. Reimagined.",
        description: "Premium Sea Buckthorn wellness and skincare, thoughtfully crafted from nature.",
        primaryCta: { label: "Shop Collection", href: "/shop" },
        secondaryCta: { label: "Discover Sea Buckthorn", href: "/story" },
        image: IMAGES.berries,
        featuredProductSlug: "pure-sea-buckthorn-oil",
      },
    },
  });

  await prisma.homepageSection.upsert({
    where: { name: "announcement" },
    update: {},
    create: {
      name: "announcement",
      type: "announcement_bar",
      isActive: true,
      content: { text: "Free nationwide delivery on orders over Rs. 5,000." },
    },
  });

  // --- FAQ (site-wide) -------------------------------------------------
  const siteFaqs = [
    { question: "Do you ship nationwide?", answer: "Yes, we deliver across the country with tracked, insured shipping on every order." },
    { question: "What is your return policy?", answer: "Unopened products can be returned within 14 days of delivery for a full refund." },
    { question: "Is sea buckthorn safe for sensitive skin?", answer: "Our formulas are designed to be gentle, but we always recommend patch testing before first use." },
  ];
  for (const faq of siteFaqs) {
    const existing = await prisma.fAQ.findFirst({ where: { question: faq.question, productId: null } });
    if (!existing) await prisma.fAQ.create({ data: { ...faq, productId: null } });
  }

  // --- Coupons -----------------------------------------------------------
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      type: "PERCENTAGE",
      value: 10,
      minOrderAmount: 2000,
      firstOrderOnly: true,
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "SAVE500" },
    update: {},
    create: {
      code: "SAVE500",
      type: "FIXED",
      value: 500,
      minOrderAmount: 3500,
      isActive: true,
      usageLimit: 500,
    },
  });

  // --- Site settings -------------------------------------------------
  const settings: Record<string, string> = {
    site_name: "HERBOVA",
    site_tagline: "The Golden Berry of Wellness",
    currency_symbol: "Rs.",
    free_shipping_threshold: "5000",
    flat_shipping_rate: "250",
    contact_email: "hello@herbova.com",
    contact_phone: "+92 300 0000000",
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }

  // --- Demo address + order for the demo customer -----------------------
  const existingAddress = await prisma.address.findFirst({ where: { userId: customer.id } });
  const address =
    existingAddress ??
    (await prisma.address.create({
      data: {
        userId: customer.id,
        firstName: "Amara",
        lastName: "Khan",
        email: customer.email,
        phone: "+92 300 1234567",
        country: "Pakistan",
        city: "Lahore",
        area: "Gulberg",
        street: "12 Botanical Lane",
        postalCode: "54000",
        isDefault: true,
      },
    }));

  const existingOrder = await prisma.order.findFirst({ where: { userId: customer.id } });
  if (!existingOrder) {
    const oil = productRecords["pure-sea-buckthorn-oil"];
    const serum = productRecords["sea-buckthorn-radiance-serum"];
    const subtotal = Number(oil.salePrice ?? oil.price) + Number(serum.salePrice ?? serum.price);
    const shipping = 0;
    const total = subtotal + shipping;

    const order = await prisma.order.create({
      data: {
        orderNumber: "HRB-10001",
        userId: customer.id,
        addressId: address.id,
        status: "DELIVERED",
        subtotal,
        discount: 0,
        shipping,
        total,
        paymentMethod: "CASH_ON_DELIVERY",
        trackingCode: "TRK-HRB10001",
        items: {
          create: [
            { productId: oil.id, quantity: 1, price: oil.salePrice ?? oil.price },
            { productId: serum.id, quantity: 1, price: serum.salePrice ?? serum.price },
          ],
        },
      },
    });

    await prisma.payment.create({
      data: { orderId: order.id, method: "CASH_ON_DELIVERY", status: "PAID", amount: total },
    });

    await prisma.shipment.create({
      data: {
        orderId: order.id,
        carrier: "HERBOVA Logistics",
        trackingNo: "TRK-HRB10001",
        status: "DELIVERED",
        shippedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        deliveredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log("Seed complete.");
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
  console.log("Customer login: customer@herbova.com / Customer@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
