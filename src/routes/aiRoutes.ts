import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

/**
 * Mock AI service che emette SSE
 * @openapi
 * /api/ai/stream:
 *   get:
 *     summary: Stream risposte mock AI con SSE
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Server-Sent Events stream
 *         content:
 *           text/event-stream
 *       401:
 *         description: Non autenticato
 */
router.get(
  "/stream",
  authenticate,
  asyncHandler(async (req: any, res: any) => {
    const { q } = req.query;

    if (!q || typeof q !== "string") {
      return res.status(400).json({
        error: "Query parameter 'q' is required",
      });
    }

    // Setta headers SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    // Mock chunks che emula streaming AI
    const chunks = [
      `Risposta AI mock per: "${q}"\n`,
      "Chunk 1: Stò pensando... ",
      "Chunk 2: Ho trovato informazioni interessanti. ",
      "Chunk 3: Ecco un'analisi approfondita: ",
      "Chunk 4: La conclusione è che questo è un mock perfetto! ",
    ];

    // Emetti chunks ogni 500ms
    let chunkIndex = 0;
    const interval = setInterval(() => {
      if (chunkIndex < chunks.length) {
        res.write(`data: ${chunks[chunkIndex]}\n\n`);
        chunkIndex++;
      } else {
        // Fine dello stream
        res.write("data: [DONE]\n\n");
        clearInterval(interval);
        res.end();
      }
    }, 500);

    // Cleanup se il client chiude la connessione
    req.on("close", () => {
      clearInterval(interval);
    });
  })
);

export default router;
