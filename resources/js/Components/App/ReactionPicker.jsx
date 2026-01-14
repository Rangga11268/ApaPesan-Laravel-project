import React, { useState } from "react";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

/**
 * ReactionPicker component for adding emoji reactions to messages.
 */
const ReactionPicker = ({ onReaction, existingReactions = {}, messageId }) => {
    const [showMore, setShowMore] = useState(false);

    const handleReaction = (emoji) => {
        if (onReaction) {
            onReaction(messageId, emoji);
        }
    };

    // Check if user already reacted with this emoji
    const hasReacted = (emoji) => {
        const reaction = existingReactions[emoji];
        if (!reaction) return false;
        return reaction.users?.some((u) => u.is_me);
    };

    return (
        <div className="flex items-center gap-1 p-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 shadow-lg animate-scale-in">
            {QUICK_REACTIONS.map((emoji) => (
                <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className={`
                        w-8 h-8 flex items-center justify-center rounded-full text-lg
                        hover:bg-white/10 transition-all hover:scale-110
                        ${
                            hasReacted(emoji)
                                ? "bg-primary-500/30 ring-2 ring-primary-400"
                                : ""
                        }
                    `}
                    title={`React with ${emoji}`}
                >
                    {emoji}
                </button>
            ))}
        </div>
    );
};

export default ReactionPicker;
