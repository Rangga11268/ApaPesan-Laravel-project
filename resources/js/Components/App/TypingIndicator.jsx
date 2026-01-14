import React from "react";

const TypingIndicator = ({ userName }) => {
    return (
        <div className="flex items-center gap-2 px-3 py-2 text-sm animate-fade-in">
            <div className="flex gap-1">
                <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                ></span>
                <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                ></span>
                <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                ></span>
            </div>
            <span className="text-gray-400 italic">
                {userName ? `${userName} is typing...` : "Someone is typing..."}
            </span>
        </div>
    );
};

export default TypingIndicator;
