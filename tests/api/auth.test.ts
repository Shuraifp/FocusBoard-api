import request from 'supertest';
import app from '../../src/app';
import { createTestUser } from '../helpers/testHelper';
import { AUTH_MESSAGES } from '../../src/constants/messages';

describe('Authentication API Tests', () => {

  describe('POST /api/auth/register', () => {

    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'Test123',
        });
      console.log('Response:', response.status, response.body);
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(AUTH_MESSAGES.REGISTRATION_SUCCESS);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.username).toBe('newuser');
      expect(response.body.data.user.email).toBe('newuser@example.com');
      expect(response.body.data.tokens).toHaveProperty('accessToken');
    });

    it('should return 400 for missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          // missing email and password
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe(AUTH_MESSAGES.MISSING_FIELDS);
    });

    it('should return 400 for weak password (less than 6 characters)', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'Test1', // Only 5 characters
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe(AUTH_MESSAGES.WEAK_PASSWORD);
    });

    it('should return 400 for password without number', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'TestPass', // No number
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe(AUTH_MESSAGES.WEAK_PASSWORD);
    });

    it('should return 409 for duplicate email', async () => {
      // Create a user first for duplicate email
      await createTestUser({
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'Test123',
      });

      // register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'existing@example.com',
          password: 'Test123',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe(AUTH_MESSAGES.USER_ALREADY_EXISTS);
    });
  });


  describe('POST /api/auth/login', () => {

    it('should login successfully with correct credentials', async () => {
      // Creating test user
      const { user, rawPassword } = await createTestUser({
        username: 'loginuser',
        email: 'login@example.com',
        password: 'Test123',
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: rawPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(AUTH_MESSAGES.LOGIN_SUCCESS);
      expect(response.body.data.user.email).toBe('login@example.com');
      expect(response.body.data.tokens).toHaveProperty('accessToken');
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'Test123',
          // missing email
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe(AUTH_MESSAGES.MISSING_EMAIL_PASSWORD);
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          // missing password
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe(AUTH_MESSAGES.MISSING_EMAIL_PASSWORD);
    });

    it('should return 401 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test123',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe(AUTH_MESSAGES.INVALID_CREDENTIALS);
    });

    it('should return 401 for invalid password', async () => {
      // Create a test user
      await createTestUser({
        username: 'loginuser',
        email: 'login@example.com',
        password: 'Test123',
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword123',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe(AUTH_MESSAGES.INVALID_CREDENTIALS);
    });
  });
});