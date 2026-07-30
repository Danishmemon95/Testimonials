import axios from "axios";
import type { Testimonial, TestimonialStatus, TestimonialSubmission, PaginatedTestimonials } from "./types";

// Set VITE_API_URL once deployed, e.g. VITE_API_URL=https://your-api.onrender.com
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const client = axios.create({
    baseURL: `${API_URL}/api`,
    // Render free-tier cold-starts take ~30 s; the default timeout would
    // give up too early and show an error before the server wakes up.
    timeout: 45_000,
});

fetch(`${API_URL}/health`).catch(() => { });

interface FetchTestimonialsParams {
    status?: TestimonialStatus;
    page?: number;
    limit?: number;
}

export async function fetchTestimonials(
    params: FetchTestimonialsParams = {}
): Promise<PaginatedTestimonials> {
    const res = await client.get<PaginatedTestimonials>("/testimonials", { params });
    return res.data;
}

export async function submitTestimonial(payload: TestimonialSubmission): Promise<Testimonial> {
    const res = await client.post<Testimonial>("/testimonials", payload);
    return res.data;
}

export async function updateStatus(
    id: string,
    status: Extract<TestimonialStatus, "approved" | "rejected">
): Promise<Testimonial> {
    const res = await client.patch<Testimonial>(`/testimonials/${id}`, { status });
    return res.data;
}

/** Extracts a human-readable message from an axios error, with a fallback. */
export function getErrorMessage(err: unknown): string {
    if (axios.isAxiosError<{ error?: string }>(err)) {
        return err.response?.data?.error || "Something went wrong. Please try again.";
    }
    return "Something went wrong. Please try again.";
}