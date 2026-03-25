/**
 * Tests for express-validator middleware chains and the handleValidationErrors helper.
 *
 * Strategy: run each middleware array against a real (in-memory) Express app
 * using supertest so the validators can execute their full chain.
 */
import express, { Request, Response } from 'express';
import request from 'supertest';
import {
  validateSignupInit,
  validateSignupComplete,
  validateSignin,
  validateVerifyOTP,
  validateResendOTP,
  validateBusinessAccessRequest,
  validateGuestSignup,
  handleValidationErrors,
} from '../../../src/middleware/validation';

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Build a minimal Express app that mounts a single POST / route with the given middleware. */
function buildApp(middleware: any[]) {
  const app = express();
  app.use(express.json());
  app.post('/', ...middleware, handleValidationErrors, (_req: Request, res: Response) => {
    res.status(200).json({ success: true });
  });
  return app;
}

// ─── handleValidationErrors ───────────────────────────────────────────────────
describe('handleValidationErrors', () => {
  it('passes through to next() when there are no errors', async () => {
    const app = buildApp(validateSignupInit);
    const res = await request(app).post('/').send({ email: 'valid@example.com' });
    expect(res.status).toBe(200);
  });

  it('returns 400 with an errors array when validation fails', async () => {
    const app = buildApp(validateSignupInit);
    const res = await request(app).post('/').send({ email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, errors: expect.any(Array) });
  });

  it('includes field name in each error object', async () => {
    const app = buildApp(validateSignupInit);
    const res = await request(app).post('/').send({ email: '' });
    expect(res.body.errors[0]).toHaveProperty('field');
    expect(res.body.errors[0]).toHaveProperty('message');
  });
});

// ─── validateSignupInit ───────────────────────────────────────────────────────
describe('validateSignupInit', () => {
  const app = buildApp(validateSignupInit);

  it('passes for a valid email', async () => {
    const res = await request(app).post('/').send({ email: 'user@example.com' });
    expect(res.status).toBe(200);
  });

  it('fails for an invalid email', async () => {
    const res = await request(app).post('/').send({ email: 'not-an-email' });
    expect(res.status).toBe(400);
  });

  it('fails when email is missing', async () => {
    const res = await request(app).post('/').send({});
    expect(res.status).toBe(400);
  });
});

// ─── validateSignupComplete ───────────────────────────────────────────────────
describe('validateSignupComplete', () => {
  const app = buildApp(validateSignupComplete);

  const VALID_BODY = {
    email: 'user@example.com',
    password: 'Secure1!',
  };

  it('passes for valid email and strong password', async () => {
    const res = await request(app).post('/').send(VALID_BODY);
    expect(res.status).toBe(200);
  });

  it('fails when password is too short', async () => {
    const res = await request(app).post('/').send({ ...VALID_BODY, password: 'Ab1!' });
    expect(res.status).toBe(400);
  });

  it('fails when password has no uppercase letter', async () => {
    const res = await request(app).post('/').send({ ...VALID_BODY, password: 'nouppercase1!' });
    expect(res.status).toBe(400);
  });

  it('fails when password has no lowercase letter', async () => {
    const res = await request(app).post('/').send({ ...VALID_BODY, password: 'NOLOWER1!' });
    expect(res.status).toBe(400);
  });

  it('fails when password has no digit', async () => {
    const res = await request(app).post('/').send({ ...VALID_BODY, password: 'NoDigitsHere!' });
    expect(res.status).toBe(400);
  });

  it('fails when password has no special character', async () => {
    const res = await request(app).post('/').send({ ...VALID_BODY, password: 'NoSpecial1' });
    expect(res.status).toBe(400);
  });
});

// ─── validateSignin ───────────────────────────────────────────────────────────
describe('validateSignin', () => {
  const app = buildApp(validateSignin);

  it('passes with valid email and password', async () => {
    const res = await request(app).post('/').send({ email: 'u@x.com', password: 'anypass' });
    expect(res.status).toBe(200);
  });

  it('fails when email is missing', async () => {
    const res = await request(app).post('/').send({ password: 'pass' });
    expect(res.status).toBe(400);
  });

  it('fails when password is missing', async () => {
    const res = await request(app).post('/').send({ email: 'u@x.com' });
    expect(res.status).toBe(400);
  });

  it('fails when email is invalid', async () => {
    const res = await request(app).post('/').send({ email: 'bad', password: 'pass' });
    expect(res.status).toBe(400);
  });
});

// ─── validateVerifyOTP ────────────────────────────────────────────────────────
describe('validateVerifyOTP', () => {
  const app = buildApp(validateVerifyOTP);

  it('passes with valid email and 6-digit OTP', async () => {
    const res = await request(app).post('/').send({ email: 'u@x.com', otp: '123456' });
    expect(res.status).toBe(200);
  });

  it('fails when OTP is fewer than 6 digits', async () => {
    const res = await request(app).post('/').send({ email: 'u@x.com', otp: '123' });
    expect(res.status).toBe(400);
  });

  it('fails when OTP contains non-numeric characters', async () => {
    const res = await request(app).post('/').send({ email: 'u@x.com', otp: '12345a' });
    expect(res.status).toBe(400);
  });

  it('fails when OTP is missing', async () => {
    const res = await request(app).post('/').send({ email: 'u@x.com' });
    expect(res.status).toBe(400);
  });
});

// ─── validateResendOTP ────────────────────────────────────────────────────────
describe('validateResendOTP', () => {
  const app = buildApp(validateResendOTP);

  it('passes with valid email', async () => {
    const res = await request(app).post('/').send({ email: 'u@x.com' });
    expect(res.status).toBe(200);
  });

  it('fails with invalid email', async () => {
    const res = await request(app).post('/').send({ email: 'not-email' });
    expect(res.status).toBe(400);
  });
});

// ─── validateGuestSignup ──────────────────────────────────────────────────────
describe('validateGuestSignup', () => {
  const app = buildApp(validateGuestSignup);

  it('passes with valid email', async () => {
    const res = await request(app).post('/').send({ email: 'guest@example.com' });
    expect(res.status).toBe(200);
  });

  it('fails with empty email', async () => {
    const res = await request(app).post('/').send({ email: '' });
    expect(res.status).toBe(400);
  });
});

// ─── validateBusinessAccessRequest ───────────────────────────────────────────
describe('validateBusinessAccessRequest', () => {
  const app = buildApp(validateBusinessAccessRequest);

  const VALID_BODY = {
    cafeName: 'My Cafe',
    ownerName: 'Jane Owner',
    email: 'jane@cafe.com',
    city: 'Toronto',
  };

  it('passes with all valid required fields', async () => {
    const res = await request(app).post('/').send(VALID_BODY);
    expect(res.status).toBe(200);
  });

  it('passes with optional phone and message included', async () => {
    const res = await request(app)
      .post('/')
      .send({ ...VALID_BODY, phone: '416-555-1234', message: 'Hello' });
    expect(res.status).toBe(200);
  });

  it('fails when cafeName is missing', async () => {
    const { cafeName: _, ...body } = VALID_BODY;
    const res = await request(app).post('/').send(body);
    expect(res.status).toBe(400);
  });

  it('fails when ownerName is too short (< 2 chars)', async () => {
    const res = await request(app).post('/').send({ ...VALID_BODY, ownerName: 'X' });
    expect(res.status).toBe(400);
  });

  it('fails when email is invalid', async () => {
    const res = await request(app).post('/').send({ ...VALID_BODY, email: 'bad-email' });
    expect(res.status).toBe(400);
  });

  it('fails when city is missing', async () => {
    const { city: _, ...body } = VALID_BODY;
    const res = await request(app).post('/').send(body);
    expect(res.status).toBe(400);
  });

  it('fails when message exceeds 1000 characters', async () => {
    const res = await request(app)
      .post('/')
      .send({ ...VALID_BODY, message: 'x'.repeat(1001) });
    expect(res.status).toBe(400);
  });
});
