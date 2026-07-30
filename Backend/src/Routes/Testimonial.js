import { Router } from "express";

import { createTestimonial, getTestimonials, updateTestimonialStatus } from "../Controller/Testimonial.js";

const router = Router();

router.post("/", createTestimonial);
router.get("/", getTestimonials);
router.patch("/:id", updateTestimonialStatus);

export default router;