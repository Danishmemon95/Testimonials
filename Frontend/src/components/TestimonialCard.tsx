import StarRating from "./StarRating";
import type { Testimonial } from "../types";

interface TestimonialCardProps {
    testimonial: Testimonial;
}

function formatDate(dateStr: string): string {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
    const { name, company, text, rating, photoUrl, createdAt } = testimonial;

    return (
        <article className="group relative bg-paper-raised border border-line/90 rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 break-inside-avoid overflow-hidden">
            {/* Top decorative amber border line on hover */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-500 opacity-80 group-hover:opacity-100 transition-opacity"></div>

            <div className="flex items-center justify-between gap-2 pt-1">
                <StarRating value={rating} size="sm" />
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200/70 font-mono text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-2xs">
                    <svg className="w-3 h-3 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Verified
                </span>
            </div>

            <p className="font-display italic text-slate-800 text-base sm:text-lg leading-relaxed m-0 grow">
                “{text}”
            </p>

            <footer className="flex items-center justify-between gap-3 pt-4 border-t border-line/70 mt-auto">
                <div className="flex items-center gap-3 min-w-0">
                    {photoUrl ? (
                        <img
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 shadow-2xs shrink-0"
                            src={photoUrl}
                            alt={name}
                            onError={(e) => {
                                // Fallback if image URL is broken
                                (e.target as HTMLElement).style.display = "none";
                            }}
                        />
                    ) : (
                        <span
                            className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-900 to-slate-800 text-amber-400 font-mono font-bold text-xs shadow-2xs flex items-center justify-center ring-2 ring-slate-100 shrink-0"
                            aria-hidden="true"
                        >
                            {name ? name.charAt(0).toUpperCase() : "?"}
                        </span>
                    )}
                    <div className="min-w-0 flex flex-col">
                        <span className="text-sm font-bold text-ink truncate">{name}</span>
                        {company && <span className="text-xs text-muted truncate">{company}</span>}
                    </div>
                </div>

                {createdAt && (
                    <time className="font-mono text-[11px] text-muted whitespace-nowrap shrink-0" dateTime={createdAt}>
                        {formatDate(createdAt)}
                    </time>
                )}
            </footer>
        </article>
    );
}