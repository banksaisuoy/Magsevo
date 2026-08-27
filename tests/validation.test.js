const request = require('supertest');
const express = require('express');
const {
    validateVideoCreate,
    validateVideoUpdate,
    validateVideoId,
} = require('../src/middleware/validation');

describe('Validation Middleware', () => {
    const createApp = () => {
        const app = express();
        app.use(express.json());
        app.post('/api/videos', validateVideoCreate, (req, res) => res.status(201).json({ ok: true }));
        app.put('/api/videos/:id', validateVideoUpdate, (req, res) => res.status(200).json({ ok: true }));
        app.delete('/api/videos/:id', validateVideoId, (req, res) => res.status(204).end());
        return app;
    };

    it('rejects invalid video URL', async () => {
        const res = await request(createApp())
            .post('/api/videos')
            .send({ title: 'My title', url: 'not-a-url', categoryId: 1 });
        expect(res.status).toBe(400);
    });

    it('accepts a valid legacy URL payload', async () => {
        const res = await request(createApp())
            .post('/api/videos')
            .send({ title: 'My title', url: 'http://test.com/video.mp4', categoryId: 1 });
        expect(res.status).toBe(201);
    });

    it('rejects an overlong description', async () => {
        const res = await request(createApp())
            .put('/api/videos/1')
            .send({
                title: 'Valid title',
                description: 'A'.repeat(1001),
                videoUrl: 'http://test.com/video.mp4',
                categoryId: 1,
            });
        expect(res.status).toBe(400);
        expect(res.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'Description cannot exceed 1000 characters' }),
            ]),
        );
    });

    it('rejects a non-numeric video id', async () => {
        const res = await request(createApp()).delete('/api/videos/abc');
        expect(res.status).toBe(400);
    });
});
