const fs = require('fs');
const path = require('path');
const { Database } = require('../../server/models');

const testDbPath = path.join(__dirname, 'test_models.db');

describe('Database Model', () => {
    let db;

    beforeAll(async () => {
        if (fs.existsSync(testDbPath)) {
            fs.unlinkSync(testDbPath);
        }
        db = new Database(testDbPath);
        await db.connect();
    });

    afterAll(async () => {
        await db.close();
        if (fs.existsSync(testDbPath)) {
            fs.unlinkSync(testDbPath);
        }
    });

    test('should connect to database', async () => {
        expect(db.db).toBeDefined();
    });

    test('should run query and create table', async () => {
        await expect(db.run('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)')).resolves.toBeDefined();
    });

    test('should insert and get data', async () => {
        await db.run('INSERT INTO test (name) VALUES (?)', ['John']);
        const row = await db.get('SELECT * FROM test WHERE name = ?', ['John']);
        expect(row.name).toBe('John');
    });

    test('should return all rows', async () => {
        await db.run('INSERT INTO test (name) VALUES (?)', ['Jane']);
        const rows = await db.all('SELECT * FROM test');
        expect(rows.length).toBe(2);
    });

    test('should create indexes', async () => {
        await db.run('CREATE TABLE videos (id INTEGER PRIMARY KEY, categoryId INTEGER, isFeatured BOOLEAN, views INTEGER, created_at DATETIME)');
        await db.run('CREATE TABLE user_favorites (userId TEXT, videoId INTEGER)');
        await db.run('CREATE TABLE comments (videoId INTEGER, userId TEXT)');
        await db.run('CREATE TABLE logs (userId TEXT, action TEXT)');
        await db.run('CREATE TABLE reports (videoId INTEGER)');
        await db.run('CREATE TABLE video_tags (videoId INTEGER, tagId INTEGER)');
        await db.run('CREATE TABLE playlist_videos (playlistId INTEGER)');
        await db.run('CREATE TABLE user_group_members (username TEXT, group_id INTEGER)');
        await db.run('CREATE TABLE user_permissions (username TEXT)');
        await db.run('CREATE TABLE group_permissions (group_id INTEGER)');

        await db.createIndexes();
    });

    test('should run analyze', async () => {
        await db.analyze();
    });

    test('should run vacuum', async () => {
        await db.vacuum();
    });

    test('should return statistics', async () => {
        await db.run('CREATE TABLE users (id INTEGER PRIMARY KEY)');
        await db.run('CREATE TABLE categories (id INTEGER PRIMARY KEY)');

        const stats = await db.getStatistics();
        expect(stats).toBeDefined();
        expect(stats.users_count).toBeDefined();
        expect(stats.database_size_mb).toBeDefined();
    });

    test('run with error', async () => {
        await expect(db.run('INVALID SQL')).rejects.toThrow();
    });

    test('get with error', async () => {
        await expect(db.get('INVALID SQL')).rejects.toThrow();
    });

    test('all with error', async () => {
        await expect(db.all('INVALID SQL')).rejects.toThrow();
    });
});
