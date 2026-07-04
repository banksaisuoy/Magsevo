const request = require('supertest');
const fs = require('fs');
const path = require('path');
const testDbPath = path.join(__dirname, 'test.db');
process.env.DB_PATH = testDbPath;
process.env.JWT_SECRET = 'test-secret';

const express = require('express');
const bodyParser = require('body-parser');
const apiRoutes = require('../../server/routes');
const { Database } = require('../../server/models/index');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());

describe('Backend Routes Integration Tests', () => {
    let testDb;

    beforeAll(async () => {
        const dbInstance = new Database(testDbPath);
        testDb = await dbInstance.connect();
        await dbInstance.db.run(`
            CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY, password TEXT, role TEXT);
        `);
        await dbInstance.db.run(`
            CREATE TABLE IF NOT EXISTS videos (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, videoUrl TEXT, isFeatured BOOLEAN, views INTEGER, categoryId INTEGER, created_at DATETIME);
        `);
        await dbInstance.db.run(`
            CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT);
        `);
        await dbInstance.db.run(`
            CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY AUTOINCREMENT, userId TEXT, action TEXT, details TEXT, created_at DATETIME);
        `);
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash('123456', 10);
        await testDb.run('INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)', ['user', hashedPassword, 'user']);
        await testDb.run('INSERT INTO categories (id, name) VALUES (1, "Test Category")');
        await testDb.run('INSERT INTO videos (id, title, videoUrl, isFeatured, views, categoryId) VALUES (1, "Test Video", "http://test.com", 1, 0, 1)');

        app.set('db', testDb);
        app.use('/api', apiRoutes);
    });

    afterAll(async () => {
        if (testDb) {
            await testDb.close();
        }
        // Cleanup test database
        if (fs.existsSync(testDbPath)) {
            fs.unlinkSync(testDbPath);
        }
    });

    describe('GET /api/videos', () => {
        it('should return a list of videos', async () => {
            const res = await request(app).get('/api/videos');
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.videos)).toBe(true);
        });
    });

    describe('GET /api/videos/:id', () => {
        it('should return a specific video', async () => {
            const res = await request(app).get('/api/videos/1');
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.video).toBeDefined();
        });

        it('should return 404 for non-existent video', async () => {
            const res = await request(app).get('/api/videos/9999');
            expect(res.statusCode).toEqual(404);
            expect(res.body.error).toBe('Video not found');
        });
    });

    describe('GET /api/categories', () => {
        it('should return a list of categories', async () => {
            const res = await request(app).get('/api/categories');
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.categories)).toBe(true);
        });
    });

    describe('POST /api/auth/login', () => {
        beforeAll(async () => {
            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash('123456', 10);
            await testDb.run('INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)', ['user', hashedPassword, 'user']);
        });
        it('should login a user with correct credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ username: 'user', password: '123456' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
            expect(res.body.user).toBeDefined();
        });

        it('should fail with incorrect credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ username: 'user', password: 'wrongpassword' });

            expect(res.statusCode).toEqual(401);
            expect(res.body.error).toBeDefined();
        });
    });
});
