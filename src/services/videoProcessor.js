const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const VideoModel = require('../models/Video');

class VideoProcessor {
  constructor(db) {