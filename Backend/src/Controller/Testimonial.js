import mongoose from "mongoose";
import { Testimonial } from "../models/Testimonial.js";

const VALID_STATUSES = ["pending", "approved", "rejected"];

/**
 * POST /api/testimonials
 * Public submission endpoint. Anyone can hit this — it's the customer-facing form.
 * Always created as "pending"; the client can never set its own status.
 */
const createTestimonial = async (req, res) => {
    try {
        const { name, email, company, text, rating, photoUrl, hp_confirm } = req.body;

        // ── Honeypot check ──────────────────────────────────────────────
        // The frontend renders a hidden field (hp_confirm) that real users
        // never see or fill in.  Bots auto-fill every field, so a non-empty
        // value here is a strong spam signal — reject silently with a
        // generic 400 so the bot doesn't know what tripped it.
        if (hp_confirm) {
            return res.status(400).json({ error: "Invalid submission." });
        }

        // ── Duplicate guard ─────────────────────────────────────────────
        // Same person (email) submitting very similar text within 24 hours
        // is almost certainly an accidental double-click, a refresh, or
        // spam.  We use a case-insensitive email match (the schema already
        // lowercases it, but the incoming value hasn't been persisted yet).
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const duplicate = await Testimonial.findOne({
            email: email?.toLowerCase?.(),
            text: text?.trim?.(),
            createdAt: { $gte: oneDayAgo },
        });

        if (duplicate) {
            return res.status(409).json({
                error: "You've already submitted a similar testimonial recently. Please wait before submitting again.",
            });
        }

        const testimonial = await Testimonial.create({
            name,
            email,
            company,
            text,
            rating,
            photoUrl,
            status: "pending",
        });

        res.status(201).json(testimonial);
    } catch (err) {
        if (err.name === "ValidationError") {
            // Collapse mongoose's per-field errors into one readable message
            // instead of leaking the raw mongoose error shape to the client.
            const message = Object.values(err.errors)
                .map((e) => e.message)
                .join(", ");
            return res.status(400).json({ error: message });
        }
        console.error("Failed to create testimonial:", err);
        res.status(500).json({ error: "Something went wrong. Please try again." });
    }
};

/**
 * GET /api/testimonials?status=pending|approved|rejected&page=1&limit=20
 * Used by both the dashboard (pending/rejected) and the public wall (approved).
 * Status filter is optional — omitting it returns everything, which the
 * dashboard uses for an "all" view.
 *
 * Returns a paginated envelope:
 *   { items: Testimonial[], page, limit, total, totalPages }
 */
const getTestimonials = async (req, res) => {
    try {
        const { status } = req.query;

        if (status && !VALID_STATUSES.includes(status)) {
            return res.status(400).json({ error: `status must be one of ${VALID_STATUSES.join(", ")}` });
        }

        // ── Pagination defaults ─────────────────────────────────────────
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));

        const filter = status ? { status } : {};

        // Run both queries in parallel — the count is cheap on an indexed
        // field and we need it for totalPages anyway.
        const [items, total] = await Promise.all([
            Testimonial.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Testimonial.countDocuments(filter),
        ]);

        res.json({
            items,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
        });
    } catch (err) {
        console.error("Failed to fetch testimonials:", err);
        res.status(500).json({ error: "Something went wrong. Please try again." });
    }
};

/**
 * PATCH /api/testimonials/:id
 * Body: { status: "approved" | "rejected" }
 * One endpoint for both moderation actions rather than two separate
 * approve/reject routes — it's a single concern (status transition),
 * validated here so the client can never set an invalid status.
 */
const updateTestimonialStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid testimonial id" });
        }

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({ error: 'status must be "approved" or "rejected"' });
        }

        const testimonial = await Testimonial.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!testimonial) {
            return res.status(404).json({ error: "Testimonial not found" });
        }

        res.json(testimonial);
    } catch (err) {
        console.error("Failed to update testimonial:", err);
        res.status(500).json({ error: "Something went wrong. Please try again." });
    }
};

export { createTestimonial, getTestimonials, updateTestimonialStatus };