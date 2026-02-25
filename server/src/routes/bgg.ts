import { Router } from "express";
import { XMLParser } from "fast-xml-parser";

const router = Router(); // Base route: /api/bgg

// GET /api/bgg/games?ids=123,456
router.get("/games", async (req, res) => {
  try {
    // Validate query parameter
    const ids = String(req.query.ids || "").trim();
    if (!ids) {
      return res.status(400).json({ error: "Missing ids" });
    }

    // BGG API URL for fetching game details by IDs
    const url = `https://boardgamegeek.com/xmlapi2/thing?id=${encodeURIComponent(
      ids
    )}&type=boardgame`;

    // const response = await fetch(url);
    // if (!response.ok) {
    //   return res.status(502).json({ error: "BGG request failed" });
    // }

    const token = process.env.BGG_TOKEN; // Load BGG token from environment variables
// Check if the token is available
if (!token) return res.status(500).json({ error: "Missing BGG_TOKEN in server env" });

console.log("BGG TOKEN:", process.env.BGG_TOKEN); // Debug log to check if the token is loaded correctly

// Make the request to BGG API with the token in the Authorization header
const response = await fetch(url, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Check if the response is successful
if (!response.ok) {
      return res.status(502).json({ error: `BGG request failed: ${response.status}` });
    }


    const xmlText = await response.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
    });

    const json = parser.parse(xmlText);

    const itemsRaw = json?.items?.item;
    const items = Array.isArray(itemsRaw)
      ? itemsRaw
      : itemsRaw
      ? [itemsRaw]
      : [];

    const result = items.map((item: any) => {
      const id = String(item.id ?? "");

      const names = Array.isArray(item.name)
        ? item.name
        : item.name
        ? [item.name]
        : [];

      const primary = names.find((n: any) => n.type === "primary");
      const name = primary?.value ?? names[0]?.value ?? "Unknown";

      const image = item.image ?? "";

      const minPlayers = item.minplayers?.value ?? null;
      const maxPlayers = item.maxplayers?.value ?? null;
      const players =
        minPlayers && maxPlayers
          ? `${minPlayers}-${maxPlayers} players`
          : "Unknown";

      const minPlay = item.minplaytime?.value ?? null;
      const maxPlay = item.maxplaytime?.value ?? null;
      const duration =
        minPlay && maxPlay
          ? `${minPlay}-${maxPlay} min`
          : "Unknown";

      return { id, name, image, players, duration };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});



export default router;