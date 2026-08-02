const request = require('supertest');
const express = require('express');
const { validateVideoCreate, validateVideoUpdate, validateVideoId } = require('../src/middleware/validation');

const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken', () => ({
    verify: jest.fn((token, secret, cb) => {
        if (token === 'valid-token') {
            cb(null, { userId: 1 });
        } else {
            cb(new Error('Invalid token'));
        }
    })
}));

describe('Validation Middleware', () => {
    let app;
    let mockDb;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        mockDb = {
            run: jest.fn()
        };
        app.set('db', mockDb);
        
        // Mock routes to test validation
        app.post('/api/videos', validateVideoCreate, (req, res) => res.status(201).send());
        app.put('/api/videos/:id', validateVideoUpdate, (req, res) => res.status(200).send());
    });

    describe('POST /api/videos', () => {
        it('should return 400 for invalid url format', async () => {
            const res = await request(app)
                .post('/api/videos')
                .send({
                    title: 'My title',
                    url: 'not-a-url'

            const res = await request(app)
                .post('/api/videos')
                .send({
                    title: 'My title',
                    url: 'http://test.com',
        it('should return 400 for invalid payload (title too long)', async () => {
            const res = await request(app)
                .put('/api/videos/1')
                .send({
                    title: 'A'.repeat(1001),
                    url: 'http://test.com'
                });

            expect(res.status).toBe(400);
            expect(res.body.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ msg: 'Description cannot exceed 1000 characters', path: 'title' })
                ])
            );
        });

        it('should return 400 for invalid id param', async () => {
            const res = await request(app)
                .put('/api/videos/abc')
                .send({
                    title: 'Valid title',
                    url: 'http://test.com'
            );
        });
    });
});
