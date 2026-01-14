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
                    onClick={() =>
                        onReactionClick && onReactionClick(messageId, emoji)
                    }
                    className="
                        flex items-center gap-1 px-2 py-0.5 rounded-full
                        bg-white/5 hover:bg-white/10 border border-white/10
                        text-xs transition-colors group
                    "
                    title={data.users?.map((u) => u.name).join(", ")}
                >
                    <span className="text-sm">{emoji}</span>
                    <span className="text-gray-400 group-hover:text-white">
                        {data.count}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default ReactionDisplay;
