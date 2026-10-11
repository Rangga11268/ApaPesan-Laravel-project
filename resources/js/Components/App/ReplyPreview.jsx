import React from "react";
import {
    XMarkIcon,
    PhotoIcon,
} from "@heroicons/react/24/outline";

/**
 * ReplyPreview shows the message being replied to above the message input field.
 */
const ReplyPreview = ({ replyTo, onCancel }) => {
    if (!replyTo) return null;

    return (
        <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-surface-elevated/80 border border-border border-l-4 border-l-primary rounded-lg mb-2 animate-slide-up shadow-2xs">
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-primary truncate">
                    Membalas {replyTo.sender?.name || "Pengguna"}
                </p>
                <p className="text-xs text-muted truncate mt-0.5">
                    {replyTo.message || (
                        <span className="inline-flex items-center gap-1">
                            {replyTo.attachments > 0 ? (
                                <>
                                    <PhotoIcon className="w-3.5 h-3.5 shrink-0" />
                                    <span>{replyTo.attachments} lampiran</span>
                                </>
                            ) : (
                                "Pesan"
                            )}
                        </span>
                    )}
                </p>
            </div>
            <button
                type="button"
                onClick={onCancel}
                className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg text-muted hover:text-main hover:bg-surface transition-colors shrink-0"
                title="Batalkan balasan"
                aria-label="Batalkan balasan"
            >
                <XMarkIcon className="w-4 h-4" />
            </button>
        </div>
    );
};

/**
 * QuotedMessage shows the original message inside a reply message bubble.
 */
export const QuotedMessage = ({ replyTo }) => {
    if (!replyTo) return null;

    return (
        <div className="mb-2 px-2.5 py-1.5 rounded-lg border-l-3 border-primary bg-black/10 dark:bg-black/25 text-xs">
            <p className="font-semibold text-primary text-[11px] truncate">
                {replyTo.sender?.name || "Pengguna"}
            </p>
            <p className="opacity-80 truncate text-xs mt-0.5">
                {replyTo.message || (replyTo.attachments ? `${replyTo.attachments} lampiran` : "Pesan")}
            </p>
        </div>
    );
};

export default ReplyPreview;

