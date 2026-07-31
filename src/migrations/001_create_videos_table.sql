CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    category_id INTEGER,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);