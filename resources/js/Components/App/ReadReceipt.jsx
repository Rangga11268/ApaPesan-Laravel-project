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
        // Double check - Blue (Read)
        return (
            <div className="flex -space-x-2">
                <CheckIcon className={`${baseClasses} text-primary-400`} />
                <CheckIcon className={`${baseClasses} text-primary-400`} />
            </div>
        );
    }

    if (isSent) {
        // Double check - Gray (Delivered)
        return (
            <div className="flex -space-x-2">
                <CheckIcon className={`${baseClasses} text-gray-400`} />
                <CheckIcon className={`${baseClasses} text-gray-400`} />
            </div>
        );
    }

    // Single check - Gray (Sent)
    return <CheckIcon className={`${baseClasses} text-gray-500`} />;
};

export default ReadReceipt;
