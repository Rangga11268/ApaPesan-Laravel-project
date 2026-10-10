import React from "react";

/**
 * ReactionDisplay shows reactions on a message bubble.
 *
 * @param {Object} props
 * @param {Object} props.reactions - Map of emoji to {count, users}
 * @param {Function} props.onReactionClick - Callback when reaction is clicked
 */
const ReactionDisplay = ({ reactions = {}, onReactionClick, messageId }) => {
    const reactionEntries = Object.entries(reactions);

    if (reactionEntries.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-1 mt-1">
            {reactionEntries.map(([emoji, data]) => (
                <button
                    key={emoji}
                    type="button"
                    onClick={() =>
                        onReactionClick && onReactionClick(messageId, emoji)
                    }
                    className="
                        flex items-center gap-1 px-2 py-0.5 rounded-full
                        bg-surface/90 hover:bg-surface border border-border/70
                        text-xs transition-colors group shadow-xs
                    "
                    title={data.users?.map((u) => u.name).join(", ")}
                >
                    <span className="text-xs">{emoji}</span>
                    <span className="text-[11px] font-medium text-main">
                        {data.count}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default ReactionDisplay;
