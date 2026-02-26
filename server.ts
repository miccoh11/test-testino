import express from "express";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(cors());
  app.use(express.json());

  // API route to fetch TikTok video info
  app.post("/api/download", async (req, res) => {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    try {
      console.log(`[Server] Processing TikTok URL: ${url}`);
      
      // Use api.tikwm.com (often more stable for API calls)
      const apiResponse = await axios.post("https://api.tikwm.com/api/", 
        new URLSearchParams({ url: url }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
          },
          timeout: 20000, // Increase to 20 seconds
        }
      );

      const data = apiResponse.data;

      if (!data) {
        throw new Error("Empty response from TikWM API");
      }

      if (data.code !== 0 || !data.data) {
        console.error("[Server] TikWM API Error Details:", data);
        return res.status(400).json({ 
          error: data?.msg || "Video non trovato o privato. Assicurati che il link sia corretto." 
        });
      }

      const videoData = data.data;
      console.log(`[Server] Successfully fetched video: ${videoData.id}`);
      
      return res.json({
        id: videoData.id,
        title: videoData.title || "Video TikTok",
        author: videoData.author.nickname,
        avatar: videoData.author.avatar,
        cover: videoData.cover,
        videoUrl: videoData.play,
      });

    } catch (error: any) {
      console.error("[Server] Critical Error:", error.message);
      
      if (error.code === 'ECONNABORTED') {
        return res.status(504).json({ error: "Il server di TikTok sta impiegando troppo tempo a rispondere. Riprova tra poco." });
      }
      
      // If it's a 429 or similar from the upstream API
      if (error.response && error.response.status === 429) {
        return res.status(429).json({ error: "Troppe richieste. Per favore, attendi un minuto prima di riprovare." });
      }

      return res.status(500).json({ error: "Errore di connessione con i server di TikTok. Riprova tra un istante." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    
    // Handle SPA routing in production
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
