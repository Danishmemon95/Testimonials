export type TestimonialStatus = "pending" | "approved" | "rejected";

export interface Testimonial {
    _id: string;
    name: string;
    email: string;
    company?: string;
    text: string;
    rating: number;
    photoUrl?: string;
    status: TestimonialStatus;
    createdAt: string;
    updatedAt: string;
}

/** Shape the submission form sends — no _id/status/timestamps, the server owns those. */
export interface TestimonialSubmission {
    name: string;
    email: string;
    company: string;
    text: string;
    rating: number;
    photoUrl: string;
    /** Honeypot — must stay empty. Real users never see this field. */
    hp_confirm: string;
}

/** Shape returned by GET /api/testimonials */
export interface PaginatedTestimonials {
    items: Testimonial[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}