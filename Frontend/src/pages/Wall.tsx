import { useEffect, useState } from "react";
import { fetchTestimonials, getErrorMessage } from "../api";
import TestimonialCard from "../components/TestimonialCard";
import type { Testimonial } from "../types";

type LoadStatus = "loading" | "ready" | "error";

const PAGE_SIZE = 9;

export default function Wall() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [status, setStatus] = useState<LoadStatus>("loading");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const [ratingFilter, setRatingFilter] = useState<number | "all">("all");

    useEffect(() => {
        let cancelled = false;

        fetchTestimonials({ status: "approved", page: 1, limit: PAGE_SIZE })
            .then((data) => {
                if (cancelled) return;
                setTestimonials(data.items);
                setTotalPages(data.totalPages);
                setPage(1);
                setStatus("ready");
            })
            .catch((err) => {
                if (!cancelled) {
                    setStatus("error");
                    console.error(getErrorMessage(err));
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    async function handleLoadMore() {
        setLoadingMore(true);
        try {
            const nextPage = page + 1;
            const data = await fetchTestimonials({ status: "approved", page: nextPage, limit: PAGE_SIZE });
            setTestimonials((prev) => [...prev, ...data.items]);
            setPage(nextPage);
            setTotalPages(data.totalPages);
        } catch (err) {
            console.error(getErrorMessage(err));
        } finally {
            setLoadingMore(false);
        }
    }

    const filteredTestimonials = ratingFilter === "all"
        ? testimonials
        : testimonials.filter((t) => t.rating >= (ratingFilter as number));

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 animate-fade-in">
            {/* Header Hero */}
            <header className="text-center max-w-xl mx-auto mb-10">
                <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-200/80 px-3.5 py-1 rounded-full text-xs font-semibold mb-4 shadow-2xs">
                    <span className="text-amber-500">★ ★ ★ ★ ★</span>
                    <span>Verified Customer Reviews</span>
                </div>
                <h1 className="font-display text-3xl sm:text-4xl text-slate-900 tracking-tight mb-3">
                    What people are saying
                </h1>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                    Real testimonials from real customers, independently submitted and human-reviewed.
                </p>

                {/* Rating Filter Pills */}
                <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
                    <button
                        onClick={() => setRatingFilter("all")}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                            ratingFilter === "all"
                                ? "bg-slate-900 text-white shadow-xs"
                                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-400"
                        }`}
                    >
                        All Reviews ({testimonials.length})
                    </button>
                    <button
                        onClick={() => setRatingFilter(5)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                            ratingFilter === 5
                                ? "bg-amber-500 text-white shadow-xs"
                                : "bg-white text-slate-600 border border-slate-200 hover:border-amber-400"
                        }`}
                    >
                        ★ 5 Stars Only
                    </button>
                    <button
                        onClick={() => setRatingFilter(4)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                            ratingFilter === 4
                                ? "bg-amber-500 text-white shadow-xs"
                                : "bg-white text-slate-600 border border-slate-200 hover:border-amber-400"
                        }`}
                    >
                        ★ 4+ Stars
                    </button>
                </div>
            </header>

            {/* Loading State - Pulse Skeletons */}
            {status === "loading" && (
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col gap-4 animate-pulse break-inside-avoid"
                        >
                            <div className="w-24 h-4 bg-slate-200 rounded-full"></div>
                            <div className="w-full h-16 bg-slate-100 rounded-xl"></div>
                            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                                <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                                <div className="space-y-1">
                                    <div className="w-20 h-3 bg-slate-200 rounded-full"></div>
                                    <div className="w-14 h-2.5 bg-slate-100 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Error State */}
            {status === "error" && (
                <div className="max-w-md mx-auto my-12 p-8 bg-white border border-rose-200 rounded-3xl text-center shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                        !
                    </div>
                    <h3 className="font-display font-bold text-lg text-slate-900 mb-2">
                        Couldn't load testimonials
                    </h3>
                    <p className="text-slate-600 text-xs mb-6">
                        There was a network error fetching reviews. Please try refreshing the page.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-slate-900 text-white font-semibold text-xs px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                        Refresh Page
                    </button>
                </div>
            )}

            {/* Empty State */}
            {status === "ready" && filteredTestimonials.length === 0 && (
                <div className="max-w-md mx-auto my-12 p-10 bg-white border border-dashed border-slate-300 rounded-3xl text-center shadow-2xs">
                    <div className="text-3xl mb-3">💬</div>
                    <h3 className="font-display font-bold text-lg text-slate-900 mb-1">
                        No testimonials match this filter
                    </h3>
                    <p className="text-slate-500 text-xs mb-6">
                        Try selecting a different filter or be the first to submit a review!
                    </p>
                    <button
                        onClick={() => setRatingFilter("all")}
                        className="bg-slate-900 text-white font-semibold text-xs px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                        Reset Filter
                    </button>
                </div>
            )}

            {/* Ready Grid */}
            {status === "ready" && filteredTestimonials.length > 0 && (
                <>
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 [&>article]:mb-6">
                        {filteredTestimonials.map((t) => (
                            <TestimonialCard key={t._id} testimonial={t} />
                        ))}
                    </div>

                    {page < totalPages && ratingFilter === "all" && (
                        <div className="text-center mt-10">
                            <button
                                className="inline-flex items-center gap-2 bg-white text-slate-900 border border-slate-300 rounded-xl px-7 py-3 text-sm font-semibold hover:border-amber-500 hover:text-amber-600 transition-all cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                            >
                                {loadingMore ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-amber-600" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Loading More Reviews...</span>
                                    </>
                                ) : (
                                    <span>Load More Testimonials</span>
                                )}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}