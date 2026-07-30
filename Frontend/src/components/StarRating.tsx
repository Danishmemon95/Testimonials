import { useState } from "react";

interface StarRatingProps {
    value: number;
    onChange?: (value: number) => void;
    size?: "sm" | "md" | "lg";
}

export default function StarRating({ value, onChange, size = "md" }: StarRatingProps) {
    const [hoverValue, setHoverValue] = useState<number | null>(null);
    const stars = [1, 2, 3, 4, 5];
    const interactive = typeof onChange === "function";

    const displayValue = hoverValue !== null ? hoverValue : value;

    const sizeClasses = {
        sm: "text-base gap-0.5",
        md: "text-xl gap-1",
        lg: "text-2xl gap-1.5",
    };

    return (
        <div
            className={`inline-flex items-center ${sizeClasses[size]}`}
            role={interactive ? "radiogroup" : "img"}
            aria-label={interactive ? "Rating select" : `${value} out of 5 stars`}
            onMouseLeave={() => interactive && setHoverValue(null)}
        >
            {stars.map((n) => {
                const isFilled = n <= displayValue;
                const starColor = isFilled
                    ? "text-amber-500 drop-shadow-[0_1px_2px_rgba(245,158,11,0.3)]"
                    : "text-slate-300";

                return interactive ? (
                    <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={value === n}
                        aria-label={`${n} star${n > 1 ? "s" : ""}`}
                        className={`bg-transparent border-0 p-0 leading-none ${starColor} cursor-pointer transition-all duration-150 transform hover:scale-125 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-1 rounded-xs`}
                        onMouseEnter={() => setHoverValue(n)}
                        onClick={() => onChange?.(n)}
                    >
                        ★
                    </button>
                ) : (
                    <span
                        key={n}
                        aria-hidden="true"
                        className={`bg-transparent border-0 p-0 leading-none ${starColor} transition-colors duration-150`}
                    >
                        ★
                    </span>
                );
            })}
        </div>
    );
}