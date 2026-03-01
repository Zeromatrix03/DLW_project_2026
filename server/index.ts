import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { seedDatabase } from "./seed"; //


const app = express();
const httpServer = createServer(app);

// Standard JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Custom Logger
export function log(message: string, source = "express") {
  const time = new Date().toLocaleTimeString("en-US", { hour12: true });
  console.log(`${time} [${source}] ${message}`);
}

// Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

(async () => {
  // 1. Populate the database if it's empty
  try {
    log("Initializing Armory and Mission Data...", "seed");
    await seedDatabase();
    log("Database is mission-ready!", "seed");
  } catch (err) {
    console.error("Seeding failed:", err);
  }

  
  // 1. Setup API and Socket Routes
  await registerRoutes(httpServer, app);

  // 2. ADHD Bi-Directional Accountability Logic
  // This simulates the AI doing its own "tasks" to help the student feel supported
  const aiStatusReports = [
    "I've finished organizing your math progress charts.",
    "I've just completed a scan of the global commander leaderboard.",
    "I'm currently preparing your next set of achievement badges."
  ];

  setInterval(() => {
    const report = aiStatusReports[Math.floor(Math.random() * aiStatusReports.length)];
    log(`[AI-BUDDY]: ${report} - Checking in on student status.`, "ADHD-Buddy");
    // Eventually, you'll emit this through Socket.io to the frontend
  }, 600000); // 10 minutes

  // 3. Global Error Handler
  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    console.error("Internal Error:", err);
    res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
  });

  // 4. Vite / Frontend
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // 5. WINDOWS-STABLE LISTENER
  // We remove the { host, reusePort } object entirely to let Node use OS defaults.
  const PORT = 3000; 
  httpServer.listen(PORT, () => {
    log(`🚀 Space Marine Command Center online at http://localhost:${PORT}`);
  });
})();