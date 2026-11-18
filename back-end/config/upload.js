// Upload of menu images (KAN-57): JPEG / PNG / WebP, 2 MB max, random file name
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { badRequest } = require('../utils/httpError');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const MENU_DIR = path.join(UPLOAD_DIR, 'menus');
fs.mkdirSync(MENU_DIR, { recursive: true });

const EXTENSIONS = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

const menuImageUpload = multer({
  storage: multer.diskStorage({
    destination: MENU_DIR,
    // Never reuse the name sent by the browser
    filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}${EXTENSIONS[file.mimetype]}`),
  }),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (EXTENSIONS[file.mimetype]) cb(null, true);
    else cb(badRequest('Format accepté : JPEG, PNG ou WebP.'));
  },
});

/** Public URL -> file on disk (only for files inside uploads/) */
function uploadedFilePath(url) {
  if (!url || !url.startsWith('/uploads/')) return null;
  const file = path.normalize(path.join(UPLOAD_DIR, url.slice('/uploads/'.length)));
  return file.startsWith(UPLOAD_DIR + path.sep) ? file : null;
}

function deleteUploadedFile(url) {
  const file = uploadedFilePath(url);
  if (file) fs.promises.unlink(file).catch(() => {});
}

module.exports = { UPLOAD_DIR, menuImageUpload, deleteUploadedFile };
