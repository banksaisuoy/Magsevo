const request = require('supertest');
const startApp = require('../src/app');

let app;

beforeAll(async () => {
  app = await startApp(':memory:');
});

afterAll(async () => {
  if (app && app.closeDb) {
    await app.closeDb();
  }
});

describe('Video CRUD API', () => {
  let createdVideoId;

  it('should create a new video (POST /api/videos)', async () => {
    const res = await request(app)
      .post('/api/videos')
      .send({
        title: 'Test Video',
        description: 'Test description',
        video_url: 'http://example.com/video.mp4',
        category_id: 1,
        user_id: 1
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toEqual('Test Video');
    createdVideoId = res.body.id;
  });

  it('should return 400 when missing required fields (POST /api/videos)', async () => {
    const res = await request(app)
      .post('/api/videos')
      .send({
        description: 'No title or url'
      });
    expect(res.statusCode).toEqual(400);
  });

  it('should fetch all videos (GET /api/videos)', async () => {
    const res = await request(app).get('/api/videos');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should fetch a video by id (GET /api/videos/:id)', async () => {
    const res = await request(app).get(`/api/videos/${createdVideoId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.id).toEqual(createdVideoId);
    expect(res.body.title).toEqual('Test Video');
  });

  it('should return 404 for a non-existent video (GET /api/videos/:id)', async () => {
    const res = await request(app).get('/api/videos/9999');
    expect(res.statusCode).toEqual(404);
  });

  it('should update a video (PUT /api/videos/:id)', async () => {
    const res = await request(app)
      .put(`/api/videos/${createdVideoId}`)
      .send({
        title: 'Updated Video Title',
        description: 'Updated description',
        video_url: 'http://example.com/updated.mp4',
        category_id: 2,
        user_id: 1
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.title).toEqual('Updated Video Title');
    expect(res.body.video_url).toEqual('http://example.com/updated.mp4');
  });

  it('should delete a video (DELETE /api/videos/:id)', async () => {
    const res = await request(app).delete(`/api/videos/${createdVideoId}`);
    expect(res.statusCode).toEqual(204);

    const checkRes = await request(app).get(`/api/videos/${createdVideoId}`);
    expect(checkRes.statusCode).toEqual(404);
  });
});