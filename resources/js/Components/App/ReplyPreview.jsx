import React from "react";
import {
    XMarkIcon,
    DocumentIcon,
    PhotoIcon,
} from "@heroicons/react/24/outline";

/**
 * ReplyPreview shows the message being replied to in the input area.
 */
const ReplyPreview = ({ replyTo, onCancel }) => {
    if (!replyTo) return null;

    return (
        <div className="flex items-center gap-2 px-4 py-2 bg-black/20 border-l-4 border-primary-500 animate-slide-up">
            <div className="flex-1 min-w-0">
                <p className="text-xs text-primary-400 font-medium truncate">
                    Replying to {replyTo.sender?.name || "Unknown"}
                </p>
                <p className="text-sm text-gray-400 truncate">
                    {replyTo.message || (
                        <span className="flex items-center gap-1">
                            {replyTo.attachments > 0 ? (
                                <>
                                    <PhotoIcon className="w-4 h-4" />
                                    {replyTo.attachments} attachment
                                    {replyTo.attachments > 1 ? "s" : ""}
                                </>
                            ) : (
                                "Message"
                            )}
                        </span>
                    )}
                </p>
            </div>
            <button
                onClick={onCancel}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
                title="Cancel reply"
            >
                <XMarkIcon className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
        </div>
    );
};

/**
 * QuotedMessage shows the original message within a reply message bubble.
 */
export const QuotedMessage = ({ replyTo }) => {
    if (!replyTo) return null;

    return (
        <div className="mb-2 px-3 py-2 bg-black/30 rounded-lg border-l-2 border-primary-500/50">
            <p className="text-xs text-primary-400 font-medium truncate">
                {replyTo.sender?.name || "Unknown"}
            </p>
            <p className="text-xs text-gray-400 truncate">
                {replyTo.message || `${replyTo.attachments} attachment(s)`}
            </p>
        </div>
    );
};

export default ReplyPreview;
