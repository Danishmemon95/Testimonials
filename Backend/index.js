import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./src/db.js";
import testimonialRoutes from "./src/Routes/Testimonial.js";
import { errorHandler, notFoundHandler } from "./src/Middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CLIENT_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim());

app.use(
    cors({
        origin: allowedOrigins,
    })
);
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.use("/api/testimonials", testimonialRoutes);

// In production, serve the built React frontend. The catch-all sends
// every non-API path to index.html so client-side routing works
// (e.g. /wall, /dashboard, /embed all resolve to the React app).
if (process.env.NODE_ENV === "production") {
    const frontendDist = path.join(__dirname, "../Frontend/dist");
    app.use(express.static(frontendDist));

    app.get(/^\/(?!api).*/, (_req, res) => {
        res.sendFile(path.join(frontendDist, "index.html"));
    });
}

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`API listening on http://localhost:${PORT}`);
    });
}

start();