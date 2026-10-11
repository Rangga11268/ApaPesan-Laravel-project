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
import { confirm, alert } from "./ConfirmModal";

export default function MessageOptionsDropdown({
    message,
    onReply,
    isOwn = false,
    onOpenChange,
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

    // Notify parent about open state so hover visibility remains locked
    useEffect(() => {
        onOpenChange?.(isOpen || showReactions);
    }, [isOpen, showReactions, onOpenChange]);

    const onDeleteMessage = useCallback(
        async (e) => {
            e.stopPropagation();
            setIsOpen(false);
            setShowReactions(false);

            const ok = await confirm({
                title: "Hapus Pesan",
                message:
                    "Apakah Anda yakin ingin menghapus pesan ini? Tindakan ini tidak dapat dibatalkan.",
                confirmText: "Hapus",
                cancelText: "Batal",
                variant: "danger",
            });
            if (!ok) return;

            const url = route("message.destroy", message.id);

            axios
                .delete(url)
                .then((res) => {
                    emit("message.deleted", {
                        message: res.data.message,
                        prevMessage: res.data.prevMessage,
                    });
                })
                .catch((err) => {
                    console.error("Error deleting message:", err);
                    alert({
                        title: "Gagal Menghapus Pesan",
                        message: "Gagal menghapus pesan. Silakan coba lagi.",
                        variant: "danger",
                    });
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
            setShowReactions(false);
        },
        [message, onReply]
    );

    const handleEdit = useCallback(
        (e) => {
            e.stopPropagation();
            emit("message.edit", message);
            setIsOpen(false);
            setShowReactions(false);
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

    // Close dropdown & reaction picker when clicking outside
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

        if (isOpen || showReactions) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, showReactions]);

    return (
        <div className="relative inline-flex items-center" ref={dropdownRef}>
            {/* Quick action bar */}
            <div className="flex items-center gap-0.5 p-0.5 rounded-full bg-surface border border-border shadow-xs">
                {/* 1-click Quick Reply */}
                <button
                    type="button"
                    onClick={handleReply}
                    className="w-7 h-7 flex items-center justify-center rounded-full text-muted hover:text-main hover:bg-surface-elevated transition-colors"
                    title="Balas pesan"
                    aria-label="Balas pesan"
                >
                    <ArrowUturnLeftIcon className="w-3.5 h-3.5" />
                </button>

                {/* Quick Reaction Toggle */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowReactions((prev) => !prev);
                        setIsOpen(false);
                    }}
                    className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
                        showReactions
                            ? "bg-surface-elevated text-primary"
                            : "text-muted hover:text-main hover:bg-surface-elevated"
                    }`}
                    title="Beri reaksi"
                    aria-label="Beri reaksi"
                >
                    <FaceSmileIcon className="w-3.5 h-3.5" />
                </button>

                {/* More Options Trigger */}
                <button
                    type="button"
                    onClick={toggleDropdown}
                    className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
                        isOpen
                            ? "bg-surface-elevated text-main"
                            : "text-muted hover:text-main hover:bg-surface-elevated"
                    }`}
                    title="Opsi lainnya"
                    aria-label="Opsi lainnya"
                >
                    <EllipsisVerticalIcon className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Direct Reaction Picker Popup */}
            {showReactions && (
                <div
                    className={`absolute top-full mt-1.5 z-50 animate-scale-in ${
                        isOwn ? "right-0 origin-top-right" : "left-0 origin-top-left"
                    }`}
                >
                    <ReactionPicker
                        onReaction={handleReaction}
                        messageId={message.id}
                    />
                </div>
            )}

            {/* Options Dropdown Menu */}
            {isOpen && (
                <div
                    className={`absolute top-full mt-1.5 min-w-[160px] rounded-xl bg-surface border border-border shadow-lg z-50 overflow-hidden p-1 animate-scale-in ${
                        isOwn ? "right-0 origin-top-right" : "left-0 origin-top-left"
                    }`}
                >
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
                                setIsOpen(false);
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
                </div>
            )}
        </div>
    );
}
