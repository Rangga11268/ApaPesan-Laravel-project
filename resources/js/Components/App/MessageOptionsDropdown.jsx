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
    const { emit, on } = useEventBus();
    const [isOpen, setIsOpen] = useState(false);
    const [showReactions, setShowReactions] = useState(false);
    const [isStarred, setIsStarred] = useState(message.is_starred || false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        setIsStarred(message.is_starred || false);
    }, [message.is_starred]);

    useEffect(() => {
        if (!on) return;
        const unsub = on(
            "message.starred",
            ({ messageId, isStarred: starredState }) => {
                if (messageId === message.id) {
                    setIsStarred(starredState);
                }
            }
        );
        return unsub;
    }, [message.id, on]);

    const onDeleteMessage = useCallback(
        (e) => {
            e.stopPropagation();
            if (!confirm("Apakah Anda yakin ingin menghapus pesan ini?")) return;

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
                    alert("Gagal menghapus pesan. Silakan coba lagi.");
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
                    emit("message.starred", {
                        messageId: message.id,
                        isStarred: false,
                    });
                } else {
                    await axios.post(route("starred.store", message.id));
                    setIsStarred(true);
                    emit("message.starred", {
                        messageId: message.id,
                        isStarred: true,
                    });
                }
                setIsOpen(false);
            } catch (err) {
                console.error("Error starring message:", err);
            }
        },
        [message, isStarred, emit]
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
                type="button"
                onClick={toggleDropdown}
                className={`flex justify-center items-center w-6 h-6 rounded-full transition-colors ${
                    isOwn
                        ? "text-white/80 hover:text-white hover:bg-black/20"
                        : "text-muted hover:text-main hover:bg-surface"
                }`}
                title="Opsi pesan"
                aria-label="Opsi pesan"
            >
                <EllipsisVerticalIcon className="h-4 w-4" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-1 min-w-[150px] rounded-xl bg-surface border border-border shadow-xl z-50 overflow-hidden origin-top-right p-1 animate-scale-in">
                    {showReactions ? (
                        <div className="p-1">
                            <ReactionPicker
                                onReaction={handleReaction}
                                messageId={message.id}
                            />
                        </div>
                    ) : (
                        <div className="space-y-0.5">
                            {/* Balas */}
                            <button
                                type="button"
                                onClick={handleReply}
                                className="group flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-main hover:bg-surface-elevated transition-colors text-left"
                            >
                                <ArrowUturnLeftIcon className="w-4 h-4 text-muted group-hover:text-main" />
                                <span>Balas</span>
                            </button>

                            {/* Beri Reaksi */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowReactions(true);
                                }}
                                className="group flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-main hover:bg-surface-elevated transition-colors text-left"
                            >
                                <FaceSmileIcon className="w-4 h-4 text-muted group-hover:text-main" />
                                <span>Beri Reaksi</span>
                            </button>

                            {/* Bintang / Hapus Bintang */}
                            <button
                                type="button"
                                onClick={handleStar}
                                className="group flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-main hover:bg-surface-elevated transition-colors text-left"
                            >
                                {isStarred ? (
                                    <>
                                        <StarIconSolid className="w-4 h-4 text-amber-500 fill-amber-500" />
                                        <span>Hapus Bintang</span>
                                    </>
                                ) : (
                                    <>
                                        <StarIcon className="w-4 h-4 text-muted group-hover:text-amber-500" />
                                        <span>Beri Bintang</span>
                                    </>
                                )}
                            </button>

                            {/* Edit (hanya pesan sendiri) */}
                            {isOwn && message.message && (
                                <button
                                    type="button"
                                    onClick={handleEdit}
                                    className="group flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-main hover:bg-surface-elevated transition-colors text-left"
                                >
                                    <PencilIcon className="w-4 h-4 text-muted group-hover:text-main" />
                                    <span>Edit</span>
                                </button>
                            )}

                            {/* Hapus (hanya pesan sendiri) */}
                            {isOwn && (
                                <>
                                    <div className="my-1 border-t border-border"></div>
                                    <button
                                        type="button"
                                        onClick={onDeleteMessage}
                                        className="group flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors text-left"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                        <span>Hapus Pesan</span>
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
