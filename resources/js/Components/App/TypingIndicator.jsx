import React from "react";

const TypingIndicator = ({ userName }) => {
    return (
        <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted animate-fade-in font-medium">
            <div className="flex gap-1 items-center">
                <span
                    className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                ></span>
                <span
                    className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                ></span>
                <span
                    className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                ></span>
            </div>
            <span className="italic">
                {userName ? `${userName} sedang mengetik...` : "Seseorang sedang mengetik..."}
            </span>
        </div>
    );
};

export default TypingIndicator;
