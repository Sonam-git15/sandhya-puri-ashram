const HeroImage = require('../models/HeroImage');
const ActivityImage = require('../models/ActivityImage');
const GalleryImage = require('../models/GalleryImage');
const Setting = require('../models/Setting');

// Real Sandhya Puri Sanyas Ashram images uploaded by the user.
const ASHRAM_EXTERIOR =
  'https://customer-assets.emergentagent.com/job_mern-temple-site/artifacts/obv2xl8j_sandhya-puri-sanyas-ashram-ip-estate-delhi-ashrams-ngjswmw0wt.jpg';
const DURGA_MAA =
  'https://customer-assets.emergentagent.com/job_mern-temple-site/artifacts/awhvcs0s_IMG_9658.PNG';
const RADHA_KRISHNA =
  'https://customer-assets.emergentagent.com/job_mern-temple-site/artifacts/xjxr5i2d_IMG_9718.JPG.jpeg';
const SHIV_PARVATI =
  'https://customer-assets.emergentagent.com/job_mern-temple-site/artifacts/2b0zgngx_IMG_9719.JPG.jpeg';
const SHIV_LINGA =
  'https://customer-assets.emergentagent.com/job_mern-temple-site/artifacts/izblo8ol_WhatsApp%20Image%202026-04-27%20at%201.48.57%20AM%20%282%29.jpeg';

const DEFAULT_HERO = [
  { url: ASHRAM_EXTERIOR, alt: 'Sandhya Puri Sanyas Ashram — Diwali Diyas' },
  { url: SHIV_LINGA, alt: 'Shiv Linga with floral abhishek' },
  { url: RADHA_KRISHNA, alt: 'Radha-Krishna deities' },
  { url: DURGA_MAA, alt: 'Maa Durga' },
  { url: SHIV_PARVATI, alt: 'Shiv-Parvati deities' },
];

const DEFAULT_ACTIVITIES = [
  {
    url: ASHRAM_EXTERIOR,
    titleKey: 'festival',
    title: 'Festival Celebrations',
    description: 'Diwali diyas lighting up the ashram courtyard',
  },
  {
    url: SHIV_LINGA,
    titleKey: 'sandhya_aarti',
    title: 'Sandhya Aarti',
    description: 'Evening lamp ritual at Shiv Linga',
  },
  {
    url: RADHA_KRISHNA,
    titleKey: 'satsang',
    title: 'Satsang',
    description: 'Devotional gathering before Radha-Krishna',
  },
  {
    url: DURGA_MAA,
    titleKey: 'prasad_vitran',
    title: 'Prasad Vitran',
    description: 'Sacred offerings to Maa Durga',
  },
  {
    url: SHIV_PARVATI,
    titleKey: 'bhandara_seva',
    title: 'Bhandara Seva',
    description: 'Community feeding & devotion',
  },
];

const DEFAULT_GALLERY = [
  ASHRAM_EXTERIOR,
  SHIV_LINGA,
  RADHA_KRISHNA,
  DURGA_MAA,
  SHIV_PARVATI,
  ASHRAM_EXTERIOR,
  SHIV_LINGA,
  RADHA_KRISHNA,
  DURGA_MAA,
];

function isStock(url = '') {
  return /unsplash\.com|images\.pexels\.com/i.test(url);
}

async function seedDefaults() {
  // Hero — replace if empty OR all current items are stock images
  const heroDocs = await HeroImage.find({}).lean();
  if (heroDocs.length === 0 || heroDocs.every((d) => isStock(d.url))) {
    await HeroImage.deleteMany({});
    await HeroImage.insertMany(DEFAULT_HERO.map((h, i) => ({ ...h, order: i })));
    // eslint-disable-next-line no-console
    console.log('[seed] hero images reseeded with real ashram photos');
  }

  // Activities — same logic
  const actDocs = await ActivityImage.find({}).lean();
  if (actDocs.length === 0 || actDocs.every((d) => isStock(d.url))) {
    await ActivityImage.deleteMany({});
    await ActivityImage.insertMany(DEFAULT_ACTIVITIES.map((a, i) => ({ ...a, order: i })));
    // eslint-disable-next-line no-console
    console.log('[seed] activities reseeded with real ashram photos');
  }

  // Gallery — same logic
  const galDocs = await GalleryImage.find({}).lean();
  if (galDocs.length === 0 || galDocs.every((d) => isStock(d.url))) {
    await GalleryImage.deleteMany({});
    await GalleryImage.insertMany(
      DEFAULT_GALLERY.map((url, i) => ({ url, caption: '', order: i }))
    );
    // eslint-disable-next-line no-console
    console.log('[seed] gallery reseeded with real ashram photos');
  }

  // About video — leave existing user-set URL untouched
  const videoSetting = await Setting.findOne({ key: 'about_video_url' });
  if (!videoSetting) {
    await Setting.create({
      key: 'about_video_url',
      value: 'https://www.youtube.com/embed/8sYUyMaW8Sk',
    });
  }

  // UPI
  if (!(await Setting.findOne({ key: 'upi_id' }))) {
    await Setting.create({ key: 'upi_id', value: 'sandhyapuri@upi' });
  }
  // Contact phone / whatsapp (from env if present)
  if (!(await Setting.findOne({ key: 'phone' })) && process.env.ASHRAM_PHONE) {
    await Setting.create({ key: 'phone', value: process.env.ASHRAM_PHONE });
  }
  if (!(await Setting.findOne({ key: 'whatsapp' })) && process.env.ASHRAM_WHATSAPP) {
    await Setting.create({ key: 'whatsapp', value: process.env.ASHRAM_WHATSAPP });
  }
}

module.exports = seedDefaults;
