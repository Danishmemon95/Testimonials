import { useState, type FormEvent } from "react";
import StarRating from "../components/StarRating";
import TestimonialCard from "../components/TestimonialCard";
import { submitTestimonial, getErrorMessage } from "../api";
import type { Testimonial, TestimonialSubmission } from "../types";

type SubmitStatus = "idle" | "submitting" | "success" | "error";

const EMPTY_FORM: TestimonialSubmission = {
    name: "",
    email: "",
    company: "",
    text: "",
    rating: 5,
    photoUrl: "",
    hp_confirm: "",
};

export default function SubmitForm() {
    const [form, setForm] = useState<TestimonialSubmission>(EMPTY_FORM);
    const [status, setStatus] = useState<SubmitStatus>("idle");
    const [error, setError] = useState("");

    function update<K extends keyof TestimonialSubmission>(field: K, value: TestimonialSubmission[K]) {
        setForm((f: any) => ({ ...f, [field]: value }));
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (form.rating === 0) {
            setError("Please select a star rating.");
            setStatus("error");
            return;
        }

        if (!form.text.trim()) {
            setError("Please write a few words for your testimonial.");
            setStatus("error");
            return;
        }

        setStatus("submitting");
        setError("");

        try {
            await submitTestimonial(form);
            setStatus("success");
            setForm(EMPTY_FORM);
        } catch (err) {
            setError(getErrorMessage(err));
            setStatus("error");
        }
    }

    const inputClasses =
        "w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all shadow-2xs";

    if (status === "success") {
        return (
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 animate-fade-in">
                <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 text-center shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 text-3xl font-bold flex items-center justify-center mx-auto mb-6 shadow-xs animate-bounce">
                        ✓
                    </div>
                    <h1 className="font-display font-bold text-3xl text-slate-900 mb-3">
                        Thank you for your feedback!
                    </h1>
                    <p className="text-slate-600 text-base max-w-md mx-auto mb-8 leading-relaxed">
                        Your testimonial has been submitted successfully. Once our team completes moderation, it will appear on the public wall.
                    </p>
                    <button
                        className="inline-flex items-center gap-2 bg-slate-900 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-md hover:bg-slate-800 hover:scale-102 active:scale-98 transition-all cursor-pointer"
                        onClick={() => setStatus("idle")}
                    >
                        Submit another testimonial
                    </button>
                </div>
            </div>
        );
    }

    // Dynamic mock for live card preview
    const previewTestimonial: Testimonial = {
        _id: "preview",
        name: form.name.trim() || "Your Name",
        email: form.email.trim() || "alex@example.com",
        company: form.company.trim() || "Company / Role",
        text: form.text.trim() || "Your testimonial will appear here in real time as you type...",
        rating: form.rating || 5,
        photoUrl: form.photoUrl.trim() || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "approved",
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 animate-fade-in">
            {/* Header */}
            <div className="text-center max-w-xl mx-auto mb-10">
                <span className="inline-block bg-amber-100 text-amber-800 text-xs font-mono font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                    Public Feedback Form
                </span>
                <h1 className="font-display text-3xl sm:text-4xl text-slate-900 tracking-tight mb-3">
                    Share your experience
                </h1>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                    Help others discover genuine stories. A few honest sentences mean the world to us.
                </p>
            </div>

            {/* Main Form & Preview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Column */}
                <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
                    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                        {/* Honeypot */}
                        <label className="sr-only" aria-hidden="true">
                            Leave this field empty
                            <input
                                type="text"
                                tabIndex={-1}
                                autoComplete="off"
                                value={form.hp_confirm}
                                onChange={(e) => update("hp_confirm", e.target.value)}
                            />
                        </label>

                        {/* Name & Email */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                                Full Name <span className="text-amber-600">*</span>
                                <input
                                    type="text"
                                    required
                                    placeholder="Alex Rivera"
                                    className={inputClasses}
                                    value={form.name}
                                    onChange={(e) => update("name", e.target.value)}
                                    maxLength={120}
                                />
                            </label>

                            <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                                Email Address <span className="text-amber-600">*</span>
                                <input
                                    type="email"
                                    required
                                    placeholder="alex@company.com"
                                    className={inputClasses}
                                    value={form.email}
                                    onChange={(e) => update("email", e.target.value)}
                                />
                            </label>
                        </div>

                        {/* Company / Role */}
                        <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                            <div className="flex justify-between items-center">
                                <span>Company / Role</span>
                                <span className="font-mono text-[10px] text-slate-400 font-normal">Optional</span>
                            </div>
                            <input
                                type="text"
                                placeholder="Product Manager at Acme Corp"
                                className={inputClasses}
                                value={form.company}
                                onChange={(e) => update("company", e.target.value)}
                                maxLength={160}
                            />
                        </label>

                        {/* Rating Selector */}
                        <div className="flex flex-col gap-2 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Overall Rating <span className="text-amber-600">*</span>
                                </span>
                                <span className="font-mono text-xs font-semibold text-amber-700">
                                    {form.rating} of 5 Stars
                                </span>
                            </div>
                            <StarRating value={form.rating} size="lg" onChange={(n) => update("rating", n)} />
                        </div>

                        {/* Testimonial Textarea */}
                        <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                            <div className="flex justify-between items-center">
                                <span>Your Testimonial <span className="text-amber-600">*</span></span>
                                <span className="font-mono text-[11px] font-normal text-slate-400">
                                    {form.text.length} / 2000
                                </span>
                            </div>
                            <textarea
                                required
                                rows={4}
                                minLength={10}
                                maxLength={2000}
                                placeholder="What stood out most about your experience?..."
                                className={`${inputClasses} resize-y min-h-[110px]`}
                                value={form.text}
                                onChange={(e) => update("text", e.target.value)}
                            />
                        </label>

                        {/* Photo URL */}
                        <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                            <div className="flex justify-between items-center">
                                <span>Avatar Photo URL</span>
                                <span className="font-mono text-[10px] text-slate-400 font-normal">Optional</span>
                            </div>
                            <input
                                type="url"
                                placeholder="https://images.unsplash.com/photo-..."
                                className={inputClasses}
                                value={form.photoUrl}
                                onChange={(e) => update("photoUrl", e.target.value)}
                            />
                        </label>

                        {/* Error Notice */}
                        {status === "error" && (
                            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
                                <svg className="w-4 h-4 text-rose-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={status === "submitting"}
                            className="mt-2 w-full sm:w-auto self-start bg-slate-900 text-white font-bold text-sm px-7 py-3.5 rounded-xl shadow-md hover:bg-slate-800 active:scale-98 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {status === "submitting" ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Submitting Review...</span>
                                </>
                            ) : (
                                <span>Submit Testimonial</span>
                            )}
                        </button>
                    </form>
                </div>

                {/* Preview Column */}
                <div className="lg:col-span-5 sticky top-24">
                    <div className="bg-slate-900/5 border border-slate-200/80 rounded-3xl p-6 shadow-2xs">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                                Live Card Preview
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">Published Card View</span>
                        </div>

                        <TestimonialCard testimonial={previewTestimonial} />

                        <p className="text-[11px] text-slate-500 mt-4 text-center leading-normal">
                            This is how your review will be rendered on our public wall once approved by our moderation team.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}