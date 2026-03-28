jest.mock('../../../src/config/jwt', () => ({
  jwtConfig: {
    secret: 'test-secret',
    refreshSecret: 'test-refresh-secret',
    expiresIn: '15m',
    refreshExpiresIn: '7d',
  },
}));

import { Response } from 'express';
import { AuthRequest } from '../../../src/types/express';
import { prismaMock } from '../../__mocks__/prisma';
import {
  getProfile,
  getSetupPrefill,
  updateProfile,
  getTables,
  addTable,
  removeTable,
  getHours,
  updateHours,
  getGames,
  addGame,
  removeGame,
  getDashboardStats,
  completeSetup,
  getPricing,
  updatePricing,
  getReservations,
  createWalkInReservation,
  deleteBusinessAccount,
  updateReservationStatus,
} from '../../../src/controllers/businessSystemController';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const buildRes = (): Response => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const buildReq = (body: object = {}, params: object = {}, user?: object): AuthRequest =>
  ({ body, params, user } as unknown as AuthRequest);

/** Set up the DB mock so getBusinessRestaurant() resolves to restaurantId=1 */
const mockLinkedRestaurant = () => {
  prismaMock.user.findUnique.mockResolvedValue({ restaurantId: 1 } as any);
};

/** Set up the DB mock so getBusinessRestaurant() finds no restaurant for the user */
const mockNoRestaurant = () => {
  prismaMock.user.findUnique.mockResolvedValue({ restaurantId: null } as any);
};

const MOCK_RESTAURANT = {
  id: 1, name: 'Test Cafe', city: 'Toronto', operatingHours: [],
  tables: [], restaurantGames: [], _count: {},
} as any;

const MOCK_TABLE = {
  id: 1, name: 'Table 1', capacity: 4, minCapacity: 1,
  type: 'Round', status: 'available', restaurantId: 1,
} as any;

const MOCK_HOURS = [
  { id: 1, restaurantId: 1, dayOfWeek: 'Monday', openTime: 600, closeTime: 1320, isClosed: false },
] as any;

const MOCK_GAME = {
  id: 1, bggId: '174430', name: 'Gloomhaven', imageUrl: null,
  category: 'Adventure', difficulty: 'Hard', minPlayers: 1, maxPlayers: 4,
  estimatedPlayTime: 120, bggRating: null, ageRating: null,
} as any;

// ─── getProfile ───────────────────────────────────────────────────────────────
describe('getProfile', () => {
  it('returns 401 when user is not authenticated', async () => {
    const req = buildReq();
    const res = buildRes();
    await getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 404 when no restaurant is linked to the user', async () => {
    mockNoRestaurant();

    const req = buildReq({}, {}, { userId: 1, email: 'b@b.com', role: 'business' });
    const res = buildRes();
    await getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 200 with restaurant data when authenticated and linked', async () => {
    mockLinkedRestaurant();
    prismaMock.restaurant.findUnique.mockResolvedValue(MOCK_RESTAURANT);

    const req = buildReq({}, {}, { userId: 1, email: 'b@b.com', role: 'business' });
    const res = buildRes();
    await getProfile(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: MOCK_RESTAURANT }),
    );
  });
});

// ─── getSetupPrefill ──────────────────────────────────────────────────────────
describe('getSetupPrefill', () => {
  it('returns 401 when user is not authenticated', async () => {
    const req = buildReq();
    const res = buildRes();
    await getSetupPrefill(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns data:null when no approved access request exists', async () => {
    prismaMock.businessAccessRequest.findFirst.mockResolvedValue(null);

    const req = buildReq({}, {}, { userId: 1, email: 'b@b.com', role: 'business' });
    const res = buildRes();
    await getSetupPrefill(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: null }),
    );
  });

  it('returns prefill data when an approved access request exists', async () => {
    const prefill = { cafeName: 'Test Cafe', ownerName: 'Owner', email: 'o@o.com', phone: null, city: 'Toronto' };
    prismaMock.businessAccessRequest.findFirst.mockResolvedValue(prefill as any);

    const req = buildReq({}, {}, { userId: 1, email: 'b@b.com', role: 'business' });
    const res = buildRes();
    await getSetupPrefill(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: prefill }),
    );
  });
});

// ─── updateProfile ────────────────────────────────────────────────────────────
describe('updateProfile', () => {
  it('returns 401 when unauthenticated', async () => {
    const req = buildReq({ name: 'New Name' });
    const res = buildRes();
    await updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 for an invalid contactEmail', async () => {
    mockLinkedRestaurant();

    const req = buildReq(
      { contactEmail: 'not-an-email' },
      {},
      { userId: 1, email: 'b@b.com', role: 'business' },
    );
    const res = buildRes();
    await updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('email') }),
    );
  });

  it('returns 400 for an invalid website URL', async () => {
    mockLinkedRestaurant();

    const req = buildReq(
      { website: 'not-a-url' },
      {},
      { userId: 1, email: 'b@b.com', role: 'business' },
    );
    const res = buildRes();
    await updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 for an empty business name string', async () => {
    mockLinkedRestaurant();

    const req = buildReq(
      { name: '   ' },
      {},
      { userId: 1, email: 'b@b.com', role: 'business' },
    );
    const res = buildRes();
    await updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('updates and returns 200 on valid payload', async () => {
    mockLinkedRestaurant();
    prismaMock.restaurant.update.mockResolvedValue({ ...MOCK_RESTAURANT, name: 'New Name' });

    const req = buildReq(
      { name: 'New Name' },
      {},
      { userId: 1, email: 'b@b.com', role: 'business' },
    );
    const res = buildRes();
    await updateProfile(req, res);

    expect(prismaMock.restaurant.update).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });
});

// ─── getTables ────────────────────────────────────────────────────────────────
describe('getTables', () => {
  it('returns 401 when unauthenticated', async () => {
    const req = buildReq();
    const res = buildRes();
    await getTables(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 200 with tables on success', async () => {
    mockLinkedRestaurant();
    prismaMock.table.findMany.mockResolvedValue([MOCK_TABLE]);

    const req = buildReq({}, {}, { userId: 1, email: 'b@b.com', role: 'business' });
    const res = buildRes();
    await getTables(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: [MOCK_TABLE] }),
    );
  });
});

// ─── addTable ─────────────────────────────────────────────────────────────────
describe('addTable', () => {
  it('returns 401 when unauthenticated', async () => {
    const req = buildReq({ name: 'T1', capacity: 4 });
    const res = buildRes();
    await addTable(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 when table name is empty', async () => {
    mockLinkedRestaurant();

    const req = buildReq({ name: '', capacity: 4 }, {}, { userId: 1, email: 'b@b.com', role: 'business' });
    const res = buildRes();
    await addTable(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('name') }),
    );
  });

  it('returns 400 when capacity is out of range (0)', async () => {
    mockLinkedRestaurant();

    const req = buildReq({ name: 'T1', capacity: 0 }, {}, { userId: 1, email: 'b@b.com', role: 'business' });
    const res = buildRes();
    await addTable(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when capacity exceeds 50', async () => {
    mockLinkedRestaurant();

    const req = buildReq({ name: 'T1', capacity: 51 }, {}, { userId: 1, email: 'b@b.com', role: 'business' });
    const res = buildRes();
    await addTable(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 for an invalid table type', async () => {
    mockLinkedRestaurant();

    const req = buildReq(
      { name: 'T1', capacity: 4, type: 'Invalid' },
      {},
      { userId: 1, email: 'b@b.com', role: 'business' },
    );
    const res = buildRes();
    await addTable(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('creates table and returns 201 on valid input', async () => {
    mockLinkedRestaurant();
    prismaMock.table.create.mockResolvedValue(MOCK_TABLE);

    const req = buildReq(
      { name: 'Table 1', capacity: 4, type: 'Round' },
      {},
      { userId: 1, email: 'b@b.com', role: 'business' },
    );
    const res = buildRes();
    await addTable(req, res);

    expect(prismaMock.table.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

// ─── removeTable ──────────────────────────────────────────────────────────────
describe('removeTable', () => {
  it('returns 401 when unauthenticated', async () => {
    const req = buildReq({}, { id: '1' });
    const res = buildRes();
    await removeTable(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 404 when table is not found or does not belong to restaurant', async () => {
    mockLinkedRestaurant();
    prismaMock.table.findFirst.mockResolvedValue(null);

    const req = buildReq({}, { id: '99' }, { userId: 1, email: 'b@b.com', role: 'business' });
    const res = buildRes();
    await removeTable(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('removes table and returns 200 on success', async () => {
    mockLinkedRestaurant();
    prismaMock.table.findFirst.mockResolvedValue(MOCK_TABLE);
    prismaMock.table.delete.mockResolvedValue(MOCK_TABLE);

    const req = buildReq({}, { id: '1' }, { userId: 1, email: 'b@b.com', role: 'business' });
    const res = buildRes();
    await removeTable(req, res);

    expect(prismaMock.table.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });
});

// ─── getHours ─────────────────────────────────────────────────────────────────
describe('getHours', () => {
  it('returns 401 when unauthenticated', async () => {
    const req = buildReq();
    const res = buildRes();
    await getHours(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 200 with hours on success', async () => {
    mockLinkedRestaurant();
    prismaMock.operatingHours.findMany.mockResolvedValue(MOCK_HOURS);

    const req = buildReq({}, {}, { userId: 1, email: 'b@b.com', role: 'business' });
    const res = buildRes();
    await getHours(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: MOCK_HOURS }),
    );
  });
});

// ─── updateHours ──────────────────────────────────────────────────────────────
describe('updateHours', () => {
  const VALID_HOURS = [
    { dayOfWeek: 'Monday', openTime: 600, closeTime: 1320, isClosed: false },
  ];

  it('returns 401 when unauthenticated', async () => {
    const req = buildReq({ hours: VALID_HOURS });
    const res = buildRes();
    await updateHours(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 when hours is not an array', async () => {
    mockLinkedRestaurant();

    const req = buildReq({ hours: 'monday' }, {}, { userId: 1, email: 'b@b.com', role: 'business' });
    const res = buildRes();
    await updateHours(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 for an invalid day name', async () => {
    mockLinkedRestaurant();

    const req = buildReq(
      { hours: [{ dayOfWeek: 'Funday', openTime: 600, closeTime: 1200, isClosed: false }] },
      {},
      { userId: 1, email: 'b@b.com', role: 'business' },
    );
    const res = buildRes();
    await updateHours(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('Invalid day') }),
    );
  });

  it('returns 400 when closeTime is not after openTime', async () => {
    mockLinkedRestaurant();

    const req = buildReq(
      { hours: [{ dayOfWeek: 'Monday', openTime: 1200, closeTime: 600, isClosed: false }] },
      {},
      { userId: 1, email: 'b@b.com', role: 'business' },
    );
    const res = buildRes();
    await updateHours(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('Close time') }),
    );
  });

  it('saves hours and returns 200 on valid input', async () => {
    mockLinkedRestaurant();
    prismaMock.operatingHours.deleteMany.mockResolvedValue({ count: 1 });
    prismaMock.operatingHours.createMany.mockResolvedValue({ count: 1 });
    prismaMock.operatingHours.findMany.mockResolvedValue(MOCK_HOURS);

    const req = buildReq({ hours: VALID_HOURS }, {}, { userId: 1, email: 'b@b.com', role: 'business' });
    const res = buildRes();
    await updateHours(req, res);

    expect(prismaMock.operatingHours.deleteMany).toHaveBeenCalled();
    expect(prismaMock.operatingHours.createMany).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });

  it('accepts an isClosed=true entry without validating times', async () => {
    mockLinkedRestaurant();
    prismaMock.operatingHours.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.operatingHours.createMany.mockResolvedValue({ count: 1 });
    prismaMock.operatingHours.findMany.mockResolvedValue([]);

    const req = buildReq(
      { hours: [{ dayOfWeek: 'Sunday', isClosed: true }] },
      {},
      { userId: 1, email: 'b@b.com', role: 'business' },
    );
    const res = buildRes();
    await updateHours(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });
});

// ─── getGames ─────────────────────────────────────────────────────────────────
describe('getGames (business system)', () => {
  it('returns 401 when unauthenticated', async () => {
    const req = buildReq();
    const res = buildRes();
    await getGames(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 200 with mapped game data', async () => {
    mockLinkedRestaurant();
    prismaMock.restaurantGame.findMany.mockResolvedValue([
      { id: 10, status: 'available', game: MOCK_GAME } as any,
    ]);

    const req = buildReq({}, {}, { userId: 1, email: 'b@b.com', role: 'business' });
    const res = buildRes();
    await getGames(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({ restaurantGameId: 10, status: 'available' }),
        ]),
      }),
    );
  });
});

// ─── addGame ──────────────────────────────────────────────────────────────────
describe('addGame', () => {
  it('returns 401 when unauthenticated', async () => {
    const req = buildReq({ bggId: '174430', name: 'Gloomhaven' });
    const res = buildRes();
    await addGame(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 when bggId or name is missing', async () => {
    mockLinkedRestaurant();

    const req = buildReq({ bggId: '' }, {}, { userId: 1, email: 'b@b.com', role: 'business' });
    const res = buildRes();
    await addGame(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 409 when game is already in the library', async () => {
    mockLinkedRestaurant();
    prismaMock.game.upsert.mockResolvedValue(MOCK_GAME);
    prismaMock.restaurantGame.findFirst.mockResolvedValue({ id: 5 } as any); // already linked

    const req = buildReq(
      { bggId: '174430', name: 'Gloomhaven' },
      {},
      { userId: 1, email: 'b@b.com', role: 'business' },
    );
    const res = buildRes();
    await addGame(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('creates restaurant-game link and returns 201 on success', async () => {
    mockLinkedRestaurant();
    prismaMock.game.upsert.mockResolvedValue(MOCK_GAME);
    prismaMock.restaurantGame.findFirst.mockResolvedValue(null);
    prismaMock.restaurantGame.create.mockResolvedValue({
      id: 10, status: 'available', restaurantId: 1, gameId: 1, game: MOCK_GAME,
    } as any);

    const req = buildReq(
      { bggId: '174430', name: 'Gloomhaven' },
      {},
      { userId: 1, email: 'b@b.com', role: 'business' },
    );
    const res = buildRes();
    await addGame(req, res);

    expect(prismaMock.restaurantGame.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

// ─── removeGame ───────────────────────────────────────────────────────────────
describe('removeGame', () => {
  it('returns 401 when unauthenticated', async () => {
    const req = buildReq({}, { id: '10' });
    const res = buildRes();
    await removeGame(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 404 when the restaurant-game record does not exist', async () => {
    mockLinkedRestaurant();
    prismaMock.restaurantGame.findFirst.mockResolvedValue(null);

    const req = buildReq({}, { id: '99' }, { userId: 1, email: 'b@b.com', role: 'business' });
    const res = buildRes();
    await removeGame(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('deletes the game and returns 200 on success', async () => {
    mockLinkedRestaurant();
    prismaMock.restaurantGame.findFirst.mockResolvedValue({ id: 10, restaurantId: 1, gameId: 1 } as any);
    prismaMock.restaurantGame.delete.mockResolvedValue({ id: 10 } as any);

    const req = buildReq({}, { id: '10' }, { userId: 1, email: 'b@b.com', role: 'business' });
    const res = buildRes();
    await removeGame(req, res);

    expect(prismaMock.restaurantGame.delete).toHaveBeenCalledWith({ where: { id: 10 } });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});

// ─── getDashboardStats ────────────────────────────────────────────────────────
describe('getDashboardStats', () => {
  it('returns 401 when unauthenticated', async () => {
    const req = buildReq();
    const res = buildRes();
    await getDashboardStats(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 404 when no restaurant is linked', async () => {
    mockNoRestaurant();

    const req = buildReq({}, {}, { userId: 1, email: 'b@b.com', role: 'business' });
    const res = buildRes();
    await getDashboardStats(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns dashboard stats with defaults when no completed reservations exist', async () => {
    mockLinkedRestaurant();
    prismaMock.table.count.mockResolvedValue(5);
    prismaMock.reservation.findMany
      .mockResolvedValueOnce([]) // occupiedTables
      .mockResolvedValueOnce([]) // todayReservations
      .mockResolvedValueOnce([]) // weekReservations
      .mockResolvedValueOnce([]); // completedRecent

    const req = buildReq({}, {}, { userId: 1, email: 'b@b.com', role: 'business' });
    const res = buildRes();
    await getDashboardStats(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          occupancy: { occupied: 0, total: 5 },
          avgSessionMinutes: 150, // default when no completed reservations
        }),
      }),
    );
  });

  it('calculates average session time from completed reservations', async () => {
    mockLinkedRestaurant();
    prismaMock.table.count.mockResolvedValue(3);

    const start = new Date('2026-03-24T10:00:00Z');
    const end = new Date('2026-03-24T12:30:00Z'); // 150 min

    prismaMock.reservation.findMany
      .mockResolvedValueOnce([]) // occupied
      .mockResolvedValueOnce([]) // today
      .mockResolvedValueOnce([]) // week
      .mockResolvedValueOnce([{ startTime: start, endTime: end }] as any); // completed

    const req = buildReq({}, {}, { userId: 1, email: 'b@b.com', role: 'business' });
    const res = buildRes();
    await getDashboardStats(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ avgSessionMinutes: 150 }),
      }),
    );
  });

  it('returns 500 on database error', async () => {
    mockLinkedRestaurant();
    prismaMock.table.count.mockRejectedValue(new Error('DB error'));

    const req = buildReq({}, {}, { userId: 1, email: 'b@b.com', role: 'business' });
    const res = buildRes();
    await getDashboardStats(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── completeSetup ────────────────────────────────────────────────────────────
describe('completeSetup', () => {
  it('returns 401 when unauthenticated', async () => {
    const req = buildReq();
    const res = buildRes();
    await completeSetup(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('creates a restaurant when user has none, then completes setup', async () => {
    // First findUnique returns no restaurantId → triggers create flow
    prismaMock.user.findUnique.mockResolvedValue({ restaurantId: null } as any);
    prismaMock.businessAccessRequest.findFirst.mockResolvedValue({ cafeName: 'My Test Cafe' } as any);
    prismaMock.restaurant.create.mockResolvedValue({ id: 2, name: 'My Test Cafe' } as any);
    prismaMock.user.update.mockResolvedValue({} as any);
    prismaMock.restaurant.update.mockResolvedValue({ id: 2, isSetupComplete: true } as any);

    const req = buildReq({}, {}, { userId: 1, email: 'b@b.com', role: 'business' });
    const res = buildRes();
    await completeSetup(req, res);

    expect(prismaMock.restaurant.create).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('uses existing restaurant when already linked', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ restaurantId: 1 } as any);
    prismaMock.restaurant.update.mockResolvedValue({ id: 1, isSetupComplete: true } as any);

    const req = buildReq({}, {}, { userId: 1, email: 'b@b.com', role: 'business' });
    const res = buildRes();
    await completeSetup(req, res);

    expect(prismaMock.restaurant.create).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('returns 400 for invalid profile contactEmail', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ restaurantId: 1 } as any);

    const req = buildReq(
      { profile: { contactEmail: 'bad-email' } },
      {},
      { userId: 1, email: 'b@b.com', role: 'business' },
    );
    const res = buildRes();
    await completeSetup(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('email') }),
    );
  });

  it('returns 400 for invalid table capacity', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ restaurantId: 1 } as any);

    const req = buildReq(
      { tables: [{ name: 'T1', capacity: 99 }] },
      {},
      { userId: 1, email: 'b@b.com', role: 'business' },
    );
    const res = buildRes();
    await completeSetup(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 for invalid hours day', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ restaurantId: 1 } as any);

    const req = buildReq(
      { hours: [{ dayOfWeek: 'Badday', openTime: 600, closeTime: 1200, isClosed: false }] },
      {},
      { userId: 1, email: 'b@b.com', role: 'business' },
    );
    const res = buildRes();
    await completeSetup(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 for invalid pricingType', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ restaurantId: 1 } as any);

    const req = buildReq(
      { pricing: { pricingType: 'subscription' } },
      {},
      { userId: 1, email: 'b@b.com', role: 'business' },
    );
    const res = buildRes();
    await completeSetup(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

// ─── getPricing ───────────────────────────────────────────────────────────────
describe('getPricing', () => {
  it('returns 401 when unauthenticated', async () => {
    const req = buildReq();
    const res = buildRes();
    await getPricing(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 200 with pricing data on success', async () => {
    mockLinkedRestaurant();
    const pricing = { pricingType: 'hourly', hourlyRate: 5.0, coverFee: null, minSpend: null, enableThreshold: false };
    prismaMock.restaurant.findUnique.mockResolvedValue(pricing as any);

    const req = buildReq({}, {}, { userId: 1, email: 'b@b.com', role: 'business' });
    const res = buildRes();
    await getPricing(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: pricing }),
    );
  });
});

// ─── updatePricing ────────────────────────────────────────────────────────────
describe('updatePricing', () => {
  it('returns 401 when unauthenticated', async () => {
    const req = buildReq({ pricingType: 'hourly' });
    const res = buildRes();
    await updatePricing(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 for invalid pricingType', async () => {
    mockLinkedRestaurant();

    const req = buildReq(
      { pricingType: 'subscription' },
      {},
      { userId: 1, email: 'b@b.com', role: 'business' },
    );
    const res = buildRes();
    await updatePricing(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('pricingType') }),
    );
  });

  it('returns 400 when hourlyRate is not a positive number', async () => {
    mockLinkedRestaurant();

    const req = buildReq(
      { pricingType: 'hourly', hourlyRate: -5 },
      {},
      { userId: 1, email: 'b@b.com', role: 'business' },
    );
    const res = buildRes();
    await updatePricing(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when coverFee is not a positive number', async () => {
    mockLinkedRestaurant();

    const req = buildReq(
      { coverFee: 0 },
      {},
      { userId: 1, email: 'b@b.com', role: 'business' },
    );
    const res = buildRes();
    await updatePricing(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('updates pricing and returns 200 on valid input', async () => {
    mockLinkedRestaurant();
    const updatedPricing = { pricingType: 'hourly', hourlyRate: 7.5, coverFee: null, minSpend: null, enableThreshold: false };
    prismaMock.restaurant.update.mockResolvedValue(updatedPricing as any);

    const req = buildReq(
      { pricingType: 'hourly', hourlyRate: 7.5 },
      {},
      { userId: 1, email: 'b@b.com', role: 'business' },
    );
    const res = buildRes();
    await updatePricing(req, res);

    expect(prismaMock.restaurant.update).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: updatedPricing }),
    );
  });
});

// ─── getReservations ──────────────────────────────────────────────────────────
describe('getReservations (business system)', () => {
  it('returns 401 when unauthenticated', async () => {
    const req = buildReq();
    const res = buildRes();
    await getReservations(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns all reservations when no filters are provided', async () => {
    mockLinkedRestaurant();
    const mockReservations = [{ id: 1, status: 'confirmed', table: {}, user: {}, gameReservations: [] }];
    prismaMock.reservation.findMany.mockResolvedValue(mockReservations as any);

    const req = { query: {}, user: { userId: 1 } } as unknown as AuthRequest;
    const res = buildRes();
    await getReservations(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: mockReservations }),
    );
  });

  it('filters reservations by date when date query param is provided', async () => {
    mockLinkedRestaurant();
    prismaMock.reservation.findMany.mockResolvedValue([]);

    const req = { query: { date: '2026-06-15' }, user: { userId: 1 } } as unknown as AuthRequest;
    const res = buildRes();
    await getReservations(req, res);

    expect(prismaMock.reservation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          startTime: expect.objectContaining({ gte: expect.any(Date), lte: expect.any(Date) }),
        }),
      }),
    );
  });

  it('filters by status when status query param is provided', async () => {
    mockLinkedRestaurant();
    prismaMock.reservation.findMany.mockResolvedValue([]);

    const req = { query: { status: 'confirmed' }, user: { userId: 1 } } as unknown as AuthRequest;
    const res = buildRes();
    await getReservations(req, res);

    expect(prismaMock.reservation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'confirmed' }),
      }),
    );
  });
});

// ─── createWalkInReservation ──────────────────────────────────────────────────
describe('createWalkInReservation', () => {
  it('returns 401 when unauthenticated', async () => {
    const req = buildReq({ customerName: 'John', partySize: 2, tableId: 1 });
    const res = buildRes();
    await createWalkInReservation(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 when required fields are missing', async () => {
    mockLinkedRestaurant();

    const req = buildReq(
      { customerName: 'John' }, // missing partySize and tableId
      {},
      { userId: 1, email: 'b@b.com', role: 'business' },
    );
    const res = buildRes();
    await createWalkInReservation(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('required') }),
    );
  });

  it('returns 404 when table does not belong to the restaurant', async () => {
    mockLinkedRestaurant();
    prismaMock.table.findFirst.mockResolvedValue(null);

    const req = buildReq(
      { customerName: 'John', partySize: 2, tableId: 99 },
      {},
      { userId: 1, email: 'b@b.com', role: 'business' },
    );
    const res = buildRes();
    await createWalkInReservation(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('creates reservation for existing guest user and returns 201', async () => {
    mockLinkedRestaurant();
    prismaMock.table.findFirst.mockResolvedValue({ id: 1, restaurantId: 1 } as any);
    const guestUser = { id: 10, name: 'John', email: 'john@example.com', isGuest: true };
    prismaMock.user.findFirst.mockResolvedValue(guestUser as any);
    const mockReservation = { id: 1, status: 'confirmed', table: {}, user: guestUser };
    prismaMock.reservation.create.mockResolvedValue(mockReservation as any);

    const req = buildReq(
      { customerName: 'John', partySize: 2, tableId: 1, email: 'john@example.com' },
      {},
      { userId: 1, email: 'b@b.com', role: 'business' },
    );
    const res = buildRes();
    await createWalkInReservation(req, res);

    expect(prismaMock.user.create).not.toHaveBeenCalled();
    expect(prismaMock.reservation.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('creates a new guest user when no matching guest exists', async () => {
    mockLinkedRestaurant();
    prismaMock.table.findFirst.mockResolvedValue({ id: 1, restaurantId: 1 } as any);
    prismaMock.user.findFirst.mockResolvedValue(null); // no existing guest
    const newGuest = { id: 11, name: 'Jane', email: 'walkin-123@gatore.local', isGuest: true };
    prismaMock.user.create.mockResolvedValue(newGuest as any);
    prismaMock.reservation.create.mockResolvedValue({ id: 2, status: 'confirmed', table: {}, user: newGuest } as any);

    const req = buildReq(
      { customerName: 'Jane', partySize: 3, tableId: 1 }, // no email → generates one
      {},
      { userId: 1, email: 'b@b.com', role: 'business' },
    );
    const res = buildRes();
    await createWalkInReservation(req, res);

    expect(prismaMock.user.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

// ─── deleteBusinessAccount ────────────────────────────────────────────────────
describe('deleteBusinessAccount', () => {
  it('returns 401 when unauthenticated', async () => {
    const req = buildReq();
    const res = buildRes();
    await deleteBusinessAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 404 when no restaurant is linked to the user', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ restaurantId: null } as any);

    const req = buildReq({}, {}, { userId: 1, email: 'b@b.com', role: 'business' });
    const res = buildRes();
    await deleteBusinessAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('deletes all related data and demotes user on success', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ restaurantId: 1 } as any);
    prismaMock.gameReservation.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.reservation.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.restaurant.delete.mockResolvedValue({} as any);
    prismaMock.businessAccessRequest.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.user.update.mockResolvedValue({} as any);

    const req = buildReq({}, {}, { userId: 1, email: 'b@b.com', role: 'business' });
    const res = buildRes();
    await deleteBusinessAccount(req, res);

    expect(prismaMock.restaurant.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ role: 'user', restaurantId: null }),
      }),
    );
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('returns 500 on database error', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ restaurantId: 1 } as any);
    prismaMock.gameReservation.deleteMany.mockRejectedValue(new Error('DB error'));

    const req = buildReq({}, {}, { userId: 1, email: 'b@b.com', role: 'business' });
    const res = buildRes();
    await deleteBusinessAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── updateReservationStatus ──────────────────────────────────────────────────
describe('updateReservationStatus (business system)', () => {
  it('returns 401 when unauthenticated', async () => {
    const req = buildReq({ status: 'confirmed' }, { id: '1' });
    const res = buildRes();
    await updateReservationStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 for an invalid status value', async () => {
    mockLinkedRestaurant();

    const req = buildReq(
      { status: 'unknown' },
      { id: '1' },
      { userId: 1, email: 'b@b.com', role: 'business' },
    );
    const res = buildRes();
    await updateReservationStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('Status must be one of') }),
    );
  });

  it('returns 404 when reservation does not belong to the restaurant', async () => {
    mockLinkedRestaurant();
    prismaMock.reservation.findFirst.mockResolvedValue(null);

    const req = buildReq(
      { status: 'confirmed' },
      { id: '99' },
      { userId: 1, email: 'b@b.com', role: 'business' },
    );
    const res = buildRes();
    await updateReservationStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('updates status and returns 200 on success', async () => {
    mockLinkedRestaurant();
    const existing = { id: 1, status: 'pending', tableId: 1 };
    prismaMock.reservation.findFirst.mockResolvedValue(existing as any);
    const updated = { id: 1, status: 'confirmed', table: { id: 1, name: 'T1', capacity: 4 }, user: {} };
    prismaMock.reservation.update.mockResolvedValue(updated as any);

    const req = buildReq(
      { status: 'confirmed' },
      { id: '1' },
      { userId: 1, email: 'b@b.com', role: 'business' },
    );
    const res = buildRes();
    await updateReservationStatus(req, res);

    expect(prismaMock.reservation.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1 }, data: expect.objectContaining({ status: 'confirmed' }) }),
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: updated }),
    );
  });

  it('includes notes in the update when notes are provided', async () => {
    mockLinkedRestaurant();
    prismaMock.reservation.findFirst.mockResolvedValue({ id: 1 } as any);
    prismaMock.reservation.update.mockResolvedValue({ id: 1, status: 'completed', notes: 'Great session', table: {}, user: {} } as any);

    const req = buildReq(
      { status: 'completed', notes: 'Great session' },
      { id: '1' },
      { userId: 1, email: 'b@b.com', role: 'business' },
    );
    const res = buildRes();
    await updateReservationStatus(req, res);

    expect(prismaMock.reservation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'completed', notes: 'Great session' }),
      }),
    );
  });
});
