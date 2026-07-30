export function errorHandler(err, req, res, next) {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Something went wrong on our end." });
}

export function notFoundHandler(req, res) {
    res.status(404).json({ error: "Route not found" });
}