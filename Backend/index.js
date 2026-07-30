import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./src/db.js";
import testimonialRoutes from "./src/Routes/Testimonial.js";
import { errorHandler, notFoundHandler } from "./src/Middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Allow only the configured frontend origin(s), not "*" — this API
// accepts writes (testimonial submissions), so an open CORS policy
// would let any site submit on a stranger's behalf.
const allowedOrigins = (process.env.CLIENT_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim());

app.use(
    cors({
        origin: allowedOrigins,
    })
);
app.use(express.json());

// Kept outside /api on purpose: this is what an uptime pinger (or you,
// checking if a Render free-tier instance has woken up yet) should hit.
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.use("/api/testimonials", testimonialRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`API listening on http://localhost:${PORT}`);
    });
}

start();