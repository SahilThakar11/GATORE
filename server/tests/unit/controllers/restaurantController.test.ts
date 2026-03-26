jest.mock('../../../src/config/jwt', () => ({
  jwtConfig: {
    secret: 'test-secret',
    refreshSecret: 'test-refresh-secret',
    expiresIn: '15m',
    refreshExpiresIn: '7d',
  },
}));

import { Request, Response } from 'express';
import { prismaMock } from '../../__mocks__/prisma';
import {
  getRestaurants,
  getRestaurantById,
  getRestaurantGames,
  getRestaurantTables,
  getRestaurantAvailability,
  getGames,
  getRestaurantsByGame,
  getRestaurantReservations,
} from '../../../src/controllers/restaurantController';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const buildRes = (): Response => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const MOCK_RESTAURANT = {
  id: 1,
  name: 'Test Cafe',
  tagline: 'We play games',
  city: 'Toronto',
  province: 'ON',
  address: '123 Main St',
  phone: '416-555-0000',
  website: null,
  logoUrl: null,
  rating: 4.5,
  reviewCount: 10,
  operatingHours: [],
  tables: [],
  restaurantGames: [],
  _count: { restaurantGames: 5, tables: 3 },
} as any;

const MOCK_TABLE = {
  id: 1,
  name: 'Table 1',
  capacity: 6,
  minCapacity: 2,
  restaurantId: 1,
  status: 'available',
} as any;

const MOCK_GAME = {
  id: 1,
  bggId: '174430',
  name: 'Gloomhaven',
  imageUrl: null,
  category: 'Adventure',
  difficulty: 'Hard',
  minPlayers: 1,
  maxPlayers: 4,
  estimatedPlayTime: 120,
  bggRating: 8.8,
  ageRating: 14,
  restaurantGames: [],
  _count: { restaurantGames: 3 },
} as any;

// ─── getRestaurants ───────────────────────────────────────────────────────────
describe('getRestaurants', () => {
  it('returns all restaurants when no city filter is provided', async () => {
    prismaMock.restaurant.findMany.mockResolvedValue([MOCK_RESTAURANT]);

    const req = { query: {} } as unknown as Request;
    const res = buildRes();
    await getRestaurants(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: [MOCK_RESTAURANT] }),
    );
  });

  it('filters by city when query param is provided', async () => {
    prismaMock.restaurant.findMany.mockResolvedValue([MOCK_RESTAURANT]);

    const req = { query: { city: 'Toronto' } } as unknown as Request;
    const res = buildRes();
    await getRestaurants(req, res);

    expect(prismaMock.restaurant.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          city: expect.objectContaining({ equals: 'Toronto' }),
        }),
      }),
    );
  });

  it('returns 500 on database error', async () => {
    prismaMock.restaurant.findMany.mockRejectedValue(new Error('DB error'));

    const req = { query: {} } as unknown as Request;
    const res = buildRes();
    await getRestaurants(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── getRestaurantById ────────────────────────────────────────────────────────
describe('getRestaurantById', () => {
  it('returns 400 for a non-numeric restaurant ID', async () => {
    const req = { params: { id: 'abc' } } as unknown as Request;
    const res = buildRes();
    await getRestaurantById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 when restaurant is not found', async () => {
    prismaMock.restaurant.findUnique.mockResolvedValue(null);

    const req = { params: { id: '999' } } as unknown as Request;
    const res = buildRes();
    await getRestaurantById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 200 with restaurant data on success', async () => {
    prismaMock.restaurant.findUnique.mockResolvedValue(MOCK_RESTAURANT);

    const req = { params: { id: '1' } } as unknown as Request;
    const res = buildRes();
    await getRestaurantById(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: MOCK_RESTAURANT }),
    );
  });
});

// ─── getRestaurantGames ───────────────────────────────────────────────────────
describe('getRestaurantGames', () => {
  it('returns 400 for a non-numeric restaurant ID', async () => {
    const req = { params: { id: 'xyz' }, query: {} } as unknown as Request;
    const res = buildRes();
    await getRestaurantGames(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 when restaurant does not exist and has no games', async () => {
    prismaMock.restaurantGame.findMany.mockResolvedValue([]);
    prismaMock.restaurant.findUnique.mockResolvedValue(null);

    const req = { params: { id: '99' }, query: {} } as unknown as Request;
    const res = buildRes();
    await getRestaurantGames(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns games for a valid restaurant', async () => {
    const mockRG = { game: MOCK_GAME, status: 'available' } as any;
    prismaMock.restaurantGame.findMany.mockResolvedValue([mockRG]);

    const req = { params: { id: '1' }, query: {} } as unknown as Request;
    const res = buildRes();
    await getRestaurantGames(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });
});

// ─── getRestaurantTables ──────────────────────────────────────────────────────
describe('getRestaurantTables', () => {
  it('returns 400 for a non-numeric restaurant ID', async () => {
    const req = { params: { id: 'bad' }, query: {} } as unknown as Request;
    const res = buildRes();
    await getRestaurantTables(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns all available tables for a restaurant', async () => {
    prismaMock.table.findMany.mockResolvedValue([MOCK_TABLE]);

    const req = { params: { id: '1' }, query: {} } as unknown as Request;
    const res = buildRes();
    await getRestaurantTables(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: [MOCK_TABLE] }),
    );
  });

  it('filters tables by party size when partySize is provided', async () => {
    prismaMock.table.findMany.mockResolvedValue([MOCK_TABLE]);

    const req = { params: { id: '1' }, query: { partySize: '4' } } as unknown as Request;
    const res = buildRes();
    await getRestaurantTables(req, res);

    expect(prismaMock.table.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          capacity: { gte: 4 },
          minCapacity: { lte: 4 },
        }),
      }),
    );
  });
});

// ─── getRestaurantAvailability ────────────────────────────────────────────────
describe('getRestaurantAvailability', () => {
  it('returns 400 when date is missing', async () => {
    const req = { params: { id: '1' }, query: {} } as unknown as Request;
    const res = buildRes();
    await getRestaurantAvailability(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 for a non-numeric restaurant ID', async () => {
    const req = {
      params: { id: 'abc' },
      query: { date: '2026-06-15' },
    } as unknown as Request;
    const res = buildRes();
    await getRestaurantAvailability(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns isOpen=false when restaurant is closed on that day', async () => {
    prismaMock.operatingHours.findFirst.mockResolvedValue({
      id: 1, restaurantId: 1, dayOfWeek: 'Sunday', isClosed: true, openTime: 0, closeTime: 0,
    });

    const req = {
      params: { id: '1' },
      query: { date: '2026-06-14' }, // a Sunday
    } as unknown as Request;
    const res = buildRes();
    await getRestaurantAvailability(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ isOpen: false, slots: [] }),
      }),
    );
  });

  it('returns no slots when no operating hours record found', async () => {
    prismaMock.operatingHours.findFirst.mockResolvedValue(null);

    const req = {
      params: { id: '1' },
      query: { date: '2026-06-15' },
    } as unknown as Request;
    const res = buildRes();
    await getRestaurantAvailability(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ isOpen: false }),
      }),
    );
  });

  it('returns time slots when the restaurant is open and tables are available', async () => {
    prismaMock.operatingHours.findFirst.mockResolvedValue({
      id: 1, restaurantId: 1, dayOfWeek: 'Monday',
      isClosed: false, openTime: 600, closeTime: 720, // 10:00–12:00 → 2 slots
    });
    prismaMock.table.findMany.mockResolvedValue([{ id: 1, name: 'T1', type: 'Round', description: null, status: 'available', restaurantId: 1, capacity: 4, minCapacity: 1 } as any]);
    prismaMock.reservation.findMany.mockResolvedValue([]);

    const req = {
      params: { id: '1' },
      query: { date: '2026-06-15' },
    } as unknown as Request;
    const res = buildRes();
    await getRestaurantAvailability(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          isOpen: true,
          slots: expect.arrayContaining([
            expect.objectContaining({ available: true }),
          ]),
        }),
      }),
    );
  });
});

// ─── getGames ─────────────────────────────────────────────────────────────────
describe('getGames', () => {
  it('returns all games with no filters', async () => {
    prismaMock.game.findMany.mockResolvedValue([MOCK_GAME]);

    const req = { query: {} } as unknown as Request;
    const res = buildRes();
    await getGames(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: [MOCK_GAME] }),
    );
  });

  it('applies category filter when provided', async () => {
    prismaMock.game.findMany.mockResolvedValue([MOCK_GAME]);

    const req = { query: { category: 'Adventure' } } as unknown as Request;
    const res = buildRes();
    await getGames(req, res);

    expect(prismaMock.game.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: expect.objectContaining({ equals: 'Adventure' }),
        }),
      }),
    );
  });

  it('applies search query filter when q is provided', async () => {
    prismaMock.game.findMany.mockResolvedValue([MOCK_GAME]);

    const req = { query: { q: 'Catan' } } as unknown as Request;
    const res = buildRes();
    await getGames(req, res);

    expect(prismaMock.game.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          name: expect.objectContaining({ contains: 'Catan' }),
        }),
      }),
    );
  });

  it('returns 500 on database error', async () => {
    prismaMock.game.findMany.mockRejectedValue(new Error('DB error'));

    const req = { query: {} } as unknown as Request;
    const res = buildRes();
    await getGames(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── getRestaurantsByGame ─────────────────────────────────────────────────────
describe('getRestaurantsByGame', () => {
  it('returns 404 when game bggId is not in catalog', async () => {
    prismaMock.game.findUnique.mockResolvedValue(null);

    const req = { params: { bggId: '99999' }, query: {} } as unknown as Request;
    const res = buildRes();
    await getRestaurantsByGame(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns game and restaurants on success', async () => {
    const gameWithRestaurants = {
      ...MOCK_GAME,
      restaurantGames: [
        { restaurant: { id: 1, name: 'Cafe A', city: 'Toronto', address: '1 Main', tagline: '', logoUrl: null, rating: 4, reviewCount: 5 } },
      ],
    };
    prismaMock.game.findUnique.mockResolvedValue(gameWithRestaurants);

    const req = { params: { bggId: '174430' }, query: {} } as unknown as Request;
    const res = buildRes();
    await getRestaurantsByGame(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          game: expect.objectContaining({ bggId: '174430' }),
          restaurants: expect.any(Array),
        }),
      }),
    );
  });
});

// ─── getRestaurantReservations ────────────────────────────────────────────────
describe('getRestaurantReservations', () => {
  it('returns 400 for a non-numeric restaurant ID', async () => {
    const req = { params: { id: 'bad' }, query: {} } as unknown as Request;
    const res = buildRes();
    await getRestaurantReservations(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns all reservations for the restaurant', async () => {
    const mockRes = [{ id: 1, status: 'confirmed', table: {}, user: {}, gameReservations: [] }];
    prismaMock.reservation.findMany.mockResolvedValue(mockRes as any);

    const req = { params: { id: '1' }, query: {} } as unknown as Request;
    const res = buildRes();
    await getRestaurantReservations(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: mockRes }),
    );
  });

  it('filters by status when query param is provided', async () => {
    prismaMock.reservation.findMany.mockResolvedValue([]);

    const req = { params: { id: '1' }, query: { status: 'confirmed' } } as unknown as Request;
    const res = buildRes();
    await getRestaurantReservations(req, res);

    expect(prismaMock.reservation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'confirmed' }),
      }),
    );
  });
});
