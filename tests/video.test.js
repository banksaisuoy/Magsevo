const request = require('supertest');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const videoRoutes = require('../src/routes/videoRoutes');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken', () => ({
    verify: jest.fn((token, secret) => {
        if (token === 'valid-token') {
            return { userId: 1 };
        } else {
            throw new Error('Invalid token');
        }
    })
}));

jest.mock('../src/services/videoProcessor', () => {
    return jest.fn().mockImplementation(() => {
        return {
            processVideo: jest.fn().mockResolvedValue(true)
        };
    });
});

describe('Video CRUD Integration Tests', () => {
    let app;
    let db;
    
    beforeAll((done) => {
        db = new sqlite3.Database(':memory:', async (err) => {
            if (err) return done(err);
            
            app = express();
            app.use(express.json());
            app.set('db', db);

            // Run Video init
            const Video = require('../src/models/Video');
            const videoModel = new Video(db);
            await videoModel.init();
            
            db.run(`CREATE TABLE categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL
            )`, (err) => {
                if (err) return done(err);
                db.run(`INSERT INTO categories (name) VALUES ('Test Category')`, (err) => {
                    if (err) return done(err);
                    app.use('/api/videos', videoRoutes);
                    done();
                });
            });
        });
    });

    afterAll((done) => {
        db.close(done);
    });
    
    let createdVideoId;

    it('should create a new video (POST /api/videos)', async () => {
        const res = await request(app)
            .post('/api/videos')
            .set('Authorization', 'Bearer valid-token')
            .send({
                title: 'Integration Test Video',
                description: 'Test description',
                url: 'http://example.com/video.mp4',
                categoryId: 1
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.title).toBe('Integration Test Video');
        createdVideoId = res.body.id;
    });

    it('should fetch all videos (GET /api/videos)', async () => {
        const res = await request(app)
            .get('/api/videos')
            .set('Authorization', 'Bearer valid-token');
            
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].title).toBe('Integration Test Video');
    });

    it('should fetch a video by id (GET /api/videos/:id)', async () => {
        const res = await request(app)
            .get(`/api/videos/${createdVideoId}`)
            .set('Authorization', 'Bearer valid-token');
            
        expect(res.status).toBe(200);
        expect(res.body.id).toBe(createdVideoId);
        expect(res.body.title).toBe('Integration Test Video');
    });

    it('should update a video (PUT /api/videos/:id)', async () => {
        const res = await request(app)
            .put(`/api/videos/${createdVideoId}`)
            .set('Authorization', 'Bearer valid-token')
            .send({
                title: 'Updated Video Title',
                description: 'Updated description',
                url: 'http://example.com/updated.mp4',
                categoryId: 1
            });

        expect(res.status).toBe(200);
        expect(res.body.title).toBe('Updated Video Title');
        expect(res.body.description).toBe('Updated description');
    });

    it('should delete a video (DELETE /api/videos/:id)', async () => {
        const res = await request(app)
            .delete(`/api/videos/${createdVideoId}`)
            .set('Authorization', 'Bearer valid-token');
            
        expect(res.status).toBe(204);
        
        const getRes = await request(app)
            .get(`/api/videos/${createdVideoId}`)
            .set('Authorization', 'Bearer valid-token');
        
        expect(getRes.status).toBe(404);
    });
});
