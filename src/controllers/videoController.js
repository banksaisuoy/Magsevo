const VideoModel = require('../db/video');

class VideoController {
  constructor(db) {
    this.videoModel = new VideoModel(db);
  }

  getAllVideos = async (req, res) => {
    try {
      const videos = await this.videoModel.getAllVideos();
      res.status(200).json(videos);
    } catch (error) {
      console.error('Error fetching videos:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getVideoById = async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid video ID' });
      }

      const video = await this.videoModel.getVideoById(id);
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      res.status(200).json(video);
    } catch (error) {
      console.error('Error fetching video:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  createVideo = async (req, res) => {
    try {
      const { title, description, video_url, category_id, user_id } = req.body;

      if (!title || !video_url) {
        return res.status(400).json({ error: 'Title and video_url are required' });
      }

      const newVideoId = await this.videoModel.createVideo({
        title,
        description,
        video_url,
        category_id,
        user_id
      });

      const newVideo = await this.videoModel.getVideoById(newVideoId);
      res.status(201).json(newVideo);
    } catch (error) {
      console.error('Error creating video:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  updateVideo = async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid video ID' });
      }

      const { title, description, video_url, category_id, user_id } = req.body;

      if (!title || !video_url) {
        return res.status(400).json({ error: 'Title and video_url are required' });
      }

      const existingVideo = await this.videoModel.getVideoById(id);
      if (!existingVideo) {
        return res.status(404).json({ error: 'Video not found' });
      }

      await this.videoModel.updateVideo(id, {
        title,
        description,
        video_url,
        category_id,
        user_id
      });

      const updatedVideo = await this.videoModel.getVideoById(id);
      res.status(200).json(updatedVideo);
    } catch (error) {
      console.error('Error updating video:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  deleteVideo = async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid video ID' });
      }

      const existingVideo = await this.videoModel.getVideoById(id);
      if (!existingVideo) {
        return res.status(404).json({ error: 'Video not found' });
      }

      await this.videoModel.deleteVideo(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting video:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

module.exports = VideoController;