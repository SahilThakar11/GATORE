/**
 * Tests for bggController.
 *
 * Strategy: the controller calls the BGG API via global fetch.
 * We mock fetch to return realistic XML responses so no real HTTP calls are made.
 * We also set process.env.BGG_TOKEN to avoid the "Missing BGG_TOKEN" early exit.
 */
import { Request, Response } from 'express';
import {
  getGamesByIds,
  searchGameIds,
  searchGames,
} from '../../../src/controllers/bggController';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const buildRes = (): Response => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Minimal valid BGG XML for a single game item
const SINGLE_GAME_XML = `
<?xml version="1.0" encoding="utf-8"?>
<items totalitems="1" termsofuse="" pubdate="">
  <item type="boardgame" id="174430">
    <name type="primary" sortindex="1" value="Gloomhaven"/>
    <description>A great game</description>
    <image>//cf.geekdo-images.com/thumb.jpg</image>
    <minplayers value="1"/>
    <maxplayers value="4"/>
    <minplaytime value="60"/>
    <maxplaytime value="120"/>
    <minage value="14"/>
    <statistics>
      <ratings>
        <average value="8.8"/>
        <averageweight value="3.9"/>
      </ratings>
    </statistics>
  </item>
</items>
`.trim();

const SEARCH_RESULTS_XML = `
<?xml version="1.0" encoding="utf-8"?>
<items total="2">
  <item type="boardgame" id="13">
    <name type="primary" sortindex="1" value="Catan"/>
  </item>
  <item type="boardgame" id="14">
    <name type="primary" sortindex="1" value="Catan: Seafarers"/>
  </item>
</items>
`.trim();

const EMPTY_RESULTS_XML = `
<?xml version="1.0" encoding="utf-8"?>
<items total="0">
</items>
`.trim();

function mockFetchOk(body: string) {
  return jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    text: async () => body,
  });
}

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  process.env.BGG_TOKEN = 'test-bgg-token';
});

afterEach(() => {
  delete process.env.BGG_TOKEN;
  jest.restoreAllMocks();
});

// ─── getGamesByIds ────────────────────────────────────────────────────────────
describe('getGamesByIds', () => {
  it('returns 400 when ids query param is missing', async () => {
    const req = { query: {} } as unknown as Request;
    const res = buildRes();
    await getGamesByIds(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Missing ids' }));
  });

  it('returns 500 when BGG_TOKEN env var is not set', async () => {
    delete process.env.BGG_TOKEN;

    const req = { query: { ids: '174430' } } as unknown as Request;
    const res = buildRes();
    await getGamesByIds(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('returns parsed game data on a successful BGG response', async () => {
    global.fetch = mockFetchOk(SINGLE_GAME_XML);

    const req = { query: { ids: '174430' } } as unknown as Request;
    const res = buildRes();
    await getGamesByIds(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(Array.isArray(payload)).toBe(true);
    expect(payload[0]).toMatchObject({
      id: '174430',
      name: 'Gloomhaven',
    });
  });

  it('returns 502 when the BGG fetch throws an error', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const req = { query: { ids: '174430' } } as unknown as Request;
    const res = buildRes();
    await getGamesByIds(req, res);

    expect(res.status).toHaveBeenCalledWith(502);
  });

  it('returns 502 when BGG responds with a non-ok status', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
      text: async () => 'Service Unavailable',
    });

    const req = { query: { ids: '174430' } } as unknown as Request;
    const res = buildRes();
    await getGamesByIds(req, res);

    expect(res.status).toHaveBeenCalledWith(502);
  });
});

// ─── searchGameIds ────────────────────────────────────────────────────────────
describe('searchGameIds', () => {
  it('returns 400 when q query param is missing', async () => {
    const req = { query: {} } as unknown as Request;
    const res = buildRes();
    await searchGameIds(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Missing query' }));
  });

  it('returns 500 when BGG_TOKEN is not set', async () => {
    delete process.env.BGG_TOKEN;

    const req = { query: { q: 'catan' } } as unknown as Request;
    const res = buildRes();
    await searchGameIds(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('returns an array of BGG IDs on success', async () => {
    global.fetch = mockFetchOk(SEARCH_RESULTS_XML);

    const req = { query: { q: 'catan' } } as unknown as Request;
    const res = buildRes();
    await searchGameIds(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const ids = (res.json as jest.Mock).mock.calls[0][0];
    expect(ids).toEqual(['13', '14']);
  });

  it('returns an empty array when no results match', async () => {
    global.fetch = mockFetchOk(EMPTY_RESULTS_XML);

    const req = { query: { q: 'zzznoresults' } } as unknown as Request;
    const res = buildRes();
    await searchGameIds(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const ids = (res.json as jest.Mock).mock.calls[0][0];
    expect(ids).toEqual([]);
  });
});

// ─── searchGames ──────────────────────────────────────────────────────────────
describe('searchGames', () => {
  it('returns 400 when q query param is missing', async () => {
    const req = { query: {} } as unknown as Request;
    const res = buildRes();
    await searchGames(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 500 when BGG_TOKEN is not set', async () => {
    delete process.env.BGG_TOKEN;

    const req = { query: { q: 'catan' } } as unknown as Request;
    const res = buildRes();
    await searchGames(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('returns empty array when search finds no results', async () => {
    global.fetch = mockFetchOk(EMPTY_RESULTS_XML);

    const req = { query: { q: 'zzznoresults' } } as unknown as Request;
    const res = buildRes();
    await searchGames(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const games = (res.json as jest.Mock).mock.calls[0][0];
    expect(games).toEqual([]);
  });

  it('fetches details for top 8 results and returns parsed games', async () => {
    // First call = search, second call = details for top items
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, status: 200, text: async () => SEARCH_RESULTS_XML })
      .mockResolvedValueOnce({ ok: true, status: 200, text: async () => SINGLE_GAME_XML });

    const req = { query: { q: 'catan' } } as unknown as Request;
    const res = buildRes();
    await searchGames(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const games = (res.json as jest.Mock).mock.calls[0][0];
    expect(Array.isArray(games)).toBe(true);
    expect(games[0]).toHaveProperty('name');
  });

  it('returns 502 when the BGG fetch throws', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Timeout'));

    const req = { query: { q: 'catan' } } as unknown as Request;
    const res = buildRes();
    await searchGames(req, res);

    expect(res.status).toHaveBeenCalledWith(502);
  });
});
