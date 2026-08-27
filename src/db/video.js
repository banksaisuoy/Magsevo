const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const run = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        return reject(err);
      }
      resolve(this);
    });
  });
};

const get = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

const all = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
};

class VideoModel {
  constructor(db) {
    this.db = db;
  }

  async getAllVideos() {
    return all(this.db, `SELECT * FROM videos ORDER BY created_at DESC`);
  }

  async getVideoById(id) {
    return get(this.db, `SELECT * FROM videos WHERE id = ?`, [id]);
  }

  async createVideo(video) {
    const { title, description, video_url, category_id, user_id } = video;
    const safeDescription = description !== undefined ? description : null;
    const safeCategoryId = category_id !== undefined ? category_id : null;
    const safeUserId = user_id !== undefined ? user_id : null;

    const result = await run(
      this.db,
      `INSERT INTO videos (title, description, video_url, category_id, user_id) VALUES (?, ?, ?, ?, ?)`,
      [title, safeDescription, video_url, safeCategoryId, safeUserId]
    );
    return result.lastID;
  }

  async updateVideo(id, video) {
    const { title, description, video_url, category_id, user_id } = video;
    const safeDescription = description !== undefined ? description : null;
    const safeCategoryId = category_id !== undefined ? category_id : null;
    const safeUserId = user_id !== undefined ? user_id : null;

    const result = await run(
      this.db,
      `UPDATE videos SET title = ?, description = ?, video_url = ?, category_id = ?, user_id = ? WHERE id = ?`,
      [title, safeDescription, video_url, safeCategoryId, safeUserId, id]
    );
    return result.changes;
  }

  async deleteVideo(id) {
    const result = await run(this.db, `DELETE FROM videos WHERE id = ?`, [id]);
    return result.changes;
  }
}

module.exports = VideoModel;