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
        <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-surface border border-border border-l-4 border-l-primary rounded-lg mb-2 animate-slide-up shadow-2xs">
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-primary truncate">
                    Membalas {replyTo.sender?.name || "Pengguna"}
                </p>
                <p className="text-xs text-muted font-normal truncate mt-0.5">
                    {replyTo.message || (
                        <span className="inline-flex items-center gap-1">
                            {replyTo.attachments > 0 ? (
                                <>
                                    <PhotoIcon className="w-3.5 h-3.5 shrink-0 text-muted" />
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
                className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg text-muted hover:text-main hover:bg-surface-elevated transition-colors shrink-0"
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
 * Adapts styling cleanly between own (primary blue) and received (surface-elevated) bubbles.
 */
export const QuotedMessage = ({ replyTo, isOwn = false }) => {
    if (!replyTo) return null;

    if (isOwn) {
        return (
            <div className="mb-2 px-3 py-1.5 rounded-lg border-l-3 border-white/90 bg-black/20 text-xs">
                <p className="font-semibold text-white text-[11px] truncate">
                    {replyTo.sender?.name || "Pengguna"}
                </p>
                <p className="text-white/90 font-normal truncate text-xs mt-0.5">
                    {replyTo.message || (replyTo.attachments ? `${replyTo.attachments} lampiran` : "Pesan")}
                </p>
            </div>
        );
    }

    return (
        <div className="mb-2 px-3 py-1.5 rounded-lg border border-border/80 border-l-3 border-l-primary bg-surface text-xs shadow-2xs">
            <p className="font-semibold text-primary text-[11px] truncate">
                {replyTo.sender?.name || "Pengguna"}
            </p>
            <p className="text-muted font-normal truncate text-xs mt-0.5">
                {replyTo.message || (replyTo.attachments ? `${replyTo.attachments} lampiran` : "Pesan")}
            </p>
        </div>
    );
};

export default ReplyPreview;

