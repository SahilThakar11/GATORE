import { Request, Response } from "express";
import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
});

// ─── Token helper ────────────────────────────────────────────────────────────
function getToken(res: Response): string | null {
  const token = process.env.BGG_TOKEN;
  if (!token) {
    res.status(500).json({ error: "Missing BGG_TOKEN in server env" });
    return null;
  }
  return token;
}

// ─── Fetch with token + 202 retry ────────────────────────────────────────────
async function fetchBGG(
  url: string,
  token: string,
  retries = 4,
  delayMs = 2000,
): Promise<string> {
  for (let i = 0; i < retries; i++) {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`[BGG] attempt ${i + 1} → ${response.status} | ${url}`);

    if (response.status === 202) {
      console.log(`[BGG] 202 received, retrying in ${delayMs}ms...`);
      await new Promise((r) => setTimeout(r, delayMs));
      continue;
    }

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `BGG request failed ${response.status}: ${body.slice(0, 200)}`,
      );
    }

    return response.text();
  }

  throw new Error("BGG did not respond after retries");
}

// ─── Parse a single BGG item into clean shape ────────────────────────────────
function parseItem(item: any) {
  const id = String(item.id ?? "");

  const names = Array.isArray(item.name)
    ? item.name
    : item.name
      ? [item.name]
      : [];
  const primary = names.find((n: any) => n.type === "primary");
  const name = primary?.value ?? names[0]?.value ?? "Unknown";

  const image = item.image ?? "";

  const rawDesc = item.description ?? "";
  const description = rawDesc
    .replace(/&#10;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/<[^>]+>/g, "")
    .trim();

  const minPlayers = item.minplayers?.value ?? null;
  const maxPlayers = item.maxplayers?.value ?? null;
  const players =
    minPlayers && maxPlayers
      ? minPlayers === maxPlayers
        ? String(minPlayers)
        : `${minPlayers}–${maxPlayers}`
      : "Unknown";

  const minPlay = item.minplaytime?.value ?? null;
  const maxPlay = item.maxplaytime?.value ?? null;
  const duration =
    minPlay && maxPlay
      ? minPlay === maxPlay
        ? `${minPlay} min`
        : `${minPlay}–${maxPlay} min`
      : "Unknown";

  const minAge = item.minage?.value ?? null;
  const age = minAge ? `${minAge}+` : null;

  const avgRating = item.statistics?.ratings?.average?.value ?? null;
  const rating =
    avgRating && !isNaN(Number(avgRating)) && Number(avgRating) > 0
      ? Math.round(Number(avgRating) * 10) / 10
      : null;

  const weight = item.statistics?.ratings?.averageweight?.value ?? null;
  const weightNum = weight ? Number(weight) : null;
  let difficulty: string | null = null;
  if (weightNum !== null && weightNum > 0) {
    if (weightNum < 1.5) difficulty = "Light";
    else if (weightNum < 2.5) difficulty = "Medium";
    else if (weightNum < 3.5) difficulty = "Hard";
    else difficulty = "Very Hard";
  }
  const weightDots =
    weightNum !== null ? Math.min(Math.round(weightNum), 3) : 0;

  const links = Array.isArray(item.link)
    ? item.link
    : item.link
      ? [item.link]
      : [];
  const categories = links
    .filter((l: any) => l.type === "boardgamecategory")
    .map((l: any) => l.value)
    .slice(0, 3);

  const designers = links
    .filter((l: any) => l.type === "boardgamedesigner")
    .map((l: any) => l.value)
    .filter((v: string) => v && v.toLowerCase() !== "(uncredited)")
    .slice(0, 2);
  const designer = designers.length > 0 ? designers.join(", ") : null;

  const publishers = links
    .filter((l: any) => l.type === "boardgamepublisher")
    .map((l: any) => l.value)
    .filter((v: string) => v && v.toLowerCase() !== "(self-published)")
    .slice(0, 2);
  const publisher = publishers.length > 0 ? publishers.join(", ") : null;

  return {
    id,
    name,
    image,
    description,
    players,
    duration,
    age,
    rating,
    difficulty,
    weightDots,
    categories,
    designer,
    publisher,
  };
}

// ─── GET /api/bgg/games?ids=174430,169786 ────────────────────────────────────
export const getGamesByIds = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const ids = String(req.query.ids || "").trim();
    if (!ids) {
      res.status(400).json({ error: "Missing ids" });
      return;
    }

    const token = getToken(res);
    if (!token) return;

    const url = `https://boardgamegeek.com/xmlapi2/thing?id=${encodeURIComponent(ids)}&type=boardgame&stats=1`;
    const xml = await fetchBGG(url, token);

    const json = parser.parse(xml);
    const itemsRaw = json?.items?.item;
    const items = Array.isArray(itemsRaw)
      ? itemsRaw
      : itemsRaw
        ? [itemsRaw]
        : [];

    res.status(200).json(items.map(parseItem));
  } catch (err: any) {
    console.error("[BGG getGamesByIds]", err.message);
    res.status(502).json({ error: err.message ?? "BGG request failed" });
  }
};

// ─── GET /api/bgg/search-ids?q=catan ─────────────────────────────────────────
// Returns all matching BGG IDs only — client paginates and fetches details
export const searchGameIds = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const q = String(req.query.q || "").trim();
    if (!q) {
      res.status(400).json({ error: "Missing query" });
      return;
    }

    const token = getToken(res);
    if (!token) return;

    const searchUrl = `https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(q)}&type=boardgame`;
    const searchXml = await fetchBGG(searchUrl, token, 3, 1500);

    const searchJson = parser.parse(searchXml);
    const rawItems = searchJson?.items?.item;
    const allItems = Array.isArray(rawItems)
      ? rawItems
      : rawItems
        ? [rawItems]
        : [];

    const ids = allItems.map((i: any) => String(i.id));
    res.status(200).json(ids);
  } catch (err: any) {
    console.error("[BGG searchGameIds]", err.message);
    res.status(502).json({ error: err.message ?? "BGG search failed" });
  }
};

// ─── GET /api/bgg/search?q=catan ─────────────────────────────────────────────
// Convenience endpoint — search + fetch first 8 details in one call
export const searchGames = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const q = String(req.query.q || "").trim();
    if (!q) {
      res.status(400).json({ error: "Missing query" });
      return;
    }

    const token = getToken(res);
    if (!token) return;

    // Step 1 — get matching IDs
    const searchUrl = `https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(q)}&type=boardgame`;
    const searchXml = await fetchBGG(searchUrl, token, 3, 1500);

    const searchJson = parser.parse(searchXml);
    const rawItems = searchJson?.items?.item;
    const allItems = Array.isArray(rawItems)
      ? rawItems
      : rawItems
        ? [rawItems]
        : [];

    if (allItems.length === 0) {
      res.status(200).json([]);
      return;
    }

    // Step 2 — fetch full details for top 8
    const topIds = allItems
      .slice(0, 8)
      .map((i: any) => String(i.id))
      .join(",");

    const detailUrl = `https://boardgamegeek.com/xmlapi2/thing?id=${topIds}&type=boardgame&stats=1`;
    const detailXml = await fetchBGG(detailUrl, token);

    const detailJson = parser.parse(detailXml);
    const detailRaw = detailJson?.items?.item;
    const details = Array.isArray(detailRaw)
      ? detailRaw
      : detailRaw
        ? [detailRaw]
        : [];

    res.status(200).json(details.map(parseItem));
  } catch (err: any) {
    console.error("[BGG searchGames]", err.message);
    res.status(502).json({ error: err.message ?? "BGG search failed" });
  }
};
