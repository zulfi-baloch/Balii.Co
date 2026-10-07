/* ==========================================================================
   Balli.Co — SITE CONFIGURATION
   Everything the owner needs to edit lives in this one file.
   ========================================================================== */

/* ---- 1. Social links: replace "#" with the real URL (e.g. "https://instagram.com/yourhandle") ---- */
const socialLinks = {
  instagram: "#",
  facebook: "#",
  tiktok: "#",
  youtube: "#"
};

/* ---- 2. Brand details ---- */
const brandConfig = {
  name: "Balli.Co",
  phone: "03043062683",
  whatsapp: "03043062683",
  location: "DHA Phase 2, Street 101, Karachi, Pakistan",
  colors: {
    orange: "#FF6115",
    porcelain: "#FFFCF4"
  },
  social: socialLinks,

  /* Default WhatsApp greeting (floating button + contact buttons) */
  whatsappGreeting: "Hello Balli.Co, I'm interested in your shirts.",

  /* Contact form: paste a Formspree endpoint (https://formspree.io/f/xxxx) or your own API URL.
     While this is empty, the form hands the message to WhatsApp instead of pretending to save it. */
  formEndpoint: "",

  /* Set to true after running download-images.py (it does this for you).
     false = photos load live from Pexels/Unsplash; true = photos load from the /images folder. */
  useLocalImages: true,

  /* Credit link in the footer. Leave empty until a URL exists. */
  developerUrl: "",

  /* Currency label used when a product has a numeric price */
  currency: "Rs.",
  /* Shown while a product has no price yet */
  pricePlaceholder: "Price on request"
};

/* ---- 3. Image helper (Pexels + Unsplash CDNs; both allow free commercial use, no attribution required) ----
   To swap a photo: change the id. Pexels ids are numbers; Unsplash ids look like "photo-1234567890-abcdef". */
function imageUrl(img, width) {
  /* Local mode: photos saved by download-images.py live in /images (one file per photo) */
  if (brandConfig.useLocalImages) { return "images/" + img.id + ".jpg"; }
  if (img.provider === "pexels") {
    return "https://images.pexels.com/photos/" + img.id + "/pexels-photo-" + img.id +
      ".jpeg?auto=compress&cs=tinysrgb&w=" + width;
  }
  return "https://images.unsplash.com/" + img.id + "?auto=format&fit=crop&q=70&w=" + width;
}
function imageSrcset(img, widths) {
  if (brandConfig.useLocalImages) { return ""; }
  return widths.map(function (w) { return imageUrl(img, w) + " " + w + "w"; }).join(", ");
}

/* ---- 4. Products ----
   Structured so a real catalogue (API / database) can replace this array later.
   Set `price` to a number (e.g. 4500) when ready. Each product has a stable `id` and `sku`. */
const BALLI_PRODUCTS = [
  {
    id: "classic-white", sku: "BC-001", name: "The Classic White", price: null,
    short: "A clean white shirt with a sharp, versatile silhouette.",
    long: "The foundation of a good wardrobe. A crisp white shirt with a refined profile that works for the office, dinners and everything in between.",
    image: { provider: "unsplash", id: "photo-1621072156002-e2fccdc0b176", alt: "Man in a white dress shirt and black sunglasses", pos: "50% 30%" }
  },
  {
    id: "signature-blue", sku: "BC-002", name: "Signature Blue", price: null,
    short: "A confident blue for work, dinners and in between.",
    long: "A considered shade of blue with a clean line from collar to hem. Easy to pair with tailored trousers or relaxed denim.",
    image: { provider: "unsplash", id: "photo-1624835567150-0c530a20d8cc", alt: "Man in a blue dress shirt and black trousers standing", pos: "50% 25%" }
  },
  {
    id: "midnight-stripe", sku: "BC-003", name: "Midnight Stripe", price: null,
    short: "Fine stripes with a dark, evening-ready edge.",
    long: "Subtle striping and a darker palette make this a natural choice for evenings out, without feeling dressed up.",
    image: { provider: "pexels", id: "16062780", alt: "Confident man in a striped shirt and sunglasses in a modern interior", pos: "50% 30%" }
  },
  {
    id: "sandstone", sku: "BC-004", name: "Sandstone", price: null,
    short: "Warm neutral tones that layer effortlessly.",
    long: "Soft, earthy neutrals designed to sit well with almost everything in your wardrobe. Worn alone or layered.",
    image: { provider: "pexels", id: "6616649", alt: "Two men in neutral-toned shirts and trousers posing in a studio", pos: "50% 30%" }
  },
  {
    id: "azure-polo", sku: "BC-005", name: "The Azure Polo", price: null,
    short: "A relaxed polo that keeps things sharp but easy.",
    long: "A smart-casual piece for warm days and relaxed weekends, with a clean collar and an easy fit.",
    image: { provider: "pexels", id: "14564838", alt: "Stylish young man in a blue polo shirt", pos: "50% 25%" }
  },
  {
    id: "terracotta", sku: "BC-006", name: "Terracotta", price: null,
    short: "A warm rust tone that stands out quietly.",
    long: "A warm, confident colour for those who want to be noticed without being loud. Made for sunlit days.",
    image: { provider: "pexels", id: "38107793", alt: "Stylish man in a red shirt and sunglasses posing outdoors", pos: "50% 30%" }
  },
  {
    id: "indigo-denim", sku: "BC-007", name: "Indigo Denim", price: null,
    short: "Denim-inspired styling for a relaxed, modern look.",
    long: "A rugged-meets-refined take on denim styling. Built for off-duty days with a clean, modern attitude.",
    image: { provider: "pexels", id: "28938765", alt: "Man in a denim outfit posing confidently in a studio", pos: "50% 25%" }
  },
  {
    id: "weekend-check", sku: "BC-008", name: "The Weekend Check", price: null,
    short: "A light check pattern for easy, polished weekends.",
    long: "A classic check, kept clean and modern. Pairs with white trousers or dark denim for an effortless weekend look.",
    image: { provider: "unsplash", id: "photo-1626557981101-aae6f84aa6ff", alt: "Man in a blue and white checked shirt and white trousers", pos: "50% 25%" }
  }
];

/* ---- 5. Editorial gallery (all different from the product and hero photos) ---- */
const BALLI_GALLERY = [
  { image: { provider: "pexels", id: "5273389", alt: "Young man in casual wear and sunglasses against a concrete wall", pos: "50% 30%" }, label: "Concrete & light" },
  { image: { provider: "pexels", id: "2897531", alt: "Man in a black and white paisley shirt posing thoughtfully in an urban setting", pos: "50% 25%" }, label: "City pattern" },
  { image: { provider: "pexels", id: "10618446", alt: "Fashionable man in sunglasses, hat and a striped shirt against a yellow background", pos: "50% 30%" }, label: "Colour study" },
  { image: { provider: "unsplash", id: "photo-1567443022715-0d7ad3a48a9b", alt: "White button-up long-sleeved shirt", pos: "50% 40%" }, label: "The details" },
  { image: { provider: "pexels", id: "29359888", alt: "Man in stylish attire posing on a tropical beach", pos: "50% 30%" }, label: "Out of office" },
  { image: { provider: "pexels", id: "19852756", alt: "Stylish man in sunglasses, plaid shirt and jeans posing indoors with a hand in his pocket", pos: "50% 25%" }, label: "Indoors" },
  { image: { provider: "unsplash", id: "photo-1647367563309-db8ff106e889", alt: "Bearded man wearing a hat", pos: "50% 30%" }, label: "Portrait" }
];

/* ---- 6. Section images (hero + about; not reused anywhere else) ---- */
const BALLI_IMAGES = {
  hero: { provider: "pexels", id: "31618286", alt: "Confident young man in smart casual attire leaning against a textured wall" },
  about: { provider: "pexels", id: "17960004", alt: "Fashionable man adjusting his shirt sleeves in a moody setting" }
};
