const fs = require('fs');
const path = require('path');
const multer = require('multer');

const ROOT = path.resolve(__dirname, '..', 'uploads');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function makeStorage(category, allowed) {
  const dest = path.join(ROOT, category);
  ensureDir(dest);
  return multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, dest),
      filename: (_req, file, cb) => {
        const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
        const ts = Date.now();
        const rand = Math.random().toString(36).slice(2, 8);
        cb(null, `${ts}_${rand}_${safe}`);
      },
    }),
    limits: { fileSize: 12 * 1024 * 1024 }, // 12 MB
    fileFilter: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
      if (allowed.includes(ext)) return cb(null, true);
      cb(new Error(`Invalid file type .${ext}. Allowed: ${allowed.join(', ')}`));
    },
  });
}

const imageExt = ['jpg', 'jpeg', 'png', 'webp'];
const videoExt = ['mp4', 'webm', 'mov', 'm4v', 'ogg'];

module.exports = {
  ROOT,
  uploadGallery: makeStorage('gallery', imageExt),
  uploadHero: makeStorage('hero', imageExt),
  uploadActivities: makeStorage('activities', imageExt),
  uploadVideos: makeStorage('videos', videoExt),
};
