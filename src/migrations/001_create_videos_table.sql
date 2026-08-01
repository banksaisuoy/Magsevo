    video_url TEXT NOT NULL,
    category_id INTEGER,
    user_id INTEGER,
    status TEXT DEFAULT 'pending',
    resolution_720p_url TEXT,
    resolution_480p_url TEXT,
    thumbnail_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);