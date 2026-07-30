import { useEffect, useState, type CSSProperties } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchTestimonials, getErrorMessage } from "../api";
import TestimonialCard from "../components/TestimonialCard";
import type { Testimonial } from "../types";

type LoadStatus = "loading" | "ready" | "error";

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export default function EmbedWidget() {
    const [searchParams] = useSearchParams();
    const rawColor = searchParams.get("color");
    const accentColor = rawColor && HEX_RE.test(rawColor) ? rawColor : undefined;
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") || "6", 10) || 6));

    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [status, setStatus] = useState<LoadStatus>("loading");

    useEffect(() => {
        let cancelled = false;

        fetchTestimonials({ status: "approved", page: 1, limit })
            .then((data) => {
                if (!cancelled) {
                    setTestimonials(data.items);
                    setStatus("ready");
                }
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [limit]);

    useEffect(() => {
        const postHeight = () => {
            window.parent.postMessage(
                { type: "testimonial-widget:resize", height: document.documentElement.scrollHeight },
                "*"
            );
        };

        postHeight();
        const observer = new ResizeObserver(postHeight);
        observer.observe(document.documentElement);
        return () => observer.disconnect();
    }, [status, testimonials]);

    const wrapperStyle = accentColor
        ? ({ "--color-gold": accentColor, "--gold": accentColor } as CSSProperties)
        : undefined;

    return (
        <div className="bg-transparent p-4" style={wrapperStyle}>
            {status === "loading" && (
                <div className="columns-1 min-[480px]:columns-2 gap-4 space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse break-inside-avoid">
                            <div className="w-20 h-3 bg-slate-200 rounded-full mb-3"></div>
                            <div className="w-full h-12 bg-slate-100 rounded-lg"></div>
                        </div>
                    ))}
                </div>
            )}
            {status === "error" && (
                <div className="p-6 bg-white border border-rose-200 rounded-2xl text-center">
                    <p className="text-rose-600 text-xs font-semibold">Couldn't load testimonials.</p>
                </div>
            )}
            {status === "ready" && testimonials.length === 0 && (
                <div className="p-6 bg-white border border-dashed border-slate-300 rounded-2xl text-center">
                    <p className="text-slate-400 text-xs">No testimonials yet.</p>
                </div>
            )}
            {status === "ready" && testimonials.length > 0 && (
                <div className="columns-1 min-[480px]:columns-2 gap-4 [&>article]:mb-4">
                    {testimonials.map((t) => (
                        <TestimonialCard key={t._id} testimonial={t} />
                    ))}
                </div>
            )}
        </div>
    );
}
