const HeroImage = require('../models/HeroImage');
const ActivityImage = require('../models/ActivityImage');
const GalleryImage = require('../models/GalleryImage');
const Setting = require('../models/Setting');

const DEFAULT_HERO = [
  'https://images.unsplash.com/photo-1529733772151-bab41484710a?crop=entropy&cs=srgb&fm=jpg&w=1920&q=85',
  'https://images.unsplash.com/photo-1557062975-96113e46608b?crop=entropy&cs=srgb&fm=jpg&w=1920&q=85',
  'https://images.unsplash.com/photo-1665003725647-3ae0f01140b1?crop=entropy&cs=srgb&fm=jpg&w=1920&q=85',
  'https://images.unsplash.com/photo-1726501604891-19fb7f7cd37b?crop=entropy&cs=srgb&fm=jpg&w=1920&q=85',
];

const DEFAULT_ACTIVITIES = [
  {
    url: 'https://images.unsplash.com/photo-1627894483216-2138af692e32?crop=entropy&cs=srgb&fm=jpg&w=1600&q=85',
    titleKey: 'sandhya_aarti',
    title: 'Sandhya Aarti',
    description: 'Evening light ritual',
  },
  {
    url: 'https://images.unsplash.com/photo-1666694051761-cd972857da30?crop=entropy&cs=srgb&fm=jpg&w=1600&q=85',
    titleKey: 'prasad_vitran',
    title: 'Prasad Vitran',
    description: 'Sacred offering distribution',
  },
  {
    url: 'https://images.unsplash.com/photo-1538024333176-f25f63f873ee?crop=entropy&cs=srgb&fm=jpg&w=1600&q=85',
    titleKey: 'bhandara_seva',
    title: 'Bhandara Seva',
    description: 'Community feeding & devotion',
  },
  {
    url: 'https://images.unsplash.com/photo-1604078893234-ff3a1a5d5292?crop=entropy&cs=srgb&fm=jpg&w=1600&q=85',
    titleKey: 'satsang',
    title: 'Satsang',
    description: 'Spiritual gathering & meditation',
  },
  {
    url: 'https://images.unsplash.com/photo-1772648892935-bba3be725552?crop=entropy&cs=srgb&fm=jpg&w=1600&q=85',
    titleKey: 'festival',
    title: 'Festival Celebrations',
    description: 'Temple silhouette at sunset',
  },
];

const DEFAULT_GALLERY = [
  'https://images.unsplash.com/photo-1529733772151-bab41484710a?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85',
  'https://images.unsplash.com/photo-1557062975-96113e46608b?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85',
  'https://images.unsplash.com/photo-1665003725647-3ae0f01140b1?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85',
  'https://images.unsplash.com/photo-1726501604891-19fb7f7cd37b?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85',
  'https://images.unsplash.com/photo-1625072290979-cac544181be8?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85',
  'https://images.unsplash.com/photo-1740152446751-4a91554e95bd?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85',
  'https://images.unsplash.com/photo-1604078893234-ff3a1a5d5292?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85',
  'https://images.unsplash.com/photo-1538024333176-f25f63f873ee?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85',
  'https://images.unsplash.com/photo-1627894483216-2138af692e32?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85',
  'https://images.unsplash.com/photo-1666694051761-cd972857da30?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85',
  'https://images.unsplash.com/photo-1772648892935-bba3be725552?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85',
];

async function seedDefaults() {
  const heroCount = await HeroImage.countDocuments();
  if (heroCount === 0) {
    await HeroImage.insertMany(
      DEFAULT_HERO.map((url, i) => ({ url, alt: `Ashram view ${i + 1}`, order: i }))
    );
    // eslint-disable-next-line no-console
    console.log('[seed] default hero images inserted');
  }

  const actCount = await ActivityImage.countDocuments();
  if (actCount === 0) {
    await ActivityImage.insertMany(
      DEFAULT_ACTIVITIES.map((a, i) => ({ ...a, order: i }))
    );
    // eslint-disable-next-line no-console
    console.log('[seed] default activity images inserted');
  }

  const galCount = await GalleryImage.countDocuments();
  if (galCount === 0) {
    await GalleryImage.insertMany(
      DEFAULT_GALLERY.map((url, i) => ({ url, caption: '', order: i }))
    );
    // eslint-disable-next-line no-console
    console.log('[seed] default gallery images inserted');
  }

  // Default about video (YouTube embed of generic peaceful ashram chanting)
  const videoSetting = await Setting.findOne({ key: 'about_video_url' });
  if (!videoSetting) {
    await Setting.create({
      key: 'about_video_url',
      value: 'https://www.youtube.com/embed/8sYUyMaW8Sk',
    });
  }

  const upiSetting = await Setting.findOne({ key: 'upi_id' });
  if (!upiSetting) {
    await Setting.create({ key: 'upi_id', value: 'sandhyapuri@upi' });
  }
}

module.exports = seedDefaults;
