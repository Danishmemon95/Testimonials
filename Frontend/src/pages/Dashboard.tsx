import { useEffect, useState } from "react";
import StarRating from "../components/StarRating";
import { fetchTestimonials, updateStatus, getErrorMessage } from "../api";
import type { Testimonial, TestimonialStatus } from "../types";

const TABS: TestimonialStatus[] = ["pending", "approved", "rejected"];
const PAGE_SIZE = 20;
type LoadStatus = "loading" | "ready" | "error";

export default function Dashboard() {
    const [tab, setTab] = useState<TestimonialStatus>("pending");
    const [items, setItems] = useState<Testimonial[]>([]);
    const [status, setStatus] = useState<LoadStatus>("loading");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const [pendingActionId, setPendingActionId] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setStatus("loading");

        fetchTestimonials({ status: tab, page: 1, limit: PAGE_SIZE })
            .then((data) => {
                if (cancelled) return;
                setItems(data.items);
                setTotalPages(data.totalPages);
                setPage(1);
                setStatus("ready");
            })
            .catch(() => {
                if (!cancelled) setStatus("error");
            });

        return () => {
            cancelled = true;
        };
    }, [tab, refreshKey]);

    async function handleLoadMore() {
        setLoadingMore(true);
        try {
            const nextPage = page + 1;
            const data = await fetchTestimonials({ status: tab, page: nextPage, limit: PAGE_SIZE });
            setItems((prev) => [...prev, ...data.items]);
            setPage(nextPage);
            setTotalPages(data.totalPages);
        } catch (err) {
            console.error(getErrorMessage(err));
        } finally {
            setLoadingMore(false);
        }
    }

    async function handleAction(id: string, newStatus: "approved" | "rejected") {
        setPendingActionId(id);
        try {
            await updateStatus(id, newStatus);
            setItems((prev) => prev.filter((item) => item._id !== id));
            showToast(`Submission successfully ${newStatus}`);
        } catch (err) {
            alert(getErrorMessage(err));
        } finally {
            setPendingActionId(null);
        }
    }

    function showToast(msg: string) {
        setToastMessage(msg);
        setTimeout(() => {
            setToastMessage(null);
        }, 3000);
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 animate-fade-in relative">
            {/* Action Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white font-semibold text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-fade-in">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    {toastMessage}
                </div>
            )}

            {/* Title & Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700">
                        Admin Portal
                    </span>
                    <h1 className="font-display text-3xl font-bold text-slate-900 tracking-tight">
                        Moderation Dashboard
                    </h1>
                </div>

                {/* Quick Status Pill Bar */}
                <div className="flex items-center gap-3">
                    <div className="bg-white border border-slate-200/80 rounded-2xl px-4 py-2 text-center shadow-2xs">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                            Active Tab
                        </span>
                        <span className="text-sm font-bold text-slate-900 capitalize">{tab}</span>
                    </div>
                </div>
            </div>

            {/* Moderation Filter Tabs */}
            <div className="flex gap-2 border-b border-slate-200 mb-6 overflow-x-auto pb-1" role="tablist">
                {TABS.map((t) => {
                    const isActive = tab === t;
                    return (
                        <button
                            key={t}
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => setTab(t)}
                            className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider cursor-pointer transition-all duration-150 flex items-center gap-2 ${
                                isActive
                                    ? "bg-slate-900 text-white shadow-xs"
                                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                            }`}
                        >
                            <span>{t}</span>
                            {isActive && status === "ready" && (
                                <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {items.length}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Loading Skeleton List */}
            {status === "loading" && (
                <div className="flex flex-col gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-28 h-4 bg-slate-200 rounded-full"></div>
                                <div className="w-16 h-3 bg-slate-100 rounded-full"></div>
                            </div>
                            <div className="w-3/4 h-4 bg-slate-100 rounded-full"></div>
                            <div className="w-36 h-3 bg-slate-100 rounded-full"></div>
                        </div>
                    ))}
                </div>
            )}

            {/* Error State */}
            {status === "error" && (
                <div className="p-8 bg-white border border-rose-200 rounded-3xl text-center shadow-xs my-8 max-w-md mx-auto">
                    <p className="text-rose-600 font-bold text-sm mb-3">Couldn't load submissions</p>
                    <button
                        onClick={() => setRefreshKey((k) => k + 1)}
                        className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-800"
                    >
                        Try Refreshing Tab
                    </button>
                </div>
            )}

            {/* Empty State */}
            {status === "ready" && items.length === 0 && (
                <div className="p-12 bg-white border border-dashed border-slate-300 rounded-3xl text-center shadow-2xs my-6">
                    <div className="text-3xl mb-2">📥</div>
                    <p className="text-slate-700 font-bold text-base mb-1">
                        No submissions in <span className="capitalize text-amber-700">{tab}</span>
                    </p>
                    <p className="text-slate-400 text-xs">
                        {tab === "pending"
                            ? "All incoming customer reviews have been reviewed!"
                            : `There are currently no ${tab} reviews.`}
                    </p>
                </div>
            )}

            {/* Items List */}
            {status === "ready" && items.length > 0 && (
                <>
                    <div className="flex flex-col gap-4">
                        {items.map((item) => (
                            <div
                                key={item._id}
                                className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 shadow-xs transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group"
                            >
                                <div className="min-w-0 flex-1 space-y-1.5">
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <span className="font-bold text-slate-900 text-sm">{item.name}</span>
                                        {item.company && (
                                            <span className="text-slate-500 text-xs font-medium">· {item.company}</span>
                                        )}
                                        <StarRating value={item.rating} size="sm" />
                                    </div>
                                    <p className="text-slate-700 text-sm leading-relaxed max-w-3xl m-0 font-display italic">
                                        “{item.text}”
                                    </p>
                                    <div className="flex items-center gap-3 pt-1">
                                        <span className="font-mono text-[11px] text-slate-400">{item.email}</span>
                                        {item.createdAt && (
                                            <span className="font-mono text-[11px] text-slate-400">
                                                · {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {tab === "pending" && (
                                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                        <button
                                            disabled={pendingActionId === item._id}
                                            onClick={() => handleAction(item._id, "approved")}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-2xs hover:shadow-xs active:scale-98 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Approve
                                        </button>
                                        <button
                                            disabled={pendingActionId === item._id}
                                            onClick={() => handleAction(item._id, "rejected")}
                                            className="bg-white hover:bg-rose-50 border border-rose-300 text-rose-700 font-bold text-xs px-4 py-2.5 rounded-xl shadow-2xs hover:border-rose-400 active:scale-98 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {page < totalPages && (
                        <div className="text-center mt-8">
                            <button
                                className="bg-white border border-slate-300 hover:border-amber-500 text-slate-800 font-semibold text-xs px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                            >
                                {loadingMore ? "Loading More..." : "Load More Submissions"}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}