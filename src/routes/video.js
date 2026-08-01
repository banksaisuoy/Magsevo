const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const VideoController = require('../controllers/videoController');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../../public/uploads/videos');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

module.exports = (db) => {
  const router = express.Router();
  const videoController = new VideoController(db);
  router.get('/', videoController.getAllVideos);
  router.get('/:id', videoController.getVideoById);
  router.post('/', videoController.createVideo);
  router.post('/upload', upload.single('video'), videoController.uploadVideo);
  router.put('/:id', videoController.updateVideo);
  router.delete('/:id', videoController.deleteVideo);
