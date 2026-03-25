import { Response } from 'express';
import { AuthRequest } from '../../../src/types/express';
import { prismaMock } from '../../__mocks__/prisma';
import {
  savePreferences,
  getPreferences,
} from '../../../src/controllers/preferencesController';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const buildRes = (): Response => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const buildReq = (body: object = {}, user?: object): AuthRequest =>
  ({ body, user } as unknown as AuthRequest);

const MOCK_PREFERENCE = {
  id: 1,
  userId: 1,
  gameTypes: 'Strategy,Cooperative',
  groupSize: 'small',
  complexity: 'medium',
} as any;

// ─── savePreferences ──────────────────────────────────────────────────────────
describe('savePreferences', () => {
  it('returns 401 when req.user is absent', async () => {
    const req = buildReq({ gameTypes: ['Strategy'], groupSize: 'small', complexity: 'medium' });
    const res = buildRes();
    await savePreferences(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 when gameTypes is not an array', async () => {
    const req = buildReq(
      { gameTypes: 'Strategy', groupSize: 'small', complexity: 'medium' },
      { userId: 1, email: 'u@u.com', role: 'user' },
    );
    const res = buildRes();
    await savePreferences(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('array') }),
    );
  });

  it('saves preferences and returns 200 on success', async () => {
    prismaMock.userPreference.upsert.mockResolvedValue(MOCK_PREFERENCE);

    const req = buildReq(
      { gameTypes: ['Strategy', 'Cooperative'], groupSize: 'small', complexity: 'medium' },
      { userId: 1, email: 'u@u.com', role: 'user' },
    );
    const res = buildRes();
    await savePreferences(req, res);

    expect(prismaMock.userPreference.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 1 },
        update: expect.objectContaining({ gameTypes: 'Strategy,Cooperative' }),
        create: expect.objectContaining({ userId: 1 }),
      }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          gameTypes: ['Strategy', 'Cooperative'],
          groupSize: 'small',
          complexity: 'medium',
        }),
      }),
    );
  });

  it('falls back to "any" for invalid groupSize values', async () => {
    prismaMock.userPreference.upsert.mockResolvedValue({
      ...MOCK_PREFERENCE,
      groupSize: 'any',
      complexity: 'any',
    });

    const req = buildReq(
      { gameTypes: [], groupSize: 'invalid-size', complexity: 'invalid-level' },
      { userId: 1, email: 'u@u.com', role: 'user' },
    );
    const res = buildRes();
    await savePreferences(req, res);

    expect(prismaMock.userPreference.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ groupSize: 'any', complexity: 'any' }),
      }),
    );
  });

  it('returns 500 on database error', async () => {
    prismaMock.userPreference.upsert.mockRejectedValue(new Error('DB error'));

    const req = buildReq(
      { gameTypes: ['Strategy'], groupSize: 'small', complexity: 'medium' },
      { userId: 1, email: 'u@u.com', role: 'user' },
    );
    const res = buildRes();
    await savePreferences(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── getPreferences ───────────────────────────────────────────────────────────
describe('getPreferences', () => {
  it('returns 401 when req.user is absent', async () => {
    const req = buildReq();
    const res = buildRes();
    await getPreferences(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns default preferences when none are stored for this user', async () => {
    prismaMock.userPreference.findUnique.mockResolvedValue(null);

    const req = buildReq({}, { userId: 1, email: 'u@u.com', role: 'user' });
    const res = buildRes();
    await getPreferences(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { gameTypes: [], groupSize: 'any', complexity: 'any' },
      }),
    );
  });

  it('returns stored preferences split into arrays on success', async () => {
    prismaMock.userPreference.findUnique.mockResolvedValue(MOCK_PREFERENCE);

    const req = buildReq({}, { userId: 1, email: 'u@u.com', role: 'user' });
    const res = buildRes();
    await getPreferences(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          gameTypes: ['Strategy', 'Cooperative'],
          groupSize: 'small',
          complexity: 'medium',
        }),
      }),
    );
  });

  it('returns empty gameTypes array when gameTypes field is null', async () => {
    prismaMock.userPreference.findUnique.mockResolvedValue({
      ...MOCK_PREFERENCE,
      gameTypes: null,
    });

    const req = buildReq({}, { userId: 1, email: 'u@u.com', role: 'user' });
    const res = buildRes();
    await getPreferences(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ gameTypes: [] }),
      }),
    );
  });

  it('returns 500 on database error', async () => {
    prismaMock.userPreference.findUnique.mockRejectedValue(new Error('DB error'));

    const req = buildReq({}, { userId: 1, email: 'u@u.com', role: 'user' });
    const res = buildRes();
    await getPreferences(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
