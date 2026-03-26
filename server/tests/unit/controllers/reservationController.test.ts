jest.mock('../../../src/config/jwt', () => ({
  jwtConfig: {
    secret: 'test-access-secret-32-chars-long!!',
    refreshSecret: 'test-refresh-secret-32-chars-long!',
    expiresIn: '15m',
    refreshExpiresIn: '7d',
  },
}));

import { Request, Response } from 'express';
import { prismaMock } from '../../__mocks__/prisma';
import {
  createReservation,
  cancelReservation,
  getMyReservations,
  getReservationById,
  updateReservationStatus,
} from '../../../src/controllers/reservationController';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const buildRes = (): Response => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Valid reservation body used in multiple tests
const VALID_BODY = {
  reservationDate: '2026-06-15',
  startTime: '2026-06-15T18:00:00.000Z',
  endTime: '2026-06-15T20:00:00.000Z',
  partySize: '4',
  tableId: '1',
};

const MOCK_TABLE = {
  id: 1,
  name: 'Table 1',
  capacity: 6,
  minCapacity: 2,
  restaurantId: 1,
  isActive: true,
} as any;

const MOCK_RESERVATION = {
  id: 10,
  userId: 1,
  tableId: 1,
  reservationDate: new Date('2026-06-15'),
  startTime: new Date('2026-06-15T18:00:00.000Z'),
  endTime: new Date('2026-06-15T20:00:00.000Z'),
  partySize: 4,
  status: 'pending',
  specialRequests: null,
  notes: null,
  gameReservations: [],
  table: { id: 1, name: 'Table 1', restaurantId: 1, restaurant: { id: 1, name: 'Cafe', address: '123 St' } },
  user: { id: 1, name: 'Test User', email: 'user@test.com' },
} as any;

// ─── createReservation ────────────────────────────────────────────────────────
describe('createReservation', () => {
  it('returns 400 when required fields are missing', async () => {
    const req = { body: { reservationDate: '2026-06-15' } } as unknown as Request;
    const res = buildRes();
    await createReservation(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 for guest flow when guestName or guestEmail is missing', async () => {
    const req = {
      body: { ...VALID_BODY, isGuest: true, guestName: '' },
    } as unknown as Request;
    const res = buildRes();
    await createReservation(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 401 for authenticated flow when no user on req', async () => {
    const req = {
      body: { ...VALID_BODY, isGuest: false },
      user: undefined,
    } as unknown as Request;
    const res = buildRes();
    await createReservation(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 when endTime is before startTime', async () => {
    const req = {
      body: {
        ...VALID_BODY,
        startTime: '2026-06-15T20:00:00.000Z',
        endTime: '2026-06-15T18:00:00.000Z',
        isGuest: false,
      },
      user: { userId: 1 },
    } as unknown as Request;
    const res = buildRes();
    await createReservation(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('endTime') }),
    );
  });

  it('returns 404 when the table does not exist', async () => {
    prismaMock.table.findUnique.mockResolvedValue(null);

    const req = {
      body: { ...VALID_BODY, isGuest: false },
      user: { userId: 1 },
    } as unknown as Request;
    const res = buildRes();
    await createReservation(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Table not found.' }),
    );
  });

  it('returns 400 when party size exceeds table capacity', async () => {
    prismaMock.table.findUnique.mockResolvedValue({ ...MOCK_TABLE, capacity: 2, minCapacity: 1 });

    const req = {
      body: { ...VALID_BODY, partySize: '10', isGuest: false },
      user: { userId: 1 },
    } as unknown as Request;
    const res = buildRes();
    await createReservation(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 409 when a conflicting reservation exists', async () => {
    prismaMock.table.findUnique.mockResolvedValue(MOCK_TABLE);
    prismaMock.reservation.findFirst.mockResolvedValue(MOCK_RESERVATION); // conflict

    const req = {
      body: { ...VALID_BODY, isGuest: false },
      user: { userId: 1 },
    } as unknown as Request;
    const res = buildRes();
    await createReservation(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('creates reservation and returns 201 on success (authenticated)', async () => {
    prismaMock.table.findUnique.mockResolvedValue(MOCK_TABLE);
    prismaMock.reservation.findFirst.mockResolvedValue(null); // no conflict
    prismaMock.reservation.create.mockResolvedValue(MOCK_RESERVATION);

    const req = {
      body: { ...VALID_BODY, isGuest: false },
      user: { userId: 1 },
    } as unknown as Request;
    const res = buildRes();
    await createReservation(req, res);

    expect(prismaMock.reservation.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('creates reservation for guest user on success', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: 99, email: 'g@g.com', name: 'Guest', isGuest: true,
    } as any);
    prismaMock.table.findUnique.mockResolvedValue(MOCK_TABLE);
    prismaMock.reservation.findFirst.mockResolvedValue(null);
    prismaMock.reservation.create.mockResolvedValue(MOCK_RESERVATION);

    const req = {
      body: {
        ...VALID_BODY,
        isGuest: true,
        guestName: 'Guest User',
        guestEmail: 'guest@test.com',
      },
    } as unknown as Request;
    const res = buildRes();
    await createReservation(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });
});

// ─── cancelReservation ────────────────────────────────────────────────────────
describe('cancelReservation', () => {
  it('returns 400 when reservation ID is not a valid number', async () => {
    const req = {
      params: { id: 'abc' },
      user: { userId: 1 },
    } as unknown as Request;
    const res = buildRes();
    await cancelReservation(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 when reservation does not exist', async () => {
    prismaMock.reservation.findUnique.mockResolvedValue(null);

    const req = {
      params: { id: '999' },
      user: { userId: 1 },
    } as unknown as Request;
    const res = buildRes();
    await cancelReservation(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 403 when a different user tries to cancel', async () => {
    prismaMock.reservation.findUnique.mockResolvedValue({ ...MOCK_RESERVATION, userId: 2 });

    const req = {
      params: { id: '10' },
      user: { userId: 1 },
    } as unknown as Request;
    const res = buildRes();
    await cancelReservation(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns 400 when reservation is already cancelled', async () => {
    prismaMock.reservation.findUnique.mockResolvedValue({
      ...MOCK_RESERVATION,
      userId: 1,
      status: 'cancelled',
    });

    const req = {
      params: { id: '10' },
      user: { userId: 1 },
    } as unknown as Request;
    const res = buildRes();
    await cancelReservation(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when reservation is already completed', async () => {
    prismaMock.reservation.findUnique.mockResolvedValue({
      ...MOCK_RESERVATION,
      userId: 1,
      status: 'completed',
    });

    const req = {
      params: { id: '10' },
      user: { userId: 1 },
    } as unknown as Request;
    const res = buildRes();
    await cancelReservation(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('cancels the reservation and returns 200', async () => {
    prismaMock.reservation.findUnique.mockResolvedValue({
      ...MOCK_RESERVATION,
      userId: 1,
      status: 'pending',
    });
    prismaMock.reservation.update.mockResolvedValue({
      ...MOCK_RESERVATION,
      status: 'cancelled',
    });

    const req = {
      params: { id: '10' },
      user: { userId: 1 },
    } as unknown as Request;
    const res = buildRes();
    await cancelReservation(req, res);

    expect(prismaMock.reservation.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'cancelled' } }),
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });
});

// ─── getMyReservations ────────────────────────────────────────────────────────
describe('getMyReservations', () => {
  it('returns all reservations for the authenticated user', async () => {
    prismaMock.reservation.findMany.mockResolvedValue([MOCK_RESERVATION]);

    const req = {
      user: { userId: 1 },
      query: {},
    } as unknown as Request;
    const res = buildRes();
    await getMyReservations(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: [MOCK_RESERVATION],
      }),
    );
  });
});

// ─── getReservationById ───────────────────────────────────────────────────────
describe('getReservationById', () => {
  it('returns 400 for an invalid (non-numeric) ID', async () => {
    const req = {
      params: { id: 'not-a-number' },
      user: { userId: 1, role: 'user' },
    } as unknown as Request;
    const res = buildRes();
    await getReservationById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 when reservation does not exist', async () => {
    prismaMock.reservation.findUnique.mockResolvedValue(null);

    const req = {
      params: { id: '999' },
      user: { userId: 1, role: 'user' },
    } as unknown as Request;
    const res = buildRes();
    await getReservationById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 403 when a regular user tries to view someone else\'s reservation', async () => {
    prismaMock.reservation.findUnique.mockResolvedValue({ ...MOCK_RESERVATION, userId: 2 });

    const req = {
      params: { id: '10' },
      user: { userId: 1, role: 'user' },
    } as unknown as Request;
    const res = buildRes();
    await getReservationById(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns 200 when the owner fetches their reservation', async () => {
    prismaMock.reservation.findUnique.mockResolvedValue({ ...MOCK_RESERVATION, userId: 1 });

    const req = {
      params: { id: '10' },
      user: { userId: 1, role: 'user' },
    } as unknown as Request;
    const res = buildRes();
    await getReservationById(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });

  it('allows a business user to view any reservation', async () => {
    prismaMock.reservation.findUnique.mockResolvedValue({ ...MOCK_RESERVATION, userId: 99 });

    const req = {
      params: { id: '10' },
      user: { userId: 1, role: 'business' },
    } as unknown as Request;
    const res = buildRes();
    await getReservationById(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });
});

// ─── updateReservationStatus ──────────────────────────────────────────────────
describe('updateReservationStatus', () => {
  it('returns 403 when caller is not business or admin', async () => {
    const req = {
      params: { id: '10' },
      body: { status: 'confirmed' },
      user: { role: 'user' },
    } as unknown as Request;
    const res = buildRes();
    await updateReservationStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns 400 for an invalid status value', async () => {
    const req = {
      params: { id: '10' },
      body: { status: 'flying' },
      user: { role: 'business' },
    } as unknown as Request;
    const res = buildRes();
    await updateReservationStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 when reservation does not exist', async () => {
    prismaMock.reservation.findUnique.mockResolvedValue(null);

    const req = {
      params: { id: '999' },
      body: { status: 'confirmed' },
      user: { role: 'business' },
    } as unknown as Request;
    const res = buildRes();
    await updateReservationStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('updates status and returns 200 for business user', async () => {
    prismaMock.reservation.findUnique.mockResolvedValue(MOCK_RESERVATION);
    prismaMock.reservation.update.mockResolvedValue({ ...MOCK_RESERVATION, status: 'confirmed' });

    const req = {
      params: { id: '10' },
      body: { status: 'confirmed' },
      user: { role: 'business' },
    } as unknown as Request;
    const res = buildRes();
    await updateReservationStatus(req, res);

    expect(prismaMock.reservation.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'confirmed' }) }),
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });
});
