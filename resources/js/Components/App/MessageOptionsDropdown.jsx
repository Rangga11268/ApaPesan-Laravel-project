import { useEventBus } from "@/EventBus";
import { useState, useCallback, useEffect, useRef } from "react";
import {
    EllipsisVerticalIcon,
    TrashIcon,
    ArrowUturnLeftIcon,
    PencilIcon,
    FaceSmileIcon,
    StarIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import axios from "axios";
import ReactionPicker from "./ReactionPicker";

export default function MessageOptionsDropdown({
    message,
    onReply,
    isOwn = false,
}) {
    const { emit } = useEventBus();
    const [isOpen, setIsOpen] = useState(false);
    const [showReactions, setShowReactions] = useState(false);
    const [isStarred, setIsStarred] = useState(message.is_starred || false);
    const [isEditing, setIsEditing] = useState(false);
    const dropdownRef = useRef(null);

    const onDeleteMessage = useCallback(
        (e) => {
            e.stopPropagation();
            if (!confirm("Are you sure you want to delete this message?"))
                return;

            const url = route("message.destroy", message.id);

            axios
                .delete(url)
                .then((res) => {
                    emit("message.deleted", {
                        message: res.data.message,
                        prevMessage: res.data.prevMessage,
                    });
                    setIsOpen(false);
                })
                .catch((err) => {
                    console.error("Error deleting message:", err);
                    alert("Failed to delete message. Please try again.");
                });
        },
        [message, emit]
    );

    const handleReply = useCallback(
        (e) => {
            e.stopPropagation();
            if (onReply) {
                onReply({
                    id: message.id,
                    message: message.message,
                    sender: message.sender,
                    attachments: message.attachments?.length || 0,
                });
            }
            setIsOpen(false);
        },
        [message, onReply]
    );

    const handleEdit = useCallback(
        (e) => {
            e.stopPropagation();
            emit("message.edit", message);
            setIsOpen(false);
        },
        [message, emit]
    );

    const handleStar = useCallback(
        async (e) => {
            e.stopPropagation();
            try {
                if (isStarred) {
                    await axios.delete(route("starred.destroy", message.id));
                    setIsStarred(false);
                } else {
                    await axios.post(route("starred.store", message.id));
                    setIsStarred(true);
                }
                setIsOpen(false);
            } catch (err) {
                console.error("Error starring message:", err);
            }
        },
        [message, isStarred]
    );

    const handleReaction = useCallback(async (messageId, emoji) => {
        try {
            await axios.post(route("reaction.store", messageId), { emoji });
            setShowReactions(false);
            setIsOpen(false);
        } catch (err) {
            if (err.response?.status === 409) {
                // Already reacted, remove it
                await axios.delete(
                    route("reaction.destroy", { message: messageId, emoji })
                );
            }
            setShowReactions(false);
            setIsOpen(false);
        }
    }, []);

    const toggleDropdown = useCallback((e) => {
        e.stopPropagation();
        setIsOpen((prev) => !prev);
        setShowReactions(false);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
                setShowReactions(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="flex justify-center items-center w-6 h-6 rounded-full hover:bg-black/20 text-white/70 hover:text-white transition-all"
            >
                <EllipsisVerticalIcon className="h-4 w-4" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-1 w-40 rounded-xl bg-[#0f1218]/95 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/50 z-50 overflow-hidden origin-top-right ring-1 ring-white/5">
                    {showReactions ? (
                        <div className="p-2">
                            <ReactionPicker
                                onReaction={handleReaction}
                                messageId={message.id}
                            />
                        </div>
                    ) : (
                        <div className="p-1">
                            {/* Reply - available for all messages */}
                            <button
                                onClick={handleReply}
                                className="group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                <ArrowUturnLeftIcon className="w-4 h-4" />
                                Reply
                            </button>

                            {/* React */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowReactions(true);
                                }}
                                className="group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                <FaceSmileIcon className="w-4 h-4" />
                                React
                            </button>

                            {/* Star/Unstar */}
                            <button
                                onClick={handleStar}
                                className="group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                {isStarred ? (
                                    <>
                                        <StarIconSolid className="w-4 h-4 text-yellow-400" />
                                        Unstar
                                    </>
                                ) : (
                                    <>
                                        <StarIcon className="w-4 h-4" />
                                        Star
                                    </>
                                )}
                            </button>

                            {/* Edit - only for own messages */}
                            {isOwn && message.message && (
                                <button
                                    onClick={handleEdit}
                                    className="group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                >
                                    <PencilIcon className="w-4 h-4" />
                                    Edit
                                </button>
                            )}

                            {/* Delete - only for own messages */}
                            {isOwn && (
                                <>
                                    <div className="my-1 border-t border-white/10"></div>
                                    <button
                                        onClick={onDeleteMessage}
                                        className="group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                        Delete
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
