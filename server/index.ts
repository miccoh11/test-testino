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
      console.log(`Processing URL: ${url}`);
      
      // Use tikwm.com API - it's more stable and handles rate limits better
      // than direct calls to TikTok's internal API from a shared IP.
      const apiResponse = await axios.post("https://www.tikwm.com/api/", 
        new URLSearchParams({ url: url }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
          },
        }
      );

      const data = apiResponse.data;

      if (data.code !== 0 || !data.data) {
        console.error("TikWM API Error:", data.msg);
        return res.status(400).json({ error: data.msg || "Failed to fetch video data. Please check the URL." });
      }

      const videoData = data.data;
      
      // Map the response to our expected format
      res.json({
        id: videoData.id,
        title: videoData.title || "TikTok Video",
        author: videoData.author.nickname,
        avatar: videoData.author.avatar,
        cover: videoData.cover,
        videoUrl: videoData.play, // This is the no-watermark URL
      });

    } catch (error: any) {
      console.error("Error fetching TikTok data:", error.message);
      res.status(500).json({ error: "Service temporarily unavailable. Please try again in a few moments." });
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
