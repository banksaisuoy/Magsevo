const VideoModel = require('../db/video');
const VideoProcessor = require('../services/videoProcessor');

class VideoController {
  constructor(db) {
    this.videoModel = new VideoModel(db);
    this.videoProcessor = new VideoProcessor(db);
  }

  getAllVideos = async (req, res) => {
    }
  };

  uploadVideo = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Video file is required' });
      }

      const { title, description, category_id, user_id } = req.body;
      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const video_url = `/uploads/${req.file.filename}`;

      const newVideoId = await this.videoModel.createVideo({
        title,
        description,
        video_url,
        category_id,
        user_id,
        status: 'pending'
      });

      // Trigger asynchronous processing
      this.videoProcessor.processVideo(newVideoId, req.file.path)
        .catch(err => console.error(`Failed to process video ${newVideoId}:`, err));

      const newVideo = await this.videoModel.getVideoById(newVideoId);
      res.status(202).json({
        message: 'Video upload successful, processing started',
        video: newVideo
      });

    } catch (error) {
      console.error('Error uploading video:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getVideoById = async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);