const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST /api/upload — upload one or more files
router.post('/', upload.array('posters', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const urls = [];
    for (const file of req.files) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'Aisira/posters',
            resource_type: 'auto',
            transformation: [
              { width: 800, height: 1200, crop: 'limit', quality: 'auto' },
            ],
          },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
        stream.end(file.buffer);
      });
      urls.push(result.secure_url);
    }

    res.json({ urls });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
});

module.exports = router;
