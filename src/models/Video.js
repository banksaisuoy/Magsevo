class Video {
  constructor(db) {
    this.db = db;
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  async init() {
    await this.run(`
      CREATE TABLE IF NOT EXISTS videos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        video_url TEXT,
        category_id INTEGER,
        status TEXT DEFAULT 'pending',
        resolution_720p_url TEXT,
        resolution_480p_url TEXT,
        thumbnail_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await this.run(`CREATE INDEX IF NOT EXISTS idx_videos_category_id ON videos(category_id)`);
    await this.run(`CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status)`);
  }

  async create(videoData) {
    const { title, description, url, categoryId } = videoData;
    const safeDescription = description !== undefined ? description : null;
    const safeCategoryId = categoryId !== undefined ? categoryId : null;

    const result = await this.run(
      `INSERT INTO videos (title, description, video_url, category_id, status) VALUES (?, ?, ?, ?, 'pending')`,
      [title, safeDescription, url, safeCategoryId]
    );
    return result.lastID;
  }

  async findAll({ limit = 50, offset = 0 } = {}) {
    return await this.all(`SELECT * FROM videos ORDER BY created_at DESC LIMIT ? OFFSET ?`, [limit, offset]);
  }

  async findById(id) {
    return await this.get(`SELECT * FROM videos WHERE id = ?`, [id]);
  }

  async update(id, updateData) {
    const { title, description, url, categoryId } = updateData;
    let setClause = [];
    let params = [];
    
    if (title !== undefined) {
      setClause.push('title = ?');
      params.push(title);
    }
    if (description !== undefined) {
      setClause.push('description = ?');
      params.push(description);
    }
    if (url !== undefined) {
      setClause.push('video_url = ?');
      params.push(url);
    }
    if (categoryId !== undefined) {
      setClause.push('category_id = ?');
      params.push(categoryId);
    }
    
    setClause.push('updated_at = CURRENT_TIMESTAMP');

    if (setClause.length === 1) return 0; // only updated_at

    params.push(id);
    const result = await this.run(
      `UPDATE videos SET ${setClause.join(', ')} WHERE id = ?`,
      params
    );
    return result.changes;
  }

  async delete(id) {
    const result = await this.run(`DELETE FROM videos WHERE id = ?`, [id]);
    return result.changes;
  }

  async updateVideoStatus(id, status) {
    const result = await this.run(
      `UPDATE videos SET status = ? WHERE id = ?`,
      [status, id]
    );
    return result.changes;
  }

  async updateVideoUrls(id, urls) {
    const { resolution_720p_url, resolution_480p_url, thumbnail_url } = urls;
    let setClause = [];
    let params = [];
    
    if (resolution_720p_url !== undefined) {
      setClause.push('resolution_720p_url = ?');
      params.push(resolution_720p_url);
    }
    if (resolution_480p_url !== undefined) {
      setClause.push('resolution_480p_url = ?');
      params.push(resolution_480p_url);
    }
    if (thumbnail_url !== undefined) {
      setClause.push('thumbnail_url = ?');
      params.push(thumbnail_url);
    }

    if (setClause.length === 0) return 0;

    params.push(id);
    const result = await this.run(
      `UPDATE videos SET ${setClause.join(', ')} WHERE id = ?`,
      params
    );
    return result.changes;
  }
}

module.exports = Video;