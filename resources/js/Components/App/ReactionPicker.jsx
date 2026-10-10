import React from "react";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

/**
 * ReactionPicker component for adding emoji reactions to messages.
 */
const ReactionPicker = ({ onReaction, existingReactions = {}, messageId }) => {
    const handleReaction = (emoji) => {
        if (onReaction) {
            onReaction(messageId, emoji);
        }
    };

    const hasReacted = (emoji) => {
        const reaction = existingReactions[emoji];
        if (!reaction) return false;
        return reaction.users?.some((u) => u.is_me);
    };

    return (
        <div className="flex items-center gap-1 p-1 bg-surface rounded-xl border border-border shadow-md">
            {QUICK_REACTIONS.map((emoji) => (
                <button
                    key={emoji}
                    type="button"
                    onClick={() => handleReaction(emoji)}
                    className={`
                        w-7 h-7 flex items-center justify-center rounded-lg text-base
                        hover:bg-surface-elevated transition-transform hover:scale-110
                        ${
                            hasReacted(emoji)
                                ? "bg-primary/20 ring-1 ring-primary"
                                : ""
                        }
                    `}
                    title={`Reaksi ${emoji}`}
                >
                    {emoji}
                </button>
            ))}
        </div>
    );
};

export default ReactionPicker;
