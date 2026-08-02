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
        app.use(express.json());

        mockDb = {
            get: jest.fn((sql, params, cb) => cb(null, { id: 1 })), // Simulate category exists
            run: jest.fn()
        };
        app.set('db', mockDb);

                .set('Authorization', 'Bearer valid-token')
                .send({
                    description: 'Some desc',
                    url: 'http://test.com',
                    categoryId: 1
                });

            expect(res.status).toBe(400);
            );
        });

        it('should return 400 for invalid url format', async () => {
            const res = await request(app)
                .post('/api/videos')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    title: 'My title',
                    url: 'not-a-url'
                });

            expect(res.status).toBe(400);
            expect(res.body.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ msg: 'Must be a valid URL', path: 'url' })
                ])
            );
        });

        it('should return 400 if categoryId does not exist in db', async () => {
            mockDb.get.mockImplementationOnce((sql, params, cb) => cb(null, null)); // Category not found

            const res = await request(app)
                .post('/api/videos')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    title: 'My title',
                    url: 'http://test.com',
                    categoryId: 999
                });

            expect(res.status).toBe(400);
            expect(res.body.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ msg: 'Category does not exist', path: 'categoryId' })
                ])
            );
        });
    });

    describe('PUT /api/videos/:id', () => {
        it('should return 400 for invalid payload (title too long)', async () => {
            const res = await request(app)
                .put('/api/videos/1')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    title: 'A'.repeat(256), // > 255 chars
                    url: 'http://test.com'
                });

            expect(res.status).toBe(400);
            );
        });

        it('should return 400 for invalid id param', async () => {
            const res = await request(app)
                .put('/api/videos/abc')
                .set('Authorization', 'Bearer valid-token')
                .send({
                    title: 'Valid title',
                    url: 'http://test.com'
                });

            expect(res.status).toBe(400);
            expect(res.body.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ msg: 'Video ID must be a positive integer', path: 'id' })
                ])
            );
        });
    });
});