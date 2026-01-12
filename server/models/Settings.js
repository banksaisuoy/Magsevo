class Settings {
    static async get(db, key) {
        return new Promise((resolve, reject) => {
            db.get("SELECT value FROM settings WHERE key = ?", [key], (err, row) => {
                if (err) reject(err);
                else resolve(row ? row.value : null);
            });
        });
    }

    static async getAll(db) {
        return new Promise((resolve, reject) => {
            db.all("SELECT key, value FROM settings", [], (err, rows) => {
                if (err) reject(err);
                else {
                    const settings = {};
                    rows.forEach(r => settings[r.key] = r.value);
                    resolve(settings);
                }
            });
        });
    }

    static async set(db, key, value) {
        return new Promise((resolve, reject) => {
            db.run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [key, value], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
}

module.exports = Settings;
