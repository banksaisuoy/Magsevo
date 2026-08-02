const request = require('supertest');
const express = require('express');
const { getDB } = require('../db/connection');
const authRoutes = require('../routes/auth');
const { verifyToken } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Mock a protected route
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ success: true, userId: req.user.id });
});

// Use a test database file
const testDbPath = path.resolve(__dirname, '../visionhub.db');

describe('Auth Endpoints', () => {
  let db;

  beforeAll((done) => {
    // Delete test db if exists
    if (fs.existsSync(testDbPath)) {
        fs.unlinkSync(testDbPath);
    }
    
    process.env.JWT_SECRET = 'test-secret';
    
    db = getDB();
    // Wait for db init
    setTimeout(done, 500); 
  });

  afterAll((done) => {
    db.close((err) => {
        if (fs.existsSync(testDbPath)) {
            fs.unlinkSync(testDbPath);
        }
        done();
    });
  });

  afterEach((done) => {
     db.run("DELETE FROM users", () => done());
  });

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
  });

  it('should not register user with existing email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('User already exists');
  });

  it('should login successfully', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test2@example.com',
        password: 'password123'
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test2@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should not login with wrong password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test3@example.com',
        password: 'password123'
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test3@example.com',
        password: 'wrongpassword'
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body.error).toEqual('Invalid credentials');
  });

  it('should access a protected route with a valid token', async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test4@example.com',
        password: 'password123'
      });
      
    const token = registerRes.body.token;

    const res = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('userId');
  });

  it('should deny access to a protected route with an invalid token', async () => {
    const res = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer invalid-token`);

    expect(res.statusCode).toEqual(401);
    expect(res.body.error).toEqual('Invalid token');
  });
  
  it('should deny access to a protected route without token', async () => {
    const res = await request(app)
      .get('/api/protected');

    expect(res.statusCode).toEqual(401);
    expect(res.body.error).toEqual('Access token is required');
  });
});