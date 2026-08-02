const Video = require('../models/Video');
const VideoProcessor = require('../services/videoProcessor');

class VideoController {
  constructor(db) {
    this.videoModel = new Video(db);
    this.videoProcessor = new VideoProcessor(db);
  }

  getVideos = async (req, res) => {
    try {
      const limit = parseInt(req.query.limit, 10) || 50;
      const offset = parseInt(req.query.offset, 10) || 0;
      const videos = await this.videoModel.findAll({ limit, offset });
      res.status(200).json(videos);
    } catch (error) {
      console.error('Error fetching videos:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  createVideo = async (req, res) => {
    try {
      const { title, description, categoryId } = req.body;
      let url = req.body.url;
      let filePath = null;

      if (req.file) {
        url = `/uploads/${req.file.filename}`;
        filePath = req.file.path;
      }

      const newVideoId = await this.videoModel.create({
        title,
        description,
        url,
        categoryId
      });

      if (filePath) {
        this.videoProcessor.processVideo(newVideoId, filePath)
          .catch(err => console.error(`Failed to process video ${newVideoId}:`, err));
      }

      const newVideo = await this.videoModel.findById(newVideoId);
      res.status(201).json({ success: true, id: newVideoId, ...newVideo });
    } catch (error) {
      console.error('Error creating video:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getVideoById = async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const video = await this.videoModel.findById(id);
      
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      res.status(200).json(video);
    } catch (error) {
      console.error('Error fetching video:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  updateVideo = async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { title, description, categoryId } = req.body;
      let url = req.body.url;
      let filePath = null;

      if (req.file) {
        url = `/uploads/${req.file.filename}`;
        filePath = req.file.path;
      }

      const existingVideo = await this.videoModel.findById(id);
      if (!existingVideo) {
        return res.status(404).json({ error: 'Video not found' });
      }

      await this.videoModel.update(id, {
        title,
        description,
        url,
        categoryId
      });

      if (filePath) {
        this.videoProcessor.processVideo(id, filePath)
          .catch(err => console.error(`Failed to process video ${id}:`, err));
      }

      const updatedVideo = await this.videoModel.findById(id);
      res.status(200).json({ success: true, ...updatedVideo });
    } catch (error) {
      console.error('Error updating video:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  deleteVideo = async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const existingVideo = await this.videoModel.findById(id);
      
      if (!existingVideo) {
        return res.status(404).json({ error: 'Video not found' });
      }

      if (existingVideo.video_url && existingVideo.video_url.startsWith('/uploads/')) {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, '../../public', existingVideo.video_url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      await this.videoModel.delete(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting video:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

module.exports = VideoController;