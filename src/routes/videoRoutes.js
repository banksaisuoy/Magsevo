const express = require('express');
const { verifyToken } = require('../../middleware/auth');
const { validateVideoCreate, validateVideoUpdate, validateVideoId } = require('../middleware/validation');
const VideoController = require('../controllers/videoController');

const router = express.Router();

router.use((req, res, next) => {
  if (!req.videoController) {
    req.videoController = new VideoController(req.app.get('db'));
  }
  next();
});

// GET /videos
router.get('/', verifyToken, (req, res) => req.videoController.getVideos(req, res));

// GET /videos/:id
router.get('/:id', verifyToken, validateVideoId, (req, res) => req.videoController.getVideoById(req, res));

// POST /videos
router.post('/', verifyToken, validateVideoCreate, (req, res) => req.videoController.createVideo(req, res));

// PUT /videos/:id
router.put('/:id', verifyToken, validateVideoId, validateVideoUpdate, (req, res) => req.videoController.updateVideo(req, res));

// DELETE /videos/:id
router.delete('/:id', verifyToken, validateVideoId, (req, res) => req.videoController.deleteVideo(req, res));

module.exports = router;