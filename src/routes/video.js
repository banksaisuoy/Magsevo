const express = require('express');
const VideoController = require('../controllers/videoController');

module.exports = (db) => {
  const router = express.Router();
  const videoController = new VideoController(db);

  router.get('/', videoController.getAllVideos);
  router.get('/:id', videoController.getVideoById);
  router.post('/', videoController.createVideo);
  router.put('/:id', videoController.updateVideo);
  router.delete('/:id', videoController.deleteVideo);

  return router;
};