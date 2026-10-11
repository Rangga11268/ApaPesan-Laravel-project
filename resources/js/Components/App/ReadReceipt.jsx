import React from "react";
import { CheckIcon } from "@heroicons/react/24/solid";

/**
 * ReadReceipt component shows message delivery/read status.
 *
 * @param {Object} props
 * @param {boolean} props.isSent - Message has been sent
 * @param {boolean} props.isRead - Message has been read (has read_at)
 * @param {boolean} props.isOwn - Is this the current user's message
 */
const ReadReceipt = ({ isSent = true, isRead = false, isOwn = false }) => {
    // Only show for own messages
    if (!isOwn) return null;

    const baseClasses = "w-4 h-4 transition-colors";

    if (isRead) {
        // Double check - Primary Blue (Read, WCAG AA compliant >= 4.5:1)
        return (
            <div className="flex -space-x-2" title="Pesan telah dibaca">
                <CheckIcon className={`${baseClasses} text-primary`} />
                <CheckIcon className={`${baseClasses} text-primary`} />
            </div>
        );
    }

    if (isSent) {
        // Double check - Muted Slate (Delivered, WCAG AA compliant >= 4.5:1)
        return (
            <div className="flex -space-x-2" title="Pesan terkirim">
                <CheckIcon className={`${baseClasses} text-muted`} />
                <CheckIcon className={`${baseClasses} text-muted`} />
            </div>
        );
    }

    // Single check - Muted Slate (Sent)
    return (
        <span title="Terkirim">
            <CheckIcon className={`${baseClasses} text-muted`} />
        </span>
    );
};

export default ReadReceipt;
