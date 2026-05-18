const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

const app         = express();
const PORT        = process.env.PORT || 3000;
const UPLOAD_DIR  = process.env.UPLOAD_DIR || '/data';
const UPLOAD_PASS = process.env.UPLOAD_PASS || '';

const ALLOWED_EXTENSIONS = ['.mp4', '.mov', '.mxf', '.mkv', '.avi'];
const ALLOWED_MIMES = [
  'video/mp4', 'video/quicktime', 'video/x-msvideo',
  'video/x-matroska', 'video/mxf', 'application/mxf',
];

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

function sanitize(str) {
  return str
    .trim()
    .replace(/[^a-zA-Z0-9 _\-\.]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 60);
}

// Reformat "First Last" -> "Last_First"
function lastFirst(fullName) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return sanitize(parts[0]);
  const last  = parts[parts.length - 1];
  const first = parts.slice(0, -1).join(' ');
  return sanitize(`${last}_${first}`);
}

function buildFilename(fields, originalName) {
  const ext   = path.extname(originalName).toLowerCase();
  const parts = [lastFirst(fields.studentName)];
  if (fields.classNumber) parts.push(sanitize(fields.classNumber));
  if (fields.professor)   parts.push(sanitize(fields.professor));
  if (fields.filmTitle)   parts.push(sanitize(fields.filmTitle));
  return parts.join('_') + ext;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename:    (req, file, cb) => cb(null, buildFilename(req.body, file.originalname)),
});

const upload = multer({
  storage,
  limits: { fileSize: Infinity },
  fileFilter: (req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;
    if (ALLOWED_EXTENSIONS.includes(ext) || ALLOWED_MIMES.includes(mime)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed. Accepted formats: ${ALLOWED_EXTENSIONS.join(', ')}`));
    }
  },
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/upload', (req, res) => {
  upload.single('film')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file received.' });
    if (!req.body.studentName || !req.body.studentEmail || !req.body.filmTitle) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Name, email, and film title are required.' });
    }
    if (UPLOAD_PASS && req.body.uploadPass !== UPLOAD_PASS) {
      fs.unlinkSync(req.file.path);
      return res.status(401).json({ error: 'Incorrect upload password.' });
    }
    console.log(`[upload] ${req.file.filename} | ${req.body.studentName} | ${req.body.studentEmail}`);
    res.json({ ok: true, filename: req.file.filename });
  });
});

app.listen(PORT, () => console.log(`Film Drop running on :${PORT}`));