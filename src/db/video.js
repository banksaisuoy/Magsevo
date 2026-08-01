  }

  async createVideo(video) {
    const { title, description, video_url, category_id, user_id, status } = video;
    const safeDescription = description !== undefined ? description : null;
    const safeCategoryId = category_id !== undefined ? category_id : null;
    const safeUserId = user_id !== undefined ? user_id : null;
    const safeStatus = status !== undefined ? status : 'pending';

    const result = await run(
      this.db,
      `INSERT INTO videos (title, description, video_url, category_id, user_id, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [title, safeDescription, video_url, safeCategoryId, safeUserId, safeStatus]
    );
    return result.lastID;
  }

  async updateVideoStatus(id, status) {
    const result = await run(
      this.db,
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
    const result = await run(
      this.db,
      `UPDATE videos SET ${setClause.join(', ')} WHERE id = ?`,
      params
    );
    return result.changes;
  }

  async updateVideo(id, video) {
    const { title, description, video_url, category_id, user_id } = video;
    const safeDescription = description !== undefined ? description : null;