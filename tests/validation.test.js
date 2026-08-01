const request = require('supertest');
const express = require('express');
const videoRoutes = require('../src/routes/videoRoutes');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken', () => ({
    verify: jest.fn((token, secret, options, callback) => {
        if (token === 'valid-token') {
            callback(null, { id: 1, username: 'testuser' });
        } else {
            callback(new Error('Invalid token'), null);
        }
    })
}));

describe('Video Route Validation', () => {
    let app;
    let mockDb;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        mockDb = {
            get: jest.fn(),
            run: jest.fn().mockResolvedValue({ lastID: 1, changes: 1 })
        };
        app.set('db', mockDb);

        app.use('/api/videos', videoRoutes);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/videos', () => {
        it('should return 400 for invalid payload (missing title)', async () => {
            const res = await request(app)
                .post('/api/videos')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    description: 'Some desc',
                    video_url: 'http://test.com',
                    category: 'Development'
                });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ msg: 'Title is required', path: 'title' })
                ])
            );
        });

        it('should return 400 for invalid payload (missing category)', async () => {
            const res = await request(app)
                .post('/api/videos')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    title: 'My title',
                    video_url: 'http://test.com'
                });

            expect(res.status).toBe(400);
            expect(res.body.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ msg: 'Category is required', path: 'category' })
                ])
            );
        });

        it('should return 400 if category does not exist in db', async () => {
            mockDb.get.mockResolvedValueOnce(null); // Category not found

            const res = await request(app)
                .post('/api/videos')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    title: 'My title',
                    video_url: 'http://test.com',
                    category: 'NonExistent'
                });

            expect(res.status).toBe(400);
            expect(res.body.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ msg: 'Category does not exist', path: 'category' })
                ])
            );
        });

        it('should return 201 for valid payload', async () => {
            mockDb.get.mockResolvedValueOnce({ id: 2 }); // Category found
            mockDb.run.mockResolvedValueOnce({ lastID: 10 });

            const res = await request(app)
                .post('/api/videos')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    title: 'Valid title',
                    description: 'Valid description',
                    video_url: 'http://test.com',
                    category: 'Development',
                    tags: ['tag1', 'tag2']
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(mockDb.get).toHaveBeenCalledWith('SELECT id FROM categories WHERE name = ?', ['Development']);
            // A second get might be called inside the route depending on the implementation
        });
    });

    describe('PUT /api/videos/:id', () => {
        it('should return 400 for invalid payload (title too long)', async () => {
            mockDb.get.mockResolvedValueOnce({ id: 1, title: 'Old' }); // Mock existing video

            const res = await request(app)
                .put('/api/videos/1')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    title: 'A'.repeat(256), // > 255 chars
                    video_url: 'http://test.com',
                    category: 'Development'
                });

            expect(res.status).toBe(400);
            expect(res.body.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ msg: 'Title cannot exceed 255 characters', path: 'title' })
                ])
            );
        });

        it('should return 200 for valid payload', async () => {
            mockDb.get.mockResolvedValueOnce({ id: 2 }); // Category found
            mockDb.get.mockResolvedValueOnce({ id: 1, title: 'Old' }); // Existing video
            
            const res = await request(app)
                .put('/api/videos/1')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    title: 'Valid title',
                    video_url: 'http://test.com',
                    category: 'Development'
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });
});
