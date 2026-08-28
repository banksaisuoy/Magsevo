const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const VideoModel = require('../db/video');

class VideoProcessor {
  constructor(db) {
    this.videoModel = new VideoModel(db);
  }

  async processVideo(videoId, inputFilePath) {
    try {
      await this.videoModel.updateVideoStatus(videoId, 'processing');

      const fileExt = path.extname(inputFilePath);
      const baseName = path.basename(inputFilePath, fileExt);
      const outputDir = path.dirname(inputFilePath);

      const resolution720pPath = path.join(outputDir, `${baseName}-720p.mp4`);
      const resolution480pPath = path.join(outputDir, `${baseName}-480p.mp4`);
      const thumbnailFileName = `${baseName}-thumbnail.jpg`;
      const thumbnailPath = path.join(outputDir, thumbnailFileName);

      await Promise.all([
        this.transcodeVideo(inputFilePath, resolution720pPath, '1280x720'),
        this.transcodeVideo(inputFilePath, resolution480pPath, '854x480'),
        this.extractThumbnail(inputFilePath, outputDir, thumbnailFileName)
      ]);

      const publicDir = path.join(__dirname, '../../public');
      const getRelativePath = (absPath) => absPath.replace(publicDir, '');

      await this.videoModel.updateVideoUrls(videoId, {
        resolution_720p_url: getRelativePath(resolution720pPath),
        resolution_480p_url: getRelativePath(resolution480pPath),
        thumbnail_url: getRelativePath(thumbnailPath)
      });
      await this.videoModel.updateVideoStatus(videoId, 'completed');

    } catch (error) {
      console.error('Error processing video:', error);
      await this.videoModel.updateVideoStatus(videoId, 'failed');
    }
  }

  transcodeVideo(inputPath, outputPath, resolution) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .size(resolution)
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(err))
        .run();
    });
  }

  extractThumbnail(inputPath, outputDir, filename) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .screenshots({
          count: 1,
          folder: outputDir,
          filename: filename,
          size: '320x240'
        })
        .on('end', () => resolve(path.join(outputDir, filename)))
        .on('error', (err) => reject(err));
    });
  }
}

module.exports = VideoProcessor;